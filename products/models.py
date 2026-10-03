from decimal import Decimal, ROUND_HALF_UP
from django.db import models


class Brand(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True, blank=True, null=True)

    def __str__(self):
        return self.name


class Product(models.Model):
    CATEGORY_CHOICES = [
        ('perfume', 'Perfume'),
        ('cosmetic', 'Cosmetic'),
        ('accessory', 'Accessory'),
    ]
    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
        ('unisex', 'Unisex'),
    ]

    name = models.CharField(max_length=200)
    brand = models.ForeignKey(
        Brand,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='products',
    )
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    discount_percent = models.PositiveSmallIntegerField(default=0)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    stock = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    # انتخاب ادمین — محصولات پرفروشِ نمایش‌داده‌شده در صفحه اصلی
    is_best_seller = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    # قیمت اختصاصی هر حجم عطر — اگر خالی باشد قیمت پایه لحاظ می‌شود
    price_15 = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    price_20 = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    price_30 = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    price_50 = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    price_100 = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)

    @property
    def final_price(self):

        return (self.price * (Decimal('100') - self.discount_percent) / Decimal('100')).quantize(
            Decimal('0.01'), rounding=ROUND_HALF_UP
        )

    def price_for_weight(self, weight) -> Decimal:
        """قیمت پایه یک حجم مشخص — حجم بدون قیمت اختصاصی از قیمت پایه استفاده می‌کند."""
        field = f'price_{weight}' if weight in (15, 20, 30, 50, 100) else None
        specific = getattr(self, field) if field else None
        return specific if specific is not None else self.price

    def final_price_for_weight(self, weight) -> Decimal:
        return (self.price_for_weight(weight) * (Decimal('100') - self.discount_percent) / Decimal('100')).quantize(
            Decimal('0.01'), rounding=ROUND_HALF_UP
        )


    def __str__(self):
        return self.name


class ProductImage(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='images',
    )
    image = models.ImageField(upload_to='products/')
    is_main = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.product.name} - {'main' if self.is_main else 'extra'}"
