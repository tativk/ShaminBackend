from rest_framework import serializers

from decimal import Decimal

from .models import Brand, Product, ProductImage


class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ['id', 'name', 'slug']


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'is_main']


class ProductListSerializer(serializers.ModelSerializer):
    """سریالایزر سبک برای لیست محصولات"""
    brand = serializers.StringRelatedField()
    final_price = serializers.SerializerMethodField()
    main_image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'brand', 'category', 'gender',
            'price', 'discount_percent', 'final_price',
            'main_image', 'is_active',
        ]


    def get_final_price(self, obj) -> Decimal:
        return obj.final_price

    def get_main_image(self, obj) -> str | None:

        main = obj.images.filter(is_main=True).first()
        if main:
            request = self.context.get('request')
            return request.build_absolute_uri(main.image.url) if request else main.image.url
        return None


class ProductDetailSerializer(ProductListSerializer):
    """سریالایزر کامل برای صفحه جزئیات"""
    images = ProductImageSerializer(many=True, read_only=True)
    average_rating = serializers.SerializerMethodField()

    class Meta(ProductListSerializer.Meta):
        fields = ProductListSerializer.Meta.fields + ['description', 'stock', 'images', 'average_rating']


    def get_average_rating(self, obj) -> float | None:


        # تا اسپرینت ۷ null برمی‌گردونه
        return None
