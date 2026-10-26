import { useEffect } from "react";

const SITE_NAME = "گالری شمین";

const setMeta = (selector, attr, value) => {
  let tag = document.head.querySelector(selector);
  if (!tag) {
    tag = document.createElement("meta");
    const [, kind, name] = selector.match(/\[(\w+)="([^"]+)"\]/) || [];
    if (kind === "name") tag.setAttribute("name", name);
    if (kind === "property") tag.setAttribute("property", name);
    document.head.appendChild(tag);
  }
  tag.setAttribute(attr, value);
};

/* عنوان و توضیحات هر صفحه را برای موتورهای جستجو و اشتراک‌گذاری به‌روز می‌کند */
const usePageTitle = (title, description) => {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | فروشگاه اینترنتی عطر، لوازم آرایشی و اکسسوری`;
    document.title = fullTitle;
    setMeta('meta[name="description"]', "content", description || "خرید آنلاین عطر و ادکلن اصل، لوازم آرایشی و بهداشتی و اکسسوری از گالری شمین با ضمانت اصالت کالا و ارسال به سراسر ایران.");
    setMeta('meta[property="og:title"]', "content", fullTitle);
    setMeta('meta[property="og:description"]', "content", description || "خرید آنلاین عطر و ادکلن اصل، لوازم آرایشی و بهداشتی و اکسسوری از گالری شمین با ضمانت اصالت کالا و ارسال به سراسر ایران.");
  }, [title, description]);
};

/* JSON-LD صفحه را در head جایگزین می‌کند — برای Rich Result گوگل */
const setJsonLd = (data) => {
  let tag = document.getElementById("page-json-ld");
  if (!data) {
    if (tag) tag.remove();
    return;
  }
  if (!tag) {
    tag = document.createElement("script");
    tag.type = "application/ld+json";
    tag.id = "page-json-ld";
    document.head.appendChild(tag);
  }
  tag.textContent = JSON.stringify(data);
};

export { setJsonLd };

export default usePageTitle;
