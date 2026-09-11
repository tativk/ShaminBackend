"""Exercise real database/API operations and roll back all sample records."""
from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth import get_user_model
from django.db import transaction
from django.test import override_settings
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from products.models import Product
from carts.models import ShippingRate


class Command(BaseCommand):
    help = 'Check authenticated cart flow on configured database; sample changes are rolled back.'

    def handle(self, *args, **options):
        with transaction.atomic(), override_settings(ALLOWED_HOSTS=['testserver']):
            user = get_user_model().objects.create_user(phone='cart-check')
            product = Product.objects.create(name='Cart smoke check', category='perfume', gender='unisex',
                                             price='100.00', discount_percent=10, stock=5)
            rate = ShippingRate.objects.create(city='__cart_smoke_check__', cost='20.00')
            client = APIClient()
            client.credentials(HTTP_AUTHORIZATION=f'Bearer {RefreshToken.for_user(user).access_token}')
            def expect(response, status):
                if response.status_code != status:
                    raise CommandError(f'Expected {status}, got {response.status_code}')
                return response.data
            expect(client.get('/api/cart/'), 200)
            data = expect(client.post('/api/cart/items/', {'product': product.pk, 'quantity': 2}, format='json'), 201)
            item_id = data['items'][0]['id']
            data = expect(client.patch('/api/cart/', {'city': rate.city}, format='json'), 200)
            if data['total'] != '200.00':
                raise CommandError('Incorrect total')
            expect(client.post('/api/cart/items/', {'product': product.pk, 'quantity': 5}, format='json'), 400)
            expect(client.patch(f'/api/cart/items/{item_id}/', {'quantity': 1}, format='json'), 200)
            expect(client.delete(f'/api/cart/items/{item_id}/'), 204)
            expect(client.get('/api/shipping/cities/'), 200)
            expect(client.post('/api/auth/token/refresh/', {'refresh': str(RefreshToken.for_user(user))}, format='json'), 200)
            expect(client.get('/api/docs/'), 200)
            product.refresh_from_db()
            if product.stock != 5:
                raise CommandError('Stock was modified')
            transaction.set_rollback(True)
        self.stdout.write(self.style.SUCCESS('Cart, shipping, JWT refresh and docs passed; sample data rolled back.'))
