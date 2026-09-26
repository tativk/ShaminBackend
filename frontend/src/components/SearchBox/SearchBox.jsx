import React, { useEffect, useRef, useState } from "react";
import { FiChevronLeft, FiSearch, FiX } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest, getAssetUrl } from "../../api";
import "./SearchBox.css";

const CATEGORY_LABEL = { perfume: "عطر و ادکلن", cosmetic: "لوازم آرایشی", accessory: "اکسسوری" };
const GENDER_LABEL = { male: "مردانه", female: "زنانه", unisex: "یونیسکس" };
const FALLBACK_IMAGE = "/logo.png";

const MIN_QUERY_LENGTH = 2;
const MAX_RESULTS = 6;
const DEBOUNCE_MS = 300;

const SUGGESTIONS = ["عطر مردانه", "عطر زنانه", "رژ لب", "کرم", "ساعت مچی", "اتو مو"];

const faNumber = (value) => new Intl.NumberFormat("fa-IR").format(Math.round(Number(value) || 0));
const formatPrice = (value) => `${faNumber(value)} تومان`;

const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/* هایلایت توکن‌های عبارت جستجو داخل نام محصول */
const Highlight = ({ text, query }) => {
  const tokens = (query || "")
    .trim()
    .split(/\s+/)
    .filter((token) => token.length >= 2)
    .map(escapeRegExp);
  if (!tokens.length) return text;
  const pattern = new RegExp(`(${tokens.join("|")})`, "gi");
  return text
    .split(pattern)
    .map((part, index) => (index % 2 === 1 ? <mark key={index}>{part}</mark> : part));
};

const SearchSkeleton = () => (
  <div className="searchbox__state">
    {[0, 1, 2].map((row) => (
      <div className="searchbox-skeleton" key={row}>
        <span className="searchbox-skeleton__thumb" />
        <span className="searchbox-skeleton__lines">
          <span className="searchbox-skeleton__line" />
          <span className="searchbox-skeleton__line searchbox-skeleton__line--short" />
        </span>
      </div>
    ))}
  </div>
);

const SearchBox = ({ variant = "desktop", onNavigate }) => {
  const isMobile = variant === "mobile";
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const trimmed = query.trim();
  const canSearch = trimmed.length >= MIN_QUERY_LENGTH;

  /* جستجوی زنده با debounce و لغو درخواست‌های قبلی */
  useEffect(() => {
    if (!canSearch) {
      setStatus("idle");
      setResults([]);
      setTotalCount(0);
      return undefined;
    }
    const controller = new AbortController();
    setStatus("loading");
    const timer = setTimeout(() => {
      apiRequest(`/products/?search=${encodeURIComponent(trimmed)}`, { signal: controller.signal })
        .then((data) => {
          const rows = Array.isArray(data) ? data : data?.results || [];
          setResults(rows.slice(0, MAX_RESULTS));
          setTotalCount(Array.isArray(data) ? rows.length : data?.count ?? rows.length);
          setStatus("done");
        })
        .catch((error) => {
          if (error?.name === "AbortError") return;
          setStatus("error");
        });
    }, DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [trimmed, canSearch]);

  useEffect(() => setActiveIndex(-1), [trimmed]);

  /* بستن پنل با کلیک بیرون (فقط دسکتاپ) */
  useEffect(() => {
    if (isMobile || !open) return undefined;
    const handlePointer = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("touchstart", handlePointer);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("touchstart", handlePointer);
    };
  }, [isMobile, open]);

  const goToProduct = (product) => {
    setOpen(false);
    navigate(`/products/${product.id}`);
    onNavigate?.();
  };

  const goToAllResults = () => {
    setOpen(false);
    navigate(`/products?search=${encodeURIComponent(trimmed)}`);
    onNavigate?.();
  };

  const clearQuery = () => {
    setQuery("");
    setResults([]);
    setTotalCount(0);
    setStatus("idle");
    inputRef.current?.focus();
  };

  const onKeyDown = (event) => {
    if (event.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
      return;
    }
    if (!results.length) {
      if (event.key === "Enter" && canSearch) {
        event.preventDefault();
        goToAllResults();
      }
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % results.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => (current - 1 + results.length) % results.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const product = results[activeIndex];
      if (product) goToProduct(product);
      else goToAllResults();
    }
  };

  const showPanel = isMobile ? canSearch : open;

  const panel = (
    <div
      className={`searchbox__panel${isMobile ? " searchbox__panel--inline" : ""}`}
      id="header-search-results"
      role="listbox"
      aria-label="نتایج جستجوی محصولات"
    >
      {status === "loading" && <SearchSkeleton />}

      {status === "error" && (
        <div className="searchbox__empty">
          <p>خطا در ارتباط با سرور</p>
          <span>لطفاً دوباره تلاش کنید</span>
        </div>
      )}

      {status === "done" && results.length === 0 && (
        <div className="searchbox__empty">
          <FiSearch />
          <p>نتیجه‌ای برای «{trimmed}» پیدا نشد</p>
          <span>نام برند یا دسته‌بندی مثل «عطر مردانه» را امتحان کنید</span>
        </div>
      )}

      {status === "done" && results.length > 0 && (
        <>
          <ul className="searchbox__list">
            {results.map((product, index) => {
              const price = Number(product.price ?? 0);
              const finalPrice = Number(product.final_price ?? price);
              return (
                <li key={product.id}>
                  <Link
                    to={`/products/${product.id}`}
                    className={`searchbox__item${index === activeIndex ? " is-active" : ""}`}
                    role="option"
                    aria-selected={index === activeIndex}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={onNavigate}
                  >
                    <img
                      className="searchbox__thumb"
                      src={product.main_image ? getAssetUrl(product.main_image) : FALLBACK_IMAGE}
                      alt={product.name}
                      loading="lazy"
                    />
                    <span className="searchbox__info">
                      <span className="searchbox__name">
                        <Highlight text={product.name} query={query} />
                      </span>
                      <span className="searchbox__tags">
                        {product.brand ? <span className="searchbox__brand">{product.brand}</span> : null}
                        <span className="searchbox__tag">
                          {CATEGORY_LABEL[product.category] || product.category}
                        </span>
                        <span className="searchbox__tag searchbox__tag--soft">
                          {GENDER_LABEL[product.gender] || product.gender}
                        </span>
                      </span>
                    </span>
                    <span className="searchbox__price">
                      {finalPrice < price && <del>{formatPrice(price)}</del>}
                      <strong>{formatPrice(finalPrice)}</strong>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <button type="button" className="searchbox__view-all" onClick={goToAllResults}>
            <span>مشاهده همه نتایج</span>
            <span className="searchbox__count">{faNumber(totalCount)} محصول</span>
            <FiChevronLeft />
          </button>
        </>
      )}

      {!isMobile && status === "idle" && trimmed.length === 0 && (
        <div className="searchbox__suggest">
          <span className="searchbox__suggest-title">جستجوهای پرطرفدار</span>
          <div className="searchbox__suggest-chips">
            {SUGGESTIONS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setQuery(item);
                  inputRef.current?.focus();
                }}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}

      {!isMobile && status === "idle" && trimmed.length === 1 && (
        <div className="searchbox__hint">برای جستجو حداقل ۲ نویسه وارد کنید…</div>
      )}
    </div>
  );

  return (
    <div className={`searchbox searchbox--${variant}`} ref={rootRef}>
      <div className={isMobile ? "mobile-menu__search" : "header__search"}>
        <FiSearch className="header__search-icon" />
        <input
          ref={inputRef}
          type="text"
          placeholder="جستجو در محصولات..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          role="combobox"
          aria-expanded={showPanel}
          aria-controls="header-search-results"
          aria-autocomplete="list"
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            className="searchbox__clear"
            aria-label="پاک کردن جستجو"
            onClick={clearQuery}
          >
            <FiX />
          </button>
        )}
      </div>
      {showPanel && panel}
    </div>
  );
};

export default SearchBox;
