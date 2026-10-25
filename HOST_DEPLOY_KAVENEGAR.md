# راهنمای آپلود روی هاست + فعال‌سازی پیامک کاوه‌نگار

وضعیت فعلی سایت (آخرین بررسی):

| بخش | آدرس | وضعیت |
|---|---|---|
| فرانت | `https://shamingallerry.ir` | ✅ بالا، به API درست وصل است |
| API | `https://api.shamingallerry.ir/api/health/` | ✅ `{"status":"ok"}` |
| پیامک | کاوه‌نگار | ⚠️ کد درست است، ولی روی هاست `SMS_PROVIDER=console` است |

یعنی تنها کاری که مانده: **یک خط در فایل `.env` روی هاست عوض شود** تا
پیامک واقعی برود. کد بک‌اند نیازی به تغییر ندارد.

---

## بخش الف — تغییر provider پیامک روی هاست (کار اصلی امروز)

چون cPanel شما **Terminal** و **Setup Python App** ندارد، از File Manager
استفاده می‌کنیم.

1. وارد `my.mizbanfa.net` شو و برو به **cPanel**.
2. cPanel → **File Manager**.
3. برو به پوشه‌ی:

   ```
   /home/shaminga/shamin_backend
   ```

4. روی فایل `.env` راست‌کلیک → **Edit**.
5. فقط همین خط را پیدا کن:

   ```
   SMS_PROVIDER=console
   ```

   و عوضش کن به:

   ```
   SMS_PROVIDER=kavenegar
   ```

6. مطمئن شو این دو خط دقیقاً همین‌طور هستند (دست نزن، فقط چک کن):

   ```
   KAVENEGAR_API_KEY=666A4B46424F70425574304F6B2B4638424A71756472384B563552692B34526A752B4C5137502B775278383D
   KAVENEGAR_TEMPLATE=shaminotp
   ```

   > ⚠️ کلید API باید **همین رشته‌ی HEX خام** باشد. اگر آن را decode کنی
   > (به شکل `fjKFBOpBUt0Ok...`) خطای «متد نامشخص» می‌دهد.

7. **Save Changes** بزن.
8. حالا بک‌اند را ری‌استارت کن:
   - در File Manager برو داخل `/home/shaminga/shamin_backend`
   - اگر پوشه‌ی `tmp` نیست، با **+ Folder** بساز
   - وارد `tmp` شو → **+ File** → اسمش `restart.txt` (محتوا خالی) → Save

9. یک دقیقه صبر کن، بعد این را باز کن:

   ```
   https://api.shamingallerry.ir/api/health/
   ```

   باید بدهد `{"status":"ok"}`.

10. تست واقعی: در سایت روی **ثبت‌نام** بزن و شماره‌ی موبایل خودت را وارد کن.
    باید پیامک «شمین گالری» بیاید.

---

## بخش ب — آپلود کد جدید بک‌اند (فقط اگر فایل پایتون عوض شده)

اگر فقط `.env` عوض شده، این بخش لازم نیست. ولی برای دفعه‌های بعد:

1. cPanel → File Manager → `/home/shaminga/shamin_backend`.
2. فایل‌های عوض‌شده را با **Upload** بفرست (یا zip کن، آپلود کن، راست‌کلیک → Extract).
3. **هرگز** این‌ها را پاک/جایگزین نکن:
   - `.env`
   - `db.sqlite3`
   - پوشه‌ی `media/`
   - `venv/` (اگر روی هاست هست)
4. اگر `requirements.txt` عوض شده، یک Cron Job بساز (مرحله بعد).

### نصب پکیج با Cron Job (جایگزین ترمینال)

cPanel → **Cron Jobs** → Add New Cron Job:

- Common Settings: `Once Per Minute (* * * * *)`
- Command:

  ```bash
  /bin/bash -lc "cd /home/shaminga/shamin_backend && /home/shaminga/virtualenv/shamin_backend/3.11/bin/pip install -r requirements.txt" > /home/shaminga/pip.txt 2>&1
  ```

> اگر `%` در دستور باشد Cron خطا می‌دهد؛ این دستور `%` ندارد.

یک دقیقه صبر کن → برگرد Cron Jobs و job را **Delete** کن → فایل
`/home/shaminga/pip.txt` را در File Manager بخوان.

### migrate / collectstatic با Cron Job

```bash
/bin/bash -lc "cd /home/shaminga/shamin_backend && /home/shaminga/virtualenv/shamin_backend/3.11/bin/python manage.py migrate && /home/shaminga/virtualenv/shamin_backend/3.11/bin/python manage.py collectstatic --noinput" > /home/shaminga/setup.txt 2>&1
```

بعد از یک دقیقه job را **حذف** کن و `setup.txt` را بخوان.

---

## بخش ج — آپلود فرانت (فقط اگر کد React عوض شده)

فرانت **روی کامپیوتر خودت** build می‌شود (هاست Node ندارد):

```powershell
cd "C:\Users\satia\Desktop\New folder (2)\ShaminBackend\frontend"
npm install
npm run build
```

> آدرس API از قبل در `frontend/.env.production` ست شده:
> `REACT_APP_API_URL=https://api.shamingallerry.ir/api`

سپس **محتویات داخل** پوشه‌ی `build` را در File Manager → `public_html`
آپلود کن (نه خود پوشه‌ی build) و اجازه بده فایل‌های قبلی جایگزین شوند.

> نام فایل‌های build هش‌دار است؛ پس `index.html` هم باید جایگزین شود.

---

## خلاصه‌ی همیشگی برای دفعه‌ی بعد

| کار | ابزار |
|---|---|
| عوض کردن تنظیمات | File Manager → Edit `.env` |
| آپلود فایل بک‌اند | File Manager → Upload |
| `pip install` | Cron Job |
| `migrate` / `collectstatic` | Cron Job |
| ری‌استارت بک‌اند | ساختن `tmp/restart.txt` |
| build فرانت + آپلود | روی کامپیوتر خودت + File Manager |

> هر Cron job را بعد از یک‌بار اجرا **حذف** کن تا هر دقیقه تکرار نشود.
