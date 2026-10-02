"""تست جریان ثبت‌نام: تا تأیید کد پیامکی، کاربر ساخته و ذخیره نمی‌شود."""
from django.contrib.auth import get_user_model
from django.test import TestCase

from .models import OtpCode, PendingRegistration

User = get_user_model()


class RegistrationFlowTests(TestCase):
    def _register(self, phone="09111111111", password="test1234"):
        return self.client.post(
            "/api/auth/register/",
            {"phone": phone, "password": password},
            format="json",
        )

    def _latest_code(self, phone):
        return OtpCode.objects.filter(phone=phone, is_used=False).latest("created_at").code

    def test_register_does_not_create_user_before_verification(self):
        response = self._register()
        self.assertEqual(response.status_code, 201, response.content)
        self.assertFalse(User.objects.filter(phone="09111111111").exists())
        self.assertTrue(PendingRegistration.objects.filter(phone="09111111111").exists())

    def test_verify_creates_user_with_saved_password(self):
        self._register()
        code = self._latest_code("09111111111")
        response = self.client.post(
            "/api/auth/verify-otp/",
            {"phone": "09111111111", "code": code},
            format="json",
        )
        self.assertEqual(response.status_code, 200, response.content)
        self.assertTrue(response.json()["access"])
        user = User.objects.get(phone="09111111111")
        self.assertTrue(user.check_password("test1234"))
        self.assertFalse(PendingRegistration.objects.filter(phone="09111111111").exists())

    def test_verify_without_registration_is_rejected(self):
        # کد OTP مستقیم ساخته می‌شود ولی هیچ ثبت‌نامی انجام نشده
        OtpCode.objects.create(phone="09222222222", code="123456")
        response = self.client.post(
            "/api/auth/verify-otp/",
            {"phone": "09222222222", "code": "123456"},
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("ثبت‌نام", response.json()["detail"])
        self.assertFalse(User.objects.filter(phone="09222222222").exists())

    def test_register_with_existing_password_user_is_rejected(self):
        User.objects.create_user(phone="09333333333")
        user = User.objects.get(phone="09333333333")
        user.set_password("oldpass")
        user.save()
        response = self._register(phone="09333333333")
        self.assertEqual(response.status_code, 400)

    def test_password_login_works_after_verification(self):
        self._register(phone="09444444444", password="secret99")
        code = self._latest_code("09444444444")
        self.client.post(
            "/api/auth/verify-otp/",
            {"phone": "09444444444", "code": code},
            format="json",
        )
        response = self.client.post(
            "/api/auth/login/",
            {"phone": "09444444444", "password": "secret99"},
            format="json",
        )
        self.assertEqual(response.status_code, 200, response.content)
