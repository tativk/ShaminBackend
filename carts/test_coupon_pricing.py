"""تست کد تخفیف، قیمت‌گذاری سایز عطر و چند آدرس."""
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework_simplejwt.tokens import RefreshToken

from accounts.models import Address
from carts.models import Cart, CartItem, Coupon, ShippingRate
from products.models import Product

User = get_user_model()


class AuthBase(TestCase):
    def auth(self, user):
        return {"HTTP_AUTHORIZATION": f"Bearer {RefreshToken.for_user(user).access_token}"}


class CouponTests(AuthBase):
    def setUp(self):
        self.user = User.objects.create_user(phone="09111111111")
        self.headers = self.auth(self.user)
        self.product = Product.objects.create(
            name="عطر", category="perfume", gender="unisex", price=Decimal("1000000"), stock=10,
        )
        self.ship = ShippingRate.objects.create(province="تهران", city="تهران", cost=Decimal("35000"))
        CartItem.objects.create(
            cart=Cart.objects.create(user=self.user, city=self.ship),
            product=self.product, quantity=2, weight_grams=30,
        )
        self.coupon = Coupon.objects.create(code="SHAMIN10", discount_percent=10)

    def _cart(self):
        return self.client.get("/api/cart/", **self.headers).json()

    def test_apply_and_remove_coupon(self):
        response = self.client.post(
            "/api/cart/coupon/", {"code": "shamin10"},
            content_type="application/json", **self.headers,
        )
        self.assertEqual(response.status_code, 200, response.content)
        data = response.json()
        self.assertEqual(data["coupon_code"], "SHAMIN10")
        self.assertEqual(Decimal(data["discount_amount"]), Decimal("200000.00"))
        # جمع نهایی: ۲٬۰۰۰٬۰۰۰ − ۲۰۰٬۰۰۰ + ۳۵٬۰۰۰
        self.assertEqual(Decimal(data["total"]), Decimal("1835000.00"))

        response = self.client.delete("/api/cart/coupon/", **self.headers)
        self.assertEqual(response.json()["discount_amount"], "0.00")

    def test_invalid_coupon_rejected(self):
        response = self.client.post(
            "/api/cart/coupon/", {"code": "NOPE"},
            content_type="application/json", **self.headers,
        )
        self.assertEqual(response.status_code, 400)


class SizePricingTests(AuthBase):
    def setUp(self):
        self.user = User.objects.create_user(phone="09111111112")
        self.headers = self.auth(self.user)
        # قیمت پایه ۱٬۰۰۰٬۰۰۰؛ ۵۰ گرمی ۶۰۰٬۰۰۰؛ ۱۰٪ تخفیف
        self.perfume = Product.objects.create(
            name="عطر", category="perfume", gender="unisex",
            price=Decimal("1000000"), price_50=Decimal("600000"), discount_percent=10, stock=10,
        )

    def test_unit_price_follows_size(self):
        cart = Cart.objects.create(user=self.user)
        item50 = CartItem.objects.create(cart=cart, product=self.perfume, quantity=2, weight_grams=50)
        item15 = CartItem.objects.create(cart=cart, product=self.perfume, quantity=1, weight_grams=15)
        # ۵۰ گرمی: ۶۰۰٬۰۰۰ × ۰٫۹ = ۵۴۰٬۰۰۰
        self.assertEqual(item50.unit_price, Decimal("540000.00"))
        # ۱۵ گرمی بدون قیمت اختصاصی: ۱٬۰۰۰٬۰۰۰ × ۰٫۹ = ۹۰۰٬۰۰۰
        self.assertEqual(item15.unit_price, Decimal("900000.00"))
        self.assertEqual(cart.subtotal, Decimal("1980000.00"))

    def test_size_price_exposed_in_detail_api(self):
        response = self.client.get(f"/api/products/{self.perfume.id}/")
        data = response.json()
        self.assertEqual(Decimal(data["size_prices"]["50"]), Decimal("540000.00"))
        # حجم بدون قیمت اختصاصی: قیمت پایه با تخفیف
        self.assertEqual(Decimal(data["size_prices"]["15"]), Decimal("900000.00"))


class MultiAddressTests(AuthBase):
    def setUp(self):
        self.user = User.objects.create_user(phone="09111111113")
        self.headers = self.auth(self.user)

    def _create(self, city, **kwargs):
        payload = {"province": "تهران", "city": city, "street": "خیابان تست", "postal_code": "1234567890", **kwargs}
        return self.client.post("/api/auth/addresses/", payload, content_type="application/json", **self.headers)

    def test_first_address_becomes_default(self):
        response = self._create("تهران")
        self.assertEqual(response.status_code, 201, response.content)
        self.assertTrue(response.json()["is_default"])
        response = self._create("کرج")
        self.assertFalse(response.json()["is_default"])
        self.assertEqual(self.user.addresses.count(), 2)

    def test_default_moves_exclusively(self):
        first = self._create("تهران").json()
        second = self._create("کرج").json()
        response = self.client.patch(
            f"/api/auth/addresses/{second['id']}/", {"is_default": True},
            content_type="application/json", **self.headers,
        )
        self.assertEqual(response.status_code, 200)
        self.assertFalse(Address.objects.get(pk=first["id"]).is_default)
        self.assertTrue(Address.objects.get(pk=second["id"]).is_default)

    def test_cannot_delete_others_address(self):
        other_user = User.objects.create_user(phone="09111111114")
        other_address = Address.objects.create(user=other_user, province="تهران", city="تهران", street="x")
        response = self.client.delete(f"/api/auth/addresses/{other_address.pk}/", **self.headers)
        self.assertEqual(response.status_code, 404)

    def test_delete_default_promotes_next(self):
        first = self._create("تهران").json()
        second = self._create("کرج").json()
        self.client.delete(f"/api/auth/addresses/{first['id']}/", **self.headers)
        self.assertTrue(Address.objects.get(pk=second["id"]).is_default)
