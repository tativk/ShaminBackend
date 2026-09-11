from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from products.models import Product
from .models import Cart, CartItem, ShippingRate


class CartTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(phone='09123456789')
        self.client = APIClient()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {RefreshToken.for_user(self.user).access_token}')
        self.product = Product.objects.create(name='Perfume', category='perfume', gender='unisex',
                                              price=Decimal('100.00'), discount_percent=10, stock=5)
        ShippingRate.objects.create(city='Tehran', cost=Decimal('20.00'))
        ShippingRate.objects.create(city='Shiraz', cost=Decimal('30.00'))

    def add(self, quantity=1):
        return self.client.post('/api/cart/items/', {'product': self.product.pk, 'quantity': quantity}, format='json')

    def test_all_endpoints_require_authentication(self):
        client = APIClient()
        for method, url in [('get', '/api/cart/'), ('patch', '/api/cart/'),
                            ('post', '/api/cart/items/'), ('patch', '/api/cart/items/1/'),
                            ('delete', '/api/cart/items/1/'), ('get', '/api/shipping/cities/')]:
            with self.subTest(method=method, url=url):
                self.assertEqual(getattr(client, method)(url).status_code, 401)

    def test_empty_cart_is_reused_and_shipping_not_assumed_free(self):
        first = self.client.get('/api/cart/').data
        second = self.client.get('/api/cart/').data
        self.assertEqual(first['id'], second['id'])
        self.assertEqual(first['subtotal'], '0.00')
        self.assertIsNone(first['total'])
        self.assertIsNone(first['shipping_cost'])

    def test_discount_totals_and_city_changes(self):
        self.assertEqual(self.add(2).status_code, 201)
        response = self.client.patch('/api/cart/', {'city': 'Tehran'}, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['subtotal'], '180.00')
        self.assertEqual(response.data['total'], '200.00')
        response = self.client.patch('/api/cart/', {'city': 'Shiraz'}, format='json')
        self.assertEqual(response.data['total'], '210.00')
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 5)

    def test_repeat_add_increases_quantity_without_duplicate(self):
        self.add(2)
        response = self.add(1)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(CartItem.objects.count(), 1)
        self.assertEqual(response.data['items'][0]['quantity'], 3)

    def test_stock_limit_includes_existing_quantity(self):
        self.add(4)
        self.assertEqual(self.add(2).status_code, 400)
        self.assertEqual(CartItem.objects.get().quantity, 4)

    def test_patch_and_delete_item(self):
        item_id = self.add(2).data['items'][0]['id']
        url = f'/api/cart/items/{item_id}/'
        self.assertEqual(self.client.patch(url, {'quantity': 6}, format='json').status_code, 400)
        response = self.client.patch(url, {'quantity': 1}, format='json')
        self.assertEqual(response.data['subtotal'], '90.00')
        self.assertEqual(self.client.delete(url).status_code, 204)
        self.assertEqual(self.client.get('/api/cart/').data['items'], [])

    def test_invalid_quantity_rejected(self):
        for quantity in [0, -1, 'bad', 1.5]:
            with self.subTest(quantity=quantity):
                self.assertEqual(self.add(quantity).status_code, 400)
        self.assertEqual(CartItem.objects.count(), 0)

    def test_inactive_and_missing_products(self):
        self.product.is_active = False
        self.product.save()
        self.assertEqual(self.add().status_code, 400)
        self.assertEqual(self.client.post('/api/cart/items/', {'product': 99999, 'quantity': 1}).status_code, 404)

    def test_unknown_city_rejected_and_existing_city_retained(self):
        self.client.patch('/api/cart/', {'city': 'Tehran'}, format='json')
        self.assertEqual(self.client.patch('/api/cart/', {'city': 'Unknown'}, format='json').status_code, 400)
        self.assertEqual(self.client.get('/api/cart/').data['city'], 'Tehran')

    def test_other_users_item_is_private(self):
        other = get_user_model().objects.create_user(phone='09123456788')
        cart = Cart.objects.create(user=other)
        item = CartItem.objects.create(cart=cart, product=self.product, quantity=1)
        url = f'/api/cart/items/{item.pk}/'
        self.assertEqual(self.client.patch(url, {'quantity': 2}).status_code, 404)
        self.assertEqual(self.client.delete(url).status_code, 404)
        item.refresh_from_db()
        self.assertEqual(item.quantity, 1)

    def test_cities_list(self):
        response = self.client.get('/api/shipping/cities/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['count'], 2)

    def test_current_product_price_used(self):
        self.add(2)
        self.product.price = Decimal('200.00')
        self.product.save()
        self.assertEqual(self.client.get('/api/cart/').data['subtotal'], '360.00')

    def test_product_list_route_is_preserved(self):
        self.assertEqual(self.client.get('/api/products/').status_code, 200)
