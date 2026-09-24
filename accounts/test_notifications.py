from django.test import TestCase
from django.db import transaction
from django.utils import timezone
from rest_framework.test import APIClient
from .models import AdminNotification, User
from .views import get_tokens_for_user
from orders.models import Order
from products.models import Product


class AdminNotificationTests(TestCase):
    def setUp(self):
        self.admin = User.objects.create_superuser(phone='09120000001', password='Testing!728')
        self.other = User.objects.create_superuser(phone='09120000002', password='Testing!728')
        self.customer = User.objects.create_user(phone='09120000003')
        AdminNotification.objects.all().delete()
        self.client = APIClient()
        self.client.force_authenticate(self.admin)
        self.url = '/api/admin/notifications/'

    def test_only_admin_can_read_or_mark(self):
        for user in (None, self.customer):
            self.client.force_authenticate(user)
            self.assertIn(self.client.get(self.url).status_code, (401, 403))
            self.assertIn(self.client.post(self.url, {'through': 1}).status_code, (401, 403))

    def test_order_status_login_and_password_events(self):
        order = Order.objects.create(user=self.customer, total_price='125000', address='test')
        order.status = 'paid'
        order.save(update_fields=['status'])
        get_tokens_for_user(self.customer)
        self.customer.set_password('Private!12345')
        self.customer.save(update_fields=['password'])
        events = self.client.get(self.url).data
        self.assertEqual(events['unread_count'], 4)
        self.assertEqual({row['kind'] for row in events['results']}, {'order', 'login', 'account'})
        self.assertNotIn('Private!12345', str(events))
        self.assertNotIn(self.customer.password, str(events))
        self.assertIn('پرداخت شده', str(events))

    def test_read_state_is_per_admin_and_bulk_read_has_cutoff(self):
        first = AdminNotification.objects.create(kind='order', title='First', message='test')
        second = AdminNotification.objects.create(kind='login', title='Second', message='test')
        response = self.client.post(self.url, {'through': first.pk})
        self.assertEqual(response.data['unread_count'], 1)
        self.assertEqual(self.client.get(self.url+'?unread=true').data['results'][0]['id'], second.pk)
        self.client.force_authenticate(self.other)
        self.assertEqual(self.client.get(self.url).data['unread_count'], 2)
        self.client.post(self.url, {'id': second.pk})
        self.client.post(self.url, {'id': second.pk})
        self.assertEqual(self.client.get(self.url).data['unread_count'], 1)

    def test_cursor_pagination_validation_and_rollback(self):
        AdminNotification.objects.bulk_create([AdminNotification(kind='order', title=str(i), message='test') for i in range(35)])
        first = self.client.get(self.url).data
        second = self.client.get(self.url, {'before': first['next_before']}).data
        self.assertEqual(len(first['results']), 30)
        self.assertEqual(len(second['results']), 5)
        self.assertFalse({row['id'] for row in first['results']} & {row['id'] for row in second['results']})
        self.assertEqual(self.client.get(self.url, {'before': 'bad'}).status_code, 400)
        self.assertEqual(self.client.post(self.url, {}).status_code, 400)
        with self.assertRaises(ValueError):
            with transaction.atomic():
                Order.objects.create(user=self.customer, total_price=100, address='test')
                raise ValueError('rollback')
        self.assertEqual(AdminNotification.objects.count(), 35)

    def test_noop_save_and_last_login_do_not_create_noise(self):
        self.customer.last_login = timezone.now()
        self.customer.save(update_fields=['last_login'])
        self.assertFalse(AdminNotification.objects.exists())
        product = Product.objects.create(name='Perfume', price='100', stock=2, category='perfume', gender='unisex')
        product.save()
        self.assertEqual(AdminNotification.objects.count(), 1)
        product.stock = 1
        product.save(update_fields=['stock'])
        product.delete()
        self.assertEqual(AdminNotification.objects.count(), 3)
