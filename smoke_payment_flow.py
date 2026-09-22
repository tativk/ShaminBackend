# -*- coding: utf-8 -*-
"""تست دود جریان کامل خرید: سبد → سفارش → درگاه فیک → پرداخت موفق (با rollback کامل)."""
import django
import os
import re

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.conf import settings
from django.db import transaction

settings.ALLOWED_HOSTS.append("testserver")

results = []


def check(name, condition, extra=""):
    results.append((name, bool(condition), extra))


with transaction.atomic():
    from django.core.files.uploadedfile import SimpleUploadedFile
    from io import BytesIO
    from PIL import Image as PILImage
    from rest_framework.test import APIClient

    from accounts.models import User
    from carts.models import Cart, CartItem, ShippingRate
    from orders.models import Order
    from products.models import Brand, Product

    # پاک‌سازی باقی‌مانده‌های اجرای قبلی
    User.objects.filter(phone="09120000077").delete()
    Product.objects.filter(name="محصول تست پرداخت").delete()
    Brand.objects.filter(name="تست پرداخت", products__isnull=True).delete()

    admin = User.objects.create_user(phone="09120000001")
    customer = User.objects.create_user(phone="09120000077")
    customer.is_staff = True
    customer.is_superuser = True
    customer.save()

    brand = Brand.objects.create(name="تست پرداخت", slug="test-pay")
    buf = BytesIO()
    PILImage.new("RGB", (4, 4), (10, 100, 60)).save(buf, format="PNG")
    buf.seek(0)
    client = APIClient()
    client.force_authenticate(customer)

    r = client.post(
        "/api/products/admin/",
        {
            "name": "محصول تست پرداخت",
            "category": "cosmetic",
            "gender": "female",
            "price": "500000",
            "discount_percent": "20",
            "stock": "10",
            "brand": str(brand.pk),
            "new_images": SimpleUploadedFile("t.png", buf.read(), content_type="image/png"),
        },
        format="multipart",
    )
    check("create product", r.status_code == 201, str(r.data)[:150])
    pid = r.data["id"]

    # ۱) افزودن به سبد
    r = client.post("/api/cart/items/", {"product": pid, "quantity": 2}, format="json")
    check("POST /cart/items/", r.status_code in (200, 201), str(r.data)[:150])
    check("cart subtotal = final_price*2", float(r.data["subtotal"]) == 800000, str(r.data["subtotal"]))

    # ۲) انتخاب شهر
    r = client.patch("/api/cart/", {"city": "تهران"}, format="json")
    check("PATCH cart city", r.status_code == 200 and r.data["city"] == "تهران", str(r.data)[:150])
    shipping = float(r.data["shipping_cost"])
    check("shipping_cost 35000", shipping == 35000, str(shipping))

    # ۳) ثبت سفارش
    r = client.post(
        "/api/orders/",
        {
            "city": "تهران",
            "address": "خیابان تست، پلاک ۱",
            "postal_code": "1234567890",
            "shipping_cost": "35000.00",
        },
        format="json",
    )
    check("POST /orders/", r.status_code == 201, str(r.data)[:200])
    order_id = r.data["order_id"]
    payment_url = r.data.get("payment_url", "")
    check("payment_url points to mock gateway", "/api/orders/mock-gateway/" in payment_url, payment_url)

    # ۴) صفحه درگاه فیک
    gateway_path = payment_url.replace("http://localhost:8000", "")
    authority = re.search(r"Authority=([^&]+)", payment_url).group(1)
    r = client.get(gateway_path)
    check("GET mock gateway 200 HTML", r.status_code == 200 and order_id and f"#{order_id}" in r.content.decode(), str(r.status_code))

    # ۵) بازگشت موفق از درگاه
    r = client.get(
        "/api/orders/payment/callback/",
        {"Authority": authority, "Status": "OK"},
    )
    check("callback OK", r.status_code == 200, str(getattr(r, "data", r.content))[:120])
    order = Order.objects.get(pk=order_id)
    check("order status paid", order.status == Order.Status.PAID, str(order.status))
    check("order ref set", bool(order.payment_ref_id), str(order.payment_ref_id))
    check("cart emptied", not CartItem.objects.filter(cart__user=customer).exists(), "")
    from products.models import Product as P
    check("stock reduced to 8", P.objects.get(pk=pid).stock == 8, str(P.objects.get(pk=pid).stock))

    # ۶) جریان انصراف برای سفارش دوم
    client.post("/api/cart/items/", {"product": pid, "quantity": 1}, format="json")
    client.patch("/api/cart/", {"city": "تهران"}, format="json")
    r = client.post(
        "/api/orders/",
        {"city": "تهران", "address": "آدرس ۲", "postal_code": "1234567890", "shipping_cost": "35000.00"},
        format="json",
    )
    payment_url2 = r.data.get("payment_url", "")
    authority2 = re.search(r"Authority=([^&]+)", payment_url2).group(1)
    r = client.get("/api/orders/payment/callback/", {"Authority": authority2, "Status": "NOK"})
    order2 = Order.objects.get(pk=r.data.get("order_id", 0)) if hasattr(r, "data") and "order_id" in r.data else None
    if order2 is None:
        order2 = Order.objects.filter(user=customer).latest("created_at")
    check("cancelled order → cancelled", order2.status == Order.Status.CANCELLED, str(order2.status))

    print("")
    failed = [x for x in results if not x[1]]
    for name, ok, extra in results:
        print(("PASS" if ok else "FAIL"), name, "" if ok else ("| " + extra))
    print("")
    print("TOTAL:", len(results), "FAILED:", len(failed))
    raise SystemExit(1 if failed else 0)
