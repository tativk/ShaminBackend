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


class Cart(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='cart')
    city = models.ForeignKey(ShippingRate, null=True, blank=True, on_delete=models.PROTECT, related_name='carts')

    # قاعده کارفرما: برای هر عطر بالای ۳۰ گرم، ارسال رایگان است.
    FREE_SHIPPING_PERFUME_MIN = 30
    # وزن مبنا هر پله ارسال (گرم) — مطابق پله‌های وزنی اداره پست
    SHIPPING_WEIGHT_STEP_GRAMS = 1000
    # وزن هر واحد محصولات غیرعطری (لوازم آرایشی/اکسسوری) — گرم
    NON_PERFUME_UNIT_WEIGHT_GRAMS = 1000

    @property
    def subtotal(self):
        return sum((item.line_total for item in self.items.select_related('product').all()), Decimal('0.00'))

    @property
    def has_free_shipping(self):
        return any(
            item.product.category == 'perfume' and item.quantity > self.FREE_SHIPPING_PERFUME_MIN
            for item in self.items.select_related('product').all()
        )

    @property
    def total_weight_grams(self):
        """عطر گرمی: هر واحد = یک گرم؛ سایر دسته‌ها: هر عدد = وزن مبنا."""
        total = 0
        for item in self.items.select_related('product').all():
            if item.product.category == 'perfume':
                total += item.quantity
            else:
                total += item.quantity * self.NON_PERFUME_UNIT_WEIGHT_GRAMS
        return total

    @property
    def shipping_cost(self):
        # An unset city has no quoted shipping cost, never an implicit free rate.
        if not self.city_id:
            return None
        if self.has_free_shipping:
            return Decimal('0.00')
        # هزینه ارسال با تعداد سفارش زیاد می‌شود: هر پله وزنی، یک نرخ استان
        steps = max(1, -(-self.total_weight_grams // self.SHIPPING_WEIGHT_STEP_GRAMS))
        return self.city.cost * steps

    @property
    def total(self):
        return self.subtotal + self.shipping_cost if self.city_id else None


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey('products.Product', on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(validators=[MinValueValidator(1)])

    class Meta:
        ordering = ['id']
        constraints = [
            models.UniqueConstraint(fields=['cart', 'product'], name='unique_cart_product'),
            models.CheckConstraint(condition=models.Q(quantity__gte=1), name='cart_quantity_positive'),
        ]

    @property
    def line_total(self):
        return self.product.final_price * self.quantity
