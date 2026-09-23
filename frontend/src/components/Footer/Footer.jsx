import React from "react";
import { FiPhone, FiMail, FiMapPin } from "react-icons/fi";
import { FaInstagram, FaTelegramPlane } from "react-icons/fa";
import { Link } from "react-router-dom";
import "./Footer.css";

const FOOTER_SERVICE_LINKS = [
  { id: "contact", label: "درباره ما", href: "/about-us" },
  { id: "faq", label: "سوالات متداول", href: "/faq" },
];

const SOCIAL_LINKS = [
  { id: "instagram", label: "اینستاگرام", href: "https://instagram.com/shamin_galerri", icon: <FaInstagram /> },
  { id: "telegram", label: "تلگرام", href: "https://t.me/Shamin_Galerri", icon: <FaTelegramPlane /> },
  /* فایل آیکون این پیام‌رسان‌ها در public موجود نیست؛ تا افزودن فایل، حرف اول نام به‌جای تصویر نمایش داده می‌شود */
  { id: "bale", label: "بله", href: "https://ble.ir/shamin_galerri", icon: <span className="footer__social-letter">ب</span> },
  { id: "eitaa", label: "ایتا", href: "https://eitaa.com/Shamin_Galerri", icon: <span className="footer__social-letter">ا</span> },
  { id: "soroush", label: "سروش", href: "https://splus.ir/Shamin_Galerri", icon: <span className="footer__social-letter">س</span> },
  { id: "rubika", label: "روبیکا", href: "https://rubika.ir/@shamin_galeri", icon: <span className="footer__social-letter">ر</span> },
];

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__col footer__col--brand">
          <Link to="/" className="header__logo header__logo--footer" aria-label="فروشگاه شمین">
            <img src="/logo.png" alt="لوگوی شمین گالری" className="header__logo-img" />
            <span className="header__logo-text">
              SHAMIN
              <small>BEAUTY · STYLE · YOU</small>
            </span>
          </Link>
          <p>فروشگاه آنلاین عطر، لوازم آرایشی و اکسسوری با ضمانت اصالت کالا.</p>
          <div className="footer__social">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.id}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>

        <div className="footer__col">
          <h4>اطلاعات بیشتر ...</h4>
          <ul>
            {FOOTER_SERVICE_LINKS.map((link) => (
              <li key={link.id}>
                <Link to={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer__col">
          <h4> ارتباط با ما</h4>
          <ul className="footer__contact">
            <li>
              <FiPhone /> <a href="tel:09185642392">09185642392</a> / <a href="tel:09193046284">09193046284</a>
            </li>
            <li>
              <FiMail /> <a href="mailto:shamingallery1401@gmail.com">shamingallery1401@gmail.com</a>
            </li>
            <li>
              <FiMapPin /> تهران، افسریه
            </li>
          </ul>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <span>© تمامی حقوق مادی و معنوی متعلق به فروشگاه شمین است.</span>
          <a
            href="https://morenacode.ir/"
            target="_blank"
            rel="noopener noreferrer"
            id="morena"
            className="footer__morena"
          >
            طراحی شده توسط تیم برنامه نویسی مورنا کد
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
