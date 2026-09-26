from django.test import TestCase
from rest_framework.test import APIClient

from .models import User


class ChangePasswordTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(phone='09123456789')
        self.user.set_password('Previous!Secure42')
        self.user.save()
        self.client.force_authenticate(self.user)

    def post(self, **data):
        return self.client.post('/api/auth/change-password/', data, format='json')

    def test_change_password_with_valid_current(self):
        response = self.post(
            current_password='Previous!Secure42',
            password='Fresh!Gallery728',
            password_confirm='Fresh!Gallery728',
        )
        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('Fresh!Gallery728'))
        self.assertFalse(self.user.check_password('Previous!Secure42'))

    def test_wrong_current_password_rejected(self):
        response = self.post(
            current_password='Wrong!Pass99',
            password='Fresh!Gallery728',
            password_confirm='Fresh!Gallery728',
        )
        self.assertEqual(response.status_code, 400)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('Previous!Secure42'))

    def test_reused_or_mismatched_or_weak_passwords_rejected(self):
        same = self.post(
            current_password='Previous!Secure42',
            password='Previous!Secure42',
            password_confirm='Previous!Secure42',
        )
        self.assertEqual(same.status_code, 400)
        mismatch = self.post(
            current_password='Previous!Secure42',
            password='Fresh!Gallery728',
            password_confirm='Fresh!Gallery999',
        )
        self.assertEqual(mismatch.status_code, 400)
        weak = self.post(
            current_password='Previous!Secure42',
            password='12345678',
            password_confirm='12345678',
        )
        self.assertEqual(weak.status_code, 400)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('Previous!Secure42'))

    def test_authentication_required(self):
        self.client.force_authenticate(None)
        response = self.post(
            current_password='Previous!Secure42',
            password='Fresh!Gallery728',
            password_confirm='Fresh!Gallery728',
        )
        self.assertEqual(response.status_code, 401)
