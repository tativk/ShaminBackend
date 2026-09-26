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
import { apiRequest, getAssetUrl } from "../api";
import { notifyCartAdded, notifyCartError } from "../cart-notice";
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

// دسته‌بندی‌های واقعی بک‌اند (products.Product.CATEGORY_CHOICES)
const CATEGORIES = [
  {
    code: "perfume",
    title: "عطر و ادکلن",
    desc: "رایحه‌ای خاص، لحظاتی ماندگار",
    image:
      "/cat-perfume.jpg",
  },
  {
    code: "cosmetic",
    title: "لوازم آرایشی و بهداشتی",
    desc: "زیبایی، مراقبت، اعتماد به نفس",
    image:
      "/cat-cosmetics.jpg",
  },
  {
    code: "accessory",
    title: "اکسسوری",
    desc: "جزئیات کوچک، تفاوت‌های بزرگ",
    image:
      "/cat-acsesory.jpg",
  },
];

const FALLBACK_IMAGE = "/logo.png";



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
  <Link to={`/products?category=${category.code}`} className="category-card">
    <img src={category.image} alt={category.title} className="category-card__image" />
    <div className="category-card__overlay" />
    <div className="category-card__body">
      <h3>{category.title}</h3>
      <p>{category.desc}</p>
    </div>
    <span className="category-card__arrow">
      <FiChevronLeft />
    </span>
  </Link>
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
  const [adding, setAdding] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (adding) return;
    setAdding(true);
    try {
      const data = await apiRequest("/cart/items/", {
        method: "POST",
        body: JSON.stringify({ product: product.id, quantity: 1 }),
      });
      notifyCartAdded({ added: 1, totalItems: data?.total_items, productName: product.name });
    } catch (err) {
      notifyCartError(err?.message || "افزودن به سبد خرید انجام نشد.");
    } finally {
      setAdding(false);
    }
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
          {product.rating != null && <Stars rating={Math.round(product.rating)} />}
          <div className="product-card__price">
            <span className="product-card__price-current">{formatPrice(product.price)}</span>
            {product.oldPrice && (
              <span className="product-card__price-old">{formatPrice(product.oldPrice)}</span>
            )}
          </div>
        </div>
      </a>
      <div className="product-card__actions">
        <button className="product-card__add-btn" onClick={handleAddToCart} disabled={adding}>
          <FiShoppingCart />
          {adding ? "در حال افزودن..." : "افزودن به سبد خرید"}
        </button>
      </div>
    </div>
  );
};

const BestSellingProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    apiRequest("/products/")
      .then((data) => {
        if (ignore) return;
        const rows = Array.isArray(data) ? data : data?.results || [];
        setProducts(rows.map((product) => ({
          id: product.id,
          name: product.name,
          brand: typeof product.brand === "string" ? product.brand : "",
          price: Number(product.final_price ?? product.price ?? 0),
          oldPrice: Number(product.discount_percent || 0) > 0 ? Number(product.price) : null,
          rating: null,
          badge: product.discount_percent > 0 ? `${new Intl.NumberFormat("fa-IR").format(product.discount_percent)}٪ تخفیف` : null,
          image: product.main_image ? getAssetUrl(product.main_image) : FALLBACK_IMAGE,
        })));
      })
      .catch((err) => { if (!ignore) setError(err?.message || "خطا در دریافت محصولات"); })
      .finally(() => { if (!ignore) setLoading(false); });
    return () => { ignore = true; };
  }, []);

  return (
    <section className="container products-section" id="products">
      <div className="section-title">
        <FiAward />
        <h2>محصولات پرفروش</h2>
      </div>
      {loading ? (
        <p className="products-state">در حال دریافت محصولات...</p>
      ) : error ? (
        <p className="products-state">{error}</p>
      ) : products.length === 0 ? (
        <p className="products-state">هنوز محصولی ثبت نشده است.</p>
      ) : (
        <div className="products-grid">
          {products.map((p) => (
            <ProductCard product={p} key={p.id} />
          ))}
        </div>
      )}
    </section>
  );
};

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
      </main>
      <Footer />
    </div>
  );
};

export default Home;
export { Hero };