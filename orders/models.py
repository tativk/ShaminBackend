from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from decimal import Decimal


class Order(models.Model):
    class Status(models.TextChoices):
        PENDING   = 'pending',   _('در انتظار پرداخت')
        PAID      = 'paid',      _('پرداخت شده')
        FAILED    = 'failed',    _('ناموفق')
        CANCELLED = 'cancelled', _('لغو شده')

    user        = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name='orders',
        verbose_name=_('کاربر'),
    )
    status      = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        verbose_name=_('وضعیت'),
    )
    total_price = models.DecimalField(max_digits=12, decimal_places=2, verbose_name=_('مبلغ کل'))
    address     = models.TextField(verbose_name=_('آدرس تحویل'))

    # فیلدهای درگاه — الان با Mock پر می‌شن، بعداً واقعی
    payment_authority = models.CharField(max_length=200, blank=True, null=True, unique=True)
    payment_ref_id    = models.CharField(max_length=200, blank=True)

    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name        = _('سفارش')
        verbose_name_plural = _('سفارش‌ها')
        ordering            = ['-created_at']

    def __str__(self):
        return f'Order #{self.pk} — {self.user} — {self.status}'

class OrderItem(models.Model):
    order    = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='items',
        verbose_name=_('سفارش'),
    )
    product  = models.ForeignKey(
        'products.Product',
        on_delete=models.PROTECT,
        related_name='order_items',
        verbose_name=_('محصول'),
    )
    quantity = models.PositiveIntegerField(default=1, verbose_name=_('تعداد'))
    price    = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        verbose_name=_('قیمت لحظه خرید'),
    )  # snapshot — تغییر قیمت بعداً روی سفارش تأثیر نمی‌ذاره

    class Meta:
        verbose_name        = _('آیتم سفارش')
        verbose_name_plural = _('آیتم‌های سفارش')

    def __str__(self):
        return f'{self.product} × {self.quantity}'

    @property
    def subtotal(self) -> Decimal:
        return self.price * self.quantity

