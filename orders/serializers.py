from rest_framework import serializers
from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    unit_price = serializers.DecimalField(source='price', max_digits=12, decimal_places=2, read_only=True)
    total_price = serializers.DecimalField(source='subtotal', max_digits=14, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'quantity', 'unit_price', 'total_price']
        read_only_fields = fields


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'status', 'total_price', 'address', 'payment_ref_id',
            'created_at', 'items',
        ]
        read_only_fields = fields


class AdminOrderSerializer(serializers.ModelSerializer):
    customer = serializers.SerializerMethodField()
    customer_phone = serializers.CharField(source='user.phone', read_only=True)
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'status', 'total_price', 'address', 'customer', 'customer_phone',
            'payment_ref_id', 'created_at', 'items',
        ]
        read_only_fields = fields

    def get_customer(self, obj):
        full_name = ' '.join(part for part in [obj.user.first_name, obj.user.last_name] if part).strip()
        return full_name or obj.user.phone


class OrderStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ['status']

    def validate_status(self, value):
        valid_statuses = {choice.value for choice in Order.Status}
        if value not in valid_statuses:
            raise serializers.ValidationError('وضعیت سفارش نامعتبر است.')
        return value


class CreateOrderSerializer(serializers.Serializer):
    """اطلاعات تحویل سفارش و مبلغ ارسالِ انتخاب‌شده در سبد."""
    city = serializers.CharField(max_length=100)
    address = serializers.CharField(max_length=500)
    postal_code = serializers.CharField(max_length=10, min_length=10)
    shipping_cost = serializers.DecimalField(
        max_digits=12, decimal_places=2, min_value=0
    )

    def validate(self, attrs):
        user = self.context['request'].user

        from carts.models import Cart

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

        if not cart.city or cart.city.city != attrs['city']:
            raise serializers.ValidationError('شهر ارسال را ابتدا در سبد خرید انتخاب کنید.')
        if cart.shipping_cost != attrs['shipping_cost']:
            raise serializers.ValidationError('هزینه ارسال معتبر نیست.')

        # بررسی موجودی همه آیتم‌ها پیش از ثبت سفارش
        for item in cart.items.select_related('product'):
            if item.product.stock < item.quantity:
                raise serializers.ValidationError(
                    f'موجودی «{item.product.name}» کافی نیست '
                    f'(موجود: {item.product.stock} عدد).'
                )

        attrs['cart'] = cart
        return attrs
