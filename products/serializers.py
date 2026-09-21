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


class ProductImageAdminSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'is_main']

    def get_image(self, obj):
        request = self.context.get('request')
        if request is not None:
            return request.build_absolute_uri(obj.image.url)
        return obj.image.url


class AdminProductSerializer(serializers.ModelSerializer):
    """سریالایزر CRUD محصولات در پنل ادمین.

    تصاویر از طریق multipart ارسال می‌شوند:
    - new_images: فایل‌های تصویر جدید (به ترتیب)
    - keep_image_ids: JSON آرایه شناسه تصاویر فعلی که باید بمانند
    - main_image_id: شناسه تصویر اصلی از بین تصاویر فعلی
    - main_new_index: اندیس تصویر اصلی از بین فایل‌های جدید
    """

    brand = serializers.PrimaryKeyRelatedField(
        queryset=Brand.objects.all(), allow_null=True, required=False
    )
    brand_name = serializers.CharField(source='brand.name', read_only=True, default=None)
    images = ProductImageAdminSerializer(many=True, read_only=True)
    new_images = serializers.ListField(
        child=serializers.ImageField(), write_only=True, required=False
    )
    keep_image_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False
    )
    main_image_id = serializers.IntegerField(
        write_only=True, required=False, allow_null=True
    )
    main_new_index = serializers.IntegerField(
        write_only=True, required=False, allow_null=True
    )

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'brand', 'brand_name', 'category', 'gender',
            'description', 'price', 'discount_percent', 'stock', 'is_active',
            'created_at', 'images', 'new_images', 'keep_image_ids',
            'main_image_id', 'main_new_index',
        ]

    def validate_discount_percent(self, value):
        if value > 100:
            raise serializers.ValidationError('درصد تخفیف نمی‌تواند بیش از ۱۰۰ باشد.')
        return value

    def _sync_images(self, product, *, new_images, keep_ids, main_image_id, main_new_index):
        if keep_ids is not None:
            keep = set(keep_ids)
            for image in product.images.all():
                if image.pk not in keep:
                    image.image.delete(save=False)
                    image.delete()

        created = [
            ProductImage.objects.create(product=product, image=file)
            for file in (new_images or [])
        ]

        product.images.all().update(is_main=False)
        if main_image_id:
            ProductImage.objects.filter(pk=main_image_id, product=product).update(is_main=True)
        elif main_new_index is not None and created:
            main = created[min(main_new_index, len(created) - 1)]
            ProductImage.objects.filter(pk=main.pk).update(is_main=True)
        elif not product.images.filter(is_main=True).exists():
            first = product.images.order_by('id').first()
            if first:
                ProductImage.objects.filter(pk=first.pk).update(is_main=True)

    def create(self, validated_data):
        # DRF در فرم‌های multipart فیلد بولی غایب را False می‌کند؛
        # اگر صریحاً ارسال نشده باشد، پیش‌فرض مدل (True) باید برقرار بماند.
        if 'is_active' not in self.initial_data:
            validated_data['is_active'] = True
        new_images = validated_data.pop('new_images', [])
        keep_ids = validated_data.pop('keep_image_ids', None)
        main_image_id = validated_data.pop('main_image_id', None)
        main_new_index = validated_data.pop('main_new_index', None)

        product = Product.objects.create(**validated_data)
        self._sync_images(
            product,
            new_images=new_images,
            keep_ids=None,
            main_image_id=main_image_id,
            main_new_index=main_new_index,
        )
        return product

    def update(self, instance, validated_data):
        new_images = validated_data.pop('new_images', [])
        keep_ids = validated_data.pop('keep_image_ids', None)
        main_image_id = validated_data.pop('main_image_id', None)
        main_new_index = validated_data.pop('main_new_index', None)

        for field, value in validated_data.items():
            setattr(instance, field, value)
        instance.save()

        self._sync_images(
            instance,
            new_images=new_images,
            keep_ids=keep_ids,
            main_image_id=main_image_id,
            main_new_index=main_new_index,
        )
        return instance


class ProductDetailSerializer(ProductListSerializer):
    """سریالایزر کامل برای صفحه جزئیات"""
    images = ProductImageSerializer(many=True, read_only=True)
    average_rating = serializers.SerializerMethodField()

    class Meta(ProductListSerializer.Meta):
        fields = ProductListSerializer.Meta.fields + ['description', 'stock', 'images', 'average_rating']


    def get_average_rating(self, obj) -> float | None:


        # تا اسپرینت ۷ null برمی‌گردونه
        return None
from django.db.models import Avg

class ProductDetailSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(source='productimage_set', many=True, read_only=True)
    average_rating = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['id', 'name', 'brand', 'category', 'gender', 'description', 'price', 
                  'discount_percent', 'final_price', 'stock', 'is_active', 'images', 'average_rating']

    def get_average_rating(self, obj):
        """میانگین امتیاز نظرات تأیید شده"""
        avg = obj.reviews.filter(is_approved=True).aggregate(Avg('rating'))['rating__avg']
        return round(avg, 2) if avg else None