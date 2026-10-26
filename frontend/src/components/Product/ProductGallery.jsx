import React, { useEffect, useRef, useState } from "react";
import { FiChevronUp, FiChevronDown, FiMaximize2, FiX, FiHeart } from "react-icons/fi";
import { FALLBACK_IMAGE } from "./shared";

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

export default ProductGallery;
