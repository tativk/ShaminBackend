"""موتور جستجوی پیشرفته محصولات.

جستجو فقط به نام محصول محدود نیست و این فیلدها را پوشش می‌دهد:
- نام محصول، نام برند و توضیحات
- دسته‌بندی با مترادف‌های فارسی (عطر، ادکلن، آرایشی، اکسسوری، ساعت و ...)
- جنسیت با مترادف‌های فارسی (مردانه، زنانه، یونیسکس و ...)

کوئری به توکن‌ها شکسته می‌شود و همه توکن‌ها باید match شوند (AND)؛
هر توکن کافی است در یکی از فیلدهای بالا موجود باشد (OR).
"""

import re

from django.db.models import Q

# یکسان‌سازی نویسه‌های عربی/فارسی؛ نیم‌فاصله (ZWNJ) هم به فاصله تبدیل می‌شود
PERSIAN_NORMALIZE_MAP = str.maketrans({
    'ي': 'ی',
    'ك': 'ک',
    'ة': 'ه',
    'أ': 'ا',
    'إ': 'ا',
    '\u200c': ' ',
    '\u0640': '',  # کشیده
})

ARABIC_DIACRITICS = re.compile(r'[\u064B-\u0652\u0670]')

CATEGORY_TERMS = {
    'perfume': (
        'perfume', 'fragrance', 'عطر', 'ادکلن', 'عطریات', 'ادوپرفیوم',
        'ادوتویلت', 'ادوپرفیوم', 'رایحه', 'بوتیک',
    ),
    'cosmetic': (
        'cosmetic', 'cosmetics', 'آرایشی', 'ارایشی', 'بهداشتی', 'لوازم',
        'کرم', 'لوسیون', 'شامپو', 'رژ', 'میکاپ', 'ماکاپ', 'مراقبت',
        'پوست', 'سرم', 'ماسک',
    ),
    'accessory': (
        'accessory', 'accessories', 'اکسسوری', 'اکسسوات', 'بدلیجات',
        'ساعت', 'عینک', 'جواهرات', 'گردنبند', 'دستبند', 'انگشتر',
        'گوشواره', 'کیف', 'شال', 'عطرهای ست',
    ),
}

GENDER_TERMS = {
    'male': ('male', 'مردانه', 'مرد', 'مردان', 'آقایانه', 'اقایانه', 'آقایان', 'آقایان'),
    'female': ('female', 'زنانه', 'زن', 'زنان', 'بانوان', 'بانو', 'خانم'),
    'unisex': ('unisex', 'یونیسکس', 'يونيسكس', 'مشترک', 'اسنشیال'),
}


def normalize_persian_text(value):
    """نرمال‌سازی متن فارسی/انگلیسی برای مقایسه و جستجو."""
    value = ARABIC_DIACRITICS.sub('', (value or '').translate(PERSIAN_NORMALIZE_MAP))
    return value.lower().strip()


def _token_matches_terms(token, terms):
    """تطبیق توکن با مترادف‌ها؛ تطبیق جزئی فقط برای توکن‌های ۴ نویسه به بالا."""
    for term in terms:
        if token == term:
            return True
        if len(token) >= 4 and (token.startswith(term) or term.startswith(token)):
            return True
    return False


def build_product_search_q(search_text):
    """ساخت Q-آبجکت جستجو؛ توکن‌ها با هم AND و فیلدها برای هر توکن OR هستند."""
    tokens = normalize_persian_text(search_text).split()
    if not tokens:
        return Q()

    combined = Q()
    for token in tokens:
        token_q = (
            Q(name__icontains=token)
            | Q(brand__name__icontains=token)
            | Q(description__icontains=token)
        )
        for category_value, terms in CATEGORY_TERMS.items():
            if _token_matches_terms(token, terms):
                token_q |= Q(category=category_value)
        for gender_value, terms in GENDER_TERMS.items():
            if _token_matches_terms(token, terms):
                token_q |= Q(gender=gender_value)
        combined &= token_q
    return combined
