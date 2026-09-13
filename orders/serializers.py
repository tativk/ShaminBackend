from decimal import Decimal
from rest_framework import serializers
from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'quantity', 'unit_price', 'total_price']
        read_only_fields = fields


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'status', 'total_amount', 'shipping_cost',
            'city', 'address', 'postal_code', 'tracking_code',
            'created_at', 'items',
        ]
        read_only_fields = fields


class CreateOrderSerializer(serializers.Serializer):
    """
    اگر City مدل جداگانه دارد، city_id را به FK تبدیل کن.
    اگر فقط CharField است، همین city را نگه دار.
    """
    city = serializers.CharField(max_length=100)
    address = serializers.CharField(max_length=500)
    postal_code = serializers.CharField(max_length=10, min_length=10)
    shipping_cost = serializers.DecimalField(
        max_digits=12, decimal_places=0, min_value=0
    )

    def validate(self, attrs):
        user = self.context['request'].user

        # ─── اگر اپ cart جدا است، این import را تنظیم کن ───
        from cart.models import Cart  # noqa: PLC0415

        try:
            cart = (
                Cart.objects
                .prefetch_related('items__product')
                .get(user=user)
            )
        except Cart.DoesNotExist:
            raise serializers.ValidationError('سبد خرید یافت نشد.')

        if not cart.items.exists():
            raise serializers.ValidationError('سبد خرید خالی است.')

        # بررسی موجودی همه آیتم‌ها پیش از ثبت سفارش
        for item in cart.items.select_related('product'):
            if item.product.stock < item.quantity:
                raise serializers.ValidationError(
                    f'موجودی «{item.product.name}» کافی نیست '
                    f'(موجود: {item.product.stock} عدد).'
                )

        attrs['cart'] = cart
        return attrs

    # mobin
