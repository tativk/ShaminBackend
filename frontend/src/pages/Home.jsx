import React, { useState, useEffect, useRef } from "react";
import {
  FiSearch,
  FiUser,
  FiHeart,
  FiShoppingCart,
  FiMenu,
  FiChevronLeft,
  FiChevronRight,
  FiTruck,
  FiShield,
  FiHeadphones,
  FiCreditCard,
  FiAward,
  FiMail,
  FiPhone,
  FiMapPin,
  FiX,
} from "react-icons/fi";
import { FaStar, FaInstagram, FaTelegramPlane, FaWhatsapp, FaPinterestP } from "react-icons/fa";
import "./Home.css";

/* =========================================================
   DATA
   ========================================================= */

const NAV_LINKS = [
  { label: "خانه", href: "#" },
  { label: "عطر و ادکلن", href: "#" },
  { label: "لوازم آرایشی و بهداشتی", href: "#" },
  { label: "اکسسوری", href: "#" },
];



const HERO_SLIDES = [
  {
    eyebrow: "عطر؛ امضای شخصیت شماست.",
    title: "عطر و ادکلن",
    description: "رایحه‌ای که حس خوب را ماندگار می‌کند؛.",
    cta: "مشاهده محصولات",
    image:
      "/banner-perfume.jpg",
  },
  {
    eyebrow: "زیبایی روزمره شما",
    title: "لوازم آرایشی",
    description: "محصولاتی که پوست شما شایسته آن است.",
    cta: "مشاهده محصولات",
    image:
      "/banner-cosmetics.jpg",
  },
  {
    eyebrow: "جزئیاتی که فرق می‌کنند",
    title: "اکسسوری ",
    description: "اکسسوری‌هایی برای تکمیل جذابیت شما.",
    cta: "مشاهده محصولات",
    image:
      "/baner-acsesory.png",
  },
];

const FEATURES = [
  { icon: <FiAward />, title: "محصولات اصل", desc: "برندهای معتبر جهانی" },
  { icon: <FiCreditCard />, title: "پرداخت امن", desc: "با درگاه‌های معتبر" },
  { icon: <FiHeadphones />, title: "پشتیبانی ۲۴ ساعته", desc: "پاسخگویی در هر زمان" },
  { icon: <FiShield />, title: "تضمین اصالت کالا", desc: "با ضمانت کیفیت" },
  { icon: <FiTruck />, title: "ارسال سریع", desc: "ارسال به سراسر کشور" },
];

const CATEGORIES = [
  {
    title: "عطر و ادکلن",
    desc: "رایحه‌ای خاص، لحظاتی ماندگار",
    image:
      "/cat-perfume.jpg",
  },
  {
    title: "لوازم آرایشی و بهداشتی",
    desc: "زیبایی، مراقبت، اعتماد به نفس",
    image:
      "/cat-cosmetics.jpg",
  },
  {
    title: "اکسسوری",
    desc: "جزئیات کوچک، تفاوت‌های بزرگ",
    image:
      "/cat-acsesory.jpg",
  },
];

const BRANDS = ["Dior", "CHANEL", "TOM FORD", "GUCCI", "YSL", "LANCÔME", "ESTÉE LAUDER", "CLINIQUE"];

const PRODUCTS = [
  {
    id: 1,
    name: "رژ لب مدل YSL Rouge Pur Couture",
    brand: "YSL",
    price: 2450000,
    oldPrice: null,
    rating: 5,
    badge: null,
    image:
      "/rozh.png",
  },
  {
    id: 2,
    name: "عطر شنل مدل Coco Mademoiselle",
    brand: "CHANEL",
    price: 6490000,
    oldPrice: null,
    rating: 5,
    badge: null,
    image:
      "/perfuame1.png",
  },
  {
    id: 3,
    name: "کرم مرطوب‌کننده کلینیک Moisture Surge",
    brand: "CLINIQUE",
    price: 2190000,
    oldPrice: null,
    rating: 4,
    badge: null,
    image:
      "/kerem1.png",
  },
  {
    id: 4,
    name: "عطر دیور مدل Sauvage",
    brand: "Dior",
    price: 6990000,
    oldPrice: null,
    rating: 5,
    badge: null,
    image:
      "/perfuame2.png",
  },
  {
    id: 5,
    name: "پالت سایه چشم NYX",
    brand: "NYX",
    price: 1890000,
    oldPrice: 2495000,
    rating: 4,
    badge: "٪۳۰",
    image:
      "/arayeshi.png",
  },
  {
    id: 6,
    name: "ساعت زنانه مایکل کورس",
    brand: "MICHAEL KORS",
    price: 7990000,
    oldPrice: null,
    rating: 5,
    badge: "جدید",
    image:
      "/wach1.png",
  },
  {
    id: 7,
    name: "ساعت مردانه رولکس",
    brand: "Rolex",
    price: 2390000,
    oldPrice: null,
    rating: 5,
    badge: "",
    image:
      "/wach2.png",
  },
  {
    id: 8,
    name: "ریمل essence",
    brand: "essence",
    price: 990000,
    oldPrice: null,
    rating: 5,
    badge: "",
    image:
      "/arayeshi2.png",
  },
  {
    id: 8,
    name: "اتو مو",
    brand: "shiglam",
    price: 3990000,
    oldPrice: null,
    rating: 5,
    badge: "",
    image:
      "/arayeshi3.png",
  },
  
];



const BLOG_POSTS = [
  {
    title: "۱۰ نکته برای انتخاب عطر مناسب",
    date: "۱۴۰۴/۰۶/۲۶",
    image:
      "/10nokteh.png",
  },
  {
    title: "روش‌های مراقبت از پوست در تابستان",
    date: "۱۴۰۴/۰۶/۲۰",
    image:
      "/raveshpost.png",
  },
  {
    title: "ترندهای اکسسوری سال ۲۰۲۶",
    date: "۱۴۰۴/۰۶/۱۵",
    image:
      "/teredacsesory.png",
  },
  {
    title: "معرفی بهترین عطرهای زنانه",
    date: "۱۴۰۴/۰۶/۱۰",
    image:
      "/moarefiatre.png",
  },
];

const FOOTER_QUICK_LINKS = ["صفحه اصلی", "عطر و ادکلن", "لوازم آرایشی و بهداشتی", "اکسسوری"];
const FOOTER_SERVICE_LINKS = ["پشتیبانی", "تماس با ما", "سوالات متداول", "شرایط و قوانین"];

/* =========================================================
   HELPERS
   ========================================================= */

const formatPrice = (value) => new Intl.NumberFormat("fa-IR").format(value) + " تومان";

const Stars = ({ rating }) => (
  <div className="stars" aria-label={`امتیاز ${rating} از ۵`}>
    {Array.from({ length: 5 }).map((_, i) => (
      <FaStar key={i} className={i < rating ? "star star--full" : "star star--empty"} />
    ))}
  </div>
);

/* =========================================================
   SECTION: TOP BAR
   ========================================================= */



/* =========================================================
   SECTION: HEADER
   ========================================================= */

export const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="header">
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
              <a href={link.href} key={link.label} className="header__link">
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <a href="#" className="header__logo" aria-label="فروشگاه شمین">
          <span className="header__logo-mark"></span>
          <span className="header__logo-text">
            گالری شمین
          </span>
        </a>

        <div className="header__actions">
          <div className="header__search">
            <FiSearch className="header__search-icon" />
            <input type="text" placeholder="جستجو در محصولات..." />
          </div>
          <button className="header__icon-btn" aria-label="حساب کاربری">
            <FiUser />
          </button>
          <button className="header__icon-btn" aria-label="علاقه‌مندی‌ها">
            <FiHeart />
          </button>
          <button className="header__icon-btn" aria-label="سبد خرید">
            <FiShoppingCart />
            <span className="header__badge">0</span>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="mobile-menu">
          <div className="mobile-menu__backdrop" onClick={() => setMenuOpen(false)} />
          <div className="mobile-menu__panel">
            <div className="mobile-menu__head">
              <span className="header__logo-text">گالری شمین</span>
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
                <a href={link.href} key={link.label} onClick={() => setMenuOpen(false)}>
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

/* =========================================================
   SECTION: HERO
   ========================================================= */

export const Hero = () => {
  const [active, setActive] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timerRef.current);
  }, []);

  const goTo = (index) => {
    clearInterval(timerRef.current);
    setActive(index);
  };

  const next = () => goTo((active + 1) % HERO_SLIDES.length);
  const prev = () => goTo((active - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);

  const slide = HERO_SLIDES[active];

  return (
    <section className="hero container">
      <div className="hero__banner">
        <div className="hero__content">
          <span className="hero__eyebrow">{slide.eyebrow}</span>
          <h1 className="hero__title">{slide.title}</h1>
          <p className="hero__desc">{slide.description}</p>
          <a href="#products" className="btn btn--primary hero__cta">
            {slide.cta}
            <FiChevronLeft />
          </a>
        </div>
        <div className="hero__image-wrap">
          <img src={slide.image} alt={slide.title} className="hero__image" />
        </div>
      </div>

      <div className="hero__controls">
        <button className="hero__arrow" onClick={next} aria-label="اسلاید بعدی">
          <FiChevronRight />
        </button>
        <div className="hero__dots">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              className={i === active ? "hero__dot hero__dot--active" : "hero__dot"}
              onClick={() => goTo(i)}
              aria-label={`اسلاید ${i + 1}`}
            />
          ))}
        </div>
        <button className="hero__arrow" onClick={prev} aria-label="اسلاید قبلی">
          <FiChevronLeft />
        </button>
      </div>
    </section>
  );
};

/* =========================================================
   SECTION: FEATURES / TRUST BAR
   ========================================================= */

const Features = () => (
  <section className="container features">
    {FEATURES.map((f, i) => (
      <React.Fragment key={f.title}>
        <div className="feature">
          <span className="feature__icon">{f.icon}</span>
          <div className="feature__text">
            <strong>{f.title}</strong>
            <span>{f.desc}</span>
          </div>
        </div>
        {i < FEATURES.length - 1 && <span className="feature__divider" />}
      </React.Fragment>
    ))}
  </section>
);

/* =========================================================
   SECTION: CATEGORY CARDS
   ========================================================= */

const CategoryCard = ({ category }) => (
  <a href="#" className="category-card">
    <img src={category.image} alt={category.title} className="category-card__image" />
    <div className="category-card__overlay" />
    <div className="category-card__body">
      <h3>{category.title}</h3>
      <p>{category.desc}</p>
    </div>
    <span className="category-card__arrow">
      <FiChevronLeft />
    </span>
  </a>
);

const CategorySection = () => (
  <section className="container category-section">
    {CATEGORIES.map((c) => (
      <CategoryCard category={c} key={c.title} />
    ))}
  </section>
);

/* =========================================================
   SECTION: BRANDS
   ========================================================= */

const BrandsSection = () => {
  const scrollerRef = useRef(null);

  const scroll = (dir) => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollBy({ left: dir * 240, behavior: "smooth" });
    }
  };

  return (
    <section className="container brands-section">
      <div className="section-title">
        <FiAward />
        <h2>برندهای معتبر</h2>
      </div>
      <div className="brands-section__row">
        <button className="brands-section__arrow" onClick={() => scroll(1)} aria-label="بعدی">
          <FiChevronRight />
        </button>
        <div className="brands-section__scroller" ref={scrollerRef}>
          {BRANDS.map((brand) => (
            <div className="brand-card" key={brand}>
              {brand}
            </div>
          ))}
        </div>
        <button className="brands-section__arrow" onClick={() => scroll(-1)} aria-label="قبلی">
          <FiChevronLeft />
        </button>
      </div>
    </section>
  );
};

/* =========================================================
   SECTION: PRODUCTS
   ========================================================= */

const ProductCard = ({ product }) => (
  <div className="product-card">
    <div className="product-card__media">
      {product.badge && (
        <span
          className={
            product.badge === "جدید"
              ? "product-card__badge product-card__badge--new"
              : "product-card__badge product-card__badge--sale"
          }
        >
          {product.badge}
        </span>
      )}
      <button className="product-card__wishlist" aria-label="افزودن به علاقه‌مندی‌ها">
        <FiHeart />
      </button>
      <img src={product.image} alt={product.name} />
    </div>
    <div className="product-card__body">
      <span className="product-card__brand">{product.brand}</span>
      <h3 className="product-card__name">{product.name}</h3>
      <Stars rating={product.rating} />
      <div className="product-card__price">
        <span className="product-card__price-current">{formatPrice(product.price)}</span>
        {product.oldPrice && (
          <span className="product-card__price-old">{formatPrice(product.oldPrice)}</span>
        )}
      </div>
    </div>
  </div>
);

const BestSellingProducts = () => (
  <section className="container products-section" id="products">
    <div className="section-title">
      <FiAward />
      <h2>محصولات پرفروش</h2>
    </div>
    <div className="products-grid">
      {PRODUCTS.map((p) => (
        <ProductCard product={p} key={p.id} />
      ))}
    </div>
  </section>
);

/* =========================================================
   SECTION: PROMO BANNERS
   ========================================================= */



/* =========================================================
   SECTION: BLOG
   ========================================================= */

const BlogCard = ({ post }) => (
  <a href="#" className="blog-card">
    <div className="blog-card__image-wrap">
      <img src={post.image} alt={post.title} />
    </div>
    <div className="blog-card__body">
      <span className="blog-card__date">{post.date}</span>
      <h3>{post.title}</h3>
      <span className="blog-card__arrow">
        <FiChevronLeft />
      </span>
    </div>
  </a>
);

const BlogSection = () => (
  <section className="container blog-section">
    <div className="section-title">
      <FiAward />
      <h2>آخرین مطالب وبلاگ</h2>
    </div>
    <div className="blog-grid">
      {BLOG_POSTS.map((post) => (
        <BlogCard post={post} key={post.title} />
      ))}
    </div>
  </section>
);

/* =========================================================
   SECTION: NEWSLETTER
   ========================================================= */

const Newsletter = () => (
  <section className="container">
    <div className="newsletter">
      <div className="newsletter__content">
        <h2>عضو خبرنامه ما شوید</h2>
        <p>برای دریافت جدیدترین محصولات و تخفیف‌های ویژه، ایمیل خود را وارد کنید.</p>
        <form className="newsletter__form" onSubmit={(e) => e.preventDefault()}>
          <input type="tel" placeholder="شماره تماس شما" required />
          <button type="submit" className="btn btn--primary">
            عضویت
            <FiMail />
          </button>
        </form>
      </div>
    </div>
  </section>
);

/* =========================================================
   SECTION: FOOTER
   ========================================================= */

export const Footer = () => (
  <footer className="footer">
    <div className="container footer__grid">
      <div className="footer__col footer__col--brand">
        <a href="#" className="header__logo header__logo--footer">
          <span className="header__logo-mark">S</span>
          <span className="header__logo-text">
            SHAMIN
            <small>BEAUTY · STYLE · YOU</small>
          </span>
        </a>
        <p>فروشگاه آنلاین عطر، لوازم آرایشی و اکسسوری با ضمانت اصالت کالا.</p>
        <div className="footer__social">
          <a href="#" aria-label="اینستاگرام">
            <FaInstagram />
          </a>
          <a href="#" aria-label="تلگرام">
            <FaTelegramPlane />
          </a>
          <a href="#" aria-label="واتس‌اپ">
            <FaWhatsapp />
          </a>
          <a href="#" aria-label="پینترست">
            <FaPinterestP />
          </a>
        </div>
      </div>

      <div className="footer__col">
        <h4>دسترسی به دسته بندی</h4>
        <ul>
          {FOOTER_QUICK_LINKS.map((l) => (
            <li key={l}>
              <a href="#">{l}</a>
            </li>
          ))}
        </ul>
      </div>

      <div className="footer__col">
        <h4>خدمات مشتریان</h4>
        <ul>
          {FOOTER_SERVICE_LINKS.map((l) => (
            <li key={l}>
              <a href="#">{l}</a>
            </li>
          ))}
        </ul>
      </div>

      <div className="footer__col">
        <h4>تماس با ما</h4>
        <ul className="footer__contact">
          <li>
            <FiPhone /> ۰۲۱-۱۲۳۴۵۶۷۸
          </li>
          <li>
            <FiMail /> info@shamin.ir
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
        <span id="morena">طراحی شده توسط تیم برنامه نویسی <a href="https://morenacode.ir/">مورنا کد</a></span>
      </div>
    </div>
  </footer>
);

/* =========================================================
   PAGE
   ========================================================= */

const Home = () => {
  return (
    <div className="home-page" dir="rtl">
      <Header />
      <main>
        <Hero />
        <Features />
        <CategorySection />
        <BrandsSection />
        <BestSellingProducts />
        <BlogSection />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
