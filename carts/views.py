from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema, extend_schema_view

from products.models import Product
from .models import Cart, CartItem, ShippingRate
from .serializers import (AddItemSerializer, CartCitySerializer, CartSerializer,
                          QuantitySerializer, ShippingRateSerializer)


def locked_cart(user):
    cart, _ = Cart.objects.get_or_create(user=user)
    return Cart.objects.select_for_update().get(pk=cart.pk)


def validate_stock(product, quantity):
    if not product.is_active:
        raise ValidationError({'product': 'این محصول غیرفعال است.'})
    if quantity > product.stock:
        raise ValidationError({'quantity': 'تعداد درخواستی بیشتر از موجودی است.'})


@extend_schema_view(
    get=extend_schema(responses=CartSerializer),
    patch=extend_schema(request=CartCitySerializer, responses=CartSerializer),
)
class CartView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        return Response(CartSerializer(cart).data)

    @transaction.atomic
    def patch(self, request):
        serializer = CartCitySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        cart = locked_cart(request.user)
        cart.city = serializer.validated_data['city']
        cart.save(update_fields=['city'])
        return Response(CartSerializer(cart).data)


@extend_schema_view(post=extend_schema(request=AddItemSerializer, responses={200: CartSerializer, 201: CartSerializer}))
class CartItemsView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        serializer = AddItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        cart = locked_cart(request.user)
        product = get_object_or_404(Product.objects.select_for_update(), pk=serializer.validated_data['product'])
        item = CartItem.objects.filter(cart=cart, product=product).first()
        quantity = serializer.validated_data['quantity'] + (item.quantity if item else 0)
        validate_stock(product, quantity)
        if item:
            item.quantity = quantity
            item.save(update_fields=['quantity'])
        else:
            CartItem.objects.create(cart=cart, product=product, quantity=quantity)
        return Response(CartSerializer(cart).data, status=status.HTTP_200_OK if item else status.HTTP_201_CREATED)


@extend_schema_view(
    patch=extend_schema(request=QuantitySerializer, responses=CartSerializer),
    delete=extend_schema(responses={204: None}),
)
class CartItemView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def patch(self, request, pk):
        serializer = QuantitySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        cart = locked_cart(request.user)
        item = get_object_or_404(CartItem, cart=cart, pk=pk)
        product = Product.objects.select_for_update().get(pk=item.product_id)
        validate_stock(product, serializer.validated_data['quantity'])
        item.quantity = serializer.validated_data['quantity']
        item.save(update_fields=['quantity'])
        return Response(CartSerializer(cart).data)

    @transaction.atomic
    def delete(self, request, pk):
        cart = locked_cart(request.user)
        item = get_object_or_404(CartItem, cart=cart, pk=pk)
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ShippingProvincesView(APIView):
    """استان‌ها و شهرهای ایران به همراه هزینه ارسال هر استان — برای منوی آبشاری سبد خرید."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        grouped = {}
        for rate in ShippingRate.objects.all().order_by('city'):
            province = rate.province or 'سایر'
            if province not in grouped:
                grouped[province] = {
                    'province': province,
                    'cost': float(rate.cost),
                    'cities': [],
                }
            grouped[province]['cities'].append({'id': rate.id, 'city': rate.city})

        data = sorted(grouped.values(), key=lambda item: item['province'])
        return Response(data)


class ShippingCitiesView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    queryset = ShippingRate.objects.all()
    serializer_class = ShippingRateSerializer
