import React, { useState, useEffect, useRef } from "react";
import {
  FiShoppingCart,
  FiChevronLeft,
  FiChevronRight,
  FiTruck,
  FiShield,
  FiHeadphones,
  FiCreditCard,
  FiAward,
  FiMail,
  FiHeart,
} from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import { Link } from "react-router-dom";
import blogPosts from "../data/blogPosts";
import { useWishlist } from "../context/WishlistContext";
import "./Home.css";

/* =========================================================
   DATA
   ========================================================= */

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
    oldPrice: null,
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
    id: 9,
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



const BLOG_POSTS = blogPosts;




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

/* =========================================================
   SECTION: HERO
   ========================================================= */

const Hero = () => {
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





/* =========================================================
   SECTION: PRODUCTS
   ========================================================= */

const ProductCard = ({ product }) => {
  const { has, toggle } = useWishlist();
  const wishlisted = has(product.id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // TODO: connect to real cart logic
    console.log("افزودن به سبد خرید:", product.name);
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(product);
  };

  return (
    <div className="product-card">
      <a href={`/product/${product.id}`} className="product-card__link">
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
          <button
            type="button"
            className={
              wishlisted
                ? "product-card__wishlist product-card__wishlist--active"
                : "product-card__wishlist"
            }
            onClick={handleToggleWishlist}
            aria-label={wishlisted ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"}
          >
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
      </a>
      <div className="product-card__actions">
        <button className="product-card__add-btn" onClick={handleAddToCart}>
          <FiShoppingCart />
          افزودن به سبد خرید
        </button>
      </div>
    </div>
  );
};

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
  <Link to={`/blog/${post.slug}`} className="blog-card">
    <div className="blog-card__image-wrap">
      <img src={post.image} alt={post.title} />
    </div>
    <div className="blog-card__body">
      <span className="blog-card__date">{post.date} · {post.readingTime}</span>
      <h3>{post.title}</h3>
      <span className="blog-card__arrow">
        <FiChevronLeft />
      </span>
    </div>
  </Link>
);

const BlogSection = () => (
  <section className="container blog-section">
    <div className="section-title">
      <FiAward />
      <h2>آخرین مطالب وبلاگ</h2>
      <Link to="/blog" className="blog-section__all">
        مشاهده همه مطالب
        <FiChevronLeft />
      </Link>
    </div>
    <div className="blog-grid">
      {BLOG_POSTS.map((post) => (
        <BlogCard post={post} key={post.slug} />
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
        <BestSellingProducts />
        <BlogSection />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
export { Hero };