# -*- coding: utf-8 -*-
"""تست دود endpointهای جدید پنل ادمین — کل اجرا داخل یک تراکنش است و در پایان rollback می‌شود."""
import json

import django
import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.conf import settings
from django.db import transaction

settings.ALLOWED_HOSTS.append("testserver")

# پاک‌سازی باقی‌مانده‌های اجرای قبلی (خارج از تراکنش)
from accounts.models import User
from orders.models import Order
from products.models import Brand, Product

Order.objects.filter(user__phone__in=["09120000001", "09120000002"]).delete()
User.objects.filter(phone__in=["09120000001", "09120000002"]).delete()
Product.objects.filter(name="عطر رز تست").delete()
Brand.objects.filter(name="Dior", products__isnull=True).delete()

results = []


def check(name, condition, extra=""):
    results.append((name, bool(condition), extra))


with transaction.atomic():
    from django.core.files.uploadedfile import SimpleUploadedFile
    from io import BytesIO
    from PIL import Image as PILImage
    from rest_framework.test import APIClient

    from orders.models import Order, OrderItem
    from products.models import ProductImage

    admin = User.objects.create_user(phone="09120000001")
    admin.is_staff = True
    admin.is_superuser = True
    admin.save()
    User.objects.create_user(phone="09120000002")  # مشتری

    client = APIClient()
    client.force_authenticate(admin)

    # ── برندها ──────────────────────────────────────────────
    brand = Brand.objects.create(name="Dior", slug="dior")
    r = client.get("/api/brands/")
    check("GET /api/brands/", r.status_code == 200 and r.data["results"][0]["name"] == "Dior", str(r.data)[:150])

    # ── ساخت محصول با تصویر (multipart) ─────────────────────
    buf = BytesIO()
    PILImage.new("RGB", (4, 4), (200, 30, 30)).save(buf, format="PNG")
    buf.seek(0)
    img = SimpleUploadedFile("rose.png", buf.read(), content_type="image/png")
    r = client.post(
        "/api/products/admin/",
        {
            "name": "عطر رز تست",
            "category": "perfume",
            "gender": "female",
            "price": "2500000",
            "discount_percent": "10",
            "stock": "12",
            "description": "توضیح تست",
            "brand": str(brand.pk),
            "new_images": img,
        },
        format="multipart",
    )
    print("POST STATUS:", r.status_code, "DATA:", str(r.data)[:400])
    check("POST /api/products/admin/", r.status_code == 201, str(r.data)[:300])
    pid = r.data.get("id")
    check("create: main image set", any(i["is_main"] for i in r.data.get("images", [])), json.dumps(r.data.get("images", []), default=str, ensure_ascii=False)[:150])
    check("create: brand_name", r.data.get("brand_name") == "Dior", str(r.data.get("brand_name")))
    check("create: is_active default True", r.data.get("is_active") is True, str(r.data.get("is_active")))

    # ── ویرایش محصول (تغییر موجودی + نگه‌داشتن تصویر) ────────
    main_img_id = next(i["id"] for i in r.data["images"] if i["is_main"])
    r = client.patch(
        f"/api/products/admin/{pid}/",
        {"stock": "4", "keep_image_ids": [str(main_img_id)], "main_image_id": str(main_img_id)},
        format="multipart",
    )
    print("PATCH STATUS:", r.status_code, "DATA:", str(r.data)[:200])
    check("PATCH product stock=4", r.status_code == 200 and r.data["stock"] == 4, str(r.data.get("stock")))
    check("PATCH keeps image", len(r.data["images"]) == 1, str(len(r.data.get("images", []))))

    # ── لیست ادمین ──────────────────────────────────────────
    r = client.get("/api/products/admin/")
    check("GET /api/products/admin/", r.status_code == 200, str(r.status_code))

    # ── دسترسی غیر ادمین ────────────────────────────────────
    plain = APIClient()
    plain.force_authenticate(User.objects.get(phone="09120000002"))
    r = plain.get("/api/products/admin/")
    check("non-staff blocked on products/admin/", r.status_code == 403, str(r.status_code))
    r = plain.get("/api/orders/admin/stats/")
    check("non-staff blocked on stats", r.status_code == 403, str(r.status_code))

    # ── سفارش برای آمار ─────────────────────────────────────
    cust = User.objects.get(phone="09120000002")
    product = Product.objects.get(pk=pid)
    order = Order.objects.create(user=cust, status=Order.Status.PAID, total_price="2250000", address="تهران")
    OrderItem.objects.create(order=order, product=product, quantity=1, price="2250000")

    r = client.get("/api/orders/admin/stats/?period=week")
    check("GET stats week", r.status_code == 200, str(r.status_code))
    check("stats cards.sales_today>0", r.data["cards"]["sales_today"] > 0, str(r.data["cards"]))
    check("stats status_counts.paid=1", r.data["status_counts"]["paid"] == 1, str(r.data["status_counts"]))
    check("stats top_products", len(r.data["top_products"]) == 1, str(r.data["top_products"])[:150])
    check("stats recent_orders", len(r.data["recent_orders"]) == 1, str(len(r.data["recent_orders"])))
    check("stats chart 7 daily pts", len(r.data["chart"]["points"]) == 7, str(len(r.data["chart"]["points"])))
    r = client.get("/api/orders/admin/stats/?period=today")
    check("stats today 12 hourly pts", len(r.data["chart"]["points"]) == 12, str(len(r.data["chart"]["points"])))
    r = client.get("/api/orders/admin/stats/?period=quarter")
    check("stats quarter ok", r.status_code == 200 and len(r.data["chart"]["points"]) >= 3, str(len(r.data.get("chart", {}).get("points", []))))

    # ── وضعیت completed + ویرایش آدرس ───────────────────────
    r = client.patch(f"/api/orders/admin/{order.id}/status/", {"status": "completed"}, format="json")
    check("PATCH order status completed", r.status_code == 200 and r.data["status"] == "completed", str(r.data.get("status")))
    r = client.patch(f"/api/orders/admin/{order.id}/status/", {"address": "تهران، خیابان تست"}, format="json")
    check("PATCH order address", r.status_code == 200 and "تست" in r.data["address"], str(r.data.get("address")))

    # ── حذف محصول: PROTECT → 409، غیرفعال‌سازی → موفق ───────
    r = client.delete(f"/api/products/admin/{pid}/")
    check("DELETE product w/ orders → 409", r.status_code == 409, str(r.status_code))
    r = client.patch(f"/api/products/admin/{pid}/", {"is_active": "false"}, format="multipart")
    check("PATCH is_active=false", r.status_code == 200 and r.data["is_active"] is False, str(r.data.get("is_active")))

    # گزارش قبل از rollback
    print("")
    failed = [x for x in results if not x[1]]
    for name, ok, extra in results:
        print(("PASS" if ok else "FAIL"), name, "" if ok else ("| " + extra))
    print("")
    print("TOTAL:", len(results), "FAILED:", len(failed))
    # خروج عمدی از داخل بلوک atomic تا همه‌چیز rollback شود
    raise SystemExit(1 if failed else 0)
