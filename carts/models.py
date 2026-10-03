from decimal import Decimal

from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models


class ShippingRate(models.Model):
    province = models.CharField(max_length=50, blank=True, default='')
    city = models.CharField(max_length=100, unique=True)
    cost = models.DecimalField(max_digits=12, decimal_places=2, validators=[MinValueValidator(0)])

    class Meta:
        ordering = ['province', 'city']
        constraints = [models.CheckConstraint(condition=models.Q(cost__gte=0), name='shipping_cost_nonnegative')]

    def __str__(self):
        return f'{self.province} — {self.city}'


class Coupon(models.Model):
    """کد تخفیف درصدی — مدیریت فعال/غیرفعال از پنل جنگو."""

    code = models.CharField(max_length=32, unique=True)
    discount_percent = models.PositiveSmallIntegerField(validators=[MinValueValidator(1)])
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'کد تخفیف'
        verbose_name_plural = 'کدهای تخفیف'

    def __str__(self):
        return f'{self.code} ({self.discount_percent}%)'


class Cart(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='cart')
    city = models.ForeignKey(ShippingRate, null=True, blank=True, on_delete=models.PROTECT, related_name='carts')
    coupon = models.ForeignKey(Coupon, null=True, blank=True, on_delete=models.SET_NULL, related_name='carts')

    @property
    def subtotal(self):
        return sum((item.line_total for item in self.items.select_related('product').all()), Decimal('0.00'))

    @property
    def discount_amount(self):
        if not self.coupon_id or not self.coupon.is_active:
            return Decimal('0.00')
        return (self.subtotal * self.coupon.discount_percent / Decimal('100')).quantize(Decimal('0.01'))

    @property
    def shipping_cost(self):
        # An unset city has no quoted shipping cost, never an implicit free rate.
        if not self.city_id:
            return None
        # عطر بالای ۳۰ میل — ارسال رایگان
        if self.items.filter(weight_grams__gt=30).exists():
            return Decimal('0.00')
        return self.city.cost

    @property
    def total(self):
        if not self.city_id:
            return None
        return self.subtotal - self.discount_amount + self.shipping_cost


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey('products.Product', on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    # حجم/وزن انتخابی برای عطرها (۱۵/۲۰/۳۰/۵۰/۱۰۰) — برای سایر محصولات null است
    weight_grams = models.PositiveIntegerField(null=True, blank=True)

    class Meta:
        ordering = ['id']
        constraints = [
            models.UniqueConstraint(fields=['cart', 'product', 'weight_grams'], name='unique_cart_product_weight'),
            models.CheckConstraint(condition=models.Q(quantity__gte=1), name='cart_quantity_positive'),
        ]

    @property
    def unit_price(self):
        # قیمت لحظه‌ای بر اساس حجم انتخابی عطر (با احتساب تخفیف)
        if self.weight_grams:
            return self.product.final_price_for_weight(self.weight_grams)
        return self.product.final_price

    @property
    def line_total(self):
        return self.unit_price * self.quantity
