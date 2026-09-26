// اعلان سراسری «افزودن به سبد خرید» — این ماژول فقط رویداد منتشر می‌کند؛
// رندر و انیمیشن در App.js انجام می‌شود (بدون کامپوننت اضافه).
export const CART_NOTICE_EVENT = "cart:notice";
export const CART_NOTICE_DURATION = 4200; // میلی‌ثانیه؛ با انیمیشن نوار پیشرفت هماهنگ است

const dispatchCartNotice = (detail) => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CART_NOTICE_EVENT, { detail }));
};

// پاسخ POST /cart/items/ شامل total_items است؛ همان را پاس بدهید
export const notifyCartAdded = ({ added = 1, totalItems, productName = "" } = {}) => {
  dispatchCartNotice({ type: "success", added, totalItems, productName });
};

export const notifyCartError = (message) => {
  dispatchCartNotice({ type: "error", message: message || "عملیات با خطا مواجه شد." });
};
