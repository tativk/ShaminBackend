from rest_framework import serializers
from products.models import Product
from .models import Review


class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_phone = serializers.CharField(source='user.phone', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'product', 'product_name', 'user', 'user_name', 'user_phone', 'rating', 'text', 'is_approved', 'created_at']
        read_only_fields = ['id', 'user', 'is_approved', 'created_at', 'user_name', 'user_phone', 'product_name']


class ReviewCreateUpdateSerializer(serializers.ModelSerializer):
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all(), required=False)

    class Meta:
        model = Review
        fields = ['product', 'rating', 'text']

    def validate_rating(self, value):
        if not (1 <= value <= 5):
            raise serializers.ValidationError("امتیاز باید بین ۱ تا ۵ باشد")
        return value

    def validate(self, attrs):
        # هر کاربر فقط یک نظر برای هر محصول
        request = self.context.get("request")
        product = attrs.get("product") or (self.instance.product if self.instance else None)
        if request and request.user.is_authenticated and product:
            exists = Review.objects.filter(user=request.user, product=product)
            if self.instance:
                exists = exists.exclude(pk=self.instance.pk)
            if exists.exists():
                raise serializers.ValidationError("شما قبلاً برای این محصول نظر ثبت کرده‌اید.")
        return attrs