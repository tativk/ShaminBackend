// Cart.jsx — صفحه سبد خرید؛ اجزا در components/Cart/ تفکیک شده‌اند
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { apiRequest, getAssetUrl } from '../../api';
import { notifyCartCount } from '../../cart-notice';
import { toFa, formatPrice } from '../../components/Cart/helpers';
import {
  CartIcon,
  HeartIcon,
  TrashIcon,
  TagIcon,
  ShieldCheckIcon,
  TruckIcon,
  HeadsetIcon,
} from '../../components/Cart/icons';
import CartSummary from '../../components/Cart/CartSummary';
import SuggestedProducts from '../../components/Cart/SuggestedProducts';
import usePageTitle from '../../usePageTitle';
import './Cart.css';
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";

/* ── کامپوننت اصلی ───────────────────────────────────────── */
export default function Cart() {
  usePageTitle("سبد خرید", "سبد خرید گالری شمین — بررسی محصولات، هزینه ارسال و ثبت سفارش.");
  const [cart, setCart] = useState(null);
  const [provinces, setProvinces] = useState([]);
  const [shipProvince, setShipProvince] = useState('');
  const [shipCity, setShipCity] = useState('');
  const [products, setProducts] = useState([]);
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const lastCommittedShippingRef = useRef('');

  const items = useMemo(() => cart?.items ?? [], [cart?.items]);

  const totals = useMemo(() => {
    // نکته: اعداد قیمت از سرور به‌صورت رشته (Decimal) می‌آیند؛ بدون تبدیل
    // عددی، جمع payable به‌صورت رشته‌ای الحاق می‌شود (۱۰۰٬۰۰۰+۷۰٬۰۰۰ → ۱۰۰۰۰۰۷۰۰۰۰)
    const count = items.reduce((sum, item) => sum + Number(item.quantity), 0);
    const subtotal = items.reduce((sum, item) => sum + Number(item.unit_price) * Number(item.quantity), 0);
    const shipping = Number(cart?.shipping_cost ?? 0);
    return { count, subtotal, shipping, discount: 0, payable: subtotal + shipping };
  }, [items, cart?.shipping_cost]);

  // هر تغییر سبد، شمارنده سبد هدر را همگام می‌کند
  const applyCart = (data) => {
    setCart(data);
    notifyCartCount(data?.total_items ?? 0);
    return data;
  };

  /* ── بارگذاری اولیه ─────────────────────────────────────── */
  useEffect(() => {
    const loadPage = async () => {
      try {
        const [cartData, provinceData_, productData] = await Promise.all([
          apiRequest('/cart/'),
          apiRequest('/shipping/provinces/'),
          apiRequest('/products/?page_size=50'),
        ]);
        setCart(cartData);
        setProvinces(provinceData_ ?? []);
        setProducts(productData.results ?? productData);
        notifyCartCount(cartData?.total_items ?? 0);
        // مقصد ارسال قبلی سبد (نام شهر) به‌عنوان پیش‌فرض فرم تایپ دستی
        if (cartData?.city) {
          setShipCity(cartData.city);
          const match = (provinceData_ ?? []).find((p) => p.cities.some((c) => c.city === cartData.city));
          if (match) setShipProvince(match.province);
        }
        try {
          const addressData = await apiRequest('/auth/address/');
          setAddress([addressData.street, addressData.detail].filter(Boolean).join('، '));
          setPostalCode(addressData.postal_code ?? '');
          if (!cartData?.city) {
            // اگر سبد شهر ثبت‌شده ندارد، آدرس حساب کاربر پیش‌فرض فرم می‌شود
            if (addressData.province) setShipProvince(addressData.province);
            if (addressData.city) setShipCity(addressData.city);
          }
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
      applyCart(await apiRequest('/cart/'));
    } catch (err) {
      setError(err.message);
    }
  };

  const changeQuantity = async (itemId, delta) => {
    setError('');
    const item = items.find((i) => i.id === itemId);
    if (!item) return;
    try {
      applyCart(
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

  /* ثبت استان/شهر تایپ‌شده روی سرور و دریافت هزینه ارسال محاسبه‌شده */
  const commitShipping = async (provinceValue = shipProvince, cityValue = shipCity) => {
    setError('');
    const province = String(provinceValue).trim();
    const city = String(cityValue).trim();
    if (!province && !city) return null;
    lastCommittedShippingRef.current = `${province}|${city}`;
    try {
      const updated = await apiRequest('/cart/', {
        method: 'PATCH',
        body: JSON.stringify({ province, city }),
      });
      return applyCart(updated);
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  /* ثبت خودکار مقصد ارسال — ۸۰۰ms بعد از توقف تایپ هر فیلد، هزینه به‌روز می‌شود
     (علاوه بر Blur و Enter؛ تا تغییر استان/شهر هیچ‌وقت «ثابت» نماند) */
  useEffect(() => {
    if (loading) return undefined;
    const province = shipProvince.trim();
    const city = shipCity.trim();
    if (!province && !city) return undefined;
    const pair = `${province}|${city}`;
    if (pair === lastCommittedShippingRef.current) return undefined;
    const timer = setTimeout(() => { commitShipping(province, city); }, 800);
    return () => clearTimeout(timer);
  }, [shipProvince, shipCity, loading]);

  const checkout = async () => {
    if (!shipProvince.trim() && !shipCity.trim()) return setError('لطفاً استان و شهر مقصد را وارد کنید.');
    if (!address.trim() || !/^\d{10}$/.test(postalCode))
      return setError('آدرس و کد پستی ده رقمی را کامل وارد کنید.');
    setBusy(true);
    setError('');
    try {
      // ثبت مقصد تایپ‌شده و گرفتن هزینه ارسال رسمی از سرور
      const current = await commitShipping(shipProvince, shipCity);
      if (!current?.city || current?.shipping_cost == null) {
        throw new Error('استان یا شهر واردشده در فهرست هزینه ارسال یافت نشد.');
      }
      // فعلاً درگاه پرداخت قطع است — سفارش بدون پرداخت ثبت می‌شود
      const order = await apiRequest('/orders/', {
        method: 'POST',
        body: JSON.stringify({
          province: shipProvince.trim(),
          city: current.city,
          address: address.trim(),
          postal_code: postalCode,
          shipping_cost: current.shipping_cost,
        }),
      });
      if (order.payment_url) {
        // بعد از اتصال درگاه واقعی، کاربر به درگاه هدایت می‌شود
        window.location.assign(order.payment_url);
      } else {
        setNotice(`سفارش شما با شماره ${toFa(order.order_id)} ثبت شد. برای پیگیری به داشبورد کاربری بروید.`);
        applyCart({ ...current, items: [], total_items: 0 });
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
      applyCart(
        await apiRequest('/cart/items/', {
          method: 'POST',
          body: JSON.stringify({ product: product.id, quantity: 1 }),
        }),
      );
    } catch (err) {
      setError(err.message);
    }
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
            <CartSummary
              cart={cart}
              totals={totals}
              provinces={provinces}
              shipProvince={shipProvince}
              shipCity={shipCity}
              address={address}
              postalCode={postalCode}
              busy={busy}
              hasItems={items.length > 0}
              onProvinceChange={setShipProvince}
              onCityChange={setShipCity}
              onShippingCommit={commitShipping}
              onAddressChange={setAddress}
              onPostalCodeChange={setPostalCode}
              onCheckout={checkout}
            />

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
        <SuggestedProducts products={products} items={items} onAdd={addSuggestedProduct} />
      </div>
      <Footer />
    </div>
    </main>
  );
}
