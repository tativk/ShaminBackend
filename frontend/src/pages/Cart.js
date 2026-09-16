import React, { useEffect, useRef, useState, useMemo } from 'react';
import './Cart.css';
import { apiRequest, getAssetUrl } from '../api';

/* ── ابزارها ─────────────────────────────────────────────── */

// تبدیل اعداد انگلیسی به فارسی
const FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

const toFa = (value) => String(value).replace(/\d/g, (d) => FA_DIGITS[Number(d)]);

// فرمت قیمت: تفکیک ارقام + تبدیل به فارسی
const formatPrice = (value) =>
  toFa(new Intl.NumberFormat('en-US').format(Math.round(value)).replace(/,/g, ','));

/* ── آیکون‌ها ─────────────────────────────────────────────── */

// آیکون سبد خرید
function CartIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="21" r="1.4" />
      <circle cx="19" cy="21" r="1.4" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  );
}

// آیکون قلب (علاقه‌مندی‌ها)
function HeartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

// آیکون سطل زباله (حذف)
function TrashIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

// آیکون برچسب (تگ)
function TagIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  );
}

// آیکون قفل (امنیت)
function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

// آیکون تأیید (چک سبز)
function CheckCircleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="8 12 11 15 16 9" />
    </svg>
  );
}

// آیکون سپر (تضمین)
function ShieldCheckIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}

// آیکون ماشین (ارسال)
function TruckIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="1" y="3" width="15" height="13" rx="1" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

// آیکون هدست (پشتیبانی)
function HeadsetIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
    </svg>
  );
}

// آیکون رسید (سفارش)
function ReceiptIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1z" />
      <line x1="8" y1="8" x2="16" y2="8" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}

// آیکون برگ (پیشنهاد)
function LeafIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 20A7 7 0 0 1 4 13c0-4 3-8 8-10 5 2 8 6 8 10a7 7 0 0 1-7 7z" />
      <path d="M12 21V11" />
    </svg>
  );
}

// آیکون شِوون (نوار پیمایش)
function ChevronIcon({ direction = 'left' }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {direction === 'left'
        ? <polyline points="15 18 9 12 15 6" />
        : <polyline points="9 18 15 12 9 6" />}
    </svg>
  );
}

// آیکون ستاره (امتیاز)
function StarIcon({ filled = true, half = false }) {
  if (half) {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
        <defs>
          <linearGradient id="half-star">
            <stop offset="50%" stopColor="#f5a623" />
            <stop offset="50%" stopColor="#dcdcdc" />
          </linearGradient>
        </defs>
        <path
          fill="url(#half-star)"
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        />
      </svg>
    );
  }
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? '#f5a623' : '#dcdcdc'} aria-hidden="true">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

// آیکون سبد (افزودن)
function BasketIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="21" r="1.4" />
      <circle cx="19" cy="21" r="1.4" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  );
}

/* ── کامپوننت صفحه سبد خرید ──────────────────────────────── */

export default function Cart() {
  // ============ State ها ============
  const [cart, setCart] = useState(null);            // سبد خرید از سرور
  const [cities, setCities] = useState([]);          // لیست شهرها برای ارسال
  const [products, setProducts] = useState([]);      // محصولات پیشنهادی
  const [address, setAddress] = useState('');        // آدرس تحویل
  const [postalCode, setPostalCode] = useState('');  // کد پستی
  const [loading, setLoading] = useState(true);      // حالت بارگذاری
  const [busy, setBusy] = useState(false);           // حالت انتظار (در حین پرداخت)
  const [error, setError] = useState('');            // پیام خطا
  const [notice, setNotice] = useState('');          // پیام موفقیت
  const [couponCode, setCouponCode] = useState('');  // کد تخفیف
  const sliderRef = useRef(null);                    // مرجع اسلایدر پیشنهادات

  // ============ محاسبات ============
  const items = cart?.items || [];
  const totals = useMemo(() => {
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
    const shipping = cart?.shipping_cost || 0;
    return {
      count,
      subtotal,
      shipping,
      discount: 0,
      payable: subtotal + shipping,
    };
  }, [items, cart]);

  // ============ بارگذاری داده‌ها هنگام Mount ============
  useEffect(() => {
    const loadPage = async () => {
      try {
        // درخواست همزمان چند API
        const [cartData, cityData, productData, addressData] = await Promise.all([
          apiRequest('/cart/'),                    // سبد خرید
          apiRequest('/shipping/cities/'),         // شهرهای ارسال
          apiRequest('/products/?page_size=20'),   // محصولات برای پیشنهاد
          apiRequest('/auth/address/'),            // آدرس کاربر
        ]);

        setCart(cartData);
        setCities(cityData.results || cityData);
        setProducts(productData.results || productData);

        // اگر آدرس قبلی وجود داشت، نمایش دهنده
        if (addressData) {
          setAddress(
            [addressData.street, addressData.detail]
              .filter(Boolean)
              .join('، ')
          );
          setPostalCode(addressData.postal_code || '');
        }
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    };

    loadPage();
  }, []);

  // ============ تابع تازه‌سازی سبد خرید ============
  const refreshCart = async () => {
    try {
      const updatedCart = await apiRequest('/cart/');
      setCart(updatedCart);
    } catch (err) {
      setError(err.message);
    }
  };

  // ============ تابع تغییر تعداد محصول ============
  const changeQuantity = async (itemId, delta) => {
    setError('');
    try {
      // پیدا کردن محصول
      const item = items.find((i) => i.id === itemId);
      if (!item) return;

      // ارسال درخواست بروزرسانی
      const updatedCart = await apiRequest(`/cart/items/${itemId}/`, {
        method: 'PATCH',
        body: JSON.stringify({
          quantity: Math.max(1, item.quantity + delta),
        }),
      });
      setCart(updatedCart);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  // ============ تابع حذف محصول ============
  const removeItem = async (itemId) => {
    setError('');
    try {
      // درخواست حذف
      await apiRequest(`/cart/items/${itemId}/`, { method: 'DELETE' });
      // تازه‌سازی سبد
      await refreshCart();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  // ============ تابع حذف تمام محصولات ============
  const clearAll = async () => {
    setError('');
    try {
      // حذف همه موارد
      await Promise.all(
        items.map((item) =>
          apiRequest(`/cart/items/${item.id}/`, { method: 'DELETE' })
        )
      );
      // تازه‌سازی سبد
      await refreshCart();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  // ============ تابع تغییر شهر ============
  const changeCity = async (event) => {
    const city = event.target.value;
    if (!city) return;

    setError('');
    try {
      const updatedCart = await apiRequest('/cart/', {
        method: 'PATCH',
        body: JSON.stringify({ city }),
      });
      setCart(updatedCart);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  // ============ تابع تکمیل سفارش (Checkout) ============
  const checkout = async () => {
    // بررسی: شهر انتخاب شده باشد
    if (!cart?.city) {
      return setError('لطفاً ابتدا شهر ارسال را انتخاب کنید.');
    }

    // بررسی: آدرس و کد پستی معتبر باشند
    if (!address.trim() || !/^\d{10}$/.test(postalCode)) {
      return setError('آدرس و کد پستی ده رقمی را وارد کنید.');
    }

    setBusy(true);
    setError('');

    try {
      // ایجاد سفارش
      const order = await apiRequest('/orders/', {
        method: 'POST',
        body: JSON.stringify({
          city: cart.city,
          address: address.trim(),
          postal_code: postalCode,
          shipping_cost: cart.shipping_cost,
        }),
      });

      // اگر لینک پرداخت ارسال شد، هدایت کن
      if (order.payment_url) {
        window.location.assign(order.payment_url);
      } else {
        setNotice(`سفارش شماره ${toFa(order.order_id)} ایجاد شد.`);
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  // ============ تابع افزودن محصول پیشنهادی ============
  const addSuggestedProduct = async (product) => {
    setError('');
    try {
      const updatedCart = await apiRequest('/cart/items/', {
        method: 'POST',
        body: JSON.stringify({
          product: product.id,
          quantity: 1,
        }),
      });
      setCart(updatedCart);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  // ============ محصولات پیشنهادی (غیر موجود در سبد) ============
  const suggestedProducts = products
    .filter((product) => !items.some((item) => item.product === product.id))
    .slice(0, 5);

  // ============ تابع اسلایدر ============
  const scrollSlider = (dir) => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: dir * 220, behavior: 'smooth' });
    }
  };

  // ============ حالت بارگذاری ============
  if (loading) {
    return (
      <div className="cart-page cart-state" dir="rtl">
        در حال دریافت سبد خرید...
      </div>
    );
  }

  // ============ رندر اصلی ============
  return (
    <div className="cart-page" dir="rtl">
      {/* ── بنر (Hero Section) ─────────────────────────────────────────── */}
      <section className="cart-hero">
        <img className="cart-hero__bg" src="/banner-cart.png" alt="" />
        <div className="cart-hero__content">
          <div className="cart-hero__icon">
            <CartIcon size={40} />
          </div>
          <h1 className="cart-hero__title">سبـد خریـد</h1>
          <p className="cart-hero__subtitle">محصولات منتخب شما در سبد خرید...</p>
        </div>
      </section>

      <div className="cart-container">
        {/* ── پیام‌های خطا و موفقیت ─────────────────────────────────────── */}
        {error && (
          <div className="cart-feedback cart-feedback--error">
            {error}
          </div>
        )}
        {notice && (
          <div className="cart-feedback cart-feedback--success">
            {notice}
          </div>
        )}

        <div className="cart-layout">
          {/* ── ستون اصلی: آیتم‌های سبد ─────────────────────────────────── */}
          <section className="cart-main">
            <div className="cart-main__head">
              <h2 className="cart-main__title">
                سبد خرید ({toFa(totals.count)} کالا)
              </h2>
              <span className="cart-main__title-icon">
                <CartIcon size={26} />
              </span>
            </div>

            <div className="cart-items">
              {/* اگر سبد خالی باشد */}
              {!items.length && (
                <p className="cart-empty">سبد خرید شما خالی است.</p>
              )}

              {/* محصولات ============================================ */}
              {items.map((item) => (
                <article className="cart-item" key={item.id}>
                  {/* تصویر محصول */}
                  <div className="cart-item__media">
                    <img
                      src={getAssetUrl(item.main_image)}
                      alt={item.name}
                    />
                  </div>

                  {/* اطلاعات محصول */}
                  <div className="cart-item__body">
                    <h3 className="cart-item__name">{item.name}</h3>

                    {/* دسته‌بندی و برند */}
                    <div className="cart-item__meta">
                      <span>دسته‌بندی : {item.category || 'محصول'}</span>
                      <span className="cart-item__meta-divider">|</span>
                      <span>برند : {item.brand || 'بدون برند'}</span>
                    </div>

                    {/* قیمت */}
                    <div className="cart-item__price">
                      {formatPrice(item.unit_price)}{' '}
                      <span>تومان</span>
                    </div>

                    {/* تغییر تعداد */}
                    <div className="cart-item__qty">
                      <button
                        type="button"
                        className="cart-item__qty-btn"
                        onClick={() => changeQuantity(item.id, -1)}
                        aria-label="کاهش تعداد"
                      >
                        −
                      </button>
                      <span className="cart-item__qty-value">
                        {toFa(item.quantity)}
                      </span>
                      <button
                        type="button"
                        className="cart-item__qty-btn"
                        onClick={() => changeQuantity(item.id, 1)}
                        aria-label="افزایش تعداد"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* دکمه‌های عملیات */}
                  <div className="cart-item__actions">
                    <button
                      type="button"
                      className="cart-item__action"
                      aria-label="افزودن به علاقه‌مندی‌ها"
                      disabled
                      title="به‌زودی"
                    >
                      <HeartIcon />
                    </button>
                    <button
                      type="button"
                      className="cart-item__action"
                      onClick={() => removeItem(item.id)}
                      aria-label="حذف از سبد"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {/* ── نوار عملیات سبد ─────────────────────────────────────────── */}
            <div className="cart-toolbar">
              {/* نوار کد تخفیف */}
              <div className="cart-coupon">
                <span className="cart-coupon__label">
                  کد تخفیف دارید؟
                  <TagIcon size={18} />
                </span>
                <input
                  type="text"
                  className="cart-coupon__input"
                  value={couponCode}
                  onChange={(event) => setCouponCode(event.target.value)}
                  placeholder="ــــــــــــــ"
                />
                <button type="button" className="cart-coupon__btn">
                  اعمال کد
                </button>
              </div>

              {/* دکمه حذف همه */}
              <button type="button" className="cart-clear" onClick={clearAll}>
                حذف همه موارد
                <TrashIcon size={16} />
              </button>
            </div>
          </section>

          {/* ── ستون کناری: خلاصه سفارش ────────────────────────────────────── */}
          <aside className="cart-side">
            {/* ── خلاصه سفارش ────────────────────────────────────────────── */}
            <div className="cart-summary">
              <div className="cart-summary__head">
                <h2 className="cart-summary__title">خلاصه سفارش</h2>
                <ReceiptIcon />
              </div>

              {/* ردیف‌های خلاصه */}
              <ul className="cart-summary__rows">
                <li className="cart-summary__row">
                  <span>تعداد کالاها</span>
                  <span>{toFa(totals.count)}</span>
                </li>
                <li className="cart-summary__row">
                  <span>جمع کل محصولات</span>
                  <span>{formatPrice(totals.subtotal)} تومان</span>
                </li>
                <li className="cart-summary__row">
                  <span>هزینه ارسال</span>
                  <span
                    className={
                      cart?.shipping_cost == null
                        ? ''
                        : 'cart-summary__free'
                    }
                  >
                    {cart?.shipping_cost == null
                      ? 'انتخاب شهر'
                      : `${formatPrice(totals.shipping)} تومان`}
                  </span>
                </li>
                <li className="cart-summary__row">
                  <span>تخفیف</span>
                  <span>{toFa(0)} تومان</span>
                </li>
              </ul>

              {/* مبلغ قابل پرداخت */}
              <div className="cart-summary__payable">
                <span>مبلغ قابل پرداخت</span>
                <strong>
                  {cart?.total == null
                    ? 'پس از انتخاب شهر'
                    : `${formatPrice(totals.payable)} تومان`}
                </strong>
              </div>

              {/* فرم ارسال ─────────────────────────────────────────────── */}
              <div className="cart-shipping-form">
                {/* انتخاب شهر */}
                <label htmlFor="shipping-city">شهر ارسال</label>
                <select
                  id="shipping-city"
                  value={cart?.city || ''}
                  onChange={changeCity}
                >
                  <option value="">انتخاب شهر</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.city}>
                      {city.city} - {formatPrice(city.cost)} تومان
                    </option>
                  ))}
                </select>

                {/* آدرس تحویل */}
                <label htmlFor="shipping-address">آدرس</label>
                <textarea
                  id="shipping-address"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  placeholder="آدرس کامل تحویل"
                  rows="3"
                />

                {/* کد پستی */}
                <label htmlFor="shipping-postal-code">کد پستی</label>
                <input
                  id="shipping-postal-code"
                  value={postalCode}
                  onChange={(event) =>
                    setPostalCode(
                      event.target.value.replace(/\D/g, '').slice(0, 10)
                    )
                  }
                  inputMode="numeric"
                  placeholder="کد پستی ده رقمی"
                />
              </div>

              {/* دکمه پرداخت */}
              <button
                type="button"
                className="cart-summary__checkout"
                onClick={checkout}
                disabled={busy || !items.length}
              >
                <LockIcon />
                {busy ? 'در حال آماده‌سازی سفارش...' : 'ادامه فرآیند پرداخت'}
              </button>

              {/* علامت امنیت */}
              <p className="cart-summary__secure">
                <CheckCircleIcon />
                پرداخت امن و مطمئن
              </p>
            </div>

            {/* ── مزایای فروشگاه ────────────────────────────────────────── */}
            <div className="cart-benefits">
              {/* تضمین اصالت */}
              <div className="cart-benefit">
                <span className="cart-benefit__icon">
                  <ShieldCheckIcon />
                </span>
                <div className="cart-benefit__text">
                  <h3>تضمین اصالت کالا</h3>
                  <p>همه محصولات اصل و اورجینال هستند.</p>
                </div>
              </div>

              {/* ارسال سریع */}
              <div className="cart-benefit">
                <span className="cart-benefit__icon">
                  <TruckIcon />
                </span>
                <div className="cart-benefit__text">
                  <h3>ارسال سریع</h3>
                  <p>در کمترین زمان ممکن به دستتان می‌رسد.</p>
                </div>
              </div>

              {/* پشتیبانی ۲۴ ساعته */}
              <div className="cart-benefit">
                <span className="cart-benefit__icon">
                  <HeadsetIcon />
                </span>
                <div className="cart-benefit__text">
                  <h3>پشتیبانی ۲۴ ساعته</h3>
                  <p>پاسخگوی سوالات و مشکلات شما هستیم.</p>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* ── بخش پیشنهادات ────────────────────────────────────────────── */}
        <section className="cart-suggest">
          <div className="cart-suggest__head">
            <h2 className="cart-suggest__title">
              شاید این محصولات را هم دوست داشته باشید
            </h2>
            <span className="cart-suggest__title-icon">
              <LeafIcon />
            </span>
          </div>

          <div className="cart-suggest__slider">
            {/* دکمه قبلی */}
            <button
              type="button"
              className="cart-suggest__nav"
              onClick={() => scrollSlider(1)}
              aria-label="قبلی"
            >
              <ChevronIcon direction="right" />
            </button>

            {/* اسلایدر محصولات */}
            <div className="cart-suggest__track" ref={sliderRef}>
              {suggestedProducts.map((product) => (
                <article className="suggest-card" key={product.id}>
                  {/* تصویر */}
                  <div className="suggest-card__media">
                    <img
                      src={getAssetUrl(product.main_image)}
                      alt={product.name}
                    />
                  </div>

                  {/* نام و مدل */}
                  <h3 className="suggest-card__name">{product.name}</h3>
                  <p className="suggest-card__model">{product.category}</p>
                  <p className="suggest-card__brand">
                    {product.brand || 'بدون برند'}
                  </p>

                  {/* امتیاز */}
                  <div className="suggest-card__stars">
                    <StarIcon />
                    <StarIcon />
                    <StarIcon />
                    <StarIcon />
                    <StarIcon half />
                  </div>

                  {/* قیمت و افزودن */}
                  <div className="suggest-card__foot">
                    <span className="suggest-card__price">
                      {formatPrice(product.final_price)}{' '}
                      <span>تومان</span>
                    </span>
                    <button
                      type="button"
                      className="suggest-card__cart"
                      onClick={() => addSuggestedProduct(product)}
                      aria-label="افزودن به سبد"
                    >
                      <BasketIcon />
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {/* دکمه بعدی */}
            <button
              type="button"
              className="cart-suggest__nav"
              onClick={() => scrollSlider(-1)}
              aria-label="بعدی"
            >
              <ChevronIcon direction="left" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
