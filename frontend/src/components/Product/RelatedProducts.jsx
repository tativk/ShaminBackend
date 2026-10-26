import React, { useRef, useState } from "react";
import { FiChevronRight, FiChevronLeft, FiHeart } from "react-icons/fi";
import { formatPrice } from "./shared";

const RelatedProductCard = ({ product }) => {
  const [wishlisted, setWishlisted] = useState(false);

  return (
    <a href={`/products/${product.id}`} className="related-card">
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
    </a>
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

export default RelatedProducts;
