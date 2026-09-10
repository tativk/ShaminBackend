# بک‌اند شمیم — اسپرینت ۱

این نسخه فقط زیرساخت مشترک اسپرینت ۱ و وظایف تکمیلی نفر دوم در همان اسپرینت را پوشش می‌دهد.

## آماده‌سازی و اجرا در Windows / PowerShell

محیط موجود پروژه با Python 3.14.6 اجرا و بررسی شده است. نسخه‌های دقیق وابستگی‌های لازم از خروجی `pip freeze` محیط ثبت شده‌اند؛ بسته‌های اضافی محیط قبلی از requirements حذف شده‌اند، ولی از محیط شما uninstall نشده‌اند. PostgreSQL برای این اسپرینت لازم نیست.

روی همین دستگاه، `venv` و `.env` آماده‌اند. برای اجرای پروژه:

```powershell
.\venv\Scripts\python.exe manage.py runserver
```

برای راه‌اندازی پس از دریافت پروژه روی دستگاه دیگر:

```powershell
python -m venv venv
.\venv\Scripts\python.exe -m pip install -r requirements.txt
Copy-Item .env.example .env
.\venv\Scripts\python.exe -c "import secrets; print(secrets.token_urlsafe(64))"
```

مقدار تولیدشده را در `DJANGO_SECRET_KEY` فایل `.env` وارد کنید. سپس:

```powershell
.\venv\Scripts\python.exe manage.py migrate
.\venv\Scripts\python.exe manage.py check
.\venv\Scripts\python.exe manage.py test
.\venv\Scripts\python.exe manage.py runserver
```

فعال‌سازی محیط با `.\venv\Scripts\Activate.ps1` اختیاری است؛ دستورهای بالا به تغییر execution policy نیازی ندارند.

در ترمینال دیگری:

```powershell
Invoke-RestMethod http://127.0.0.1:8000/api/health/
```

پاسخ موفق: `{"status":"ok"}` با وضعیت HTTP 200. قرارداد کامل در `API_CONTRACT.md` است.

## ساختار و تصمیم‌های اسپرینت ۱

- پروژه `config` و اپ‌های `accounts`، `products`، `carts`، `orders` و `reviews` آماده‌اند.
- اسکلت قبلی `perfume_shop`، `users` و `cart` به نام‌های سند تغییر کرده؛ پوشه settings قبلی فایل‌های خالی داشت و تنظیمات در `config/settings.py` یکپارچه شد.
- دیتابیس توسعه SQLite است. مدل‌های کسب‌وکار هنوز تعریف نشده‌اند.
- DRF به‌صورت پیش‌فرض `JWTAuthentication` و `IsAuthenticated` دارد. فقط endpoint سلامت عمومی است.
- صفحه‌بندی پیش‌فرض `PageNumberPagination` با اندازه ۲۰ است.
- CORS فقط originهای `CORS_ALLOWED_ORIGINS` را می‌پذیرد؛ مقدار توسعه `http://localhost:3000` است.
- `.env` با `python-dotenv` خوانده می‌شود. متغیرهای واقعی محیط بر فایل اولویت دارند. نبود کلید Django خطای واضح می‌دهد.
- جای کلید پیامک و شناسه درگاه در `.env.example` آماده است؛ سرویس پیامک و پرداخت هنوز پیاده‌سازی یا متصل نشده‌اند.
- تنظیمات برای توسعه محلی هستند؛ استقرار مربوط به اسپرینت بعدی سند است.

## مرز اسپرینت

مدل سفارشی User، OTP، صدور و refresh توکن، محصولات، سبد خرید، پرداخت و نظرات جزو این تحویل نیستند. اپ accounts فعلاً اسکلت دارد. پنل `/admin/` همان پنل پیش‌فرض Django است و حساب مدیر خودکار ساخته نمی‌شود.

طبق سند، User سفارشی متعلق به اسپرینت ۲ است. دیتابیس فعلی فقط برای بررسی زیرساخت ایجاد شده است؛ پیش از شروع اسپرینت ۲ و ذخیره داده واقعی، مدل User و `AUTH_USER_MODEL` باید هماهنگ شوند و migrationها روی یک دیتابیس توسعه تازه اجرا شوند. دیتابیس دارای داده را بدون پشتیبان حذف نکنید.

## Git و همکاری

فایل `.gitignore` محیط مجازی، `.env`، دیتابیس محلی و فایل‌های تولیدی را کنار می‌گذارد. فقط `.env.example` باید در Git باشد. ارسال به GitHub، commit، ساخت branch کاری و Pull Request با شماست؛ هیچ remote تنظیم نشده است.

روش همکاری طبق سند: `main` سالم بماند، هر اسپرینت روی branch جدا انجام شود و ادغام با Pull Request و مرور همکار باشد. در هر بازه فقط یک نفر migration بسازد و پس از دریافت تغییرات هر دو نفر `migrate` اجرا کنند. قرارداد endpointها پیش از کدنویسی مرور شود.

## معیار تحویل

`check` بدون خطا، پنج تست زیرساخت موفق، migrationهای داخلی Django قابل اجرا و `runserver` پاسخ‌گوی endpoint سلامت است. بررسی push/pull دو نفره و تأیید همکار پس از ایجاد مخزن GitHub توسط شما انجام می‌شود.
