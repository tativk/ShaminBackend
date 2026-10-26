from unittest.mock import patch

from django.test import SimpleTestCase, override_settings
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from accounts.sms import send_otp, send_otp_kavenegar
from accounts.models import Address, User


class SmsKavenegarTests(SimpleTestCase):
    @override_settings(
        SMS_PROVIDER='kavenegar',
        KAVENEGAR_API_KEY='demo-key',
        KAVENEGAR_TEMPLATE='demo-template',
    )
    @patch('accounts.sms.requests.post')
    def test_send_otp_uses_kavenegar_lookup_api(self, mock_post):
        mock_post.return_value.json.return_value = {'return': {'status': 200}}

        result = send_otp('09123456789', '123456')

        self.assertTrue(result)
        mock_post.assert_called_once_with(
            'https://api.kavenegar.com/v1/demo-key/verify/lookup.json',
            data={'receptor': '09123456789', 'token': '123456', 'template': 'demo-template'},
            timeout=10,
        )

    @override_settings(SMS_PROVIDER='console')
    def test_send_otp_console_provider_returns_true(self):
        self.assertTrue(send_otp('09123456789', '654321'))

    @override_settings(
        SMS_PROVIDER='kavenegar',
        KAVENEGAR_API_KEY='demo-key',
        KAVENEGAR_TEMPLATE='demo-template',
    )
    @patch('accounts.sms.requests.post')
    def test_send_otp_kavenegar_handles_failed_response(self, mock_post):
        mock_post.return_value.json.return_value = {'return': {'status': 400, 'message': 'bad request'}}

        self.assertFalse(send_otp_kavenegar('09123456789', '123456'))


class RegistrationApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(phone='09120000000')
        self.client.force_authenticate(self.user)

    def test_complete_registration_saves_user_and_address(self):
        response = self.client.post('/api/auth/complete-registration/', {
            'first_name': 'علی',
            'last_name': 'رضایی',
            'email': 'ali@example.com',
            'province': 'تهران',
            'city': 'تهران',
            'street': 'خیابان ولیعصر',
            'postal_code': '1234567890',
            'detail': 'پلاک ۱۰',
        })

        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.is_profile_complete)
        self.assertEqual(self.user.address.postal_code, '1234567890')
        self.assertEqual(response.data['role'], 'customer')
        self.assertTrue(response.data['is_profile_complete'])

    def test_incomplete_registration_is_rejected(self):
        response = self.client.post('/api/auth/complete-registration/', {
            'first_name': 'علی',
            'last_name': 'رضایی',
            'province': 'تهران',
            'city': 'تهران',
            'street': 'خیابان ولیعصر',
            'postal_code': '123',
        })

        self.assertEqual(response.status_code, 400)
        self.assertFalse(Address.objects.filter(user=self.user).exists())


class AdminManagementTests(TestCase):
    """تب ادمین‌ها + تغییر شماره خود کاربر."""

    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(phone='09120000001')
        self.admin.is_staff = True
        self.admin.set_password('AdminPass1')
        self.admin.save()
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {RefreshToken.for_user(self.admin).access_token}')

    def test_admin_can_list_and_create_admins(self):
        response = self.client.post('/api/auth/admin/admins/', {
            'phone': '09120000002', 'first_name': 'مدیر', 'last_name': 'دوم', 'password': 'Secret2',
        }, format='json')
        self.assertEqual(response.status_code, 201)
        created = User.objects.get(phone='09120000002')
        self.assertTrue(created.is_staff)
        self.assertTrue(created.check_password('Secret2'))
        self.assertEqual(self.client.get('/api/auth/admin/admins/').status_code, 200)

    def test_duplicate_admin_phone_rejected(self):
        self.client.post('/api/auth/admin/admins/', {'phone': '09120000003', 'password': 'Secret3'}, format='json')
        response = self.client.post('/api/auth/admin/admins/', {'phone': '09120000003', 'password': 'Secret3'}, format='json')
        self.assertEqual(response.status_code, 400)

    def test_customer_cannot_manage_admins(self):
        customer = User.objects.create_user(phone='09120000004')
        client = APIClient()
        client.credentials(HTTP_AUTHORIZATION=f'Bearer {RefreshToken.for_user(customer).access_token}')
        self.assertEqual(client.get('/api/auth/admin/admins/').status_code, 403)

    def test_admin_cannot_deactivate_self(self):
        me = User.objects.get(phone='09120000001')
        response = self.client.patch(f'/api/auth/admin/admins/{me.pk}/', {'is_active': False}, format='json')
        self.assertEqual(response.status_code, 400)

    def test_user_can_change_own_phone_with_password(self):
        response = self.client.post('/api/auth/change-phone/', {
            'phone': '09120000009', 'current_password': 'AdminPass1',
        }, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(User.objects.filter(phone='09120000009').exists())

    def test_change_phone_requires_correct_password_and_unique(self):
        response = self.client.post('/api/auth/change-phone/', {
            'phone': '09120000010', 'current_password': 'wrong',
        }, format='json')
        self.assertEqual(response.status_code, 400)

        User.objects.create_user(phone='09120000011')
        response = self.client.post('/api/auth/change-phone/', {
            'phone': '09120000011', 'current_password': 'AdminPass1',
        }, format='json')
        self.assertEqual(response.status_code, 400)
