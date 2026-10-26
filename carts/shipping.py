# -*- coding: utf-8 -*-
"""تطبیق متن دستیِ استان/شهر کاربر با نرخ‌های ارسال ثبت‌شده.

کاربر استان و شهر را آزادانه تایپ می‌کند؛ این ماژول نویسه‌های عربی/فارسی را
یکسان‌سازی می‌کند و نزدیک‌ترین نرخ (ترجیحاً همان استان) را پیدا می‌کند تا
هزینه ارسال مطابق نرخ‌های ابلاغی اداره پست محاسبه شود.
"""
import re

from .models import ShippingRate

# نویسه‌های عربی رایج در تایپ کاربران → معادل فارسی استاندارد
_CHAR_MAP = {
    'ي': 'ی', 'ﻯ': 'ی', 'ﻰ': 'ی', 'ى': 'ی',
    'ك': 'ک', 'ﻙ': 'ک',
    'أ': 'ا', 'إ': 'ا', 'ٱ': 'ا', 'آ': 'آ',
    'ة': 'ه', 'ۀ': 'ه', 'ﻪ': 'ه',
    'ؤ': 'و', 'ئ': 'ی',
}

_ZWNJ = '\u200c'


def normalize_persian_text(value):
    """یکسان‌سازی متن فارسی برای مقایسه: عربی→فارسی، نیم‌فاصله→فاصله، فشرده‌سازی فاصله‌ها."""
    text = str(value or '').strip()
    for src, dst in _CHAR_MAP.items():
        text = text.replace(src, dst)
    text = text.replace(_ZWNJ, ' ')
    text = re.sub(r'\s+', ' ', text)
    return text


def resolve_shipping_rate(province_text, city_text):
    """پیدا کردن ShippingRate برای استان/شهر تایپ‌شده؛ None یعنی یافت نشد.

    ترتیب تطبیق: شهرِ دقیق (با ترجیح استان تایپ‌شده) → شهرِ جزئی → استان.
    """
    province_norm = normalize_persian_text(province_text)
    city_norm = normalize_persian_text(city_text)
    if not province_norm and not city_norm:
        return None

    rates = list(ShippingRate.objects.all())
    normalized = [
        (rate, normalize_persian_text(rate.city), normalize_persian_text(rate.province))
        for rate in rates
    ]

    if city_norm:
        exact = [row for row in normalized if row[1] == city_norm]
        if province_norm:
            in_province = [row for row in exact if row[2] == province_norm]
            if in_province:
                return in_province[0][0]
        if exact:
            return exact[0][0]

        partial = [
            row for row in normalized
            if (city_norm in row[1] or row[1] in city_norm) and len(row[1]) > 1
        ]
        if province_norm:
            in_province = [row for row in partial if row[2] == province_norm]
            if in_province:
                return in_province[0][0]
        if partial:
            return partial[0][0]

    if province_norm:
        in_province = [row for row in normalized if row[2] == province_norm]
        if in_province:
            # اگر شهر تایپ شده باشد ولی در این استان نباشد، نزدیک‌ترین شهرِ
            # همان استان ملاک است (هزینه ارسال در سطح استان یکسان است).
            return in_province[0][0]
        partial_province = [row for row in normalized if province_norm in row[2]]
        if partial_province:
            return partial_province[0][0]

    return None
