from django.shortcuts import render

# Create your views here.
from decimal import Decimal

from django.conf import settings
from django.db import transaction
from django.db.models import F
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Order, OrderItem
from .serializers import CreateOrderSerializer, OrderSerializer
from payments.factory import get_payment_service  # noqa: PLC0415


class CreateOrderView(APIView):
    """
    POST /api/orders/
    سبد خرید را به سفارش تبدیل می‌کند و URL درگاه پرداخت را برمی‌گرداند.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = CreateOrderSerializer(
            data=request.data,
            context={'request': request},
        )
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        cart = data['cart']

        try:
            order, payment_url = self._create_order_and_get_payment_url(
                user=request.user,
                cart=cart,
                city=data['city'],
                address=data['address'],
                postal_code=data['postal_code'],
                shipping_cost=data['shipping_cost'],
            )
        except Exception as exc:  # noqa: BLE001
            return Response(
                {'detail': str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                'order_id': order.id,
                'payment_url': payment_url,
            },
            status=status.HTTP_201_CREATED,
        )

    @transaction.atomic
    def _create_order_and_get_payment_url(
        self, *, user, cart, city, address, postal_code, shipping_cost
    ):
        # ── محاسبه مبلغ سفارش ──────────────────────────────────────────
        items = cart.items.select_related('product').select_for_update()
        items_total = Decimal('0')
        for item in items:
            items_total += item.product.final_price * item.quantity

        total_amount = items_total + Decimal(str(shipping_cost))

        # ── ساخت سفارش ─────────────────────────────────────────────────
        order = Order.objects.create(
            user=user,
            status=Order.Status.PAYMENT_PENDING,
            total_amount=total_amount,
            shipping_cost=shipping_cost,
            city=city,
            address=address,
            postal_code=postal_code,
        )

        # ── کپی آیتم‌ها با قیید (snapshot) ──────────────────ه خرید (snapshot) ──────────────────
        order_items = []
        for item in items:
            order_items.append(OrderItem(
                order=order,
                product=item.product,
                product_name=item.product.name,  # snapshot نام
                quantity=item.quantity,
                unit_price=item.product.final_price,  # snapshot قیمت
            ))
            # کاهش موجودی با F expression برای جلوگیری از race condition
            item.product.__class__.objects.filter(pk=item.product.pk).update(
                stock=F('stock') - item.quantity
            )

        OrderItem.objects.bulk_create(order_items)

        # ── خالی کردن سبد ──────────────────────────────────────────────
        cart.items.all().delete()

        # ── درخواست پرداخت به درگاه ────────────────────────────────────
        callback_url = (
            f"{settings.FRONTEND_URL}/payment/callback"
            if hasattr(settings, 'FRONTEND_URL')
            else f"{settings.SITE_URL}/api/payment/callback/"
        )

        payment_service = get_payment_service()
        result = payment_service.request_payment(
            amount=int(total_amount),  # تومان
            description=f'سفارش شماره {order.id} — شامین گالری',
            callback_url=callback_url,
            order_id=order.id,
        )

        if not result.get('success'):
            raise ValueError(result.get('message', 'خطا در اتصال به درگاه پرداخت.'))

        # ذخیره authority برای تطبیق در callback
        order.payment_authority = result['authority']
        order.save(update_fields=['payment_authority'])

        return order, result['payment_url']


class PaymentCallbackView(APIView):
    """
    GET /api/payment/callback/
    بازگشت از درگاه پرداخت.
    پارامترها: Authority, Status (سازگار با فرمت زرین‌پال)
    """
    permission_classes = []  # درگاه بدون auth redirect می‌کند

    def get(self, request):
        authority = request.query_params.get('Authority', '')
        payment_status = request.query_params.get('Status', '')

        if not authority:
            return Response(
                {'detail': 'Authority یافت نشد.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            order = Order.objects.get(payment_authority=authority)
        except Order.DoesNotExist:
            return Response(
                {'detail': 'سفارش مرتبط با این تراکنش یافت نشد.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        # اگر قبلاً پردازش شده باشد
        if order.status != Order.Status.PAYMENT_PENDING:
            return Response(
                {'detail': 'این تراکنش قبلاً پردازش شده است.', 'status': order.status},
                status=status.HTTP_200_OK,
            )

        # کاربر از صفحه پرداخت انصراف داده
        if payment_status != 'OK':
            self._cancel_order(order)
            return Response(
                {'detail': 'پرداخت لغو شد.', 'order_id': order.id},
                status=status.HTTP_200_OK,
            )

        # تأیید پرداخت
        payment_service = get_payment_service()
        result = payment_service.verify_payment(
            authority=authority,
            amount=int(order.total_amount),
        )

        if result.get('success'):
            order.status = Order.Status.PROCESSING
            order.save(update_fields=['status'])
            return Response(
                {
                    'detail': 'پرداخت با موفقیت انجام شد.',
                    'order_id': order.id,
                    'ref_id': result.get('ref_id'),
                },
                status=status.HTTP_200_OK,
            )

