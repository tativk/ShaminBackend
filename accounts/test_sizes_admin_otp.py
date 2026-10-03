"""تست سایز عطر، ارسال رایگان بالای ۳۰ میل، محدودیت تلاش OTP و مدیریت مدیران."""
import io
import tempfile

from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings
from rest_framework_simplejwt.tokens import RefreshToken

from accounts.models import OtpCode
from carts.models import Cart, CartItem, ShippingRate
from products.models import Product

User = get_user_model()


def make_perfume(**kwargs):
    defaults = dict(
        name="عطر تست", category="perfume", gender="unisex",
        price=1000000, stock=100,
    )
    defaults.update(kwargs)
    return Product.objects.create(**defaults)


class AuthApiTestBase(TestCase):
    def auth(self, user):
        token = RefreshToken.for_user(user)
        return {"HTTP_AUTHORIZATION": f"Bearer {token.access_token}"}


class PerfumeSizeTests(AuthApiTestBase):
    def setUp(self):
        self.user = User.objects.create_user(phone="09111111111")
        self.headers = self.auth(self.user)
        self.perfume = make_perfume()
        ShippingRate.objects.create(province="تهران", city="تهران", cost=35000)

    def _add(self, payload):
        return self.client.post(
            "/api/cart/items/", payload,
            content_type="application/json", **self.headers,
        )

    def test_perfume_requires_valid_weight(self):
        response = self._add({"product": self.perfume.id, "quantity": 1, "weight_grams": 25})
        self.assertEqual(response.status_code, 400, response.content)

        response = self._add({"product": self.perfume.id, "quantity": 1, "weight_grams": 15})
        self.assertEqual(response.status_code, 201, response.content)
        item = CartItem.objects.get(cart__user=self.user)
        self.assertEqual(item.weight_grams, 15)

    def test_same_weight_merges_different_weight_separate_rows(self):
        self._add({"product": self.perfume.id, "quantity": 1, "weight_grams": 15})
        self._add({"product": self.perfume.id, "quantity": 1, "weight_grams": 15})
        self._add({"product": self.perfume.id, "quantity": 1, "weight_grams": 50})
        cart = Cart.objects.get(user=self.user)
        rows = {(i.weight_grams, i.quantity) for i in cart.items.all()}
        self.assertEqual(rows, {(15, 2), (50, 1)})

    def test_shipping_free_above_30_grams(self):
        self._add({"product": self.perfume.id, "quantity": 1, "weight_grams": 20})
        cart = Cart.objects.get(user=self.user)
        cart.city = ShippingRate.objects.get(city="تهران")
        cart.save()
        self.assertEqual(cart.shipping_cost, 35000)

        self._add({"product": self.perfume.id, "quantity": 1, "weight_grams": 50})
        cart.refresh_from_db()
        self.assertEqual(cart.shipping_cost, 0)

    def test_non_perfume_ignores_weight(self):
        cosmetic = Product.objects.create(
            name="کرم", category="cosmetic", gender="female", price=200000, stock=10,
        )
        response = self._add({"product": cosmetic.id, "quantity": 2, "weight_grams": 100})
        self.assertEqual(response.status_code, 201)
        item = CartItem.objects.get(cart__user=self.user)
        self.assertIsNone(item.weight_grams)


class OtpAttemptLimitTests(TestCase):
    def test_five_wrong_attempts_invalidate_code(self):
        from accounts.models import PendingRegistration
        PendingRegistration.objects.create(
            phone="09222222222",
            password="hashed-value-for-test",
        )
        self.client.post(
            "/api/auth/register/",
            {"phone": "09222222222", "password": "secret123"},
            format="json",
        )
        code = OtpCode.objects.filter(phone="09222222222", is_used=False).latest("created_at")
        for _ in range(5):
            response = self.client.post(
                "/api/auth/verify-otp/",
                {"phone": "09222222222", "code": "000000"},
                format="json",
            )
            self.assertEqual(response.status_code, 400)
        code.refresh_from_db()
        self.assertTrue(code.is_used)
        # حتی با کد درست هم دیگر پذیرفته نمی‌شود
        response = self.client.post(
            "/api/auth/verify-otp/",
            {"phone": "09222222222", "code": code.code},
            format="json",
        )
        self.assertEqual(response.status_code, 400)


class AdminStaffTests(AuthApiTestBase):
    def setUp(self):
        self.superuser = User.objects.create_superuser(phone="09300000001", password="adminpass1")
        self.staff = User.objects.create_user(phone="09300000002")
        self.staff.is_staff = True
        self.staff.save()
        self.customer = User.objects.create_user(phone="09300000003")
        self.super_headers = self.auth(self.superuser)
        self.staff_headers = self.auth(self.staff)

    def test_only_superuser_can_list_staff(self):
        response = self.client.get("/api/auth/admin/staff/", **self.staff_headers)
        self.assertEqual(response.status_code, 403)
        response = self.client.get("/api/auth/admin/staff/", **self.super_headers)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 2)  # ابروزر + یک استف

    def test_superuser_can_create_and_remove_admin(self):
        response = self.client.post(
            "/api/auth/admin/staff/",
            {"phone": "09300000004", "password": "strongpass1", "first_name": "مدیر", "last_name": "دوم"},
            format="json",
            **self.super_headers,
        )
        self.assertEqual(response.status_code, 201, response.content)
        created = User.objects.get(phone="09300000004")
        self.assertTrue(created.is_staff)

        response = self.client.delete(
            f"/api/auth/admin/staff/{created.id}/", **self.super_headers,
        )
        self.assertEqual(response.status_code, 200)
        created.refresh_from_db()
        self.assertFalse(created.is_staff)  # کاربر حذف نمی‌شود، فقط از مدیریت خارج می‌شود

    def test_cannot_remove_superuser_or_self(self):
        response = self.client.delete(
            f"/api/auth/admin/staff/{self.superuser.id}/", **self.super_headers,
        )
        self.assertEqual(response.status_code, 400)
        response = self.client.delete(
            f"/api/auth/admin/staff/{self.superuser.id}/", **self.super_headers,
        )
        self.assertEqual(response.status_code, 400)
