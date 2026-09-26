"""افزودن ۱۵ محصول نمونه برای تست فروشگاه و جستجو.

عکس‌ها از frontend/public خوانده و در media/products کپی می‌شوند.
دستور idempotent است: اجرای دوباره، محصولات را به‌روز می‌کند و تکراری نمی‌سازد.

اجرا:  python manage.py seed_demo_products
"""

from decimal import Decimal
from pathlib import Path

from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from django.db import transaction

from products.models import Brand, Product, ProductImage

BASE_DIR = Path(__file__).resolve().parents[3]
IMAGES_DIR = BASE_DIR / 'frontend' / 'public'

# (نام فایل منبع در frontend/public، نام فایل مقصد در media/products)
DEMO_PRODUCTS = [
    # ---------- عطر و ادکلن ----------
    {
        'name': 'ادوپرفیوم زنانه شنل کاکو مویزل',
        'brand': 'Chanel',
        'category': 'perfume',
        'gender': 'female',
        'price': '7950000',
        'discount_percent': 10,
        'stock': 8,
        'image': ('perfuame1.png', 'chanel-coco-mademoiselle.png'),
        'description': (
            'ادوپرفیوم اورجینال کاکو مویزل شنل (Chanel Coco Mademoiselle) با رایحه گرم و شیرین '
            'وانیل، رز و پچولی؛ عطری زنانه، شیک و ماندگار مناسب مهمانی و استفاده روزانه.'
        ),
    },
    {
        'name': 'ادوپرفیوم مردانه شنل بلو دو شنل',
        'brand': 'Chanel',
        'category': 'perfume',
        'gender': 'male',
        'price': '8600000',
        'discount_percent': 0,
        'stock': 5,
        'image': ('عکس عطر2.png', 'chanel-bleu-de-chanel.png'),
        'description': (
            'ادوپرفیوم بلو دو شنل (Bleu de Chanel) با رایحه تلخ و چوبی مرکبات و سندل؛ '
            'عطری مردانه، قدرتمند و ماندگار برای محیط کار و مهمانی.'
        ),
    },
    {
        'name': 'ادوپرفیوم زنانه دیور میس دیور',
        'brand': 'Dior',
        'category': 'perfume',
        'gender': 'female',
        'price': '6850000',
        'discount_percent': 15,
        'stock': 12,
        'image': ('عکس عطر1.png', 'dior-miss-dior.png'),
        'description': (
            'ادوپرفیوم میس دیور (Miss Dior) با رایحه گل‌های تازه، رز و پیونی؛ عطری زنانه، '
            'رمانتیک و لطیف با ماندگاری بالا. ادکلن دیور فرانسوی مناسب هدیه.'
        ),
    },
    {
        'name': 'ادوپرفیوم زنانه ایو سن لورن لیبر',
        'brand': 'Yves Saint Laurent',
        'category': 'perfume',
        'gender': 'female',
        'price': '7400000',
        'discount_percent': 0,
        'stock': 6,
        'image': ('عکس عطر3.png', 'ysl-libre.png'),
        'description': (
            'ادوپرفیوم لیبر ایو سن لورن (YSL Libre) با رایحه لاوندر، وانیل و عنبر؛ عطری زنانه، '
            'مدرن و آزادمنش با ماندگاری بالا و پخش بوی عالی.'
        ),
    },
    {
        'name': 'پک ویژه عطرهای زنانه گالری شمین',
        'brand': 'Shamin Selection',
        'category': 'perfume',
        'gender': 'unisex',
        'price': '12500000',
        'discount_percent': 20,
        'stock': 3,
        'image': ('moarefiatre.png', 'shamin-perfume-set.png'),
        'description': (
            'پک ویژه ۴ عددی عطر و ادکلن زنانه گالری شمین؛ مجموعه‌ای از رایحه‌های محبوب زنانه '
            'با ماندگاری بالا، مناسب هدیه ولنتاین و تولد.'
        ),
    },
    # ---------- لوازم آرایشی و بهداشتی ----------
    {
        'name': 'کرم آبرسان کلینیک مویچر سرج',
        'brand': 'Clinique',
        'category': 'cosmetic',
        'gender': 'female',
        'price': '2850000',
        'discount_percent': 0,
        'stock': 15,
        'image': ('kerem1.png', 'clinique-moisture-surge.png'),
        'description': (
            'کرم آبرسان و مرطوب‌کننده صورت کلینیک مویچر سرج (Clinique Moisture Surge) با '
            'آبرسانی ۱۰۰ ساعته؛ مناسب پوست خشک، معمولی و حساس، بدون چربی و فوری جذب.'
        ),
    },
    {
        'name': 'رژ لب مات ایو سن لورن بلک کلاسیک',
        'brand': 'Yves Saint Laurent',
        'category': 'cosmetic',
        'gender': 'female',
        'price': '1450000',
        'discount_percent': 10,
        'stock': 20,
        'image': ('rozh.png', 'ysl-lipstick.png'),
        'description': (
            'رژ لب مات ایو سن لورن (YSL) با پوشش کامل و مخملی؛ ماندگاری ۱۲ ساعته، بدون خشکی '
            'لب و حاوی ویتامین E برای مراقبت از لب‌ها. آرایش حرفه‌ای روز و شب.'
        ),
    },
    {
        'name': 'پالت سایه چشم ان و ایکس آلتیمیت',
        'brand': 'NYX Professional Makeup',
        'category': 'cosmetic',
        'gender': 'female',
        'price': '1850000',
        'discount_percent': 0,
        'stock': 10,
        'image': ('arayeshi.png', 'nyx-shadow-palette.png'),
        'description': (
            'پالت سایه چشم ان و ایکس (NYX) آلتیمیت با ۱۶ رنگ مات و شاین؛ پیگمنت بالا، دیر پاک '
            'شدن و مناسب میکاپ و آرایش حرفه‌ای روز و شب.'
        ),
    },
    {
        'name': 'ریمل حجم دهنده لنکوم اپنوز',
        'brand': 'Lancome',
        'category': 'cosmetic',
        'gender': 'female',
        'price': '2150000',
        'discount_percent': 5,
        'stock': 9,
        'image': ('arayeshi2.png', 'lancome-mascara.png'),
        'description': (
            'ریمل حجم‌دهنده و بلندکننده لنکوم اپنوز (Lancôme Hypnôse)؛ فرمول ضد آب، برس مخصوص '
            'برای جدا کردن مژه‌ها و حجم چند برابر بدون کلوخه شدن.'
        ),
    },
    {
        'name': 'اتو مو رمینگتون پرو سرامیک اولترا',
        'brand': 'Remington',
        'category': 'cosmetic',
        'gender': 'unisex',
        'price': '3450000',
        'discount_percent': 0,
        'stock': 7,
        'image': ('arayeshi3.png', 'remington-straightener.png'),
        'description': (
            'اتو مو رمینگتون پرو سرامیک اولترا (Remington) با پوشش سرامیک پیشرفته، دمای قابل '
            'تنظیم تا ۲۳۰ درجه و گرم شدن سریع؛ صاف کننده مو مناسب موهای صاف و فر.'
        ),
    },
    {
        'name': 'کرم بدن عطری مردانه دیور ساواج',
        'brand': 'Dior',
        'category': 'cosmetic',
        'gender': 'male',
        'price': '3200000',
        'discount_percent': 0,
        'stock': 11,
        'image': ('perfuame2.png', 'dior-sauvage-body-cream.png'),
        'description': (
            'کرم بدن عطری مردانه دیور ساواج (Dior Sauvage) با رایحه تلخ، چوبی و تازه؛ '
            'مرطوب‌کننده و نرم‌کننده پوست با ماندگاری رایحه در طول روز. مراقبت و بهداشت مردانه.'
        ),
    },
    # ---------- اکسسوری ----------
    {
        'name': 'ساعت مچی زنانه مایکل کورس رزگلد',
        'brand': 'Michael Kors',
        'category': 'accessory',
        'gender': 'female',
        'price': '9800000',
        'discount_percent': 5,
        'stock': 4,
        'image': ('wach1.png', 'michael-kors-watch.png'),
        'description': (
            'ساعت مچی زنانه مایکل کورس (Michael Kors) با بند استیل رزگلد و قاب نگین‌کاری شده؛ '
            'اصل و دارای گارانتی، مناسب استایل روزمره و مجلسی. اکسسوری لوکس زنانه.'
        ),
    },
    {
        'name': 'ساعت مچی مردانه رولکس سابمارینر',
        'brand': 'Rolex',
        'category': 'accessory',
        'gender': 'male',
        'price': '45000000',
        'discount_percent': 0,
        'stock': 2,
        'image': ('wach2.png', 'rolex-submariner.png'),
        'description': (
            'ساعت مچی مردانه رولکس سابمارینر (Rolex Submariner) اصل با بند استیل، ضد آب تا '
            '۳۰۰ متر و موتور اتوماتیک؛ ساعت لوکس و سرمایه‌ای برای آقایان.'
        ),
    },
    {
        'name': 'ست اکسسوری زنانه گالری شمین',
        'brand': 'Shamin Selection',
        'category': 'accessory',
        'gender': 'female',
        'price': '5600000',
        'discount_percent': 15,
        'stock': 5,
        'image': ('teredacsesory.png', 'shamin-accessory-set.png'),
        'description': (
            'ست اکسسوری زنانه گالری شمین شامل کیف دستی، عینک آفتابی، شال و بدلیجات طلاکوب؛ '
            'هماهنگ و آماده برای هدیه یا استایل کامل شما. جواهرات و زیورآلات زنانه.'
        ),
    },
    {
        'name': 'ست کیف و اکسسوری زنانه سبز رویال',
        'brand': 'Shamin Selection',
        'category': 'accessory',
        'gender': 'female',
        'price': '6900000',
        'discount_percent': 0,
        'stock': 6,
        'image': ('baner-acsesory.png', 'royal-green-accessory-set.png'),
        'description': (
            'ست کیف و اکسسوری زنانه سبز رویال شامل کیف دستی چرم، ساعت، عینک آفتابی و '
            'گوشواره؛ انتخابی شیک برای هدیه و استفاده روزمره.'
        ),
    },
]


class Command(BaseCommand):
    help = 'افزودن ۱۵ محصول نمونه با عکس‌های موجود در frontend/public'

    @transaction.atomic
    def handle(self, *args, **options):
        created_count = 0
        updated_count = 0

        for item in DEMO_PRODUCTS:
            brand = None
            if item['brand']:
                brand, _ = Brand.objects.get_or_create(name=item['brand'])

            product, created = Product.objects.update_or_create(
                name=item['name'],
                defaults={
                    'brand': brand,
                    'category': item['category'],
                    'gender': item['gender'],
                    'price': Decimal(item['price']),
                    'discount_percent': item['discount_percent'],
                    'stock': item['stock'],
                    'is_active': True,
                    'description': item['description'],
                },
            )
            created_count += int(created)
            updated_count += int(not created)

            if not product.images.exists():
                self._attach_image(product, *item['image'])

        self.stdout.write(self.style.SUCCESS(
            f'انجام شد: {created_count} محصول ساخته شد، {updated_count} محصول به‌روزرسانی شد.'
        ))

    def _attach_image(self, product, source_name, target_name):
        source = IMAGES_DIR / source_name
        if not source.exists():
            self.stdout.write(self.style.WARNING(f'تصویر {source_name} پیدا نشد!'))
            return
        image = ProductImage(product=product, is_main=True)
        image.image.save(target_name, ContentFile(source.read_bytes()), save=True)
        self.stdout.write(f'  + تصویر {target_name} برای «{product.name}»')
