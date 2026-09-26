// Cart.jsx — نسخه یکپارچه (بر اساس شاخه main) — اصلاح‌شده
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { apiRequest, getAssetUrl } from '../api';
import { notifyCartAdded } from '../cart-notice';
import './Cart.css';
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";

/* ── ابزارها ─────────────────────────────────────────────── */
const FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
const toFa = (value) => String(value).replace(/\d/g, (d) => FA_DIGITS[Number(d)]);
const formatPrice = (value) =>
  toFa(new Intl.NumberFormat('en-US').format(Math.round(value)).replace(/,/g, '٬'));

/* ── آیکون‌ها ─────────────────────────────────────────────── */
function CartIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="21" r="1.4" /><circle cx="19" cy="21" r="1.4" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  );
}
function HeartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
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
function TagIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  );
}
function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
function CheckCircleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" /><polyline points="8 12 11 15 16 9" />
    </svg>
  );
}
function ShieldCheckIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}
function TruckIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="1" y="3" width="15" height="13" rx="1" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}
function HeadsetIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
    </svg>
  );
}
function ReceiptIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
      <path d="M14 8H8" />
      <path d="M16 12H8" />
      <path d="M13 16H8" />
    </svg>
  );
}
function LeafIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  );
}
function ChevronIcon({ direction = 'left' }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {direction === 'left' ? <polyline points="15 18 9 12 15 6" /> : <polyline points="9 18 15 12 9 6" />}
    </svg>
  );
}
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
        <path fill="url(#half-star)" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    );
  }
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? '#f5a623' : '#dcdcdc'} aria-hidden="true">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}
function BasketIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 9h18l-1.5 10.5a2 2 0 0 1-2 1.5h-11a2 2 0 0 1-2-1.5L3 9Z" />
      <path d="M8 9V6a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

/* ── کامپوننت اصلی ───────────────────────────────────────── */
export default function Cart() {
  const [cart, setCart] = useState(null);
  const [cities, setCities] = useState([]);
  const [products, setProducts] = useState([]);
  const [province, setProvince] = useState('');
  const [manualCity, setManualCity] = useState('');
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const sliderRef = useRef(null);

  const items = useMemo(() => cart?.items ?? [], [cart?.items]);

  const totals = useMemo(() => {
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
    const shipping = cart?.shipping_cost ?? 0;
    return { count, subtotal, shipping, discount: 0, payable: subtotal + shipping };
  }, [items, cart?.shipping_cost]);

  /* ── بارگذاری اولیه ─────────────────────────────────────── */
  useEffect(() => {
    const loadPage = async () => {
      try {
        const [cartData, cityData, productData] = await Promise.all([
          apiRequest('/cart/'),
          apiRequest('/shipping/cities/'),
          apiRequest('/products/'),
        ]);
        setCart(cartData);
        setCities(cityData.results ?? cityData);
        setProducts(productData.results ?? productData);
        try {
          const addressData = await apiRequest('/auth/address/');
          setProvince(addressData.province ?? '');
          setManualCity(addressData.city ?? '');
          setAddress([addressData.street, addressData.detail].filter(Boolean).join('، '));
          setPostalCode(addressData.postal_code ?? '');
        } catch {
          // کاربر هنوز آدرس ثبت نکرده — فرم خالی می‌ماند
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadPage();
  }, []);

  const refreshCart = async () => {
    try {
      setCart(await apiRequest('/cart/'));
    } catch (err) {
      setError(err.message);
    }
  };

  const changeQuantity = async (itemId, delta) => {
    setError('');
    const item = items.find((i) => i.id === itemId);
    if (!item) return;
    try {
      setCart(
        await apiRequest(`/cart/items/${itemId}/`, {
          method: 'PATCH',
          body: JSON.stringify({ quantity: Math.max(1, item.quantity + delta) }),
        }),
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const removeItem = async (itemId) => {
    setError('');
    try {
      await apiRequest(`/cart/items/${itemId}/`, { method: 'DELETE' });
      await refreshCart();
    } catch (err) {
      setError(err.message);
    }
  };

  const clearAll = async () => {
    setError('');
    try {
      await Promise.all(items.map((item) => apiRequest(`/cart/items/${item.id}/`, { method: 'DELETE' })));
      await refreshCart();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCityInput = (value) => {
    const normalized = value.trim();
    setManualCity(normalized);
    setError('');

    if (!normalized) {
      setCart((prev) => (prev ? { ...prev, city: null, shipping_cost: null } : prev));
      return;
    }

    const matchedCity = cities.find((item) => item.city.toLowerCase() === normalized.toLowerCase());
    if (!matchedCity) {
      setCart((prev) => (prev ? { ...prev, city: null, shipping_cost: null } : prev));
      return;
    }

    setCart((prev) => (prev ? { ...prev, city: matchedCity.city, shipping_cost: matchedCity.cost } : prev));

    // ثبت شهر روی سرور — بدون این، ثبت سفارش با خطای «شهر انتخاب نشده» رد می‌شود
    if (cart?.city !== matchedCity.city) {
      apiRequest('/cart/', {
        method: 'PATCH',
        body: JSON.stringify({ city: matchedCity.city }),
      })
        .then((data) => setCart(data))
        .catch((err) => setError(err.message));
    }
  };

  const checkout = async () => {
    if (!cart?.city && !manualCity.trim()) return setError('لطفاً استان و شهر ارسال را وارد کنید.');
    if (!province.trim() || !manualCity.trim()) return setError('لطفاً استان و شهر خود را وارد کنید.');
    if (!address.trim() || !/^\d{10}$/.test(postalCode))
      return setError('آدرس و کد پستی ده رقمی را وارد کنید.');
    setBusy(true);
    setError('');
    try {
      // قبل از ثبت سفارش، انتخاب شهر دوباره روی سرور هماهنگ می‌شود
      const matched = cities.find((c) => c.city.toLowerCase() === manualCity.trim().toLowerCase());
      let current = cart;
      if (matched) {
        current = await apiRequest('/cart/', {
          method: 'PATCH',
          body: JSON.stringify({ city: matched.city }),
        });
        setCart(current);
      }
      const order = await apiRequest('/orders/', {
        method: 'POST',
        body: JSON.stringify({
          city: current?.city || manualCity.trim(),
          province: province.trim(),
          address: address.trim(),
          postal_code: postalCode,
          shipping_cost: current?.shipping_cost ?? 0,
        }),
      });
      if (order.payment_url) {
        window.location.assign(order.payment_url);
      } else {
        setNotice(`سفارش شماره ${toFa(order.order_id)} ایجاد شد.`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const addSuggestedProduct = async (product) => {
    setError('');
    try {
      const data = await apiRequest('/cart/items/', {
        method: 'POST',
        body: JSON.stringify({ product: product.id, quantity: 1 }),
      });
      setCart(data);
      notifyCartAdded({ added: 1, totalItems: data?.total_items, productName: product.name });
    } catch (err) {
      setError(err.message);
    }
  };

  const suggestedProducts = products
    .filter((p) => !items.some((item) => item.product === p.id))
    .slice(0, 5);

  const scrollSlider = (dir) => {
    sliderRef.current?.scrollBy({ left: dir * 220, behavior: 'smooth' });
  };

  /* ── حالت بارگذاری ─────────────────────────────────────── */
  if (loading) {
    return (
      <div className="cart-page cart-state" dir="rtl">
        در حال دریافت سبد خرید...
      </div>
    );
  }

  /* ── رندر اصلی ─────────────────────────────────────────── */
  return (
    <main>
      <div dir="rtl">
        <Header />
      </div>
      <div className="cart-page" dir="rtl">
      {/* بنر */}
      <section className="cart-hero">
        <img className="cart-hero__bg" src="/banner-cart.png" alt="" />
        <div className="cart-hero__content">
          <div className="cart-hero__icon"><CartIcon size={30} /></div>
          <h1 className="cart-hero__title">سبد خرید</h1>
          <p className="cart-hero__subtitle">محصولات منتخب شما در سبد خرید...</p>
        </div>
      </section>

      <div className="cart-container">
        {/* پیام‌ها */}
        {error && <div className="cart-feedback cart-feedback--error">{error}</div>}
        {notice && <div className="cart-feedback cart-feedback--success">{notice}</div>}

        <div className="cart-layout">
          {/* ستون اصلی */}
          <section className="cart-main">
            <div className="cart-main__head">
              <h2 className="cart-main__title">سبد خرید ({toFa(totals.count)} کالا)</h2>
              <span className="cart-main__title-icon"><CartIcon size={26} /></span>
            </div>

            <div className="cart-items">
              {!items.length && <p className="cart-empty">سبد خرید شما خالی است.</p>}

              {items.map((item) => (
                <article className="cart-item" key={item.id}>
                  <div className="cart-item__media">
                    <img src={getAssetUrl(item.main_image || item.image || null)} alt={item.name} />
                  </div>
                  <div className="cart-item__body">
                    <h3 className="cart-item__name">{item.name}</h3>
                    <div className="cart-item__meta">
                      <span>تعداد : {toFa(item.quantity)}</span>
                      <span className="cart-item__meta-divider">|</span>
                      <span>محصول : {item.product ?? '—'}</span>
                    </div>
                    <div className="cart-item__price">
                      {formatPrice(item.unit_price)} <span>تومان</span>
                    </div>
                    <div className="cart-item__qty">
                      <button type="button" className="cart-item__qty-btn" onClick={() => changeQuantity(item.id, -1)} aria-label="کاهش تعداد">−</button>
                      <span className="cart-item__qty-value">{toFa(item.quantity)}</span>
                      <button type="button" className="cart-item__qty-btn" onClick={() => changeQuantity(item.id, 1)} aria-label="افزایش تعداد">+</button>
                    </div>
                  </div>
                  <div className="cart-item__actions">
                    <button type="button" className="cart-item__action" aria-label="افزودن به علاقه‌مندی‌ها" disabled title="به‌زودی">
                      <HeartIcon />
                    </button>
                    <button type="button" className="cart-item__action" onClick={() => removeItem(item.id)} aria-label="حذف از سبد">
                      <TrashIcon />
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {/* نوار ابزار */}
            <div className="cart-toolbar">
              <div className="cart-coupon">
                <span className="cart-coupon__label">کد تخفیف دارید؟ <TagIcon size={18} /></span>
                <input
                  type="text"
                  className="cart-coupon__input"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="ــــــــــــــ"
                />
                <button type="button" className="cart-coupon__btn">اعمال کد</button>
              </div>
              <button type="button" className="cart-clear" onClick={clearAll}>
                حذف همه موارد <TrashIcon size={16} />
              </button>
            </div>
          </section>

          {/* ستون کناری */}
          <aside className="cart-side">
            <div className="cart-summary">
              <div className="cart-summary__head">
                <h2 className="cart-summary__title">خلاصه سفارش</h2>
                <ReceiptIcon />
              </div>
              <ul className="cart-summary__rows">
                <li className="cart-summary__row"><span>تعداد کالاها</span><span>{toFa(totals.count)}</span></li>
                <li className="cart-summary__row"><span>جمع کل محصولات</span><span>{formatPrice(totals.subtotal)} تومان</span></li>
                <li className="cart-summary__row">
                  <span>هزینه ارسال</span>
                  <span className={cart?.shipping_cost == null ? '' : 'cart-summary__free'}>
                    {cart?.shipping_cost == null ? 'انتخاب شهر' : `${formatPrice(totals.shipping)} تومان`}
                  </span>
                </li>
                <li className="cart-summary__row"><span>تخفیف</span><span>{toFa(0)} تومان</span></li>
              </ul>
              <div className="cart-summary__payable">
                <span>مبلغ قابل پرداخت</span>
                <strong>
                  {cart?.city == null ? 'پس از انتخاب شهر' : `${formatPrice(totals.payable)} تومان`}
                </strong>
              </div>

              {/* فرم ارسال */}
              <div className="cart-shipping-form">
                <div className="cart-shipping-form__field">
                  <label htmlFor="shipping-province">استان</label>
                  <input
                    id="shipping-province"
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    placeholder="مثلاً تهران"
                  />
                </div>

                <div className="cart-shipping-form__field">
                  <label htmlFor="shipping-city">شهر</label>
                  <input
                    id="shipping-city"
                    value={manualCity}
                    onChange={(e) => handleCityInput(e.target.value)}
                    placeholder="مثلاً تهران یا شیراز"
                  />
                </div>

                <div className="cart-shipping-form__field cart-shipping-form__field--address">
                  <label htmlFor="shipping-address">آدرس</label>
                  <textarea
                    id="shipping-address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="آدرس کامل تحویل"
                    rows="3"
                  />
                </div>

                <div className="cart-shipping-form__field">
                  <label htmlFor="shipping-postal-code">کد پستی</label>
                  <input
                    id="shipping-postal-code"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    inputMode="numeric"
                    placeholder="کد پستی ده رقمی"
                  />
                </div>
              </div>

              <button
                type="button"
                className="cart-summary__checkout"
                onClick={checkout}
                disabled={busy || !items.length}
              >
                <LockIcon />
                ادامه فرآیند پرداخت
              </button>
              <p className="cart-summary__secure"><CheckCircleIcon /> پرداخت امن و مطمئن</p>
            </div>

            {/* مزایا */}
            <div className="cart-benefits">
              <div className="cart-benefit">
                <span className="cart-benefit__icon"><ShieldCheckIcon /></span>
                <div className="cart-benefit__text"><h3>تضمین اصالت کالا</h3><p>همه محصولات اصل و اورجینال هستند.</p></div>
              </div>
              <div className="cart-benefit">
                <span className="cart-benefit__icon"><TruckIcon /></span>
                <div className="cart-benefit__text"><h3>ارسال سریع</h3><p>در کمترین زمان ممکن به دستتان می‌رسد.</p></div>
              </div>
              <div className="cart-benefit">
                <span className="cart-benefit__icon"><HeadsetIcon /></span>
                <div className="cart-benefit__text"><h3>پشتیبانی ۲۴ ساعته</h3><p>پاسخگوی سوالات و مشکلات شما هستیم.</p></div>
              </div>
            </div>
          </aside>
        </div>

        {/* پیشنهادات */}
        <section className="cart-suggest">
          <div className="cart-suggest__head">
            <h2 className="cart-suggest__title">شاید این محصولات را هم دوست داشته باشید</h2>
            <span className="cart-suggest__title-icon"><LeafIcon /></span>
          </div>
          <div className="cart-suggest__slider">
            <button type="button" className="cart-suggest__nav" onClick={() => scrollSlider(1)} aria-label="قبلی">
              <ChevronIcon direction="right" />
            </button>
            <div className="cart-suggest__track" ref={sliderRef}>
              {suggestedProducts.map((product) => (
                <article className="suggest-card" key={product.id}>
                  <div className="suggest-card__media">
                    <img src={getAssetUrl(product.main_image)} alt={product.name} />
                  </div>
                  <h3 className="suggest-card__name">{product.name}</h3>
                  <p className="suggest-card__model">{product.category}</p>
                  <p className="suggest-card__brand">{product.brand ?? 'بدون برند'}</p>
                  <div className="suggest-card__stars">
                    <StarIcon /><StarIcon /><StarIcon /><StarIcon /><StarIcon half />
                  </div>
                  <div className="suggest-card__foot">
                    <span className="suggest-card__price">
                      {formatPrice(product.final_price)} <span>تومان</span>
                    </span>
                    <button type="button" className="suggest-card__cart" onClick={() => addSuggestedProduct(product)} aria-label="افزودن به سبد">
                      <BasketIcon />
                    </button>
                  </div>
                </article>
              ))}
            </div>
            <button type="button" className="cart-suggest__nav" onClick={() => scrollSlider(-1)} aria-label="بعدی">
              <ChevronIcon direction="left" />
            </button>
          </div>
        </section>
      </div>
    </div>
    <div dir="rtl">
      <Footer />
    </div>
    </main>
  );
}
