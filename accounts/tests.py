from unittest.mock import patch

from django.test import SimpleTestCase, override_settings
from django.test import TestCase
from rest_framework.test import APIClient

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
