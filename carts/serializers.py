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
    # عکس اصلی محصول برای نمایش در سبد خرید — فیلد image هم برای سازگاری با فرانت
    main_image = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'name', 'quantity', 'weight_grams', 'unit_price', 'line_total', 'main_image', 'image']

    def _main_image_url(self, obj):
        request = self.context.get('request')
        img = obj.product.images.filter(is_main=True).first() or obj.product.images.first()
        if not img or not img.image:
            return None
        url = img.image.url
        return request.build_absolute_uri(url) if request else url

    def get_main_image(self, obj):
        return self._main_image_url(obj)

    def get_image(self, obj):
        return self._main_image_url(obj)


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
    # ثبت مقصد ارسال با «نام شهر» (متن آزاد) — سازگار با تایپ دستی کاربر در فرانت؛
    # اگر نام در فهرست ShippingRate باشد هزینه ارسال رسمی همان ردیف لحاظ می‌شود.
    city = serializers.CharField(max_length=100)


class CouponApplySerializer(serializers.Serializer):
    code = serializers.CharField(max_length=32)


class QuantitySerializer(serializers.Serializer):
    quantity = serializers.IntegerField(min_value=1, max_value=2147483647)


class AddItemSerializer(QuantitySerializer):
    product = serializers.IntegerField(min_value=1)
    # حجم انتخابی عطر — فقط مقادیر مجاز پذیرفته می‌شود
    weight_grams = serializers.IntegerField(required=False, allow_null=True)


ALLOWED_WEIGHTS = (10, 15, 20, 30, 50, 100)