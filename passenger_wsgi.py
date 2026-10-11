"""
نقطه‌ی ورود اپلیکیشن برای cPanel (Setup Python App / Passenger).

در cPanel:
  - Application root: مسیر همین پروژه (جایی که manage.py هست)
  - Application startup file: passenger_wsgi.py
  - Application Entry point: application

این فایل نباید چیزی به sys.path اضافه کند چون Passenger خودش
پوشه‌ی application root را به مسیر اضافه می‌کند.
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

from config.wsgi import application  # noqa: E402,F401
