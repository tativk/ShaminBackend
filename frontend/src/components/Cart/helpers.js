/* ابزارهای مشترک صفحه سبد خرید */

export const FA_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
export const toFa = (value) => String(value).replace(/\d/g, (d) => FA_DIGITS[Number(d)]);
export const formatPrice = (value) =>
  toFa(new Intl.NumberFormat('en-US').format(Math.round(value)).replace(/,/g, '٬'));
