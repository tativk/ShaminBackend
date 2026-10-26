import React, { useMemo } from 'react';
import { LockIcon, CheckCircleIcon, ReceiptIcon } from './icons';
import { toFa, formatPrice } from './helpers';

/* نرمال‌سازی متن فارسی برای فیلتر پیشنهادها — هماهنگ با منطق سرور */
const normalizeFa = (value) =>
  String(value || '')
    .replace(/[\u200c]/g, ' ')
    .replace(/[يﻯﻰى]/g, 'ی')
    .replace(/[كﻙ]/g, 'ک')
    .replace(/[أإٱ]/g, 'ا')
    .replace(/\s+/g, ' ')
    .trim();

/* ستون کناری سبد: خلاصه سفارش، فرم ارسال (تایپ دستی استان/شهر) و دکمه ثبت نهایی */
const CartSummary = ({
  cart,
  totals,
  provinces,
  shipProvince,
  shipCity,
  address,
  postalCode,
  busy,
  hasItems,
  onProvinceChange,
  onCityChange,
  onShippingCommit,
  onAddressChange,
  onPostalCodeChange,
  onCheckout,
}) => {
  const citySuggestions = useMemo(() => {
    const matched = (provinces ?? []).find(
      (p) => normalizeFa(p.province) === normalizeFa(shipProvince),
    );
    const source = matched ? matched.cities : (provinces ?? []).flatMap((p) => p.cities);
    return source ?? [];
  }, [provinces, shipProvince]);

  const commitCity = () => {
    onShippingCommit?.();
  };

  return (
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
          {cart?.shipping_cost == null ? (
            <span>با ثبت استان و شهر</span>
          ) : Number(cart.shipping_cost) === 0 ? (
            <span className="cart-summary__free">ارسال رایگان</span>
          ) : (
            <span className="cart-summary__free">{formatPrice(totals.shipping)} تومان</span>
          )}
        </li>
        <li className="cart-summary__row"><span>تخفیف</span><span>{toFa(0)} تومان</span></li>
      </ul>
      <div className="cart-summary__payable">
        <span>مبلغ قابل پرداخت</span>
        <strong>
          {cart?.city == null ? 'پس از ثبت استان و شهر' : `${formatPrice(totals.payable)} تومان`}
        </strong>
      </div>

      {/* فرم ارسال — استان و شهر به‌صورت دستی تایپ می‌شوند و هزینه ارسال
          مطابق نرخ‌های اداره پست همان مقصد از سرور محاسبه می‌شود */}
      <div className="cart-shipping-form">
        <datalist id="shipping-province-options">
          {(provinces ?? []).map((p) => (
            <option key={p.province} value={p.province} />
          ))}
        </datalist>
        <datalist id="shipping-city-options">
          {citySuggestions.map((c) => (
            <option key={c.id} value={c.city} />
          ))}
        </datalist>

        <div className="cart-shipping-form__field">
          <label htmlFor="shipping-province">استان</label>
          <input
            id="shipping-province"
            type="text"
            list="shipping-province-options"
            value={shipProvince}
            onChange={(e) => onProvinceChange(e.target.value)}
            placeholder="مثال: تهران"
            autoComplete="off"
          />
        </div>

        <div className="cart-shipping-form__field">
          <label htmlFor="shipping-city">شهر</label>
          <input
            id="shipping-city"
            type="text"
            list="shipping-city-options"
            value={shipCity}
            onChange={(e) => onCityChange(e.target.value)}
            onBlur={commitCity}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); commitCity(); } }}
            placeholder="نام شهر محل سکونت را تایپ کنید"
            autoComplete="off"
          />
          <small className="cart-shipping-form__hint">
            استان و شهر را تایپ کنید تا هزینه ارسال محاسبه شود.
          </small>
        </div>

        <div className="cart-shipping-form__field cart-shipping-form__field--address">
          <label htmlFor="shipping-address">آدرس</label>
          <textarea
            id="shipping-address"
            value={address}
            onChange={(e) => onAddressChange(e.target.value)}
            placeholder="آدرس کامل تحویل"
            rows="3"
          />
        </div>

        <div className="cart-shipping-form__field">
          <label htmlFor="shipping-postal-code">کد پستی</label>
          <input
            id="shipping-postal-code"
            value={postalCode}
            onChange={(e) => onPostalCodeChange(e.target.value.replace(/\D/g, '').slice(0, 10))}
            inputMode="numeric"
            placeholder="کد پستی ده رقمی"
          />
        </div>
      </div>

      <button
        type="button"
        className="cart-summary__checkout"
        onClick={onCheckout}
        disabled={busy || !hasItems}
      >
        <LockIcon />
        {busy ? 'در حال ثبت...' : 'ثبت سفارش نهایی'}
      </button>
      <p className="cart-summary__secure"><CheckCircleIcon /> ثبت سفارش بدون پرداخت آنلاین</p>
    </div>
  );
};

export default CartSummary;
