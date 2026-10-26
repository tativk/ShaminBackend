import React, { useEffect, useRef, useState } from "react";
import { FiUser, FiHeart, FiShoppingCart, FiMenu, FiX } from "react-icons/fi";
import { Link } from "react-router-dom";
import SearchBox from "../SearchBox/SearchBox";
import { useCartCount } from "../../context/CartCountContext";
import { hasAuthToken } from "../../api";
import { AUTH_CHANGED_EVENT } from "../../cart-notice";
import "./Header.css";

const NAV_LINKS = [
  { label: "خانه", to: "/" },
  { label: "عطر و ادکلن", to: "/products?category=perfume" },
  { label: "لوازم آرایشی و بهداشتی", to: "/products?category=cosmetic" },
  { label: "اکسسوری", to: "/products?category=accessory" },
  { label: "وبلاگ", to: "/blog" },
];

const toFa = (value) => Number(value || 0).toLocaleString("fa-IR");

/* مقصد آیکون کاربر: اگر در حساب خود است، بدون ورود مجدد به پنلش می‌رود؛
   وگرنه به صفحه ورود/ثبت‌نام. خروج فقط از داخل پنل انجام می‌شود. */
const readUserPanelPath = () => {
  if (!hasAuthToken()) return "/register";
  try {
    const stored = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user") || "null");
    return stored?.role === "admin" ? "/admin" : "/dashboard";
  } catch {
    return "/dashboard";
  }
};

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef(null);
  const { count: cartCount } = useCartCount();
  const [panelPath, setPanelPath] = useState(readUserPanelPath);

  useEffect(() => {
    const sync = () => setPanelPath(readUserPanelPath());
    window.addEventListener(AUTH_CHANGED_EVENT, sync);
    return () => window.removeEventListener(AUTH_CHANGED_EVENT, sync);
  }, []);

  /* ارتفاع هدر به‌صورت متغیر CSS در ریشه سند منتشر می‌شود تا
     محتوای صفحه با padding معادل، زیر هدر ثابت پنهان نشود. */
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const update = () =>
      document.documentElement.style.setProperty("--header-h", `${el.offsetHeight}px`);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <header className="header" ref={headerRef}>
      <div className="container header__inner">
        <div className="header__nav">
          <button
            className="header__hamburger"
            aria-label="باز کردن منو"
            onClick={() => setMenuOpen(true)}
          >
            <FiMenu />
          </button>
          <nav className="header__links">
            {NAV_LINKS.map((link) => (
              <Link to={link.to} key={link.label} className="header__link">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <Link to="/" className="header__logo" aria-label="فروشگاه شمین">
          <img src="/logo.png" alt="لوگوی شمین گالری" className="header__logo-img" />
          <span className="header__logo-text">
            گالری شمین
          </span>
        </Link>

        <div className="header__actions">
          <SearchBox variant="desktop" />
          <Link
            to={panelPath}
            className="header__icon-btn"
            aria-label={panelPath === "/register" ? "ورود / ثبت نام" : "حساب کاربری من"}
          >
            <FiUser />
          </Link>
          <Link to="/favorites" className="header__icon-btn" aria-label="علاقه‌مندی‌ها">
            <FiHeart />
          </Link>
          <Link
            to="/cart"
            className="header__icon-btn"
            aria-label={cartCount > 0 ? `سبد خرید (${toFa(cartCount)} کالا)` : "سبد خرید"}
          >
            <FiShoppingCart />
            {cartCount > 0 && <span className="header__badge">{toFa(cartCount)}</span>}
          </Link>
        </div>
      </div>

      {menuOpen && (
        <div className="mobile-menu">
          <div className="mobile-menu__backdrop" onClick={() => setMenuOpen(false)} />
          <div className="mobile-menu__panel">
            <div className="mobile-menu__head">
              <span className="mobile-menu__brand">
                <img src="/logo.png" alt="لوگوی شمین گالری" className="header__logo-img" />
                <span className="header__logo-text">گالری شمین</span>
              </span>
              <button
                className="header__icon-btn"
                aria-label="بستن منو"
                onClick={() => setMenuOpen(false)}
              >
                <FiX />
              </button>
            </div>
            <SearchBox variant="mobile" onNavigate={() => setMenuOpen(false)} />
            <nav className="mobile-menu__links">
              {NAV_LINKS.map((link) => (
                <Link to={link.to} key={link.label} onClick={() => setMenuOpen(false)}>
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
