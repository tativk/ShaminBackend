# قرارداد API — اسپرینت ۱ و ۲

قرارداد اسپرینت ۴، ورودی/خروجی مسیرهای سبد خرید و تصمیم‌های هزینه ارسال در
[SPRINT4.md](SPRINT4.md) ثبت شده است. تأیید همکار هنوز انجام نشده است.

## احراز هویت با OTP — اسپرینت ۲

- `POST /api/auth/request-otp/` عمومی است و ورودی آن `{"phone":"09123456789"}` است.
- `POST /api/auth/verify-otp/` عمومی است و ورودی آن `{"phone":"09123456789","code":"123456"}` است؛ پاسخ موفق شامل `access`، `refresh` و `user` است.
- `POST /api/auth/token/refresh/` با ورودی `{"refresh":"<refresh-token>"}` توکن `access` جدید برمی‌گرداند.
- `GET/PATCH /api/auth/profile/` و `GET/PUT /api/auth/address/` به هدر `Authorization: Bearer <access-token>` نیاز دارند.
- کد OTP پنج دقیقه اعتبار دارد و یک‌بارمصرف است.

تنها endpoint این اسپرینت برای بررسی اجرای Django و DRF است.

## بررسی سلامت

- URL: `/api/health/`
- Method: `GET` (همچنین `HEAD` و `OPTIONS`)
- دسترسی: عمومی با `AllowAny`؛ احراز هویت برای این مسیر اجرا نمی‌شود.
- ورودی: ندارد.
- پاسخ موفق: `200 OK` با `Content-Type: application/json`

```json
{"status": "ok"}
```

متدهای دیگر مانند `POST` پاسخ `405 Method Not Allowed` می‌گیرند.
این مسیر فقط اجرای برنامه را بررسی می‌کند، نه اتصال دیتابیس یا سرویس‌های خارجی.

## پیش‌فرض مسیرهای آینده

احراز هویت `JWTAuthentication` و مجوز `IsAuthenticated` است؛ مسیرهای عمومی باید صریحاً مجوز خود را تعیین کنند. صفحه‌بندی `PageNumberPagination` با اندازه ۲۰ است.

هیچ مسیر صدور توکن، OTP، محصول، سبد خرید، سفارش یا نظر در اسپرینت ۱ پیاده‌سازی نمی‌شود. قرارداد هر مسیر جدید باید پیش از پیاده‌سازی به این فایل اضافه و با همکار مرور شود. قرارداد فعلی طبق درخواست اجرای کامل اسپرینت ۱ تهیه شده؛ تأیید همکار ادعا نمی‌شود.

## Sprint 3 — Products

### GET /api/products/
**Auth:** AllowAny  
**Query Params:**
- `category` — `perfume` | `cosmetic` | `accessory`
- `brand` — integer (brand id)
- `gender` — `male` | `female` | `unisex`
- `page` — integer (default page size: 20)

**Response 200:**
```json
{
  "count": 50,
  "next": "http://localhost:8000/api/products/?page=2",
  "previous": null,
  "results": [
{
"id": 1,
"name": "عطر رز",
"brand": "شامین",
"category": "perfume",
"gender": "unisex",
"price": "250000.00",
"discount_percent": 10,
"final_price": "225000.00",
"main_image": "http://localhost:8000/media/products/rose.jpg",
"is_active": true
}
  ]
}

---

### GET /api/products/{id}/
**Auth:** AllowAny

**Response 200:**
json
{
  "id": 1,
  "name": "عطر رز",
  "brand": "شامین",
  "category": "perfume",
  "gender": "unisex",
  "price": "250000.00",
  "discount_percent": 10,
  "final_price": "225000.00",
  "average_rating": null,
  "images": [
{"id": 1, "image": "http://localhost:8000/media/products/rose.jpg", "is_main": true},
{"id": 2, "image": "http://localhost:8000/media/products/rose2.jpg", "is_main": false}
  ],
  "is_active": true
}

**Response 404:**
json
{"detail": "Not found."}


---

## گام ۳ — کدنویسی `products/models.py`

```python
from django.db import models

class Brand(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True, blank=True, null=True)

    def __str__(self):
        return self.name


class Product(models.Model):
    CATEGORY_CHOICES = [
        ('perfume', 'عطر'),
        ('cosmetic', 'لوازم آرایشی'),
        ('accessory', 'اکسسوری'),
    ]
    GENDER_CHOICES = [
        ('male', 'مردانه'),
        ('female', 'زنانه'),
        ('unisex', 'یونیسکس'),
    ]

    name = models.CharField(max_length=200)
    brand = models.ForeignKey(Brand, on_delete=models.SET_NULL, null=True, related_name='products')
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    discount_percent = models.PositiveSmallIntegerField(default=0)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    stock = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    @property
    def final_price(self):
        return self.price * (1 - self.discount_percent / 100)


class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='products/')
    is_main = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.product.name} - {'main' if self.is_main else 'secondary'}"
