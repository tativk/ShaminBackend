from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from products.models import Product
from carts.models import ShippingRate


class Command(BaseCommand):
    help = 'Create a clearly labelled demo product and shipping city for local manual testing.'

    @transaction.atomic
    def handle(self, *args, **options):
        if not settings.DEBUG:
            raise CommandError('Demo data is only allowed with DEBUG=True.')
        product, _ = Product.objects.get_or_create(
            name='محصول آزمایشی سبد خرید',
            defaults={'category': 'perfume', 'gender': 'unisex', 'price': '100000.00',
                      'discount_percent': 10, 'stock': 10, 'is_active': True},
        )
        ShippingRate.objects.get_or_create(city='شهر آزمایشی', defaults={'cost': '20000.00'})
        self.stdout.write(f'Demo product ID: {product.pk}; demo city created. Existing values preserved.')
