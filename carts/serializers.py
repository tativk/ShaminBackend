from rest_framework import serializers

from .models import Cart, CartItem, ShippingRate


class ShippingRateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShippingRate
        fields = ['id', 'city', 'cost']


class CartItemSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='product.name', read_only=True)
    unit_price = serializers.DecimalField(max_digits=14, decimal_places=2, read_only=True)
    line_total = serializers.DecimalField(max_digits=24, decimal_places=2, read_only=True)
    weight_grams = serializers.IntegerField(read_only=True, allow_null=True)

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'name', 'quantity', 'weight_grams', 'unit_price', 'line_total']


class CartSerializer(serializers.ModelSerializer):
    city = serializers.SlugRelatedField(slug_field='city', read_only=True)
    items = CartItemSerializer(many=True, read_only=True)
    subtotal = serializers.DecimalField(max_digits=30, decimal_places=2, read_only=True)
    shipping_cost = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True, allow_null=True)
    total = serializers.DecimalField(max_digits=30, decimal_places=2, read_only=True, allow_null=True)
    coupon_code = serializers.CharField(source='coupon.code', read_only=True, default=None)
    discount_percent = serializers.IntegerField(source='coupon.discount_percent', read_only=True, default=None)
    discount_amount = serializers.DecimalField(max_digits=30, decimal_places=2, read_only=True)
    # بعد از «items» می‌آید تا از کوئری همان relation کش‌شده استفاده کند
    total_items = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ['id', 'city', 'items', 'total_items', 'subtotal', 'shipping_cost', 'total', 'coupon_code', 'discount_percent', 'discount_amount']

    def get_total_items(self, obj):
        return sum(item.quantity for item in obj.items.all())


class CartCitySerializer(serializers.Serializer):
    # انتخاب شهر با شناسه (id) ShippingRate — جلوگیری از ابهام شهرهای هم‌نام در استان‌های مختلف
    city = serializers.PrimaryKeyRelatedField(queryset=ShippingRate.objects.all())


class CouponApplySerializer(serializers.Serializer):
    code = serializers.CharField(max_length=32)


class QuantitySerializer(serializers.Serializer):
    quantity = serializers.IntegerField(min_value=1, max_value=2147483647)


class AddItemSerializer(QuantitySerializer):
    product = serializers.IntegerField(min_value=1)
    # حجم انتخابی عطر — فقط مقادیر مجاز پذیرفته می‌شود
    weight_grams = serializers.IntegerField(required=False, allow_null=True)


ALLOWED_WEIGHTS = (15, 20, 30, 50, 100)
