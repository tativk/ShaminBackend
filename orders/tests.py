from decimal import Decimal

from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import User
from carts.models import Cart, CartItem, ShippingRate
from products.models import Brand, Product

from .models import Order



class OrderFlowTests(TestCase):
	def setUp(self):
		self.client = APIClient()
		self.user = User.objects.create_user(phone='09121111111')
		self.client.force_authenticate(self.user)
		brand = Brand.objects.create(name='Shamin', slug='shamin')
		self.product = Product.objects.create(
			name='Test perfume',
			brand=brand,
			category='perfume',
			gender='unisex',
			price='100.00',
			stock=5,
		)
		shipping = ShippingRate.objects.create(city='تهران', cost='20.00')
		cart = Cart.objects.create(user=self.user, city=shipping)
		CartItem.objects.create(cart=cart, product=self.product, quantity=2)

	def test_successful_payment_makes_product_visible_in_dashboard(self):
		response = self.client.post('/api/orders/', {
			'city': 'تهران',
			'address': 'خیابان ولیعصر، پلاک ۱۰',
			'postal_code': '1234567890',
			'shipping_cost': '20.00',
		})

		self.assertEqual(response.status_code, 201, response.data)
		order = Order.objects.get(pk=response.data['order_id'])
		self.assertEqual(order.status, Order.Status.PENDING)
		self.assertEqual(order.total_price, Decimal('220.00'))
		self.assertEqual(order.items.get().price, Decimal('100.00'))
		self.assertEqual(self.product.__class__.objects.get(pk=self.product.pk).stock, 3)
		self.assertFalse(CartItem.objects.filter(cart__user=self.user).exists())

		callback = self.client.get(
			'/api/orders/payment/callback/',
			{'Authority': order.payment_authority, 'Status': 'OK'},
		)

		self.assertEqual(callback.status_code, 200)
		order.refresh_from_db()
		self.assertEqual(order.status, Order.Status.PAID)

		purchased = self.client.get('/api/auth/purchased-products/')
		self.assertEqual(purchased.status_code, 200)
		self.assertEqual(purchased.data[0]['product_id'], self.product.id)
		self.assertEqual(purchased.data[0]['quantity'], 2)
