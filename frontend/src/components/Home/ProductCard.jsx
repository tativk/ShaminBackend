import React, { useState } from "react";
import { FiShoppingCart, FiHeart } from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import { apiRequest } from "../../api";
import { notifyCartAdded, notifyCartError } from "../../cart-notice";
import { useWishlist } from "../../context/WishlistContext";

const formatPrice = (value) => new Intl.NumberFormat("fa-IR").format(value) + " تومان";

const Stars = ({ rating }) => (
  <div className="stars" aria-label={`امتیاز ${rating} از ۵`}>
    {Array.from({ length: 5 }).map((_, i) => (
      <FaStar key={i} className={i < rating ? "star star--full" : "star star--empty"} />
    ))}
  </div>
);

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

export default ProductCard;
