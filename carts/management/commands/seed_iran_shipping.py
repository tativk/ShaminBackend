from decimal import Decimal

from django.core.management.base import BaseCommand

from carts.iran_shipping_data import PROVINCE_SHIPPING
from carts.models import ShippingRate


class Command(BaseCommand):
    help = 'Seed all Iran provinces and cities with base shipping costs.'

    def handle(self, *args, **options):
        created = 0
        updated = 0
        for province, cost, cities in PROVINCE_SHIPPING:
            for city in cities:
                rate, was_created = ShippingRate.objects.update_or_create(
                    city=city,
                    defaults={'province': province, 'cost': Decimal(str(cost))},
                )
                if was_created:
                    created += 1
                else:
                    updated += 1

        total = ShippingRate.objects.count()
        provinces = ShippingRate.objects.exclude(province='').values('province').distinct().count()
        self.stdout.write(self.style.SUCCESS(
            f'Created: {created} | Updated: {updated} | Total cities: {total} | Provinces: {provinces}'
        ))
