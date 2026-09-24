from datetime import timedelta
from unittest.mock import patch

from django.core.cache import cache
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from .models import PasswordRecovery, User


class PasswordRecoveryTests(TestCase):
    def setUp(self):
        cache.clear()
        self.client = APIClient()
        self.user = User.objects.create_user(phone='09123456789')
        self.user.set_password('Previous!Secure42')
        self.user.save()
        self.sender = patch('accounts.recovery.send_otp', return_value=True).start()
        self.addCleanup(patch.stopall)

    def post(self, action, **data):
        return self.client.post('/api/auth/password-reset/' + action + '/', data, format='json')

    def request_code(self):
        response = self.post('request', phone=self.user.phone)
        self.assertEqual(response.status_code, 200)
        return self.sender.call_args.args[1]

    def verify(self, code):
        return self.post('verify', phone=self.user.phone, code=code)

    def test_reset_and_login_and_replay_rejected(self):
        code = self.request_code()
        self.assertNotEqual(PasswordRecovery.objects.get().code_hash, code)
        token = self.verify(code).data['reset_token']
        data = dict(reset_token=token, password='Fresh!Gallery728', password_confirm='Fresh!Gallery728')
        self.assertEqual(self.post('confirm', **data).status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password(data['password']))
        self.assertFalse(self.user.check_password('Previous!Secure42'))
        login = self.client.post('/api/auth/login/', {'phone': self.user.phone, 'password': data['password']})
        self.assertEqual(login.status_code, 200)
        self.assertIn('access', login.data)
        self.assertEqual(self.post('confirm', **data).status_code, 400)
        self.assertEqual(self.verify(code).status_code, 400)

    def test_unknown_number_does_not_create_account_or_send_sms(self):
        response = self.post('request', phone='09999999999')
        self.assertEqual(response.status_code, 200)
        self.sender.assert_not_called()
        self.assertEqual(User.objects.count(), 1)

    def test_cooldown_and_expiry(self):
        code = self.request_code()
        self.assertEqual(self.post('request', phone=self.user.phone).status_code, 429)
        PasswordRecovery.objects.update(created_at=timezone.now() - timedelta(minutes=6))
        self.assertEqual(self.verify(code).status_code, 400)

    def test_five_wrong_attempts_lock_code(self):
        code = self.request_code()
        wrong = '000000' if code != '000000' else '111111'
        for _ in range(5):
            self.assertEqual(self.verify(wrong).status_code, 400)
        self.assertEqual(self.verify(code).status_code, 400)

    def test_failed_sms_allows_retry(self):
        self.sender.return_value = False
        self.assertEqual(self.post('request', phone=self.user.phone).status_code, 503)
        self.assertFalse(PasswordRecovery.objects.exists())
        self.sender.return_value = True
        self.request_code()

    def test_password_validation_does_not_consume_token(self):
        token = self.verify(self.request_code()).data['reset_token']
        for password, confirmation in [('123', '123'), ('Fresh!Gallery728', 'different')]:
            self.assertEqual(self.post('confirm', reset_token=token, password=password, password_confirm=confirmation).status_code, 400)
        self.assertFalse(PasswordRecovery.objects.get().consumed)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('Previous!Secure42'))

    def test_new_request_invalidates_old_token(self):
        token = self.verify(self.request_code()).data['reset_token']
        PasswordRecovery.objects.update(created_at=timezone.now() - timedelta(minutes=3))
        self.request_code()
        response = self.post('confirm', reset_token=token, password='Fresh!Gallery728', password_confirm='Fresh!Gallery728')
        self.assertEqual(response.status_code, 400)

    def test_inactive_account_cannot_reset_or_login(self):
        self.user.is_active = False
        self.user.save()
        self.post('request', phone=self.user.phone)
        self.sender.assert_not_called()
        response = self.client.post('/api/auth/login/', {'phone': self.user.phone, 'password': 'Previous!Secure42'})
        self.assertEqual(response.status_code, 400)
