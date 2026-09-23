import React, { useEffect, useRef, useState } from "react";
import { FiSearch, FiUser, FiHeart, FiShoppingCart, FiMenu, FiX } from "react-icons/fi";
import { Link } from "react-router-dom";
import "./Header.css";

const NAV_LINKS = [
  { label: "خانه", to: "/" },
  { label: "عطر و ادکلن", to: "/products?category=perfume" },
  { label: "لوازم آرایشی و بهداشتی", to: "/products?category=cosmetic" },
  { label: "اکسسوری", to: "/products?category=accessory" },
];

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef(null);

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
          <div className="header__search">
            <FiSearch className="header__search-icon" />
            <input type="text" placeholder="جستجو در محصولات..." />
          </div>
          <Link to="/register" className="header__icon-btn" aria-label="ورود / ثبت نام">
            <FiUser />
          </Link>
          <button className="header__icon-btn" aria-label="علاقه‌مندی‌ها">
            <FiHeart />
          </button>
          <Link to="/cart" className="header__icon-btn" aria-label="سبد خرید">
            <FiShoppingCart />
            <span className="header__badge">0</span>
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
            <div className="mobile-menu__search">
              <FiSearch className="header__search-icon" />
              <input type="text" placeholder="جستجو در محصولات..." />
            </div>
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
