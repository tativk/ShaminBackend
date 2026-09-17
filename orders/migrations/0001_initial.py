import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models
from django.utils.translation import gettext_lazy as _


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ('products', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Order',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('status', models.CharField(choices=[('pending', _('در انتظار پرداخت')), ('paid', _('پرداخت شده')), ('failed', _('ناموفق')), ('cancelled', _('لغو شده'))], default='pending', max_length=20, verbose_name=_('وضعیت'))),
                ('total_price', models.DecimalField(decimal_places=2, max_digits=12, verbose_name=_('مبلغ کل'))),
                ('address', models.TextField(verbose_name=_('آدرس تحویل'))),
                ('payment_authority', models.CharField(blank=True, max_length=200, null=True, unique=True)),
                ('payment_ref_id', models.CharField(blank=True, max_length=200)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='orders', to=settings.AUTH_USER_MODEL, verbose_name=_('کاربر'))),
            ],
            options={
                'verbose_name': _('سفارش'),
                'verbose_name_plural': _('سفارش‌ها'),
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='OrderItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('quantity', models.PositiveIntegerField(default=1, verbose_name=_('تعداد'))),
                ('price', models.DecimalField(decimal_places=2, max_digits=12, verbose_name=_('قیمت لحظه خرید'))),
                ('order', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='items', to='orders.order', verbose_name=_('سفارش'))),
                ('product', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='order_items', to='products.product', verbose_name=_('محصول'))),
            ],
            options={
                'verbose_name': _('آیتم سفارش'),
                'verbose_name_plural': _('آیتم‌های سفارش'),
            },
        ),
    ]
