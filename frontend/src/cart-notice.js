// اعلان‌های سراسری سبد خرید — این ماژول فقط رویداد منتشر می‌کند؛
// رندر اعلان در App.js و شمارنده سبد در context/CartCountContext انجام می‌شود.
export const CART_NOTICE_EVENT = "cart:notice";
export const CART_NOTICE_DURATION = 4200; // میلی‌ثانیه؛ با انیمیشن نوار پیشرفت هماهنگ است
export const CART_COUNT_EVENT = "cart:count"; // تغییر شمارنده سبد هدر
export const AUTH_CHANGED_EVENT = "auth:changed"; // ورود / خروج کاربر

const dispatchEvent = (type, detail) => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(type, { detail }));
};

// پاسخ POST /cart/items/ شامل total_items است؛ همان را پاس بدهید
export const notifyCartAdded = ({ added = 1, totalItems, productName = "" } = {}) => {
  dispatchEvent(CART_NOTICE_EVENT, { type: "success", added, totalItems, productName });
};

export const notifyCartError = (message) => {
  dispatchEvent(CART_NOTICE_EVENT, { type: "error", message: message || "عملیات با خطا مواجه شد." });
};

// همگام‌سازی شمارنده سبد هدر؛ count نامعتبر یعنی «دوباره از سرور بگیر»
export const notifyCartCount = (count) => dispatchEvent(CART_COUNT_EVENT, { count });

// پس از ورود/خروج تا هدر و سایر بخش‌ها وضعیت را به‌روز کنند
export const notifyAuthChanged = () => dispatchEvent(AUTH_CHANGED_EVENT, {});
