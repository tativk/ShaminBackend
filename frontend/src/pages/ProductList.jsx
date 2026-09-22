import React, { useMemo, useState } from "react";
import { FiChevronDown, FiFilter, FiHeart, FiSearch, FiSliders, FiX } from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import { Link } from "react-router-dom";
import { Footer, Header, Hero } from "./Home";
import "./Home.css";
import "./ProductList.css";
import { isFavorite, toggleFavorite } from "../favorites";

const PRODUCTS = [
  { id: 1, name: "رژ لب مدل YSL Rouge Pur Couture", brand: "YSL", category: "لوازم آرایشی", gender: "زنانه", price: 2450000, rating: 5, badge: "پیشنهاد ویژه", image: "/rozh.png" },
  { id: 2, name: "عطر شنل مدل Coco Mademoiselle", brand: "CHANEL", category: "عطر و ادکلن", gender: "زنانه", price: 6490000, rating: 5, image: "/perfuame1.png" },
  { id: 3, name: "کرم مرطوب‌کننده کلینیک Moisture Surge", brand: "CLINIQUE", category: "لوازم آرایشی", gender: "زنانه", price: 2190000, rating: 4, image: "/kerem1.png" },
  { id: 4, name: "عطر دیور مدل Sauvage", brand: "DIOR", category: "عطر و ادکلن", gender: "مردانه", price: 6990000, rating: 5, badge: "پرفروش", image: "/perfuame2.png" },
  { id: 5, name: "پالت سایه چشم NYX", brand: "NYX", category: "لوازم آرایشی", gender: "زنانه", price: 1890000, rating: 4, image: "/arayeshi.png" },
  { id: 6, name: "ریمل حجم‌دهنده essence", brand: "ESSENCE", category: "لوازم آرایشی", gender: "زنانه", price: 990000, rating: 5, image: "/arayeshi2.png" },
  { id: 7, name: "عطر مردانه بلو شنل", brand: "CHANEL", category: "عطر و ادکلن", gender: "مردانه", price: 7350000, rating: 5, image: "/عکس عطر1.png" },
  { id: 8, name: "عطر زنانه لانکوم لاویه بل", brand: "LANCÔME", category: "عطر و ادکلن", gender: "زنانه", price: 5250000, rating: 5, image: "/عکس عطر2.png" },
];

const formatPrice = (value) => `${new Intl.NumberFormat("fa-IR").format(value)} تومان`;

const ProductCard = ({ product }) => {
  const [favorite, setFavorite] = useState(() => isFavorite(product.id));
  const handleFavorite = () => {
    toggleFavorite(product);
    setFavorite((current) => !current);
  };

  return (
  <article className="product-list-card">
    <div className="product-list-card__media">
      {product.badge && <span className="product-list-card__badge">{product.badge}</span>}
      <button type="button" className={`product-list-card__wishlist ${favorite ? "is-active" : ""}`} onClick={handleFavorite} aria-label={favorite ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"}><FiHeart /></button>
      <img src={product.image} alt={product.name} loading="lazy" />
    </div>
    <div className="product-list-card__body">
      <span className="product-list-card__brand">{product.brand}</span>
      <h2>{product.name}</h2>
      <div className="product-list-card__meta">
        <span>{product.gender}</span>
        <span className="product-list-card__stars" aria-label={`امتیاز ${product.rating} از ۵`}>
          {Array.from({ length: 5 }).map((_, index) => <FaStar key={index} className={index < product.rating ? "is-filled" : ""} />)}
        </span>
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
  const [category, setCategory] = useState("همه");
  const [gender, setGender] = useState("همه");
  const [maxPrice, setMaxPrice] = useState(10000000);
  const [sort, setSort] = useState("newest");
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    const result = PRODUCTS.filter((product) => (
      (category === "همه" || product.category === category) &&
      (gender === "همه" || product.gender === gender) &&
      product.price <= maxPrice &&
      (!query || `${product.name} ${product.brand}`.toLocaleLowerCase().includes(query))
    ));
    if (sort === "price-low") return [...result].sort((a, b) => a.price - b.price);
    if (sort === "price-high") return [...result].sort((a, b) => b.price - a.price);
    return result;
  }, [category, gender, maxPrice, search, sort]);

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
            <label className="product-list-field"><span>دسته‌بندی</span><span className="select-control"><select value={category} onChange={(event) => setCategory(event.target.value)}><option>همه</option><option>عطر و ادکلن</option><option>لوازم آرایشی</option></select><FiChevronDown /></span></label>
            <label className="product-list-field"><span>نوع محصول</span><span className="select-control"><select value={gender} onChange={(event) => setGender(event.target.value)}><option>همه</option><option>مردانه</option><option>زنانه</option></select><FiChevronDown /></span></label>
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
            {filteredProducts.length ? <div className="product-list-grid">{filteredProducts.map((product) => <ProductCard product={product} key={product.id} />)}</div> : <div className="product-list-empty"><FiSearch /><h2>محصولی با این فیلترها پیدا نشد</h2><button type="button" onClick={resetFilters}>نمایش همه محصولات</button></div>}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ProductList;