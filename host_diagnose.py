"""
عیب‌یاب هاست — بدون نیاز به ترمینال.

روی هاست از طریق Cron Jobs اجرا کنید:

    /bin/bash -lc "cd /home/shaminga/shamin_backend && python3 host_diagnose.py" \
        > /home/shaminga/host_diagnose.txt 2>&1

سپس فایل host_diagnose.txt را در File Manager باز کنید و متنش را بفرستید.
این اسکریپت فقط «می‌خواند» و چیزی را تغییر نمی‌دهد.
"""

import os
import sys
import platform
import traceback
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent


def line(title):
    print("\n" + "=" * 60)
    print(title)
    print("=" * 60)


def main():
    line("۱) اطلاعات سیستم")
    print("python:", sys.version)
    print("executable:", sys.executable)
    print("platform:", platform.platform())
    print("cwd:", os.getcwd())
    print("BASE_DIR:", BASE_DIR)

    line("۲) فایل‌های مهم")
    for name in ["manage.py", "passenger_wsgi.py", ".env", "db.sqlite3", "requirements.txt", "tmp"]:
        p = BASE_DIR / name
        print(f"{name:20} exists={p.exists()}")

    line("۳) محتوای .env (بدون نمایش مقادیر حساس)")
    env_path = BASE_DIR / ".env"
    if env_path.exists():
        for raw in env_path.read_text(encoding="utf-8", errors="replace").splitlines():
            s = raw.strip()
            if not s or s.startswith("#") or "=" not in s:
                continue
            key, _, val = s.partition("=")
            key = key.strip()
            if key in {
                "DJANGO_SECRET_KEY",
                "KAVENEGAR_API_KEY",
                "SMS_API_KEY",
                "MELLIPAYAM_PASSWORD",
                "POSTGRES_PASSWORD",
                "ZARINPAL_MERCHANT_ID",
            }:
                val = f"<set:{len(val)} chars>" if val else "<empty>"
            print(f"{key}={val}")
    else:
        print("فایل .env وجود ندارد! (این می‌تواند علت خطای 503 باشد)")

    line("۴) بررسی پکیج‌های پایتون")
    for mod in [
        "django",
        "environ",
        "dotenv",
        "rest_framework",
        "corsheaders",
        "whitenoise",
        "requests",
        "jazzmin",
        "drf_spectacular",
        "rest_framework_simplejwt",
        "PIL",
    ]:
        try:
            m = __import__(mod)
            print(f"OK   {mod:30} {getattr(m, '__version__', '')}")
        except Exception as e:  # noqa: BLE001
            print(f"FAIL {mod:30} {e!r}")

    line("۵) بارگذاری تنظیمات Django")
    try:
        os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
        sys.path.insert(0, str(BASE_DIR))
        import django  # noqa: E402

        django.setup()
        from django.conf import settings  # noqa: E402

        print("DEBUG:", settings.DEBUG)
        print("ALLOWED_HOSTS:", settings.ALLOWED_HOSTS)
        print("SMS_PROVIDER:", getattr(settings, "SMS_PROVIDER", "?"))
        print("KAVENEGAR_API_KEY set:", bool(getattr(settings, "KAVENEGAR_API_KEY", "")))
        print("KAVENEGAR_TEMPLATE:", getattr(settings, "KAVENEGAR_TEMPLATE", ""))
        print("CORS_ALLOWED_ORIGINS:", settings.CORS_ALLOWED_ORIGINS)
        print("DATABASES engine:", settings.DATABASES["default"]["ENGINE"])
        print("STATIC_ROOT:", settings.STATIC_ROOT)
        print("MEDIA_ROOT:", settings.MEDIA_ROOT)
    except Exception:
        print("!!! خطا در بارگذاری تنظیمات Django:")
        traceback.print_exc()
        return

    line("۶) تست دیتابیس")
    try:
        from django.db import connection

        with connection.cursor() as cur:
            cur.execute("SELECT 1")
            print("اتصال دیتابیس OK →", cur.fetchone())
        from django.contrib.auth import get_user_model

        User = get_user_model()
        print("تعداد کاربران:", User.objects.count())
    except Exception:
        print("!!! خطا در دیتابیس:")
        traceback.print_exc()

    line("۷) بررسی جدول‌ها (migrate لازم است؟)")
    try:
        from django.core.management import call_command

        call_command("showmigrations", "--plan", verbosity=1)
    except Exception:
        traceback.print_exc()

    line("۸) تست ارسال پیامک کاوه‌نگار (فقط تست، پیامک واقعی نمی‌فرستد)")
    try:
        import requests
        from django.conf import settings as s

        key = getattr(s, "KAVENEGAR_API_KEY", "")
        if not key:
            print("کلید کاوه‌نگار ست نشده.")
        else:
            r = requests.get(
                f"https://api.kavenegar.com/v1/{key}/account/info.json", timeout=15
            )
            print("HTTP:", r.status_code)
            print(r.text[:300])
    except Exception:
        traceback.print_exc()

    line("پایان تشخیص")


if __name__ == "__main__":
    main()
