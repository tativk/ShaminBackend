from decimal import Decimal

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from carts.models import ShippingRate
from products.models import Brand, Product


class Command(BaseCommand):
    help = 'Create a realistic demo product, shipping city, and customer user for cart checkout testing.'

    def add_arguments(self, parser):
        parser.add_argument('--phone', default='09123456789', help='Customer phone number to create/use.')
        parser.add_argument('--product-name', default='محصول تست واقعی برای سبد خرید', help='Product name to seed.')

    @transaction.atomic
    def handle(self, *args, **options):
        if not settings.DEBUG:
            raise CommandError('Demo data is only allowed with DEBUG=True.')

        phone = options['phone']
        product_name = options['product_name']

        user_model = get_user_model()
        user, _ = user_model.objects.get_or_create(
            phone=phone,
            defaults={'first_name': 'Customer', 'last_name': 'Demo'},
        )

        brand, _ = Brand.objects.get_or_create(name='Demo Brand', defaults={'slug': 'demo-brand'})
        product, _ = Product.objects.get_or_create(
            name=product_name,
            defaults={
                'brand': brand,
                'category': 'perfume',
                'gender': 'unisex',
                'price': Decimal('250000.00'),
                'discount_percent': 10,
                'stock': 12,
                'is_active': True,
            },
        )

        ShippingRate.objects.get_or_create(city='تهران', defaults={'cost': Decimal('25000.00')})

        self.stdout.write(self.style.SUCCESS(
            f'Customer: {user.phone} | Product ID: {product.pk} | Product: {product.name} | City: تهران'
        ))
