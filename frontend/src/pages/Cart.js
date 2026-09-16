import React, { useMemo, useRef, useState } from 'react';
import './Cart.css';

/* ── ابزارها ─────────────────────────────────────────────── */

const FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

const toFa = (value) => String(value).replace(/\d/g, (d) => FA_DIGITS[Number(d)]);

const formatPrice = (value) =>
  toFa(new Intl.NumberFormat('en-US').format(Math.round(value)).replace(/,/g, ','));

/* ── داده نمونه ──────────────────────────────────────────── */

const SEED_ITEMS = [
  {
    id: 1,
    name: 'عطر زنانه دیور مدل Miss Dior',
    brand: 'Dior',
    volume: '100 میل',
    price: 4790000,
    quantity: 1,
    image: '/عکس عطر1.png',
  },
  {
    id: 2,
    name: 'ادکلن مردانه شنل مدل Bleu de Chanel',
    brand: 'Chanel',
    volume: '100 میل',
    price: 3990000,
    quantity: 1,
    image: '/عکس عطر2.png',
  },
  {
    id: 3,
    name: 'عطر مردانه ایو سن لورن مدل Y',
    brand: 'YSL',
    volume: '100 میل',
    price: 2800000,
    quantity: 1,
    image: '/عکس عطر3.png',
  },
];

const SUGGESTED_PRODUCTS = [
  {
    id: 101,
    name: 'عطر زنانه ورساچه مدل',
    model: 'Bright Crystal',
    brand: 'Versace',
    price: 3490000,
    image: '/عکس عطر1.png',
  },
  {
    id: 102,
    name: 'ادکلن مردانه دیور مدل',
    model: 'Sauvage',
    brand: 'Dior',
    price: 4990000,
    image: '/عکس عطر2.png',
  },
  {
    id: 103,
    name: 'عطر زنانه گوچی مدل',
    model: 'Bloom',
    brand: 'Gucci',
    price: 3990000,
    image: '/عکس عطر3.png',
  },
  {
    id: 104,
    name: 'ادکلن مردانه دولچه گابانا',
    model: 'مدل Light Blue',
    brand: 'Dolce & Gabbana',
    price: 3290000,
    image: '/عکس عطر2.png',
  },
  {
    id: 105,
    name: 'عطر زنانه لانکوم مدل',
    model: 'La Vie Est Belle',
    brand: 'Lancôme',
    price: 4590000,
    image: '/عکس عطر1.png',
  },
];

/* ── آیکون‌ها ─────────────────────────────────────────────── */

function CartIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="21" r="1.4" />
      <circle cx="19" cy="21" r="1.4" />
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

function ShieldCheckIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="8 12 11 15 16 9" />
    </svg>
  );
}

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
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1z" />
      <line x1="8" y1="8" x2="16" y2="8" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}

function LeafIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 20A7 7 0 0 1 4 13c0-4 3-8 8-10 5 2 8 6 8 10a7 7 0 0 1-7 7z" />
      <path d="M12 21V11" />
    </svg>
  );
}

function ChevronIcon({ direction = 'left' }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {direction === 'left'
        ? <polyline points="15 18 9 12 15 6" />
        : <polyline points="9 18 15 12 9 6" />}
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
  const [items, setItems] = useState(SEED_ITEMS);
  const [couponCode, setCouponCode] = useState('');
  const sliderRef = useRef(null);

  const totals = useMemo(() => {
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return { count, subtotal, discount: 0, payable: subtotal };
  }, [items]);

  const changeQuantity = (id, delta) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const removeItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearAll = () => setItems([]);

  const scrollSlider = (dir) => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: dir * 220, behavior: 'smooth' });
    }
  };

  return (
    <div className="cart-page" dir="rtl">
      {/* ── بنر ─────────────────────────────────────────── */}
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
        <div className="cart-layout">
          {/* ── ستون اصلی: آیتم‌های سبد ─────────────────── */}
          <section className="cart-main">
            <div className="cart-main__head">
              <h2 className="cart-main__title">سبد خرید ({toFa(totals.count)} کالا)</h2>
              <span className="cart-main__title-icon">
                <CartIcon size={26} />
              </span>
            </div>

            <div className="cart-items">
              {items.map((item) => (
                <article className="cart-item" key={item.id}>
                  <div className="cart-item__media">
                    <img src={item.image} alt={item.name} />
                  </div>

                  <div className="cart-item__body">
                    <h3 className="cart-item__name">{item.name}</h3>
                    <div className="cart-item__meta">
                      <span>حجم : {toFa(item.volume)}</span>
                      <span className="cart-item__meta-divider">|</span>
                      <span>برند : {item.brand}</span>
                    </div>
                    <div className="cart-item__price">
                      {formatPrice(item.price)} <span>تومان</span>
                    </div>
                    <div className="cart-item__qty">
                      <button
                        type="button"
                        className="cart-item__qty-btn"
                        onClick={() => changeQuantity(item.id, -1)}
                        aria-label="کاهش تعداد"
                      >
                        −
                      </button>
                      <span className="cart-item__qty-value">{toFa(item.quantity)}</span>
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

                  <div className="cart-item__actions">
                    <button type="button" className="cart-item__action" aria-label="افزودن به علاقه‌مندی‌ها">
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

            {/* ── نوار کد تخفیف / حذف همه ─────────────────── */}
            <div className="cart-toolbar">
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
                <button type="button" className="cart-coupon__btn">اعمال کد</button>
              </div>
              <button type="button" className="cart-clear" onClick={clearAll}>
                حذف همه موارد
                <TrashIcon size={16} />
              </button>
            </div>
          </section>

          {/* ── ستون کناری: خلاصه سفارش ─────────────────── */}
          <aside className="cart-side">
            <div className="cart-summary">
              <div className="cart-summary__head">
                <h2 className="cart-summary__title">خلاصه سفارش</h2>
                <ReceiptIcon />
              </div>

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
                  <span className="cart-summary__free">رایگان</span>
                </li>
                <li className="cart-summary__row">
                  <span>تخفیف</span>
                  <span>{toFa(0)} تومان</span>
                </li>
              </ul>

              <div className="cart-summary__payable">
                <span>مبلغ قابل پرداخت</span>
                <strong>{formatPrice(totals.payable)} تومان</strong>
              </div>

              <button type="button" className="cart-summary__checkout">
                <LockIcon />
                ادامه فرآیند پرداخت
              </button>

              <p className="cart-summary__secure">
                <CheckCircleIcon />
                پرداخت امن و مطمئن
              </p>
            </div>

            <div className="cart-benefits">
              <div className="cart-benefit">
                <span className="cart-benefit__icon">
                  <ShieldCheckIcon />
                </span>
                <div className="cart-benefit__text">
                  <h3>تضمین اصالت کالا</h3>
                  <p>همه محصولات اصل و اورجینال هستند.</p>
                </div>
              </div>
              <div className="cart-benefit">
                <span className="cart-benefit__icon">
                  <TruckIcon />
                </span>
                <div className="cart-benefit__text">
                  <h3>ارسال سریع</h3>
                  <p>در کمترین زمان ممکن به دستتان می‌رسد.</p>
                </div>
              </div>
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

        {/* ── پیشنهادها ─────────────────────────────────── */}
        <section className="cart-suggest">
          <div className="cart-suggest__head">
            <h2 className="cart-suggest__title">شاید این محصولات را هم دوست داشته باشید</h2>
            <span className="cart-suggest__title-icon">
              <LeafIcon />
            </span>
          </div>

          <div className="cart-suggest__slider">
            <button
              type="button"
              className="cart-suggest__nav"
              onClick={() => scrollSlider(1)}
              aria-label="قبلی"
            >
              <ChevronIcon direction="right" />
            </button>

            <div className="cart-suggest__track" ref={sliderRef}>
              {SUGGESTED_PRODUCTS.map((product) => (
                <article className="suggest-card" key={product.id}>
                  <div className="suggest-card__media">
                    <img src={product.image} alt={`${product.name} ${product.model}`} />
                  </div>
                  <h3 className="suggest-card__name">{product.name}</h3>
                  <p className="suggest-card__model">{product.model}</p>
                  <p className="suggest-card__brand">{product.brand}</p>
                  <div className="suggest-card__stars">
                    <StarIcon />
                    <StarIcon />
                    <StarIcon />
                    <StarIcon />
                    <StarIcon half />
                  </div>
                  <div className="suggest-card__foot">
                    <span className="suggest-card__price">
                      {formatPrice(product.price)} <span>تومان</span>
                    </span>
                    <button type="button" className="suggest-card__cart" aria-label="افزودن به سبد">
                      <BasketIcon />
                    </button>
                  </div>
                </article>
              ))}
            </div>

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
