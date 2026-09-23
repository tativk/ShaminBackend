import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiCheck, FiCopy, FiClock, FiAlertCircle, FiX, FiShoppingBag } from 'react-icons/fi';
import './PaymentCallback.css';

const STATES = {
  success: {
    label: 'پرداخت موفق',
    title: 'خریدتان مبارک!',
    description: 'پرداخت شما تأیید شد و سفارشتان با موفقیت ثبت شد. از همراهی شما با شامین سپاسگزاریم.',
    icon: FiCheck,
    note: 'برای مشاهده سفارش‌ها، به حساب کاربری خود بروید.',
  },
  failed: {
    label: 'پرداخت ناموفق',
    title: 'پرداخت تأیید نشد',
    description: 'این پرداخت با موفقیت انجام نشد. وضعیت سفارش را در حساب کاربری خود بررسی کنید.',
    icon: FiAlertCircle,
    note: 'اگر مبلغی از حسابتان کسر شده، پیش از پرداخت دوباره وضعیت تراکنش را بررسی کنید.',
  },
  cancelled: {
    label: 'پرداخت لغو شد',
    title: 'از پرداخت منصرف شدید',
    description: 'فرآیند پرداخت تکمیل نشد. می‌توانید به فروشگاه برگردید یا سفارش‌های خود را در حساب کاربری ببینید.',
    icon: FiX,
    note: 'این صفحه تأییدیه پرداخت نیست.',
  },
  pending: {
    label: 'در حال بررسی',
    title: 'در انتظار نتیجه پرداخت',
    description: 'نتیجه نهایی پرداخت هنوز مشخص نشده است. پس از دریافت تأیید، وضعیت تراکنش به‌روزرسانی می‌شود.',
    icon: FiClock,
    note: 'تا مشخص شدن نتیجه، پرداخت دیگری انجام ندهید.',
  },
  unknown: {
    label: 'وضعیت نامشخص',
    title: 'نتیجه پرداخت در دسترس نیست',
    description: 'اطلاعات کافی برای نمایش نتیجه این تراکنش وجود ندارد. وضعیت سفارش را در حساب کاربری بررسی کنید.',
    icon: FiAlertCircle,
    note: 'نمایش این صفحه به معنی تأیید پرداخت نیست.',
  },
};

// Presentational page only. Pass verified data through props when integrating later.
// URL parameters intentionally do not determine payment success.
export default function PaymentCallback({ status = 'success', orderId = null, referenceId = null }) {
  const stateKey = Object.prototype.hasOwnProperty.call(STATES, status) ? status : 'unknown';
  const state = STATES[stateKey];
  const StatusIcon = state.icon;
  const [copyMessage, setCopyMessage] = useState('');

  const copyReference = async () => {
    try {
      await navigator.clipboard.writeText(String(referenceId));
      setCopyMessage('کد پیگیری کپی شد.');
    } catch {
      setCopyMessage('کپی خودکار انجام نشد؛ کد پیگیری را انتخاب و کپی کنید.');
    }
  };

  return (
    <main className={`payment-callback payment-callback--${stateKey}`} dir="rtl">
      <section className="payment-callback__hero" aria-label="شامین گالری">
        <img className="payment-callback__hero-image" src="/banner-cart.png" alt="" />
        <div className="payment-callback__hero-inner">
          <div className="payment-callback__hero-copy">
            <span className="payment-callback__eyebrow">SHAMIN GALLERY</span>
            <p className="payment-callback__hero-title">انتخابی از جنس شما</p>
            <p className="payment-callback__hero-description">عطر، زیبایی و جزئیاتی که ماندگار می‌شوند.</p>
          </div>
        </div>
      </section>

      <div className="payment-callback__container">
        <section className="payment-callback__card" aria-labelledby="payment-result-title">
          <div className="payment-callback__result" role="status" aria-live="polite" aria-atomic="true">
            <div className="payment-callback__status-icon" aria-hidden="true"><StatusIcon /></div>
            <span className="payment-callback__badge">{state.label}</span>
            <h1 id="payment-result-title">{state.title}</h1>
            <p className="payment-callback__description">{state.description}</p>
          </div>

          <div className="payment-callback__receipt">
            <div className="payment-callback__receipt-heading">
              <FiShoppingBag aria-hidden="true" />
              <h2>جزئیات تراکنش</h2>
            </div>
            <dl className="payment-callback__details">
              <div className="payment-callback__detail">
                <dt>شماره سفارش</dt>
                <dd><bdi>{orderId == null ? '—' : String(orderId)}</bdi></dd>
              </div>
              <div className="payment-callback__detail">
                <dt>وضعیت پرداخت</dt>
                <dd className="payment-callback__detail-status">{state.label}</dd>
              </div>
              {stateKey === 'success' && (
                <div className="payment-callback__detail payment-callback__detail--reference">
                  <dt>کد پیگیری پرداخت</dt>
                  <dd>
                    <bdi className="payment-callback__reference">{referenceId == null ? '—' : String(referenceId)}</bdi>
                    {referenceId && (
                      <button className="payment-callback__copy" type="button" onClick={copyReference} aria-label="کپی کد پیگیری">
                        <FiCopy aria-hidden="true" />
                      </button>
                    )}
                  </dd>
                </div>
              )}
            </dl>
            {copyMessage && <p className="payment-callback__copy-message" role="status">{copyMessage}</p>}
          </div>

          <div className="payment-callback__actions">
            <Link className="payment-callback__button payment-callback__button--primary" to="/">
              بازگشت به فروشگاه <FiArrowLeft aria-hidden="true" />
            </Link>
            <Link className="payment-callback__button payment-callback__button--secondary" to="/dashboard">مشاهده حساب کاربری</Link>
          </div>
          <p className="payment-callback__note">{state.note}</p>
        </section>
        <p className="payment-callback__signature">با مهر، شامین گالری</p>
      </div>
    </main>
  );
}
