"""Store business events, never passwords, OTP codes, or payment credentials."""
from decimal import Decimal
from django.contrib.auth.signals import user_logged_in, user_logged_out
from django.db.models.signals import pre_save, post_save, post_delete
from django.dispatch import receiver

from .models import AdminNotification, User, Address
from products.models import Product, Brand, ProductImage
from orders.models import Order, OrderItem
from carts.models import Cart, CartItem, ShippingRate
from reviews.models import Review


TRACKED = {
    User: ('account', 'حساب کاربری', '', ('first_name', 'last_name', 'email', 'phone', 'password', 'is_active', 'is_staff', 'is_superuser')),
    Address: ('account', 'آدرس کاربر', '', ('province', 'city', 'street', 'postal_code', 'detail')),
    Order: ('order', 'سفارش', 'orders', ('status', 'total_price', 'address')),
    OrderItem: ('order', 'آیتم سفارش', 'orders', ('quantity', 'price', 'product_id')),
    Product: ('product', 'محصول', 'products', ('name', 'price', 'stock', 'discount_percent', 'is_active', 'description', 'category', 'gender', 'brand_id')),
    Brand: ('product', 'برند', 'products', ('name', 'slug')),
    ProductImage: ('product', 'تصویر محصول', 'products', ('image', 'is_main')),
    Review: ('review', 'نظر مشتری', '', ('text', 'rating', 'is_approved')),
    Cart: ('cart', 'سبد خرید', '', ('city_id',)),
    CartItem: ('cart', 'آیتم سبد خرید', '', ('quantity', 'product_id')),
    ShippingRate: ('shipping', 'تعرفه ارسال', '', ('city', 'cost')),
}


def record_login(user, logout=False):
    AdminNotification.objects.create(
        kind='login', title='خروج از حساب' if logout else 'ورود به حساب',
        message=f'کاربر #{user.pk} ({user.get_full_name() or "بدون نام"}) ' + ('از حساب خارج شد.' if logout else 'وارد حساب شد.'),
    )


@receiver(user_logged_in)
def session_login(sender, user, **kwargs):
    record_login(user)


@receiver(user_logged_out)
def session_logout(sender, user, **kwargs):
    if user:
        record_login(user, logout=True)


@receiver(pre_save)
def remember_changes(sender, instance, raw=False, using='default', update_fields=None, **kwargs):
    if raw or sender not in TRACKED:
        return
    fields = [name for name in TRACKED[sender][3] if update_fields is None or name in update_fields or name.removesuffix('_id') in update_fields]
    previous = sender.objects.using(using).filter(pk=instance.pk).values(*fields).first() if instance.pk else None
    instance._notification_changes = [
        name for name in fields if previous and
        sender._meta.get_field(name).get_prep_value(previous[name]) !=
        sender._meta.get_field(name).get_prep_value(getattr(instance, name))
    ]


@receiver(post_save)
def notify_save(sender, instance, created, raw=False, using='default', **kwargs):
    if raw or sender not in TRACKED:
        return
    changes = getattr(instance, '_notification_changes', [])
    if not created and not changes:
        return
    kind, label, section, _ = TRACKED[sender]
    action = 'ثبت شد' if created else 'ویرایش شد'
    message = f'{label} #{instance.pk} {action}.'
    if sender is Order:
        message = f'سفارش #{instance.pk} · وضعیت: {instance.get_status_display()} · مبلغ: {Decimal(str(instance.total_price)):,.0f} تومان'
    elif sender is Product:
        message = f'{instance.name} · موجودی: {instance.stock} · قیمت: {Decimal(str(instance.price)):,.0f} تومان'
    title = f'{label} {action}'
    if sender is User and 'password' in changes:
        title = 'رمز عبور تغییر کرد'
        message = f'رمز عبور حساب #{instance.pk} تغییر کرد.'
    AdminNotification.objects.using(using).create(kind=kind, title=title, message=message, section=section)


@receiver(post_delete)
def notify_delete(sender, instance, using='default', **kwargs):
    if sender in TRACKED:
        kind, label, section, _ = TRACKED[sender]
        AdminNotification.objects.using(using).create(kind=kind, title=f'{label} حذف شد', message=f'{label} #{instance.pk} حذف شد.', section=section)
