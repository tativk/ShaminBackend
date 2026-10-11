# آپدیت هاست بدون ترمینال (فقط با File Manager و Cron Jobs)

چون در cPanel شما **Terminal** و **Setup Python App** نیست، از دو ابزار
جایگزین استفاده می‌کنیم که همیشه در cPanel هستند:

- **File Manager** → برای آپلود فایل‌ها و ساختن/ویرایش فایل‌ها
- **Cron Jobs** → برای اجرای دستورهای پایتون (به‌جای ترمینال)

---

## نقشه‌ی سایت شما

| بخش | مسیر روی هاست | آدرس عمومی |
|---|---|---|
| بک‌اند Django | `/home/shaminga/shamin_backend` | `https://api.shamingallerry.ir` |
| فرانت React | `/home/shaminga/public_html` | `https://shamingallerry.ir` |

---

## مرحله ۰ — پیدا کردن مسیر پایتون هاست (یک‌بار برای همیشه)

برای اجرای دستورها باید بدانیم پایتون و پکیج‌ها کجا نصب شده‌اند.

1. cPanel → **Cron Jobs**.
2. در بخش **Add New Cron Job**:
   - Common Settings: `Once Per Minute (* * * * *)`
   - Command: این خط را بگذارید (تا نتیجه را در یک فایل بنویسد):

     ```bash
     /bin/bash -lc "which python3 python; python3 -V; python3 -c 'import django;print(django.__version__)'" > /home/shaminga/pyinfo.txt 2>&1
     ```
3. صبر کنید ۱ دقیقه، بعد cPanel → **File Manager** → فایل `pyinfo.txt` را باز کنید.
4. **مهم:** بلافاصله برگردید به Cron Jobs و این job را **حذف** کنید (Delete).

داخل `pyinfo.txt` یکی از این حالت‌ها را می‌بینید:

- مسیر پایتون + نسخه‌ی Django چاپ شده → عالی، پایتون و Django نصب‌اند.
- `ModuleNotFoundError: No module named 'django'` → پکیج‌ها نصب نیستند (مرحله ۲).
- خالی / خطای دستور → مسیر پایتون فرق دارد؛ خروجی را برایم بفرستید.

> مسیر پایتونی که در خروجی می‌بینید (مثلاً `/home/shaminga/virtualenv/shamin_backend/3.11/bin/python`)
> را یادداشت کنید؛ در مرحله‌های بعد به‌جای `PYTHON` می‌گذاریم.

---

## مرحله ۱ — آپلود بک‌اند

1. cPanel → **File Manager** → بروید داخل `/home/shaminga/shamin_backend`.
2. فایل‌های تغییرکرده را با **Upload** آپلود کنید.
3. **هرگز** این‌ها را پاک/جایگزین نکنید:
   - `.env` (تنظیمات)
   - `media/` (عکس‌های آپلودی)
   - `db.sqlite3` (اگر از SQLite استفاده می‌کنید)
   - `venv/` (اگر روی هاست وجود دارد)
4. اگر zip آپلود کردید، راست‌کلیک → **Extract**.

---

## مرحله ۲ — نصب پکیج‌ها (فقط اگر Django نصب نبود یا requirements عوض شده)

در Cron Jobs یک job با این Command بسازید:

```bash
/bin/bash -lc "PYTHON -m pip install --user -r /home/shaminga/shamin_backend/requirements.txt" > /home/shaminga/pip_install.txt 2>&1
```

> جای `PYTHON` همان مسیر پایتونی که در مرحله ۰ پیدا کردید بگذارید.
> اگر مسیر پایتون را نمی‌دانید، فعلاً `python3` بگذارید.

زمان را `Once Per Minute` بگذارید، یک دقیقه صبر کنید، job را **حذف** کنید و
فایل `pip_install.txt` را در File Manager بخوانید تا مطمئن شوید خطا نداده.

> اگر خطای `No module named pip` یا اجازه‌ی نوشتن داد، خروجی را برایم بفرستید.

---

## مرحله ۳ — migrate و collectstatic (بدون ترمینال)

این دو دستور را با یک Cron job اجرا می‌کنیم:

```bash
/bin/bash -lc "cd /home/shaminga/shamin_backend && PYTHON manage.py migrate && PYTHON manage.py collectstatic --noinput" > /home/shaminga/setup_result.txt 2>&1
```

زمان `Once Per Minute` → ۱ دقیقه صبر → job را **حذف** کنید → فایل
`setup_result.txt` را بخوانید.

نتیجه‌ی خوب: `No migrations to apply` یا `Applying ... OK` و در آخر `collectstatic` بدون خطا.

> این همان کار `setup_production.py` است؛ اگر ترجیح می‌دهید همان را اجرا کنید:
> `PYTHON /home/shaminga/shamin_backend/setup_production.py`

---

## مرحله ۴ — ری‌استارت بک‌اند (بدون ترمینال)

روی هاست‌های cPanel معمولاً اپ پایتون با **Passenger** اجرا می‌شود و با
ساختن فایل `tmp/restart.txt` ری‌استارت می‌شود:

1. cPanel → **File Manager** → بروید داخل `/home/shaminga/shamin_backend`.
2. اگر پوشه‌ی `tmp` نیست، با **+ Folder** بسازید.
3. وارد `tmp` شوید → **+ File** → نامش را `restart.txt` بگذارید (محتوا خالی، OK).

> همین کار باعث می‌شود Passenger اپ را دوباره بالا بیاورد.

---

## مرحله ۵ — ساخت و آپلود فرانت (مهم‌ترین مرحله)

سایت زنده‌ی شما الان داخل کدش نوشته `http://localhost:8000/api` — یعنی به
کامپیوتر خودش وصل می‌شود و ثبت‌نام/محصولات کار نمی‌کند. باید دوباره build شود.

**روی کامپیوتر خودتان** در PowerShell:

```powershell
cd C:\Users\satia\Desktop\ShaminBackend\frontend
npm install
npm run build
```

> آدرس API را از قبل در `frontend/.env.production` ست کرده‌ام:
> `REACT_APP_API_URL=https://api.shamingallerry.ir/api`

سپس در cPanel → File Manager → `public_html`:

1. فایل‌های قدیمی (به‌جز پوشه‌های `Asets` و `fonts` و عکس‌های دستی) را پاک کنید.
2. **محتویات داخل** پوشه‌ی `frontend/build` را آپلود کنید (نه خود پوشه).
3. مطمئن شوید `index.html` هم جایگزین شده.

---

## مرحله ۶ — چک نهایی

1. مرورگر: `https://api.shamingallerry.ir/api/health/`
   → باید بنویسد `{"status":"ok"}`
2. سایت را باز کنید و یک ثبت‌نام تستی بزنید.
3. **F12** → تب **Network** → اگر درخواستی قرمز بود، آدرس API یا CORS مشکل دارد.

---

## خلاصه‌ی همیشگی (برای دفعه‌ی بعد)

| کار | ابزار |
|---|---|
| آپلود فایل‌های بک‌اند | File Manager |
| `pip install -r requirements.txt` | Cron Job |
| `manage.py migrate` | Cron Job |
| `manage.py collectstatic` | Cron Job |
| ری‌استارت بک‌اند | ساختن `tmp/restart.txt` در File Manager |
| build فرانت + آپلود | روی کامپیوتر خودتان + File Manager |

> هر Cron job را بعد از یک‌بار اجرا **حذف** کنید تا هر دقیقه تکرار نشود.
