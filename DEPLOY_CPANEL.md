# راهنمای استقرار روی cPanel (بک‌اند Django + فرانت React)

معماری پیشنهادی روی cPanel:

```
دامنه اصلی        →  https://example.com          → فایل‌های build فرانت (React)
ساب‌دامین API     →  https://api.example.com      → Django (Passenger / Setup Python App)
```

> اگر نمی‌توانید ساب‌دامین بسازید، هر دو را روی یک دامنه بگذارید:
> فرانت در `public_html` و بک‌اند در پوشه‌ای مثل `shamin_backend`، سپس
> `.htaccess` در `public_html` مسیرهای `/api`, `/media`, `/admin`, `/static`
> را به `shamin_backend/passenger_wsgi.py` پروکسی کند (بخش ۶).

---

## ۰) پیش‌نیازها در WHM/cPanel

- PHP نیست؛ باید **Setup Python App** داشته باشید (Python 3.10+).
- در WHM گزینه‌ی **Application Manager / Passenger** فعال باشد.
- SSL (Let's Encrypt) برای هر دو دامنه فعال شود.

---

## ۱) ساخت دیتابیس (PostgreSQL توصیه می‌شود)

در cPanel → **PostgreSQL Databases** (یا MySQL Databases):

1. یک دیتابیس بسازید: `shamin`
2. یک کاربر بسازید و به دیتابیس وصل کنید (ALL PRIVILEGES)
3. مشخصات را یادداشت کنید: `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`

> اگر هاست فقط MySQL دارد، `DATABASES` را در `config/settings.py` به MySQL
> تغییر دهید و درایور `mysqlclient` را به `requirements.txt` اضافه کنید.
> SQLite برای فروشگاه تولیدی توصیه نمی‌شود (قفل‌شدن زیر بار، پشتیبان‌گیری سخت).

---

## ۲) آپلود بک‌اند

1. کل پروژه‌ی بک‌اند را در پوشه‌ای بیرون از `public_html` آپلود کنید، مثلاً:
   ```
   /home/USERNAME/shamin_backend/
   ```
   (می‌توانید فایل zip را آپلود و در File Manager از حالت Extract استفاده کنید.)
2. مطمئن شوید `passenger_wsgi.py` و `manage.py` در ریشه‌ی همین پوشه هستند.
3. پوشه‌ی `venv/` ویندوز را آپلود **نکنید**؛ روی سرور venv جدید می‌سازیم.

---

## ۳) ساخت Python App و نصب پکیج‌ها

در cPanel → **Setup Python App** → **Create Application**:

| فیلد | مقدار |
|---|---|
| Python version | 3.10 یا بالاتر |
| Application root | `shamin_backend` |
| Application URL | `api.example.com` |
| Application startup file | `passenger_wsgi.py` |
| Application Entry point | `application` |

بعد از ساخت، cPanel دستور فعال‌سازی محیط را نشان می‌دهد؛ چیزی شبیه:

```bash
source /home/USERNAME/virtualenv/shamin_backend/3.11/bin/activate
cd /home/USERNAME/shamin_backend
pip install --upgrade pip
pip install -r requirements.txt
```

> اگر `psycopg` لازم بود: `pip install "psycopg[binary]"` و در `requirements.txt` بگذارید.

---

## ۴) ساخت فایل `.env` روی سرور

در ریشه‌ی بک‌اند فایل `.env` بسازید (کنار `manage.py`):

```dotenv
DJANGO_SECRET_KEY=<یک مقدار تصادفی طولانی و جدید>
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=api.example.com,example.com
CORS_ALLOWED_ORIGINS=https://example.com,https://www.example.com

USE_SQLITE=0
POSTGRES_DB=shamin
POSTGRES_USER=shamin_user
POSTGRES_PASSWORD=<رمز دیتابیس>
POSTGRES_HOST=127.0.0.1
POSTGRES_PORT=5432

SMS_PROVIDER=kavenegar
KAVENEGAR_API_KEY=666A4B46424F70425574304F6B2B4638424A71756472384B563552692B34526A752B4C5137502B775278383D
KAVENEGAR_TEMPLATE=shaminotp

BACKEND_BASE_URL=https://api.example.com
PAYMENT_SERVICE=mock

SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
SECURE_HSTS_SECONDS=31536000
BEHIND_PROXY_SSL=True
```

نکات:
- `DJANGO_SECRET_KEY` را عوض کنید (دستی یا با `python -c "import secrets;print(secrets.token_urlsafe(64))"`).
- `USE_SQLITE=0` یعنی از PostgreSQL استفاده کن (طبق بخش ۱).
- `DEBUG=False` است، پس اگر `KAVENEGAR_API_KEY` خالی باشد برنامه بالا نمی‌آید — کلید را بگذارید.
- `CORS_ALLOWED_ORIGINS` باید دقیقاً دامنه‌ی فرانت باشد (با `https://`).

---

## ۵) migrate و collectstatic

در ترمینال cPanel یا همان محیط virtualenv:

```bash
cd /home/USERNAME/shamin_backend
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser   # یا از setup_production.py استفاده کنید
```

> فایل `setup_production.py` در ریپو همین کارها را انجام می‌دهد و می‌توانید از
> صفحه‌ی Setup Python App با دکمه‌ی «Run Script» اجرایش کنید.

سپس از پنل cPanel اپ پایتون را **Restart** کنید.

---

## ۶) آپلود فرانت (React build)

روی سیستم خودتان (نه هاست) فرانت را build کنید، چون build نیاز به Node دارد:

```bash
cd frontend
npm install
# آدرس API نهایی را قبل از build ست کنید:
# PowerShell:
$env:REACT_APP_API_URL="https://api.example.com/api"
$env:REACT_APP_SITE_URL="https://example.com"
npm run build
```

سپس محتویات پوشه‌ی `frontend/build/` را در `public_html` (یا پوشه‌ی دامنه‌ی اصلی) آپلود کنید.

> اگر بک‌اند و فرانت روی یک دامنه باشند، `REACT_APP_API_URL=https://example.com/api`.

### SPA fallback (فایل `.htaccess` در `public_html`)

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  # اگر API روی همین دامنه است، این خطوط را فعال کنید:
  # RewriteRule ^api/(.*)$ /shamin_backend/passenger_wsgi.py [L,QSA]
  # RewriteRule ^(media|static|admin)/(.*)$ /shamin_backend/passenger_wsgi.py [L,QSA]
  # در غیر این صورت همه‌چیز به index.html برود (SPA):
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

> اگر API روی ساب‌دامین جدا (`api.example.com`) است، به این rewrite نیازی نیست؛
> فقط fallback ساده‌ی SPA کافی است.

---

## ۷) رسانه (عکس‌های آپلودی)

`config/urls.py` مسیر `/media/` را با `django.views.static.serve` سرو می‌کند،
پس در حالت فعلی کار می‌کند. برای سرعت بیشتر روی هاست پرترافیک، بهتر است
آپاچی مستقیماً `media/` را سرو کند:

```apache
Alias /media/ /home/USERNAME/shamin_backend/media/
<Directory /home/USERNAME/shamin_backend/media/>
  Require all granted
</Directory>
```

---

## ۸) چک‌لیست بعد از استقرار

- [ ] `https://api.example.com/api/health/` مقدار `{"status":"ok"}` می‌دهد.
- [ ] `https://api.example.com/admin/` باز می‌شود (پنل مدیریت).
- [ ] `https://example.com` فرانت را نشان می‌دهد و صفحات داخلی (مثل `/products/1`) با رفرش ۴۰۴ نمی‌شوند (SPA fallback).
- [ ] ثبت‌نام → دریافت OTP → تأیید → ورود، از روی دامنه‌ی واقعی کار می‌کند.
- [ ] درخواست‌ها بدون خطای CORS هستند (تب Network مرورگر).
- [ ] بعد از تأیید حساب کاوهنگار، پیامک واقعی می‌رسد.

---

## ۹) به‌روزرسانی نسخه‌های بعدی

بک‌اند:
```bash
cd /home/USERNAME/shamin_backend
source /home/USERNAME/virtualenv/shamin_backend/3.11/bin/activate
git pull            # یا آپلود فایل‌های جدید
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
# سپس Restart از پنل Setup Python App
```

فرانت: build جدید بسازید و محتویات `build/` را دوباره در `public_html` آپلود کنید.
