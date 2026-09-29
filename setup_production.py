"""
اسکریپت راه‌اندازی اولیه روی هاست (جایگزین ترمینال).
این اسکریپت را از صفحه Setup Python App در cPanel با دکمه "Run Script" اجرا کنید.

کارهایی که انجام می‌دهد:
1. migrate          → ساخت جدول‌های دیتابیس
2. collectstatic    → جمع‌آوری فایل‌های استاتیک پنل ادمین
3. ساخت حساب ادمین  → با شماره موبایل و رمزهایی که در ADMIN_ACCOUNTS است

⚠️ امنیتی: بعد از اجرای موفق، ADMIN_ACCOUNTS را خالی کنید تا رمزها در فایل نمانند.
"""

import os
import sys

import django

LOG_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "setup_production.log")


class _Tee:
    def __init__(self, *streams):
        self.streams = streams

    def write(self, data):
        for s in self.streams:
            s.write(data)
            s.flush()

    def flush(self):
        for s in self.streams:
            s.flush()


_log_file = open(LOG_PATH, "w", encoding="utf-8")
sys.stdout = _Tee(sys.stdout, _log_file)
sys.stderr = _Tee(sys.stderr, _log_file)

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.core.management import call_command  # noqa: E402
from django.db import transaction  # noqa: E402

# شماره موبایل و رمز ادمین‌ها — بعد از اجرای موفق اینجا را خالی کنید: []
ADMIN_ACCOUNTS = []


def main():
    print("=== 1/3 migrate ===", flush=True)
    call_command("migrate", interactive=False, verbosity=1)

    print("=== 2/3 collectstatic ===", flush=True)
    call_command("collectstatic", interactive=False, verbosity=0)
    print("collectstatic done", flush=True)

    print("=== 3/3 superusers ===", flush=True)
    from accounts.models import User

    for phone, password in ADMIN_ACCOUNTS:
        with transaction.atomic():
            if User.objects.filter(phone=phone).exists():
                print(f"ادمین {phone} از قبل وجود دارد — رد شد", flush=True)
                continue
            User.objects.create_superuser(phone=phone, password=password)
            print(f"ادمین {phone} ساخته شد ✔", flush=True)

    print("=== setup finished OK ===", flush=True)


if __name__ == "__main__":
    main()
