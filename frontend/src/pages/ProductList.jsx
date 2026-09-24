import React, { useEffect, useMemo, useState } from "react";
import { FiChevronDown, FiFilter, FiHeart, FiSearch, FiSliders, FiX } from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import { Link, useSearchParams } from "react-router-dom";
import { apiRequest, getAssetUrl } from "../api";
import { useWishlist } from "../context/WishlistContext";
import { Hero } from "./Home";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import "./Home.css";
import "./ProductList.css";

const CATEGORY_LABEL = { perfume: "عطر و ادکلن", cosmetic: "لوازم آرایشی", accessory: "اکسسوری" };
const GENDER_LABEL = { male: "مردانه", female: "زنانه", unisex: "یونیسکس" };
const FALLBACK_IMAGE = "/logo.png";

const formatPrice = (value) => `${new Intl.NumberFormat("fa-IR").format(value)} تومان`;

const ProductCard = ({ product }) => {
  const { has, toggle } = useWishlist();
  const wishlisted = has(product.id);

  return (
  <article className="product-list-card">
    <div className="product-list-card__media">
      {product.badge && <span className="product-list-card__badge">{product.badge}</span>}
      <button
        type="button"
        className={wishlisted ? "product-list-card__wishlist product-list-card__wishlist--active" : "product-list-card__wishlist"}
        aria-label={wishlisted ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"}
        onClick={() => toggle(product)}
      >
        <FiHeart />
      </button>
      <img src={product.image} alt={product.name} loading="lazy" />
    </div>
    <div className="product-list-card__body">
      {product.brand && <span className="product-list-card__brand">{product.brand}</span>}
      <h2>{product.name}</h2>
      <div className="product-list-card__meta">
        <span>{product.gender}</span>
        {product.rating != null && (
          <span className="product-list-card__stars" aria-label={`امتیاز ${product.rating} از ۵`}>
            {Array.from({ length: 5 }).map((_, index) => <FaStar key={index} className={index < product.rating ? "is-filled" : ""} />)}
          </span>
        )}
      </div>
      <div className="product-list-card__footer">
        <strong>{formatPrice(product.price)}</strong>
        <Link to={`/products/${product.id}`} className="product-list-card__details">مشخصات محصول <span>←</span></Link>
      </div>
    </div>
  </article>
  );
};

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("همه");
  const [gender, setGender] = useState("همه");
  const [maxPrice, setMaxPrice] = useState(10000000);
  const [sort, setSort] = useState("newest");
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchParams] = useSearchParams();

  // لینک‌های دسته‌بندی هدر (مثل /products?category=perfume) فیلتر صفحه را تنظیم می‌کنند
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    const genderParam = searchParams.get("gender");
    if (categoryParam && CATEGORY_LABEL[categoryParam]) setCategory(CATEGORY_LABEL[categoryParam]);
    if (genderParam && GENDER_LABEL[genderParam]) setGender(GENDER_LABEL[genderParam]);
  }, [searchParams]);

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
          category: CATEGORY_LABEL[product.category] || product.category,
          gender: GENDER_LABEL[product.gender] || product.gender,
          price: Number(product.final_price ?? product.price ?? 0),
          rating: null,
          badge: product.discount_percent > 0 ? `${new Intl.NumberFormat("fa-IR").format(product.discount_percent)}٪ تخفیف` : undefined,
          image: product.main_image ? getAssetUrl(product.main_image) : FALLBACK_IMAGE,
        })));
      })
      .catch((err) => { if (!ignore) setError(err?.message || "خطا در دریافت محصولات"); })
      .finally(() => { if (!ignore) setLoading(false); });
    return () => { ignore = true; };
  }, []);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    const result = products.filter((product) => (
      (category === "همه" || product.category === category) &&
      (gender === "همه" || product.gender === gender) &&
      product.price <= maxPrice &&
      (!query || `${product.name} ${product.brand}`.toLocaleLowerCase().includes(query))
    ));
    if (sort === "price-low") return [...result].sort((a, b) => a.price - b.price);
    if (sort === "price-high") return [...result].sort((a, b) => b.price - a.price);
    return result;
  }, [products, category, gender, maxPrice, search, sort]);

  const resetFilters = () => {
    setCategory("همه");
    setGender("همه");
    setMaxPrice(10000000);
    setSort("newest");
    setSearch("");
  };

  return (
    <div className="home-page product-list-page" dir="rtl">
      <Header />
      <main>
        <Hero />
        <section className="container product-list-intro">
          <div>
            <span className="product-list-kicker"><FiSliders /> انتخابی برای سلیقه شما</span>
            <h1>لیست محصولات</h1>
            <p>محصولات اصل و محبوب شمین را با چند انتخاب ساده پیدا کنید.</p>
          </div>
          <span className="product-list-count">{filteredProducts.length.toLocaleString("fa-IR")} محصول</span>
        </section>

        <section className="container product-list-layout" id="products">
          <aside className={`product-list-filters ${filtersOpen ? "is-open" : ""}`}>
            <div className="product-list-filters__head">
              <div><FiFilter /><strong>فیلتر محصولات</strong></div>
              <button type="button" onClick={() => setFiltersOpen(false)} aria-label="بستن فیلترها"><FiX /></button>
            </div>
            <label className="product-list-search"><FiSearch /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="جستجوی محصول یا برند" /></label>
            <label className="product-list-field"><span>دسته‌بندی</span><span className="select-control"><select value={category} onChange={(event) => setCategory(event.target.value)}><option>همه</option><option>عطر و ادکلن</option><option>لوازم آرایشی</option><option>اکسسوری</option></select><FiChevronDown /></span></label>
            <label className="product-list-field"><span>نوع محصول</span><span className="select-control"><select value={gender} onChange={(event) => setGender(event.target.value)}><option>همه</option><option>مردانه</option><option>زنانه</option><option>یونیسکس</option></select><FiChevronDown /></span></label>
            <div className="product-list-field"><div className="product-list-price-label"><span>حداکثر قیمت</span><strong>{formatPrice(maxPrice)}</strong></div><input className="product-list-range" type="range" min="500000" max="10000000" step="250000" value={maxPrice} onChange={(event) => setMaxPrice(Number(event.target.value))} /></div>
            <button type="button" className="product-list-reset" onClick={resetFilters}>پاک کردن فیلترها</button>
          </aside>

          <div className="product-list-results">
            <div className="product-list-toolbar">
              <button type="button" className="product-list-mobile-filter" onClick={() => setFiltersOpen(true)}><FiFilter /> فیلترها</button>
              <span>{filteredProducts.length.toLocaleString("fa-IR")} محصول یافت شد</span>
              <label>مرتب‌سازی <select value={sort} onChange={(event) => setSort(event.target.value)}><option value="newest">جدیدترین</option><option value="price-low">ارزان‌ترین</option><option value="price-high">گران‌ترین</option></select><FiChevronDown /></label>
            </div>
            {filtersOpen && <button type="button" className="product-list-filter-backdrop" onClick={() => setFiltersOpen(false)} aria-label="بستن فیلترها" />}
            {loading ? <div className="product-list-empty"><h2>در حال دریافت محصولات...</h2></div>
            : error ? <div className="product-list-empty"><FiSearch /><h2>خطا در دریافت محصولات</h2><p>{error}</p></div>
            : filteredProducts.length ? <div className="product-list-grid">{filteredProducts.map((product) => <ProductCard product={product} key={product.id} />)}</div> : <div className="product-list-empty"><FiSearch /><h2>محصولی با این فیلترها پیدا نشد</h2><button type="button" onClick={resetFilters}>نمایش همه محصولات</button></div>}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ProductList;