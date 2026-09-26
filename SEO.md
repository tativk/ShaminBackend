# سند جامع سئو — فروشگاه اینترنتی شامین

**نسخه:** ۱٫۰ — تاریخ: ۲۰۲۶/۰۹/۲۶
**دامنه فرضی:** `https://shamin.ir` (در همه‌ی مثال‌ها جایگزین دامنه واقعی شود و در `.env` به‌صورت `SITE_URL` تعریف شود)
**محدوده:** فرانت‌اند (`frontend/` — React 19 + Create React App) و بک‌اند (`Django + DRF`)

---

## ۱. خلاصه اجرایی

این پروژه یک فروشگاه عطر، لوازم آرایشی و اکسسوری است که فرانت‌اند آن یک **SPA کامل با Create React App** است و بک‌اند آن Django/DRF. در وضعیت فعلی **هیچ زیرساخت سئویی وجود ندارد**: صفحه‌ی HTML خروجی، قالب پیش‌فرض CRA است (`<title>React App</title>`، `lang="en"`، توضیحات پیش‌فرض)، robots.txt خالی است، sitemap وجود ندارد، آدرس محصولات عددی است و چند مسیر تکراری محتوای تکراری تولید می‌کند.

**سه مشکل بحرانی** که بدون حل آن‌ها بقیه‌ی کار بی‌اثر است:

1. **رندر صرفاً سمت کلاینت:** تمام محتوا با جاوااسکریپت ساخته می‌شود. گوگل می‌تواند JS را رندر کند ولی با تأخیر (موج دوم ایندکس)، و **تلگرام، واتساپ و بسیاری از خزنده‌ها هیچ‌چیز نمی‌بینند** — برای فروشگاه ایرانی که ترافیک پیام‌رسانی مهم است، این یعنی بدون پیش‌نمایش (Preview) در پیام‌رسانی‌ها.
2. **Head پیش‌فرض CRA:** در `frontend/public/index.html` عنوان و توضیحات عمومی وجود دارد و برای همه‌ی صفحات یکسان است.
3. **URLهای غیراستاندارد و تکراری:** آدرس محصول بر اساس شناسه عددی (`/products/1`) و چهار جفت مسیر تکراری (`/products` ↔ `/ProductList`، `/products/:id` ↔ `/product/:id`، `/cart` ↔ `/Cart`، `/favorites` ↔ `/Favorites`) بدون canonical.

**نقشه راه سه‌فازی:**

| فاز | هدف | زمان تقریبی |
|---|---|---|
| فاز ۱ | اصلاح head، متای هر صفحه، robots، مسیرهای تکراری، lang/dir | ۲ تا ۳ روز |
| فاز ۲ | slug و فیلدهای سئو در بک‌اند، sitemap داینامیک، داده‌ی ساختاریافته، prerender برای خزنده‌ها | ۱ هفته |
| فاز ۳ | محتوا، کلمات کلیدی، صفحات دسته‌بندی، بلاگ، پایش در Search Console | مستمر |

---

## ۲. وضعیت فعلی — یافته‌های بازرسی کد

| # | فایل / بخش | وضعیت فعلی | مشکل سئو | شدت |
|---|---|---|---|---|
| ۱ | `frontend/public/index.html` | `<title>React App</title>`، description پیش‌فرض CRA، `lang="en"`، بدون canonical/OG/JSON-LD | هویت سایت در نتایج گوگل و پیام‌رسانی‌ها غلط است | 🔴 بحرانی |
| ۲ | معماری CRA (SPA) | همه‌ی محتوا client-side رندر می‌شود؛ کتابخانه‌ی مدیریت متا (helmet) نصب نیست | ایندکس تأخیری، بدون پیش‌نمایش در تلگرام/واتساپ | 🔴 بحرانی |
| ۳ | `frontend/src/routes/AppRoutes.jsx` | آدرس محصول `/products/:id` (عددی) + مسیرهای تکراری با حروف بزرگ | URL ناخوانا، محتوای تکراری بدون canonical | 🔴 بحرانی |
| ۴ | `products/models.py` | مدل `Product` فیلد slug ندارد؛ فقط `Brand.slug` وجود دارد (nullable و بلااستفاده) | ساخت URL معنادار ممکن نیست | 🔴 بحرانی |
| ۵ | `frontend/public/robots.txt` | فقط `User-agent: *` + `Disallow:` (اجازه‌ی کامل) | بدون Sitemap، بدون مسدودسازی API/پنل ادمین | 🟠 مهم |
| ۶ | sitemap.xml | وجود ندارد | کشف کند صفحات | 🟠 مهم |
| ۷ | داده‌ی ساختاریافته (Schema) | هیچ JSON-LD ای وجود ندارد | بدون ستاره‌ی امتیاز/قیمت در نتایج گوگل | 🟠 مهم |
| ۸ | `frontend/public/manifest.json` | پیش‌فرض CRA با نام "Create React App Sample" | برندینگ ناقص در نصب PWA | 🟡 متوسط |
| ۹ | `config/settings.py` | `LANGUAGE_CODE = 'en-us'` | ناسازگاری با زبان فارسی سایت | 🟡 متوسط |
| ۱۰ | تصاویر در `frontend/public/` | نام‌های فارسی مثل `طراحی فیگما.jpg`، `عکس عطر1.png` و پوشه‌ی `Asets` | URLهای انکود‌شده‌ی ناخوانا، بدون کلمه‌کلیدی در نام فایل | 🟡 متوسط |
| ۱۱ | H1 صفحات | صفحه‌ی محصول و لیست محصولات H1 صحیح دارند؛ H1 صفحه‌ی اصلی = عنوان اسلاید hero که با تعویض اسلاید عوض می‌شود | ناپایداری H1 در صفحه‌ی اصلی | 🟡 متوسط |
| ۱۲ | تصاویر محصولات | alt در بیشتر جاها هست ولی یکنواخت نیست؛ بدون width/height | CLS و ایندکس ضعیف تصاویر | 🟡 متوسط |
| ۱۳ | صفحه‌ی ۴۰۴ | route `*` تعریف نشده؛ هاست هر مسیر ناشناخته را index.html با کد ۲۰۰ برمی‌گرداند | soft-404 و ایندکس صفحات بی‌محتوا | 🟠 مهم |
| ۱۴ | `reviews/models.py` | نظر با تأیید ادمین (`is_approved`) و امتیاز ۱ تا ۵ — `average_rating` در سریالایزر موجود است | **فرصت:** آماده‌ی ساخت `AggregateRating` است | ✅ فرصت |
| ۱۵ | `products/serializers.py` | `final_price`، `stock`، `main_image`، `description` در API موجود است | **فرصت:** داده‌ی لازم برای `Product` schema کامل است | ✅ فرصت |
| ۱۶ | فونت داخلی (dana woff2) | فونت لوکال، دو وزن | **نقطه‌ی قوت** — فقط preload شود | ✅ فرصت |

---

## ۳. تصمیم معماری: رندر و نمایایی محتوا

### مسئله
CRA خروجی `index.html` تقریباً خالی می‌سازد (`<div id="root"></div>`). خزنده‌هایی که JS اجرا نمی‌کنند (تلگرام، واتساپ، بخشی از Bing و ابزارهای ثالث) فقط یک صفحه‌ی خالی با تگ‌های ثابت می‌بینند.

### گزینه‌ها

| گزینه | شرح | هزینه | نتیجه |
|---|---|---|---|
| **الف — فقط react-helmet** | متای هر صفحه در سمت کلاینت تزریق می‌شود | بسیار کم | فقط برای گوگل کافی است؛ تلگرام/واتساپ همچنان خالی |
| **ب — Dynamic Rendering / Prerender (پیشنهاد فاز ۲)** | برای User-Agent خزنده‌ها، HTML آماده‌ی رندرشده سرو می‌شود؛ کاربران همان SPA را می‌بینند | متوسط | گوگل + همه‌ی پیام‌رسانی‌ها بدون بازنویسی پروژه |
| **ج — مهاجرت به Next.js** | SSR/ISR واقعی | بالا (بازنویسی فرانت) | ایده‌آل بلندمدت، لازم نیست فوراً |

### توصیه
- **الان (فاز ۱):** گزینه‌ی الف — نصب `react-helmet` و متای کامل در همه‌ی صفحات. این کار «منبع حقیقت» متا را در کد فرانت می‌سازد و بعداً در هر معماری کار می‌کند.
- **فاز ۲:** گزینه‌ی ب — prerender سه مسیر کلیدی (`/`، `/products`، `/products/{slug}`) با یک گام build مبتنی بر Puppeteer یا سرویس آماده (Prerender.io / prerender-self-hosted) و سرو آن HTML ها به خزنده‌ها در nginx. الگوی «Dynamic Rendering» رسماً توسط گوگل پذیرفته است.
- **بلندمدت (اختیاری):** CRA منسوخ (deprecated) شده است؛ در بازنویسی بعدی فرانت، Next.js انتخاب شود.

> نکته: prerender جایگزین helmet نیست؛ هر دو لازم‌اند. helmet محتوا را برای کاربرِ موتور جستجو درون SPA به‌روز می‌کند و prerender همان را به خزنده‌ی بدون JS می‌رساند.

---

## ۴. معماری اطلاعات و ساختار URL

### ۴.۱ آدرس‌های نهایی (هدف)

| صفحه | URL نهایی | ایندکس؟ |
|---|---|---|
| صفحه اصلی | `/` | ✅ |
| همه محصولات | `/products` | ✅ |
| دسته‌بندی (مسیرمحور، نه query) | `/products/perfume` ، `/products/cosmetic` ، `/products/accessory` | ✅ |
| برند | `/products?brand={id}` → در فاز ۳ مسیرمحور شود: `/brand/{brand-slug}` | ✅ |
| جنسیت | `/products?gender=male` (تا زمان مسیرمحور شدن) | ✅ |
| صفحه محصول | `/products/{product-slug}` | ✅ |
| صفحه‌بندی | `/products?page=2` (canonical به خودش) | ✅ |
| جستجو | `/products?search=...` | ❌ `noindex, follow` |
| سبد خرید | `/cart` | ❌ `noindex` |
| ورود / ثبت‌نام / تأیید OTP | `/login` ، `/register` ، `/verify` | ❌ `noindex` |
| داشبورد، علاقه‌مندی‌ها، ادمین، callback پرداخت | `/dashboard` ، `/favorites` ، `/admin` ، `/payment-callback` | ❌ `noindex` |

**قواعد:**
- تمام حروف URL **کوچک** و با خط تیره جدا شوند؛ بدون trailing slash (یا همیشه با — فقط یک قرارداد، و canonical مطابق همان).
- slug محصول فارسی-پسند باشد: `slugify(name, allow_unicode=True)`؛ نمونه: `/products/عطر-رز-شامین` (URLهای یونیکد در گوگل کاملاً پشتیبانی می‌شوند) یا transliterate انگلیسی — فقط یک قرارداد در کل سایت.
- فیلترهای ترکیبی (دسته+جنسیت+برند) با پارامتر query بمانند و `noindex, follow` بگیرند تا صفحات بی‌ارزش تولید نشود.
- مسیرهای قدیمی حذف نشوند؛ به آدرس جدید **redirect ۳۰۱** شوند (بند ۶٫۵).

---

## ۵. بک‌اند (Django) — تغییرات لازم

### ۵٫۱ فیلدهای جدید مدل `Product` در `products/models.py`

```python
from django.utils.text import slugify

class Product(models.Model):
    # ... فیلدهای موجود ...
    slug = models.SlugField(max_length=220, unique=True, blank=True, allow_unicode=True)
    meta_title = models.CharField("عنوان سئو", max_length=70, blank=True)
    meta_description = models.TextField("توضیح سئو", max_length=300, blank=True)
    updated_at = models.DateTimeField(auto_now=True)   # برای lastmod نقشه سایت

    def _unique_slug(self, base):
        slug, i = base or "product", 2
        while Product.objects.filter(slug=slug).exclude(pk=self.pk).exists():
            slug = f"{base}-{i}"; i += 1
        return slug

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = self._unique_slug(slugify(self.name, allow_unicode=True))
        super().save(*args, **kwargs)
```

سپس:

```powershell
.\venv\Scripts\python.exe manage.py makemigrations products
.\venv\Scripts\python.exe manage.py migrate
```

و اسلاگ محصولات موجود را یک‌بار پر کنید (shell یا دستور مدیریتی):

```python
from products.models import Product
from django.utils.text import slugify
for p in Product.objects.filter(slug=""):
    p.save()  # متد بالا slug می‌سازد
```

در `ProductImage` هم فیلد اختیاری `alt_text = models.CharField(max_length=200, blank=True)` اضافه شود (سئوی تصاویر).

### ۵٫۲ سریالایزر — `products/serializers.py`

به `ProductListSerializer` فیلد `slug` و به `ProductDetailSerializer` فیلدهای `slug`, `meta_title`, `meta_description` اضافه شود؛ در `BrandSerializer` فیلد `slug` هست و باید مقدار غیر-null تضمین شود.

### ۵٫۳ واکشی محصول با slug — `products/views.py`

مسیر فعلی `retrieve` با id می‌ماند (سازگاری)، و یک مسیر عمومی اضافه شود:

```python
from django.shortcuts import get_object_or_404
from rest_framework.generics import RetrieveAPIView

class ProductBySlugView(RetrieveAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = ProductDetailSerializer
    lookup_field = "slug"
    lookup_url_kwarg = "slug"
    queryset = (Product.objects.filter(is_active=True)
                .select_related("brand").prefetch_related("images", "reviews"))
```

در `products/urls.py`:

```python
path("products/by-slug/<slug:slug>/", ProductBySlugView.as_view(), name="product-by-slug"),
```

### ۵٫۴ نقشه سایت داینامیک — فایل جدید `config/sitemaps.py`

```python
import os
from django.contrib.sitemaps import Sitemap
from products.models import Product

SITE_URL = os.getenv("SITE_URL", "https://shamin.ir")

class StaticSitemap(Sitemap):
    priority, changefreq = 0.8, "weekly"
    def items(self):
        return ["/", "/products", "/products/perfume", "/products/cosmetic", "/products/accessory"]
    def location(self, item): return item

class ProductSitemap(Sitemap):
    changefreq, priority = "weekly", 0.9
    def items(self):
        return (Product.objects.filter(is_active=True)
                .select_related("brand").prefetch_related("images"))
    def location(self, obj): return f"/products/{obj.slug}"
    def lastmod(self, obj): return obj.updated_at
```

در `config/urls.py`:

```python
from django.contrib.sitemaps.views import sitemap
from config.sitemaps import StaticSitemap, ProductSitemap
from django.views.generic import TemplateView
from django.templatetags.static import static as dj_static
import os

sitemaps = {"static": StaticSitemap, "products": ProductSitemap}

urlpatterns += [
    path("sitemap.xml", sitemap, {"sitemaps": sitemaps}, name="sitemap"),
]
```

> اگر فرانت و API روی دامنه‌های جدا هاست می‌شوند، `sitemap.xml` باید URLهای **فرانت** را بدهد (همان‌طور که بالا با `/products/...` نوشته شده) و از دامنه‌ی اصلی سرو شود.

### ۵٫۵ تنظیمات `config/settings.py`

```python
LANGUAGE_CODE = 'fa'          # به‌جای en-us
SITE_URL = os.getenv('SITE_URL', 'https://shamin.ir')
```

و در `.env.example`:

```
SITE_URL=https://shamin.ir
```

### ۵٫۶ سرعت و کش رسانه‌ها (استقرار)

- روی nginx برای `/media/` و فایل‌های استاتیک build: `expires 30d` + هدر `Cache-Control: public, immutable` برای فایل‌های هش‌دار `static/`.
- فشرده‌سازی Brotli یا Gzip فعال شود (`gzip_types` شامل `text/html text/css application/javascript application/json`).
- تصاویر محصولات یک‌بار در آپلود به WebP با عرض حداکثر ۱۲۰۰px تبدیل شوند (فیلد جدا یا در زمان آپلود در `AdminProductSerializer._sync_images` با Pillow).

---

## ۶. فرانت‌اند — تغییرات لازم

### ۶٫۱ جایگزینی کامل `frontend/public/index.html`

```html
<!DOCTYPE html>
<html lang="fa" dir="rtl">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>فروشگاه اینترنتی شامین | خرید عطر، ادکلن و لوازم آرایشی اصل</title>
    <meta name="description" content="خرید آنلاین عطر و ادکلن اورجینال، لوازم آرایشی و اکسسوری با ضمانت اصالت کالا، پرداخت امن و ارسال سریع به سراسر ایران از فروشگاه شامین." />
    <meta name="theme-color" content="#0d0d0d" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />
    <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />

    <!-- Canonical پیش‌فرض؛ هر صفحه با helmet آن را بازنویسی می‌کند -->
    <link rel="canonical" href="https://shamin.ir/" />

    <!-- Open Graph / Twitter (پیش‌فرض؛ per-page بازنویسی می‌شود) -->
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="شامین" />
    <meta property="og:locale" content="fa_IR" />
    <meta property="og:title" content="فروشگاه اینترنتی شامین | خرید عطر و لوازم آرایشی اصل" />
    <meta property="og:description" content="عطر، ادکلن، لوازم آرایشی و اکسسوری اصل با ضمانت اصالت و ارسال سریع." />
    <meta property="og:url" content="https://shamin.ir/" />
    <meta property="og:image" content="https://shamin.ir/SHAMIN BANER 1.png" />
    <meta name="twitter:card" content="summary_large_image" />

    <!-- فونت لوکال: اولویت بالا برای جلوگیری از FOIT و بهبود LCP -->
    <link rel="preload" href="%PUBLIC_URL%/fonts/dana/dana-fanum-regular.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="preload" href="%PUBLIC_URL%/fonts/dana/dana-fanum-bold.woff2" as="font" type="font/woff2" crossorigin />
  </head>
  <body>
    <noscript>
      <h1>فروشگاه اینترنتی شامین</h1>
      <p>خرید عطر، ادکلن، لوازم آرایشی و اکسسوری اصل. برای تجربه‌ی کامل، جاوااسکریپت را فعال کنید.</p>
      <a href="/products">مشاهده محصولات</a>
    </noscript>
    <div id="root"></div>
  </body>
</html>
```

> تمام URLهای مطلق (`https://shamin.ir`) بعداً با مقدار `REACT_APP_SITE_URL` یکدست شوند تا در استقرار فقط یک تغییر لازم باشد.

### ۶٫۲ نصب کتابخانه‌ی متا و کامپوننت `Seo`

```powershell
npm install @dr.pogodin/react-helmet
```

> این fork نگه‌داری‌شده‌ی react-helmet با React 19 سازگار است. (اگر `react-helmet-async` را ترجیح دادید، ممکن است به `--legacy-peer-deps` نیاز شود.)

فایل جدید `frontend/src/components/Seo.jsx`:

```jsx
import React from "react";
import { Helmet } from "@dr.pogodin/react-helmet";

const SITE_URL = (process.env.REACT_APP_SITE_URL || "https://shamin.ir").replace(/\/$/, "");

export default function Seo({
  title,                      // عنوان کامل صفحه
  description,
  path = "/",                 // مسیر بدون دامنه
  image,                      // URL مطلق تصویر OG
  type = "website",
  robots = "index, follow",   // برای صفحات خصوصی: "noindex, nofollow"
  jsonLd,                     // آرایه یا آبجکت اسکیما
  children,
}) {
  const url = `${SITE_URL}${path}`;
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={url} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:locale" content="fa_IR" />
      {image && <meta property="og:image" content={image} />}
      <meta name="twitter:card" content={image ? "summary_large_image" : "summary"} />
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(Array.isArray(jsonLd) ? jsonLd : [jsonLd])}
        </script>
      )}
      {children}
    </Helmet>
  );
}
```

### ۶٫۳ جدول متای هر صفحه (با `Seo` در هر page)

| صفحه | title (حدود ۵۰–۶۰ کاراکتر) | description (۱۲۰–۱۶۰ کاراکتر) | robots |
|---|---|---|---|
| Home | `فروشگاه اینترنتی شامین | خرید عطر و لوازم آرایشی اصل` | معرفی فروشگاه + ضمانت اصالت + ارسال سریع | index |
| ProductList | `خرید عطر، لوازم آرایشی و اکسسوری | شامین` | معرفی فروشگاه با CTA | index |
| ProductList دسته‌ای | `خرید {عطر و ادکلن/لوازم آرایشی/اکسسوری} اصل | شامین` | معرفی دسته + برندها | index |
| Product | `{نام محصول} {برند} | خرید با قیمت و اصالت تضمینی — شامین` | ۱۵۰ کاراکتر از `description` محصول | index |
| Cart / Login / Register / Verify / Dashboard / Favorites / Admin / PaymentCallback | عنوان کوتاه صفحه | — | **noindex, nofollow** |
| ۴۰۴ | `صفحه پیدا نشد | شامین` | — | noindex |

نمونه استفاده در `pages/Product.jsx`:

```jsx
<Seo
  type="product"
  title={`${product.name} ${product.brand || ""} | خرید با ضمانت اصالت — شامین`}
  description={(product.description || product.name).slice(0, 160)}
  path={`/products/${product.slug || product.id}`}
  image={product.main_image}
  robots="index, follow"
  jsonLd={productJsonLd(product)}
/>
```

### ۶٫۴ داده‌ی ساختاریافته (JSON-LD)

فایل جدید `frontend/src/components/schema.js` — داده از همان API موجود (`final_price`، `stock`، `average_rating`، `main_image`) می‌آید:

```jsx
const SITE_URL = (process.env.REACT_APP_SITE_URL || "https://shamin.ir").replace(/\/$/, "");

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "شامین",
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  sameAs: ["https://instagram.com/shamin"], // آدرس واقعی شبکه‌های اجتماعی
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "شامین",
  url: SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/products?search={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export const productSchema = (p) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  name: p.name,
  description: (p.description || p.name).slice(0, 300),
  image: p.main_image ? [p.main_image] : undefined,
  brand: p.brand ? { "@type": "Brand", name: p.brand } : undefined,
  sku: `SH-${p.id}`,
  offers: {
    "@type": "Offer",
    url: `${SITE_URL}/products/${p.slug || p.id}`,
    priceCurrency: "IRR",                    // ⚠️ تصمیم: قیمت‌ها تومان است؛ IRR = تومان × ۱۰
    price: String(Math.round(p.final_price * 10)),
    availability: p.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    itemCondition: "https://schema.org/NewCondition",
  },
  ...(p.average_rating != null && {
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: p.average_rating,
      reviewCount: p.reviews_count ?? undefined, // باید از API اضافه شود
      bestRating: 5,
    },
  }),
});

export const breadcrumbSchema = (items) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: item.name,
    item: `${SITE_URL}${item.path}`,
  })),
});
```

**نکات الزامی:**
- `priceCurrency` باید ISO 4217 باشد؛ برای تومان مقدار `IRR` با ضریب ۱۰ بدهید (یا قیمت را ریال ذخیره/نمایش دهید) — **این تصمیم باید یک‌بار و در همه‌جا یکسان گرفته شود**.
- برای `reviewCount`، فیلد `reviews_count` (تعداد نظرات تأییدشده) به `ProductDetailSerializer` اضافه شود.
- اسکیمای `Organization` + `WebSite` فقط در صفحه‌ی اصلی رندر شود؛ `Product` + `BreadcrumbList` فقط در صفحه‌ی محصول.
- اسکیمای `Product` **فقط برای محصول فعال و موجود** معنادار است؛ قیمت/موجودی باید با همان مقادیر صفحه هم‌خوان باشد (گوگل مغایرت را خطا می‌دهد).
- بعد از استقرار، خروجی را در «Rich Results Test» گوگل تست کنید.

### ۶٫۵ اصلاح مسیرها و ریدایرکت ۳۰۱ — بازنویسی `frontend/src/routes/AppRoutes.jsx`

```jsx
import { Route, Routes, Navigate } from "react-router-dom";
// ... import ها مثل قبل
import NotFound from "../pages/NotFound"; // ساخته شود (بند ۶٫۹)

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/products" element={<ProductList />} />
    <Route path="/products/:category" element={<ProductList />} />   {/* perfume|cosmetic|accessory */}
    <Route path="/products/:slug" element={<Product />} />           {/* slug یا id */}
    {/* ریدایرکت مسیرهای قدیمی/تکراری — ۳۰۱ معنایی (Navigate replace) */}
    <Route path="/ProductList" element={<Navigate to="/products" replace />} />
    <Route path="/product/:id" element={<NavigateReplaceToProduct />} />
    <Route path="/products/:id" element={<NavigateReplaceToProduct />} /> {/* اگر id عددی بود */}
    <Route path="/Cart" element={<Navigate to="/cart" replace />} />
    <Route path="/Favorites" element={<Navigate to="/favorites" replace />} />
    <Route path="/Login" element={<Navigate to="/login" replace />} />
    <Route path="/Register" element={<Navigate to="/register" replace />} />
    <Route path="/admin" element={<AdminPanel />} />
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/favorites" element={<Favorites />} />
    <Route path="/cart" element={<Cart />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/verify" element={<Verify />} />
    <Route path="/payment-callback" element={<Navigate to="/PaymentCallback" replace />} />
    <Route path="/PaymentCallback" element={<PaymentCallback />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);
```

> چون SPA است، این «ریدایرکت» سمت کلاینت است؛ برای خزنده‌ها باید prerender یا هاست هم مسیرهای قدیمی را ۳۰۱ کند (بند ۹). لینک‌های داخلی (`Link to=`) در همه‌ی کامپوننت‌ها به آدرس‌های جدید اصلاح شوند — جستجو کنید: `ProductList`، `/product/`، `/Cart`، `/Favorites`، `/Login`، `/Register`.

کامپوننت کمکی برای ریدایرکت id → slug:

```jsx
function NavigateReplaceToProduct() {
  const { id } = useParams();
  // اگر id عددی بود به صفحه‌ی همان محصول با slug بروید؛
  // ساده‌ترین حالت: همان Product را رندر کن و canonical درست را بده (بند ۶٫۳)
  return <Product />;
}
```

**قانون canonical در صفحه‌ی محصول:** اگر با id عددی باز شد، canonical به `/products/{slug}` تنظیم شود (پس id ایندکس نمی‌شود)؛ اگر با slug باز شد، canonical به خودش.

### ۶٫۶ پشتیبانی slug در `pages/Product.jsx`

واکشی به شکل جدید:

```js
const { slug } = useParams();
const isNumeric = /^\d+$/.test(slug);
const url = isNumeric ? `${API_BASE_URL}/products/${slug}/` : `${API_BASE_URL}/products/by-slug/${encodeURIComponent(slug)}/`;
```

لینک کارت‌های محصول در `ProductList.jsx` و `Home.jsx` به `/products/${p.slug}` تغییر کند (تا وقتی slug نیست، `p.id`).

### ۶٫۷ تصاویر

1. **نام فایل‌ها:** همه‌ی فایل‌های فارسی/غیراستاندارد در `frontend/public/` تغییر نام دهند: `طراحی فیگما.jpg` → `figma-design.jpg`، `عکس عطر1.png` → `perfume-1.png`، پوشه‌ی `Asets` → `assets`. تصاویر محصولات آپلودی هم ترجیحاً `product-slug-1.webp`.
2. **alt توصیفی** برای همه‌ی `<img>` — الگو: `alt={`${product.name} - ${product.brand || "شامین"}`}`. alt خالی فقط برای تصاویر تزئینی.
3. **width/height صریح** یا `aspect-ratio` در CSS برای همه‌ی تصاویر تا CLS صفر شود؛ به‌خصوص کارت‌های محصول و hero.
4. **lazy loading:** `loading="lazy"` برای همه‌ی تصاویر به‌جز تصویر اول hero (آن یکی `fetchpriority="high"`).
5. فرمت WebP برای تصاویر محصولات (فاز ۲ — در آپلود تبدیل شود).

### ۶٫۸ پرفورمنس / Core Web Vitals

| مورد | اقدام | هدف |
|---|---|---|
| LCP | preload فونت‌ها (در ۶٫۱ انجام شد)؛ تصویر hero بهینه و `fetchpriority=high`؛ از لود Hero با اسلایدر سنگین خودداری | LCP < 2.5s |
| CLS | width/height تصاویر، رزرو ارتفاع اسلایدر و بنرها | CLS < 0.1 |
| INP/TBT | code-splitting با `React.lazy` برای صفحات ادمین و داشبورد (بخش عمده‌ی bundle هستند ولی برای سئو لازم نیستند اول لود شوند) | INP < 200ms |
| کش | هدر `Cache-Control: max-age=31536000, immutable` برای `static/` (فایل‌های هش‌دار) و ۳۰ روز برای media | — |
| فونت | `font-display: swap` در `@font-face` (در App.css بررسی شود) | جلوگیری از متن نامرئی |

مثال code-splitting در `AppRoutes.jsx`:

```jsx
const AdminPanel = React.lazy(() => import("../pages/AdminPanel"));
const Dashboard = React.lazy(() => import("../pages/Dashboard"));
// داخل Routes: <Suspense fallback={null}><AdminPanel /></Suspense>
```

### ۶٫۹ صفحه‌ی ۴۰۴ و جلوگیری از soft-404

صفحه‌ی جدید `pages/NotFound.jsx` با لینک به دسته‌بندی‌ها و جستجو + `<Seo robots="noindex, nofollow" title="صفحه پیدا نشد | شامین" />` و route `*`. روی هاست (nginx) هم برای پسوندهای فایل نامعتبر (`*.php` و امثال آن) پاسخ ۴۰۴ واقعی داده شود، نه index.html.

### ۶٫۱۰ به‌روزرسانی `frontend/public/manifest.json`

```json
{
  "short_name": "شامین",
  "name": "فروشگاه اینترنتی شامین",
  "description": "خرید عطر، ادکلن، لوازم آرایشی و اکسسوری اصل",
  "lang": "fa",
  "dir": "rtl",
  "icons": [
    { "src": "favicon.ico", "sizes": "64x64 32x32 24x24 16x16", "type": "image/x-icon" },
    { "src": "logo192.png", "type": "image/png", "sizes": "192x192" },
    { "src": "logo512.png", "type": "image/png", "sizes": "512x512", "purpose": "any maskable" }
  ],
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#0d0d0d",
  "background_color": "#ffffff"
}
```

### ۶٫۱۱ `frontend/public/robots.txt` — نسخه‌ی نهایی

```
User-agent: *
Disallow: /admin
Disallow: /api/
Disallow: /dashboard
Disallow: /cart
Disallow: /login
Disallow: /register
Disallow: /verify
Disallow: /payment-callback

Sitemap: https://shamin.ir/sitemap.xml
```

> تصاویر محصولات (`/media/`) **نباید** بسته شوند — سئوی تصاویر گوگل منبع ترافیک مهم برای فروشگاه است. صفحات خصوصی علاوه بر Disallow، متای `noindex` هم می‌گیرند (۶٫۳).

---

## ۷. سئو صفحه‌ای (On-Page) — استانداردهای محتوا

### ۷٫۱ عنوان و توضیح متا
- title: ۵۰–۶۰ کاراکتر؛ کلمه‌کلیدی اصلی در ابتدا؛ نام برند «شامین» در انتها؛ بدون تکرار بین صفحات.
- description: ۱۲۰–۱۶۰ کاراکتر؛ شامل CTA («همین حالا خرید کنید») و مزیت رقابتی (ضمانت اصالت، ارسال سریع).
- فیلدهای `meta_title` و `meta_description` محصول در پنل ادمین پر شود؛ اگر خالی بود، فرانت از `name` و `description` fallback کند (منطق در `Seo` یا صفحه‌ی محصول).

### ۷٫۲ ساختار هدینگ
- **هر صفحه فقط یک H1.** صفحه اصلی H1 ثابت بگیرد (مثلاً «فروشگاه اینترنتی عطر و لوازم آرایشی شامین») — عنوان اسلایدها `H2` شوند و H1 جدا و ثابت بالای hero قرار گیرد.
- صفحه محصول: H1 = نام کامل محصول؛ بخش‌ها (توضیحات، نظرات، محصولات مشابه) H2.
- صفحه لیست: H1 شامل کلمه‌کلیدی دسته («خرید عطر و ادکلن اصل») به‌جای «لیست محصولات» خنثی فعلی.

### ۷٫۳ محتوای محصول (مهم‌ترین اهرم رتبه در فروشگاه)
- توضیح حداقل **۳۰۰ کلمه** یکتا برای هر محصول (نه متن کپی از سایت دیگر)؛ شامل: نت‌های رایحه/ترکیبات، ماندگاری، مناسب برای، نحوه‌ی استفاده.
- مشخصات فنی به‌صورت جدول HTML (نه تصویر) تا قابل ایندکس باشد.
- بخش «پرسش‌های متداول محصول» (۲–۳ سؤال) + اسکیمای `FAQPage`.
- نظرات تأییدشده زیر محصول نمایش داده شوند (برای AggregateRating و محتوای تازه‌ی خودکار).

### ۷٫۴ صفحه‌ی دسته‌بندی
- بالای گرید محصولات، ۱۰۰–۱۵۰ کلمه **متن معرفی دسته** (لورم نباشد): «خرید عطر و ادکلن اصل با ضمانت اصالت…».
- breadcrumb قابل مشاهده (خانه ← دسته‌بندی ← صفحه فعلی) با اسکیمای `BreadcrumbList` — هم UI و هم JSON-LD.
- فیلترها به‌صورت لینک واقعی (`<a href="/products?gender=male">`) نه فقط دکمه‌ی JS تا خزنده لینک‌ها را دنبال کند.

### ۷٫۵ لینک‌سازی داخلی
- فوتر (`components/Footer/Footer.jsx`): لینک متنی به هر سه دسته‌بندی + صفحات کلیدی (درباره ما، تماس، روش ارسال).
- صفحه محصول: «محصولات مشابه» (همان دسته/برند — می‌تواند سمت کلاینت از همان لیست فیلتر شود).
- متن لینک (anchor) توصیفی باشد؛ «مشاهده محصولات» به‌جای «اینجا».

---

## ۸. استراتژی کلمات کلیدی و محتوا

### ۸٫۱ خوشه‌های کلمه‌ی هدف (فارسی)

| خوشه | نمونه کوئری‌ها | صفحه هدف | اینتنت |
|---|---|---|---|
| برند + خرید | خرید عطر شامین، قیمت ادکلن شامین | صفحه برند / محصولات برند | تراکنشی |
| دسته‌بندی | خرید عطر مردانه، عطر زنانه اصل، لوازم آرایشی اورجینال | `/products/perfume` و … | تراکنشی |
| محصول | قیمت و خرید {نام دقیق عطر} | صفحه محصول | تراکنشی |
| مقایسه/راهنما | بهترین عطرهای ماندگار مردانه، تفاوت ادوپرفیوم و ادوتویلت | بلاگ | اطلاعاتی |
| اعتماد | روش‌های پرداخت، ارسال و مرجوعی کالا | صفحات ایستا | اطلاعاتی |

**قانون:** هر کلمه‌کلیدی = یک صفحه. کوئری‌های اطلاعاتی به صفحه‌ی دسته/محصول لینک داخلی بدهند.

### ۸٫۲ صفحات ایستای اعتماد (الان وجود ندارند — ساخته شود)
`/about`، `/contact`، `/shipping` (روش‌های ارسال و هزینه)، `/returns` (رویه‌ی مرجوعی)، `/faq`. این صفحات هم رتبه می‌گیرند هم نرخ تبدیل و اعتماد (E-E-A-T) را بالا می‌برند. مسیرهای ایستا به sitemap اضافه شوند.

### ۸٫۳ بلاگ (فاز ۳)
پیشنهاد اجرا: ساده‌ترین راه، اپ Django با مدل `Post (title, slug, excerpt, body, cover_image, published_at, is_published)` و لیست/جزئیات به‌صورت SSR (Django template) — بلاگ را SPA نمی‌خواهد؛ همین کار prerender رایگان محتوا را هم تضمین می‌کند. ۲–۳ پست در ماه با اینتنت اطلاعاتی جدول ۸٫۱.

---

## ۹. استقرار (Deployment) — الزامات سئو روی سرور

1. **HTTPS اجباری:** ریدایرکت ۳۰۱ از http به https روی nginx؛ گواهی معتبر (Let's Encrypt).
2. **یک دامنه‌ی canonical:** `shamin.ir` و `www.shamin.ir` یکی شود (۳۰۱)، canonicalها و `SITE_URL` مطابق همان.
3. **SPA fallback درست:**

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

4. **Dynamic rendering (اختیاری ولی توصیه‌شده — فاز ۲):**

```nginx
location / {
    # درخواست خزنده‌ها به سرویس prerender
    if ($http_user_agent ~* (bot|crawler|spider|crows|telegram|whatsapp|twitterbot|facebookexternalhit|slackbot|discordbot)) {
        proxy_pass http://127.0.0.1:3000;   # سرویس prerender
    }
    try_files $uri $uri/ /index.html;
}
```

    سرویس prerender (نمونه‌ی متن‌باز self-hosted با Puppeteer) HTML واقعی هر مسیر را برمی‌گرداند — پیش‌نمایش تلگرام/واتساپ و ایندکس مطمئن.
5. **فشرده‌سازی و کش** طبق بند ۵٫۶.
6. **بدون محتوای تست روی دامنه‌ی اصلی:** نسخه‌ی توسعه با `X-Robots-Tag: noindex` یا دامنه‌ی جدا.

---

## ۱۰. ابزارها، پایش و KPI

### ۱۰٫۱ راه‌اندازی (بعد از استقرار)
1. **Google Search Console** (با دامنه‌ی apex): ثبت مالکیت با DNS → ارسال `sitemap.xml` → درخواست ایندکس صفحات کلیدی → پایش گزارش Pages (ایندکس‌شده/مستثنا) و Core Web Vitals.
2. **Bing Webmaster Tools** — ایمپورت از GSC با یک کلیک (سهم Bing/دیگر موتورها را رایگان پوشش می‌دهد).
3. **تحلیل ترافیک:** GA4 یا جایگزین (برای ایران، Matomo self-host گزینه‌ی پایدارتری است) + Event برای add-to-cart و purchase.
4. **رتبه‌سنجی:** ابزارهایی مثل Ahrefs/Semrush یا ابزارهای ایرانی برای پایش کلمات جدول ۸٫۱.

### ۱۰٫۲ KPI های سه‌ماهه‌ی اول

| KPI | هدف |
|---|---|
| صفحات ایندکس‌شده در GSC | ≥ ۹۰٪ صفحات محصول فعال |
| CLS / LCP / INP (گزارش CWV) | سبز برای ≥ ۷۵٪ بازده‌ها |
| کلیک ارگانیک | رشد ماهانه؛ شروع از جستجوی برند «شامین» |
| پیش‌نمایش لینک در تلگرام | عنوان + تصویر صحیح برای همه‌ی صفحات محصول |
| خطاهای اسکیما در GSC | صفر |

---

## ۱۱. چک‌لیست اجرایی فازبندی‌شده

### فاز ۱ — سریع و بدون تغییر معماری (اولویت: همین هفته)
- [ ] جایگزینی کامل `frontend/public/index.html` (بند ۶٫۱) — `lang="fa" dir="rtl"`، title/description فارسی، OG، preload فونت
- [ ] نصب `@dr.pogodin/react-helmet` + کامپوننت `Seo` (بند ۶٫۲) و اتصال به **همه‌ی** صفحات طبق جدول ۶٫۳
- [ ] `noindex` برای صفحات خصوصی (cart, login, register, verify, dashboard, favorites, admin, payment-callback)
- [ ] رفع مسیرهای تکراری + ریدایرکت‌ها + route `*` و صفحه NotFound (بند ۶٫۵ و ۶٫۹)
- [ ] `manifest.json` جدید (بند ۶٫۱۰) و `robots.txt` نهایی (بند ۶٫۱۱)
- [ ] `LANGUAGE_CODE = 'fa'` در `config/settings.py`
- [ ] تغییر نام فایل‌های تصویری فارسی در `public/` (بند ۶٫۷٫۱)
- [ ] alt و width/height تصاویر (بند ۶٫۷)
- [ ] H1 ثابت صفحه‌ی اصلی؛ متن معرفی دسته در ProductList (بند ۷٫۲ و ۷٫۴)
- [ ] `SITE_URL` و `REACT_APP_SITE_URL` در `.env`

### فاز ۲ — تکنیکال (هفته‌ی بعد)
- [ ] فیلدهای `slug`, `meta_title`, `meta_description`, `updated_at` در Product + مهاجرت + پر کردن slug موجودها (بند ۵٫۱)
- [ ] `ProductBySlugView` و مسیر `by-slug` (بند ۵٫۳) + URLهای slug در فرانت (بند ۶٫۶)
- [ ] canonical خودکار: نسخه‌ی id محصول → canonical به slug (بند ۶٫۵)
- [ ] sitemap داینامیک Django + مسیر `/sitemap.xml` (بند ۵٫۴)
- [ ] JSON-LD: Organization و WebSite در صفحه اصلی؛ Product + Breadcrumb در محصول؛ فیلد `reviews_count` در سریالایزر (بند ۶٫۴)
- [ ] breadcrumb UI + URLهای مسیرمحور دسته‌بندی `/products/{category}` (بند ۶٫۵)
- [ ] تبدیل تصاویر آپلودی به WebP و کش/فشرده‌سازی روی سرور (بند ۵٫۶)
- [ ] code-splitting ادمین/داشبورد (بند ۶٫۸)
- [ ] استقرار: https، redirect دامنه، SPA fallback، (اختیاری) prerender برای خزنده‌ها (بند ۹)
- [ ] ثبت در Google Search Console و Bing + ارسال sitemap (بند ۱۰)

### فاز ۳ — محتوا و اعتبار (مستمر)
- [ ] متن ۳۰۰ کلمه‌ای یکتا برای محصولات موجود + جدول مشخصات + FAQ محصول (بند ۷٫۳)
- [ ] متای اختصاصی (`meta_title`/`meta_description`) برای همه‌ی محصولات در پنل ادمین
- [ ] صفحات ایستا: درباره ما، تماس، ارسال، مرجوعی، FAQ (بند ۸٫۲)
- [ ] راه‌اندازی بلاگ SSR با Django (بند ۸٫۳) — ۲–۳ پست در ماه
- [ ] پایش هفتگی GSC: خطاهای ایندکس، CWV، کوئری‌ها؛ به‌روزرسانی sitemap خودکار (می‌باشد)
- [ ] ثبت نماد اعتماد الکترونیکی و نشان‌ها (سیگنال اعتماد برای کاربر — تسلط روی نرخ کلیک)

---

## ۱۲. تعریف «انجام‌شده» — QA نهایی پیش از اعلام تکمیل

| تست | ابزار | معیار قبولی |
|---|---|---|
| منبع HTML صفحه (بدون JS) | `view-source:` یا curl | title/description/canonical/OG فارسی و صحیح در هر صفحه‌ی کلیدی |
| متای داینامیک | باز کردن SPA و تغییر route | title و canonical با هر ناوبری عوض شود |
| رندر خزنده | Rich Results Test + URL Inspection در GSC | HTML کامل + اسکیمای Product بدون خطا |
| اسکیما | Rich Results Test / Schema validator | Product, Organization, WebSite, BreadcrumbList: بدون Error (warning قابل قبول) |
| ۳۰۱ها | curl -I | مسیرهای قدیمی → جدید با ۳۰۱؛ http → https؛ www → apex |
| ۴۰۴ | مسیر ساختگی | صفحه NotFound با متای noindex |
| robots/sitemap | `/robots.txt` و `/sitemap.xml` | sitemap در robots معرفی شده؛ همه‌ی URLها ۲۰۰ بدهند |
| Core Web Vitals | PageSpeed Insights (موبایل) | هر سه متریک سبز یا نارنجیِ نزدیک سبز |
| پیش‌نمایش پیام‌رسانی | ارسال لینک محصول در تلگرام | عنوان + توضیح + تصویر محصول نمایش داده شود |
| داده | GSC گزارش Pages بعد از ۲ هفته | صفحات محصول ایندکس شده‌اند؛ بدون soft-404 و duplicate |

---

### پیوست الف — تصمیم‌های باز (پیش از پیاده‌سازی تکمیل شود)
1. **دامنه‌ی نهایی** و اینکه www باشد یا apex → همه‌ی canonicalها و `SITE_URL`.
2. **واحد پول در اسکیما:** تومان با `IRR × ۱۰` یا ذخیره‌ی ریالی — یک تصمیم، همه‌جا یکسان.
3. **قرارداد slug:** فارسی-یونیکد یا انگلیسی‌شده — هر دو قابل قبول‌اند ولی باید یکدست باشد.
4. **آدرس شبکه‌های اجتماعی** برای `sameAs` اسکیمای Organization.
5. **تصویر پیش‌فرض OG** (بنر برند) برای صفحات بدون تصویر.
