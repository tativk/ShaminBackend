import React, { useCallback, useEffect, useState } from "react";
import "./App.css";
import { BrowserRouter, Link } from "react-router-dom";
import { FiAlertCircle, FiShoppingCart, FiX } from "react-icons/fi";
import AppRoutes from "./routes/AppRoutes";
import ScrollToTop from "./components/ScrollToTop";
import { WishlistProvider } from "./context/WishlistContext";
import { CART_NOTICE_DURATION, CART_NOTICE_EVENT } from "./cart-notice";
import "./cart-notice.css";

/* اعلان «افزودن به سبد خرید» بدون کامپوننت جدا، مستقیم در همین فایل رندر می‌شود.
   ماژول cart-notice فقط رویداد منتشر می‌کند؛ نوار باریک زیر پیام با
   cart-notice-fill پر می‌شود و همان لحظه (animationend) پیام بسته می‌شود. */
const CART_NOTICE_EXIT_MS = 450;
const toFa = (value) => Number(value || 0).toLocaleString("fa-IR");

const App = () => {
  const [notice, setNotice] = useState(null);
  const [visible, setVisible] = useState(false);
  const [paused, setPaused] = useState(false);

  const closeNotice = useCallback(() => {
    setVisible(false);
    setPaused(false);
  }, []);

  // بعد از پایان انیمیشن خروج، از DOM حذف شود
  useEffect(() => {
    if (visible || !notice) return undefined;
    const timer = setTimeout(() => setNotice(null), CART_NOTICE_EXIT_MS);
    return () => clearTimeout(timer);
  }, [visible, notice]);

  useEffect(() => {
    const onCartNotice = (event) => {
      setNotice({ id: Date.now(), ...(event.detail || {}) });
      setVisible(false);
      setPaused(false);
      // دو فریم صبر تا حالت اولیه paint شود، بعد انیمیشن ورود شروع شود
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
    };
    window.addEventListener(CART_NOTICE_EVENT, onCartNotice);
    return () => window.removeEventListener(CART_NOTICE_EVENT, onCartNotice);
  }, []);

  return (
    <WishlistProvider>
      <BrowserRouter>

        <ScrollToTop />

        <div className="App">
          <AppRoutes />
        </div>

      {notice && (
        <div
          key={notice.id}
          dir="rtl"
          role="status"
          aria-live="polite"
          className={[
            "cart-notice",
            visible ? "cart-notice--visible" : "",
            paused ? "cart-notice--paused" : "",
            notice.type === "error" ? "cart-notice--error" : "",
          ].filter(Boolean).join(" ")}
          style={{ "--cart-notice-duration": `${CART_NOTICE_DURATION}ms` }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onAnimationEnd={(event) => {
            if (event.animationName === "cart-notice-fill") closeNotice();
          }}
        >
          <span className="cart-notice__icon" aria-hidden="true">
            {notice.type === "error" ? (
              <FiAlertCircle />
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12.5l4.4 4.4L19 7.3" />
              </svg>
            )}
          </span>

          <div className="cart-notice__body">
            <p className="cart-notice__title">
              {notice.type === "error"
                ? notice.message || "عملیات با خطا مواجه شد."
                : `${toFa(notice.added)} عدد به سبد خرید اضافه شد`}
            </p>
            {notice.type === "success" && (
              <p className="cart-notice__meta">
                <span className="cart-notice__product">{notice.productName}</span>
                {Number(notice.totalItems) > 0 && (
                  <span className="cart-notice__count-chip">
                    <FiShoppingCart />
                    سبد شما: {toFa(notice.totalItems)} کالا
                  </span>
                )}
              </p>
            )}
          </div>

          {notice.type === "success" && (
            <Link to="/cart" className="cart-notice__action">
              مشاهده سبد خرید
            </Link>
          )}

          <button
            type="button"
            className="cart-notice__close"
            onClick={closeNotice}
            aria-label="بستن پیام"
          >
            <FiX />
          </button>

          <span className="cart-notice__bar" aria-hidden="true">
            <span className="cart-notice__bar-fill" />
          </span>
        </div>
      )}

    </BrowserRouter>
    </WishlistProvider>
  );
};

export default App;
