import React, { useEffect, useRef, useState } from "react";
import {
  FiHeart,
  FiShoppingCart,
  FiChevronLeft,
  FiChevronRight,
  FiChevronUp,
  FiChevronDown,
  FiMaximize2,
  FiX,
  FiShield,
  FiTruck,
  FiRefreshCw,
  FiMinus,
  FiPlus,
  FiDroplet,
  FiSun,
  FiClock,
} from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiRequest, getAssetUrl } from "../api";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import "./Home.css";
import "./Product.css";

const CATEGORY_LABEL = { perfume: "عطر و ادکلن", cosmetic: "لوازم آرایشی", accessory: "اکسسوری" };
const GENDER_LABEL = { male: "مردانه", female: "زنانه", unisex: "یونیسکس" };
const FALLBACK_IMAGE = "/logo.png";

const MIN_GRAM = 5;

const formatPrice = (value) => new Intl.NumberFormat("fa-IR").format(value) + " تومان";

const Stars = ({ rating }) => (
  <div className="stars" aria-label={`امتیاز ${rating} از ۵`}>
    {Array.from({ length: 5 }).map((_, i) => (
      <FaStar key={i} className={i < rating ? "star star--full" : "star star--empty"} />
    ))}
  </div>
);

/* =========================================================
   PRODUCT GALLERY
   ========================================================= */

const ProductGallery = ({ product }) => {
  const images = product.images;
  const [activeIndex, setActiveIndex] = useState(0);
  const [wishlisted, setWishlisted] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const thumbsRef = useRef(null);

  useEffect(() => {
    setActiveIndex(0);
  }, [product.id]);

  const scrollThumbs = (dir) => {
    thumbsRef.current?.scrollBy({ top: dir * 90, behavior: "smooth" });
  };

  return (
    <div className="product-gallery">
      <div className="product-gallery__thumbs-col">
        <button
          className="product-gallery__scroll-btn"
          onClick={() => scrollThumbs(-1)}
          aria-label="تصاویر قبلی"
        >
          <FiChevronUp />
        </button>
        <div className="product-gallery__thumbs" ref={thumbsRef}>
          {images.map((img, i) => (
            <button
              key={i}
              className={
                i === activeIndex
                  ? "product-gallery__thumb product-gallery__thumb--active"
                  : "product-gallery__thumb"
              }
              onClick={() => setActiveIndex(i)}
              aria-label={`تصویر ${i + 1}`}
            >
              <img src={img} alt={`${product.name} - ${i + 1}`} />
            </button>
          ))}
        </div>
        <button
          className="product-gallery__scroll-btn"
          onClick={() => scrollThumbs(1)}
          aria-label="تصاویر بعدی"
        >
          <FiChevronDown />
        </button>
      </div>

      <div className="product-gallery__main">
        <button
          className={
            wishlisted
              ? "product-gallery__wishlist product-gallery__wishlist--active"
              : "product-gallery__wishlist"
          }
          onClick={() => setWishlisted((prev) => !prev)}
          aria-label="افزودن به علاقه‌مندی‌ها"
        >
          <FiHeart />
        </button>
        <img src={images[activeIndex] || FALLBACK_IMAGE} alt={product.name} className="product-gallery__image" />
        <button
          className="product-gallery__zoom"
          onClick={() => setLightboxOpen(true)}
          aria-label="بزرگ‌نمایی تصویر"
        >
          <FiMaximize2 />
        </button>
      </div>

      {lightboxOpen && (
        <div className="product-lightbox" onClick={() => setLightboxOpen(false)}>
          <button className="product-lightbox__close" aria-label="بستن">
            <FiX />
          </button>
          <img src={images[activeIndex] || FALLBACK_IMAGE} alt={product.name} />
        </div>
      )}
    </div>
  );
};

/* =========================================================
   PRODUCT INFO PANEL
   ========================================================= */

const ProductInfo = ({ product }) => {
  const navigate = useNavigate();
  const isPerfume = product.category === "perfume";
  const outOfStock = product.stock <= 0;
  const [gram, setGram] = useState(MIN_GRAM);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [cartMessage, setCartMessage] = useState(null); // {type:'success'|'error', text}

  const handleGramChange = (e) => {
    const raw = e.target.value;
    if (raw === "") {
      setGram("");
      return;
    }
    const value = Number(raw);
    if (!Number.isNaN(value)) {
      setGram(value);
    }
  };

  const handleGramBlur = () => {
    setGram((prev) => {
      const value = Number(prev);
      return !prev || Number.isNaN(value) || value < MIN_GRAM ? MIN_GRAM : value;
    });
  };

  const handleAddToCart = async () => {
    if (outOfStock || adding) return;
    setAdding(true);
    setCartMessage(null);
    try {
      // نکته: فروش گرمی هنوز در بک‌اند پشتیبانی نمی‌شود؛ هر کلیک یک عدد اضافه می‌کند.
      await apiRequest("/cart/items/", {
        method: "POST",
        body: JSON.stringify({ product: product.id, quantity: isPerfume ? 1 : quantity }),
      });
      setCartMessage({ type: "success", text: "محصول به سبد خرید اضافه شد." });
    } catch (err) {
      setCartMessage({ type: "error", text: err?.message || "افزودن به سبد ناموفق بود." });
    } finally {
      setAdding(false);
    }
  };

  const handleAddToWishlist = () => {
    // علاقه‌مندی‌ها هنوز بک‌اند ندارد — فعلاً محلی است
    setCartMessage({ type: "success", text: "به علاقه‌مندی‌ها اضافه شد (محلی)." });
  };

  return (
    <div className="product-info">
      <span className="product-info__badge">{product.badge}</span>
      <h1 className="product-info__title">{product.name}</h1>

      <div className="product-info__rating">
        {product.rating != null ? (
          <>
            <Stars rating={Math.round(product.rating)} />
            <span>({product.rating.toLocaleString("fa-IR")} از ۵)</span>
          </>
        ) : (
          <span>بدون امتیاز</span>
        )}
      </div>

      <p className="product-info__desc">{product.description || "توضیحی برای این محصول ثبت نشده است."}</p>

      <div className="product-info__price">
        {product.oldPrice && (
          <span className="product-info__price-old">{formatPrice(product.oldPrice)}</span>
        )}
        {formatPrice(product.price)}
      </div>

      <div className="product-info__trust">
        <span>
          <FiShield />
          اصالت کالا
        </span>
        <span>
          <FiTruck />
          ارسال سریع
        </span>
        <span>
          <FiRefreshCw />
          ضمانت بازگشت
        </span>
      </div>

      {isPerfume ? (
        <div className="product-info__field">
          <span className="product-info__field-label">گرم مورد نظر خود را وارد کنید (حداقل {MIN_GRAM} گرم)</span>
          <input
            type="number"
            min={MIN_GRAM}
            step={1}
            inputMode="numeric"
            value={gram}
            onChange={handleGramChange}
            onBlur={handleGramBlur}
            className="product-info__gram-input"
          />
        </div>
      ) : (
        <div className="product-info__field">
          <span className="product-info__field-label">تعداد</span>
          <div className="product-info__stepper">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              aria-label="کاهش تعداد"
            >
              <FiMinus />
            </button>
            <span>{quantity.toLocaleString("fa-IR")}</span>
            <button onClick={() => setQuantity((q) => q + 1)} aria-label="افزایش تعداد">
              <FiPlus />
            </button>
          </div>
        </div>
      )}

      {cartMessage && (
        <p
          className={
            cartMessage.type === "success"
              ? "product-info__cart-msg product-info__cart-msg--success"
              : "product-info__cart-msg product-info__cart-msg--error"
          }
        >
          {cartMessage.text}
          {cartMessage.type === "success" && (
            <button type="button" onClick={() => navigate("/Cart")}>مشاهده سبد خرید ←</button>
          )}
        </p>
      )}

      <button
        className="product-info__add-btn"
        onClick={handleAddToCart}
        disabled={outOfStock || adding}
      >
        {outOfStock ? "ناموجود" : adding ? "در حال افزودن..." : "افزودن به سبد خرید"}
        <FiShoppingCart />
      </button>
      <button className="product-info__wishlist-btn" onClick={handleAddToWishlist}>
        افزودن به علاقه‌مندی‌ها
        <FiHeart />
      </button>
    </div>
  );
};

/* =========================================================
   PRODUCT TABS
   ========================================================= */

const ProductTabs = ({ product }) => {
  const [activeTab, setActiveTab] = useState("description");

  const tabs = [
    { id: "description", label: "توضیحات محصول" },
    { id: "specs", label: "مشخصات" },
    { id: "reviews", label: "نظرات کاربران" },
  ];

  const specIcons = {
    "نوع محصول": <FiDroplet />,
    "جنسیت": <FiSun />,
    "موجودی": <FiClock />,
  };

  const quickSpecs = product.specs.filter((s) => specIcons[s.label]);

  return (
    <div className="product-tabs">
      <div className="product-tabs__nav">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={
              activeTab === tab.id
                ? "product-tabs__tab product-tabs__tab--active"
                : "product-tabs__tab"
            }
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="product-tabs__panel">
        {activeTab === "description" && (
          <div className="product-tabs__description">
            <p>{product.longDescription || "توضیحی برای این محصول ثبت نشده است."}</p>
            <div className="product-tabs__specs-box">
              {quickSpecs.map((spec) => (
                <div className="product-tabs__spec-row" key={spec.label}>
                  <div className="product-tabs__spec-text">
                    <span className="product-tabs__spec-label">{spec.label}</span>
                    <span className="product-tabs__spec-value">{spec.value}</span>
                  </div>
                  <span className="product-tabs__spec-icon">{specIcons[spec.label]}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "specs" && (
          <table className="product-tabs__specs-table">
            <tbody>
              {product.specs.map((spec) => (
                <tr key={spec.label}>
                  <th>{spec.label}</th>
                  <td>{spec.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === "reviews" && <ProductReviews productId={product.id} averageRating={product.rating} />}
      </div>
    </div>
  );
};

/* =========================================================
   PRODUCT REVIEWS — لیست نظرها + فرم ثبت نظر برای کاربران
   ========================================================= */

const isLoggedIn = () => Boolean(localStorage.getItem("access") || localStorage.getItem("access_token"));

const ProductReviews = ({ productId, averageRating }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState(null); // {type:'success'|'error', text}

  const loadReviews = () => {
    setLoading(true);
    apiRequest(`/reviews/product/${productId}/`)
      .then((data) => setReviews(Array.isArray(data) ? data : data?.results || []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadReviews();
  }, [productId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitState(null);
    setSubmitting(true);
    apiRequest("/reviews/", {
      method: "POST",
      body: JSON.stringify({ product: productId, rating, text: text.trim() }),
    })
      .then(() => {
        setSubmitState({ type: "success", text: "نظر شما ثبت شد و پس از تأیید مدیر نمایش داده می‌شود." });
        setText("");
        setRating(5);
      })
      .catch((err) => {
        setSubmitState({ type: "error", text: err?.message || "ثبت نظر ناموفق بود." });
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <div className="product-tabs__reviews">
      <div className="product-tabs__reviews-summary">
        {averageRating != null ? (
          <>
            <span className="product-tabs__reviews-score">{averageRating.toLocaleString("fa-IR")}</span>
            <div>
              <Stars rating={Math.round(averageRating)} />
              <span className="product-tabs__reviews-count">میانگین امتیاز کاربران</span>
            </div>
          </>
        ) : (
          <>
            <span className="product-tabs__reviews-score">—</span>
            <div>
              <span className="product-tabs__reviews-count">هنوز امتیازی ثبت نشده است. اولین نفر باشید!</span>
            </div>
          </>
        )}
      </div>

      <section className="product-tabs__review-form">
        <h3 className="product-review-form__title">ثبت نظر شما</h3>
        {isLoggedIn() ? (
          <form onSubmit={handleSubmit}>
            <div className="product-review-form__stars">
              <span>امتیاز شما:</span>
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  className={value <= rating ? "product-review-form__star is-active" : "product-review-form__star"}
                  onClick={() => setRating(value)}
                  aria-label={`${value} ستاره`}
                >
                  <FaStar />
                </button>
              ))}
            </div>
            <textarea
              className="product-review-form__textarea"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="تجربه خود از این محصول را بنویسید..."
              rows={3}
            />
            {submitState && (
              <p className={submitState.type === "success" ? "product-review-form__msg is-success" : "product-review-form__msg is-error"}>
                {submitState.text}
              </p>
            )}
            <button type="submit" className="product-review-form__submit" disabled={submitting}>
              {submitting ? "در حال ثبت..." : "ثبت نظر"}
            </button>
          </form>
        ) : (
          <p className="product-review-form__login-hint">
            برای ثبت نظر ابتدا
            <Link to="/Login" className="product-review-form__login-link"> وارد حساب کاربری </Link>
            شوید.
          </p>
        )}
      </section>

      <div className="product-tabs__reviews-list">
        {loading ? (
          <p className="product-tabs__reviews-count">در حال دریافت نظرها...</p>
        ) : reviews.length ? (
          reviews.map((review) => (
            <div className="product-tabs__review" key={review.id}>
              <div className="product-tabs__review-head">
                <strong>{review.user_name || "کاربر شمین"}</strong>
                <span>{review.created_at ? new Intl.DateTimeFormat("fa-IR", { year: "numeric", month: "short", day: "numeric" }).format(new Date(review.created_at)) : ""}</span>
              </div>
              <Stars rating={Math.round(review.rating)} />
              {review.text && <p>{review.text}</p>}
            </div>
          ))
        ) : (
          <p className="product-tabs__reviews-count">هنوز نظری برای این محصول تأیید نشده است.</p>
        )}
      </div>
    </div>
  );
};

/* =========================================================
   RELATED PRODUCTS
   ========================================================= */

const RelatedProductCard = ({ product }) => {
  const [wishlisted, setWishlisted] = useState(false);

  return (
    <Link to={`/products/${product.id}`} className="related-card">
      <button
        className={
          wishlisted ? "related-card__wishlist related-card__wishlist--active" : "related-card__wishlist"
        }
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setWishlisted((prev) => !prev);
        }}
        aria-label="افزودن به علاقه‌مندی‌ها"
      >
        <FiHeart />
      </button>
      <div className="related-card__media">
        <img src={product.image} alt={product.name} />
      </div>
      <span className="related-card__name">{product.name}</span>
      <span className="related-card__price">{formatPrice(product.price)}</span>
    </Link>
  );
};

const RelatedProducts = ({ products }) => {
  const scrollerRef = useRef(null);

  const scroll = (dir) => {
    scrollerRef.current?.scrollBy({ left: dir * 220, behavior: "smooth" });
  };

  if (!products.length) return null;

  return (
    <section className="related-products">
      <div className="related-products__title">
        <span className="related-products__line" />
        <h2>محصولات مشابه</h2>
      </div>

      <div className="related-products__row">
        <button
          className="related-products__arrow"
          onClick={() => scroll(1)}
          aria-label="محصولات بعدی"
        >
          <FiChevronRight />
        </button>
        <div className="related-products__scroller" ref={scrollerRef}>
          {products.map((p) => (
            <RelatedProductCard product={p} key={p.id} />
          ))}
        </div>
        <button
          className="related-products__arrow"
          onClick={() => scroll(-1)}
          aria-label="محصولات قبلی"
        >
          <FiChevronLeft />
        </button>
      </div>
    </section>
  );
};

/* =========================================================
   PAGE — داده واقعی از /api/products/{id}/
   ========================================================= */

const Product = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError("");
    setProduct(null);
    window.scrollTo(0, 0);
    apiRequest(`/products/${id}/`)
      .then((data) => {
        if (ignore) return;
        const images = (data.images || []).map((img) => getAssetUrl(img.image));
        const mapped = {
          id: data.id,
          category: data.category,
          badge: CATEGORY_LABEL[data.category] || data.category,
          name: data.name,
          brand: typeof data.brand === "string" ? data.brand : "",
          gender: data.gender,
          stock: Number(data.stock || 0),
          rating: data.average_rating != null ? Number(data.average_rating) : null,
          description: data.description || "",
          longDescription: data.description || "",
          price: Number(data.final_price ?? data.price ?? 0),
          oldPrice: Number(data.discount_percent || 0) > 0 ? Number(data.price) : null,
          images: images.length ? images : [FALLBACK_IMAGE],
          specs: [
            { label: "نوع محصول", value: CATEGORY_LABEL[data.category] || data.category },
            { label: "جنسیت", value: GENDER_LABEL[data.gender] || data.gender },
            { label: "برند", value: (typeof data.brand === "string" && data.brand) || "بدون برند" },
            { label: "موجودی", value: Number(data.stock || 0) > 0 ? `${Number(data.stock).toLocaleString("fa-IR")} عدد` : "ناموجود" },
            { label: "قیمت واحد", value: formatPrice(Number(data.final_price ?? data.price ?? 0)) },
            { label: "درصد تخفیف", value: `${Number(data.discount_percent || 0).toLocaleString("fa-IR")}٪` },
          ],
        };
        setProduct(mapped);
      })
      .catch((err) => {
        if (!ignore) setError(err?.message || "خطا در دریافت محصول");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    apiRequest("/products/")
      .then((list) => {
        if (ignore) return;
        const rows = Array.isArray(list) ? list : list?.results || [];
        setRelated(
          rows
            .filter((p) => String(p.id) !== String(id))
            .slice(0, 5)
            .map((p) => ({
              id: p.id,
              name: p.name,
              price: Number(p.final_price ?? p.price ?? 0),
              image: p.main_image ? getAssetUrl(p.main_image) : FALLBACK_IMAGE,
            })),
        );
      })
      .catch(() => {});
    return () => {
      ignore = true;
    };
  }, [id]);

  return (
    <div className="home-page" dir="rtl">
      <Header />
      <main>
        {loading ? (
          <section className="container product-detail">
            <p>در حال دریافت محصول...</p>
          </section>
        ) : error || !product ? (
          <section className="container product-detail">
            <p>{error || "محصول یافت نشد."}</p>
            <Link to="/products" className="product-info__add-btn">بازگشت به لیست محصولات</Link>
          </section>
        ) : (
          <>
            <section className="container product-detail">
              <ProductGallery product={product} />
              <ProductInfo product={product} />
            </section>

            <section className="container">
              <ProductTabs product={product} />
            </section>

            <RelatedProducts products={related} />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Product;
