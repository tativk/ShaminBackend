import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { apiRequest, hasAuthToken } from "../api";
import { AUTH_CHANGED_EVENT, CART_COUNT_EVENT, CART_NOTICE_EVENT } from "../cart-notice";

/* شمارنده سبد خرید هدر — منبع حقیقتش پاسخ سرور (total_items) است.
   پس از افزودن کالا، ProductCard/ProductInfo همان عدد را در رویداد
   cart:notice می‌فرستند و صفحه سبد با cart:count همگام می‌کند. */
const CartCountContext = createContext({ count: 0, refreshCartCount: () => {} });

const asCount = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
};

export const CartCountProvider = ({ children }) => {
  const [count, setCount] = useState(0);

  const refreshCartCount = useCallback(async () => {
    if (!hasAuthToken()) {
      setCount(0);
      return;
    }
    try {
      const cart = await apiRequest("/cart/");
      setCount(asCount(cart?.total_items) ?? 0);
    } catch {
      // شمارنده هدر حیاتی نیست؛ خطا بی‌صدا نادیده گرفته می‌شود
    }
  }, []);

  useEffect(() => {
    refreshCartCount();
  }, [refreshCartCount]);

  useEffect(() => {
    const onCartNotice = (event) => {
      if (event.detail?.type !== "success") return;
      const total = asCount(event.detail?.totalItems);
      if (total != null) setCount(total);
      else refreshCartCount();
    };
    const onCartCount = (event) => {
      if (!event.detail || !("count" in event.detail)) {
        refreshCartCount();
        return;
      }
      const total = asCount(event.detail?.count);
      if (total != null) setCount(total);
    };
    const onAuthChanged = () => refreshCartCount();

    window.addEventListener(CART_NOTICE_EVENT, onCartNotice);
    window.addEventListener(CART_COUNT_EVENT, onCartCount);
    window.addEventListener(AUTH_CHANGED_EVENT, onAuthChanged);
    return () => {
      window.removeEventListener(CART_NOTICE_EVENT, onCartNotice);
      window.removeEventListener(CART_COUNT_EVENT, onCartCount);
      window.removeEventListener(AUTH_CHANGED_EVENT, onAuthChanged);
    };
  }, [refreshCartCount]);

  return (
    <CartCountContext.Provider value={{ count, refreshCartCount }}>
      {children}
    </CartCountContext.Provider>
  );
};

export const useCartCount = () => useContext(CartCountContext);
