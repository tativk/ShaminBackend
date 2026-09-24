from decimal import Decimal
from datetime import datetime, time, timedelta

from django.conf import settings
from django.db import transaction
from django.db.models import Avg, Count, F, Q, Sum
from django.db.models.functions import TruncDate, TruncHour, TruncMonth
from django.http import HttpResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User
from products.models import Product

from .models import Order, OrderItem
from .serializers import (
    AdminOrderSerializer,
    CreateOrderSerializer,
    OrderSerializer,
    OrderStatusUpdateSerializer,
)
from .services.base import PaymentRequest, VerifyRequest
from .services.factory import get_payment_service

# سفارش‌هایی که در آمار فروش حساب می‌شوند
REVENUE_STATUSES = (Order.Status.PAID, Order.Status.SHIPPING, Order.Status.COMPLETED)


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
            status=Order.Status.PENDING,
            total_price=total_amount,
            address=f'{city}، {address}، کد پستی: {postal_code}',
        )

        # ── کپی آیتم‌ها با قیید (snapshot) ──────────────────ه خرید (snapshot) ──────────────────
        order_items = []
        for item in items:
            order_items.append(OrderItem(
                order=order,
                product=item.product,
                quantity=item.quantity,
                price=item.product.final_price,
            ))
            # کاهش موجودی با F expression برای جلوگیری از race condition
            item.product.__class__.objects.filter(pk=item.product.pk).update(
                stock=F('stock') - item.quantity
            )
            # QuerySet.update bypasses model signals; record this stock change explicitly.
            from accounts.models import AdminNotification
            AdminNotification.objects.create(
                kind='product', title='موجودی محصول کاهش یافت', section='products',
                message=f'{item.product.name} · {item.quantity} عدد برای سفارش #{order.pk}',
            )

        OrderItem.objects.bulk_create(order_items)

        # ── خالی کردن سبد ──────────────────────────────────────────────
        cart.items.all().delete()

        # ── درخواست پرداخت به درگاه ────────────────────────────────────
        callback_url = (
            f"{settings.FRONTEND_URL}/payment/callback"
            if hasattr(settings, 'FRONTEND_URL')
            else f"{settings.BACKEND_BASE_URL}/api/orders/payment/callback/"
        )

        payment_service = get_payment_service()
        result = payment_service.request_payment(PaymentRequest(
            amount=total_amount,
            description=f'سفارش شماره {order.id} — شامین گالری',
            callback_url=callback_url,
            order_id=order.id,
        ))

        if not result.success:
            raise ValueError(result.error_message or 'خطا در اتصال به درگاه پرداخت.')

        order.payment_authority = result.authority
        order.save(update_fields=['payment_authority'])

        return order, result.payment_url


class MockGatewayView(APIView):
    """
    GET /api/orders/mock-gateway/?Authority=...&order_id=...
    درگاه پرداخت آزمایشی (فیک) برای محیط توسعه — جایگزین زرین‌پال.
    دکمه‌ی موفق به callback با Status=OK و انصراف با Status=NOK می‌رود.
    """
    permission_classes = []

    def get(self, request):
        from .services.mock_payment import _pending

        authority = request.query_params.get('Authority', '')
        order_id = request.query_params.get('order_id', '')
        if not authority:
            return HttpResponse('Authority یافت نشد.', status=400)

        amount = _pending.get(authority)
        amount_str = f'{int(amount):,}' if amount is not None else '—'
        ok_url = f'/api/orders/payment/callback/?Authority={authority}&Status=OK'
        nok_url = f'/api/orders/payment/callback/?Authority={authority}&Status=NOK'

        html = f"""<!doctype html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>درگاه پرداخت آزمایشی</title>
<style>
  body {{ font-family: Tahoma, sans-serif; background: #f2f5f4; margin: 0;
         display: flex; align-items: center; justify-content: center; min-height: 100vh; }}
  .card {{ background: #fff; border-radius: 16px; padding: 32px; width: 340px;
          box-shadow: 0 10px 30px rgba(0,0,0,.08); text-align: center; }}
  .badge {{ display: inline-block; background: #fdf3e3; color: #a88950; font-size: 12px;
           padding: 4px 14px; border-radius: 999px; margin-bottom: 14px; }}
  h1 {{ font-size: 18px; margin: 0 0 18px; color: #17483f; }}
  .row {{ display: flex; justify-content: space-between; font-size: 14px;
         padding: 10px 0; border-bottom: 1px dashed #e5e9e8; color: #555; }}
  .row b {{ color: #17483f; }}
  .btn {{ display: block; margin-top: 14px; padding: 13px; border-radius: 10px;
         font-size: 14px; font-weight: bold; text-decoration: none; }}
  .ok {{ background: #17483f; color: #fff; }}
  .ok:hover {{ background: #0f352c; }}
  .nok {{ background: #fff; color: #a34b4b; border: 1px solid #a34b4b; }}
  small {{ color: #999; font-size: 11px; margin-top: 14px; display: block; }}
</style>
</head>
<body>
  <div class="card">
    <span class="badge">درگاه پرداخت آزمایشی (Mock)</span>
    <h1>پرداخت سفارش</h1>
    <div class="row"><span>شماره سفارش</span><b>#{order_id}</b></div>
    <div class="row"><span>مبلغ قابل پرداخت</span><b>{amount_str} تومان</b></div>
    <div class="row"><span>درگاه</span><b>شبیه‌ساز داخلی</b></div>
    <a class="btn ok" href="{ok_url}">پرداخت موفق (تست)</a>
    <a class="btn nok" href="{nok_url}">انصراف / پرداخت ناموفق</a>
    <small>این صفحه فقط برای توسعه است؛ بعداً زرین‌پال جایگزین می‌شود.</small>
  </div>
</body>
</html>"""
        return HttpResponse(html)


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
        if order.status != Order.Status.PENDING:
            return Response(
                {'detail': 'این تراکنش قبلاً پردازش شده است.', 'status': order.status},
                status=status.HTTP_200_OK,
            )

        # کاربر از صفحه پرداخت انصراف داده
        if payment_status != 'OK':
            order.status = Order.Status.CANCELLED
            order.save(update_fields=['status', 'updated_at'])
            return Response(
                {'detail': 'پرداخت لغو شد.', 'order_id': order.id},
                status=status.HTTP_200_OK,
            )

        # تأیید پرداخت
        payment_service = get_payment_service()
        result = payment_service.verify_payment(VerifyRequest(
            authority=authority,
            amount=order.total_price,
        ))

        if result.success:
            order.status = Order.Status.PAID
            order.payment_ref_id = result.ref_id
            order.save(update_fields=['status', 'payment_ref_id', 'updated_at'])
            return Response(
                {
                    'detail': 'پرداخت با موفقیت انجام شد.',
                    'order_id': order.id,
                    'ref_id': result.ref_id,
                },
                status=status.HTTP_200_OK,
            )

        order.status = Order.Status.FAILED
        order.save(update_fields=['status', 'updated_at'])
        return Response(
            {'detail': result.error_message or 'پرداخت ناموفق بود.', 'order_id': order.id},
            status=status.HTTP_400_BAD_REQUEST,
        )


class AdminOrdersView(APIView):
    """لیست سفارش‌ها برای پنل ادمین."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if not (request.user.is_staff or request.user.is_superuser):
            return Response({'detail': 'Only staff can access admin orders.'}, status=status.HTTP_403_FORBIDDEN)

        orders = (
            Order.objects
            .select_related('user')
            .prefetch_related('items__product')
            .all()
            .order_by('-created_at')
        )

        search = request.query_params.get('search', '').strip()
        if search:
            query = (
                Q(user__first_name__icontains=search)
                | Q(user__last_name__icontains=search)
                | Q(user__phone__icontains=search)
                | Q(items__product__name__icontains=search)
            )
            if search.isdigit():
                query |= Q(id=int(search))
            orders = orders.filter(query).distinct()

        serializer = AdminOrderSerializer(orders, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AdminOrderStatusView(APIView):
    """به‌روزرسانی وضعیت سفارش از پنل ادمین."""
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        if not (request.user.is_staff or request.user.is_superuser):
            return Response({'detail': 'Only staff can update order statuses.'}, status=status.HTTP_403_FORBIDDEN)

        order = get_object_or_404(Order, pk=pk)
        serializer = OrderStatusUpdateSerializer(order, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        return Response(AdminOrderSerializer(order).data, status=status.HTTP_200_OK)


class AdminDashboardStatsView(APIView):
    """
    آمار کلی پنل ادمین: GET /api/orders/admin/stats/?period=today|week|month|quarter
    شامل کارت‌های آماری، نمودار فروش، وضعیت سفارش‌ها، آخرین سفارش‌ها و پرفروش‌ترین‌ها.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if not (request.user.is_staff or request.user.is_superuser):
            return Response({'detail': 'Only staff can access dashboard stats.'}, status=status.HTTP_403_FORBIDDEN)

        period = request.query_params.get('period', 'week')
        if period not in {'today', 'week', 'month', 'quarter'}:
            period = 'week'

        now = timezone.now()
        today_start = timezone.make_aware(datetime.combine(timezone.localdate(now), time.min))
        tomorrow_start = today_start + timedelta(days=1)

        orders_today = Order.objects.filter(created_at__gte=today_start, created_at__lt=tomorrow_start)
        sales_today = orders_today.filter(status__in=REVENUE_STATUSES).aggregate(
            total=Sum('total_price')
        )['total'] or Decimal('0')

        status_counts = {choice.value: 0 for choice in Order.Status}
        for row in orders_today.values('status').annotate(count=Count('id')):
            status_counts[row['status']] = row['count']

        customers_count = User.objects.filter(is_staff=False, is_superuser=False).count()
        active_products = Product.objects.filter(is_active=True).count()
        low_stock_count = Product.objects.filter(is_active=True, stock__gt=0, stock__lte=5).count()
        pending_orders = Order.objects.filter(status=Order.Status.PENDING).count()

        month_ago = today_start - timedelta(days=30)
        avg_order_value = Order.objects.filter(
            created_at__gte=month_ago, status__in=REVENUE_STATUSES
        ).aggregate(avg=Avg('total_price'))['avg'] or Decimal('0')
        orders_last_month = Order.objects.filter(created_at__gte=month_ago).count()
        completed_last_month = Order.objects.filter(
            created_at__gte=month_ago, status=Order.Status.COMPLETED
        ).count()
        completion_rate = round(completed_last_month * 100 / orders_last_month) if orders_last_month else None

        chart_points, growth_percent, period_total = self._build_chart(period, today_start)

        recent_orders = (
            Order.objects
            .select_related('user')
            .prefetch_related('items__product')
            .order_by('-created_at')[:5]
        )
        recent_data = AdminOrderSerializer(recent_orders, many=True, context={'request': request}).data

        top_products = list(
            OrderItem.objects
            .values('product_id', 'product__name', 'product__category', 'product__stock')
            .annotate(sold=Sum('quantity'), revenue=Sum(F('price') * F('quantity')))
            .order_by('-revenue')[:4]
        )
        top_products_data = [
            {
                'id': row['product_id'],
                'name': row['product__name'],
                'category': row['product__category'],
                'sold': row['sold'],
                'stock': row['product__stock'] or 0,
                'revenue': int(row['revenue'] or 0),
            }
            for row in top_products
        ]

        return Response(
            {
                'period': period,
                'cards': {
                    'sales_today': float(sales_today),
                    'orders_today': orders_today.count(),
                    'customers': customers_count,
                    'active_products': active_products,
                },
                'quick': {
                    'avg_order_value': float(avg_order_value),
                    'completion_rate': completion_rate,
                    'low_stock_count': low_stock_count,
                    'pending_orders': pending_orders,
                },
                'status_counts': status_counts,
                'chart': {
                    'points': chart_points,
                    'period_total': period_total,
                    'sales_growth_percent': growth_percent,
                },
                'recent_orders': recent_data,
                'top_products': top_products_data,
            },
            status=status.HTTP_200_OK,
        )

    def _build_chart(self, period, today_start):
        """نقاط نمودار فروش بازه انتخابی + درصد رشد نسبت به بازه قبلی مشابه."""
        spans = {
            'today': (
                today_start, today_start + timedelta(days=1),
                today_start - timedelta(days=1), today_start,
            ),
            'week': (
                today_start - timedelta(days=6), today_start + timedelta(days=1),
                today_start - timedelta(days=13), today_start - timedelta(days=6),
            ),
            'month': (
                today_start - timedelta(days=29), today_start + timedelta(days=1),
                today_start - timedelta(days=59), today_start - timedelta(days=29),
            ),
            'quarter': (
                today_start - timedelta(days=89), today_start + timedelta(days=1),
                today_start - timedelta(days=179), today_start - timedelta(days=89),
            ),
        }
        start, end, prev_start, prev_end = spans[period]

        def revenue(a, b):
            return Order.objects.filter(
                created_at__gte=a, created_at__lt=b, status__in=REVENUE_STATUSES
            )

        points = []
        if period == 'today':
            # بازه‌های ۲ساعته برای خوانایی نمودار
            rows = revenue(start, end).annotate(bucket=TruncHour('created_at')).values('bucket').annotate(
                total=Sum('total_price')
            )
            sums = {row['bucket'].hour: row['total'] for row in rows}
            for hour in range(0, 24, 2):
                total = sum(sums.get(h, Decimal('0')) for h in (hour, hour + 1))
                points.append({'date': start.date().isoformat(), 'hour': hour, 'total': float(total)})
        elif period == 'quarter':
            rows = revenue(start, end).annotate(bucket=TruncMonth('created_at')).values('bucket').annotate(
                total=Sum('total_price')
            )
            sums = {row['bucket'].date(): row['total'] for row in rows}
            month_cursor = start.date().replace(day=1)
            while month_cursor < end.date():
                points.append({'date': month_cursor.isoformat(), 'hour': None, 'total': float(sums.get(month_cursor, Decimal('0')))})
                month_cursor = (month_cursor + timedelta(days=32)).replace(day=1)
        else:
            rows = revenue(start, end).annotate(bucket=TruncDate('created_at')).values('bucket').annotate(
                total=Sum('total_price')
            )
            sums = {row['bucket']: row['total'] for row in rows}
            day = start.date()
            while day < end.date():
                points.append({'date': day.isoformat(), 'hour': None, 'total': float(sums.get(day, Decimal('0')))})
                day += timedelta(days=1)

        current_total = revenue(start, end).aggregate(total=Sum('total_price'))['total'] or Decimal('0')
        previous_total = revenue(prev_start, prev_end).aggregate(total=Sum('total_price'))['total'] or Decimal('0')
        growth = round((current_total - previous_total) / previous_total * 100, 1) if previous_total else None
        return points, growth, float(current_total)

