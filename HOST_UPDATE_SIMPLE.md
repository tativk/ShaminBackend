# آپدیت هاست — راهنمای اختصاصی سایت شما

## نقشه‌ی سایت شما (بر اساس چیزی که فرستادید)

| بخش | روی هاست | آدرس عمومی |
|---|---|---|
| بک‌اند (Django) | `/home/shaminga/shamin_backend` | `https://api.shamingallerry.ir` |
| فرانت (React) | `/home/shaminga/public_html` | `https://shamingallerry.ir` |

یعنی کاربر سایت را از `shamingallerry.ir` می‌بیند و سایت با API روی
`api.shamingallerry.ir` حرف می‌زند. پس **دو چیز جدا** باید آپدیت شود.

---

## ⚠️ دو مشکل که الان روی هاست پیدا کردم

### مشکل ۱: فرانت روی هاست هنوز به آدرس اشتباه وصل است

فایل جاوااسکریپت سایت زنده‌ی شما (`main.770b8c25.js`) را باز کردم؛ داخلش
نوشته:

```
http://localhost:8000/api
```

یعنی سایت روی هاست دارد به «کامپیوتر خودش» وصل می‌شود، نه به API واقعی.
به همین دلیل سایت باز می‌شود ولی ثبت‌نام/محصولات کار نمی‌کند.

**راه‌حل:** باید فرانت را با آدرس درست دوباره build و آپلود کنید (مرحله ۶).

### مشکل ۲: خود بک‌اند روی ساب‌دامین بالا نمی‌آید

آدرس `https://api.shamingallerry.ir` الان خطای **503 (Service Unavailable)**
می‌دهد. یعنی اپ Django روی هاست کرش کرده یا اصلاً اجرا نشده.
معمولاً علتش یکی از این‌هاست:

- فایل `.env` روی هاست نیست یا مقدارش اشتباه است.
- پکیج‌های پایتون نصب نشده‌اند.
- اپ پایتون ری‌استارت نشده.

**راه‌حل:** مراحل ۲ تا ۵ پایین.

---

## مرحله ۱ — آپلود بک‌اند

1. cPanel → **File Manager**.
2. بروید داخل `/home/shaminga/shamin_backend`.
3. فایل‌های جدید/تغییرکرده را آپلود کنید (دکمه‌ی **Upload**).
   اگر مطمئن نیستید کدام فایل‌ها عوض شده‌اند، می‌توانید کل پوشه‌ها را دوباره
   آپلود کنید **به‌جز این‌ها**:
   - `venv/` (روی هاست لازم نیست)
   - `.env` (فایل تنظیمات روی هاست؛ **هرگز پاک یا جایگزین نکنید**)
   - `db.sqlite3` و پوشه‌ی `media/` (اطلاعات و عکس‌های سایت هستند)
4. اگر فایل zip آپلود کردید، روی آن کلیک راست → **Extract**.

---

## مرحله ۲ — نصب پکیج‌های جدید (فقط اگر `requirements.txt` عوض شده)

چون **Setup Python App** ندارید، باید از **Terminal** cPanel استفاده کنید.
در cPanel → **Advanced → Terminal**:

```bash
cd /home/shaminga/shamin_backend

# مسیر virtualenv روی هاست را پیدا کنید (اگر نمی‌دانید کدام است):
ls -d /home/shaminga/virtualenv/* 2>/dev/null
```

اگر مسیری مثل `/home/shaminga/virtualenv/shamin_backend/3.11` دیدید، فعالش کنید:

```bash
source /home/shaminga/virtualenv/shamin_backend/3.11/bin/activate
cd /home/shaminga/shamin_backend
pip install -r requirements.txt
```

> اگر هیچ virtualenv نبود، یعنی بک‌اند با پایتون سیستم اجرا می‌شود؛ در آن
> صورت `pip install --user -r requirements.txt` بزنید.
> (اگر `psycopg` لازم بود: `pip install "psycopg[binary]"`.)

> **اگر Terminal ندارید:** در cPanel → **File Manager** روی `.htaccess` سایت
> نمی‌توان این کار را کرد؛ در آن صورت به پشتیبانی هاست بگویید دستور
> `pip install -r requirements.txt` را در پوشه‌ی `/home/shaminga/shamin_backend`
> اجرا کنند.

---

## مرحله ۳ — ساخت جدول‌های جدید دیتابیس (اگر مدل‌ها عوض شده)

در Terminal (همان محیط فعال‌شده‌ی مرحله ۲):

```bash
python manage.py migrate
```

اگر پیام `No migrations to apply` داد، یعنی چیزی لازم نبود. مشکلی نیست.

---

## مرحله ۴ — جمع‌کردن فایل‌های استاتیک (فقط اگر ظاهر پنل ادمین عوض شده)

```bash
python manage.py collectstatic --noinput
```

---

## مرحله ۵ — ری‌استارت بک‌اند (چون Setup Python App ندارید)

چون اپ پایتون را از پنل مدیریت نمی‌کنید، معمولاً روی این هاست‌ها بک‌اند با
**Passenger** اجرا می‌شود و با «لمس‌کردن» فایل `tmp/restart.txt` ری‌استارت می‌شود.

در Terminal cPanel:

```bash
mkdir -p /home/shaminga/shamin_backend/tmp
touch /home/shaminga/shamin_backend/tmp/restart.txt
```

سپس یک دقیقه صبر کنید و این آدرس را باز کنید:

```
https://api.shamingallerry.ir/api/health/
```

باید بنویسد `{"status":"ok"}`. اگر هنوز `503` داد، به **مرحله ۷ (خطایابی)** بروید.

> اگر روش ری‌استارت شما فرق دارد (مثلاً از پشتیبانی هاست)، همان روش هم اشکالی ندارد؛
> مهم این است که بعد از هر آپدیت بک‌اند یک‌بار ری‌استارت شود.

---

## مرحله ۶ — ساخت و آپلود فرانت (مهم‌ترین مرحله برای شما)

سایت زنده‌ی شما الان به `http://localhost:8000/api` وصل است و به همین دلیل
ثبت‌نام/محصولات کار نمی‌کند. باید با آدرس درست دوباره ساخته شود.

فرانت را باید **روی کامپیوتر خودتان** بسازید (چون هاست Node ندارد):

1. در PowerShell:

   ```powershell
   cd C:\Users\satia\Desktop\ShaminBackend\frontend
   npm install
   npm run build
   ```

   > آدرس API را در فایل `frontend/.env.production` از قبل ست کرده‌ام:
   > `REACT_APP_API_URL=https://api.shamingallerry.ir/api`
   > پس لازم نیست دستی چیزی ست کنید.

2. پوشه‌ی `frontend/build` ساخته می‌شود.
3. **محتویات داخل** پوشه‌ی `build` (نه خود پوشه) را در cPanel → File Manager →
   `public_html` آپلود کنید و اجازه بدهید فایل‌های قبلی جایگزین شوند.

> نکته‌ی مهم: چون نام فایل‌های build هش‌دار است (مثل `main.770b8c25.js`)،
> فایل `index.html` جدید به فایل js جدید اشاره می‌کند. مطمئن شوید `index.html`
> هم جایگزین شده باشد.

---

## مرحله ۷ — خطایابی اگر بک‌اند ۵۰۳ داد

۱. اول لاگ‌های Django را ببینید (در Terminal):

```bash
cd /home/shaminga/shamin_backend
tail -n 50 setup_production.log 2>/dev/null
ls -la *.log logs 2>/dev/null
```

۲. ببینید فایل `.env` وجود دارد و کلیدهای لازم داخلش هست:

```bash
cd /home/shaminga/shamin_backend
ls -la .env
grep -E "DJANGO_DEBUG|ALLOWED_HOSTS|SMS_PROVIDER|KAVENEGAR|USE_SQLITE|POSTGRES" .env
```

۳. مطمئن شوید خود Django بدون خطا بالا می‌آید:

```bash
cd /home/shaminga/shamin_backend
python manage.py check
```

- اگر `ImproperlyConfigured` داد → مقدار `.env` ناقص است.
- اگر `ModuleNotFoundError` داد → پکیج‌ها نصب نیستند (مرحله ۲).

۴. اگر پیام `SQLite` یا `no such table` دید → `python manage.py migrate` بزنید.

> متن دقیق خطا را برایم بفرستید تا بگویم چه کاری لازم است.

---

## چطور بفهمم درست شده؟

- `https://آدرس-بک-اند/api/health/` را در مرورگر باز کنید → باید بنویسد `{"status":"ok"}`.
- صفحه‌ی ورود/ثبت‌نام سایت را باز کنید و یک ثبت‌نام تستی انجام دهید.
- در مرورگر کلید **F12** را بزنید → تب **Network** → اگر درخواستی قرمز بود،
  یعنی آدرس API یا CORS مشکل دارد.

---

## هر بار آپدیت، فقط همین ۶ مرحله

1. آپلود فایل‌های بک‌اند
2. `pip install -r requirements.txt` (اگر پکیج عوض شده)
3. `python manage.py migrate` (اگر مدل عوض شده)
4. `python manage.py collectstatic --noinput` (اگر پنل ادمین عوض شده)
5. **Restart** در Setup Python App
6. `npm run build` و آپلود `build` در `public_html` (اگر فرانت عوض شده)

> هیچ‌وقت فایل `.env` و پوشه‌ی `media/` را پاک نکنید.
