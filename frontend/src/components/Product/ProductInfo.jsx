import React, { useState } from "react";
import { FiShoppingCart, FiHeart, FiShield, FiTruck, FiRefreshCw, FiMinus, FiPlus } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../api";
import { notifyCartAdded } from "../../cart-notice";
import { useWishlist } from "../../context/WishlistContext";
import { formatPrice, Stars } from "./shared";

/* گرم‌های مجاز سفارش عطر — فقط همین گزینه‌ها؛ بالای ۳۰ گرم ارسال رایگان است */
const PERFUME_GRAMS = [10, 15, 20, 30, 50, 100];

const ProductInfo = ({ product }) => {
  const navigate = useNavigate();
  const { has: wishHas, toggle: wishToggle } = useWishlist();
  const isPerfume = product.category === "perfume";
  const outOfStock = product.stock <= 0;
  const [gram, setGram] = useState(PERFUME_GRAMS[0]);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [cartMessage, setCartMessage] = useState(null); // {type:'success'|'error', text}
  const wishlisted = wishHas(product.id);

  const handleAddToCart = async () => {
    if (outOfStock || adding) return;
    setAdding(true);
    setCartMessage(null);
    try {
      // برای عطر، گرم انتخاب‌شده (از گزینه‌های ثابت) همان تعداد واحد سبد است؛
      // بالای ۳۰ گرم، هزینه ارسال در بک‌اند صفر می‌شود.
      const data = await apiRequest("/cart/items/", {
        method: "POST",
        body: JSON.stringify({ product: product.id, quantity: isPerfume ? gram : quantity }),
      });
      notifyCartAdded({
        added: isPerfume ? gram : quantity,
        totalItems: data?.total_items,
        productName: product.name,
      });
    } catch (err) {
      if (/Authentication credentials/i.test(err?.message || "")) {
        setCartMessage({ type: "error", text: "برای افزودن به سبد خرید ابتدا وارد حساب خود شوید." });
        navigate("/Login");
      } else {
        setCartMessage({ type: "error", text: err?.message || "افزودن به سبد ناموفق بود." });
      }
    } finally {
      setAdding(false);
    }
  };

  const handleAddToWishlist = () => {
    const added = wishToggle(product);
    setCartMessage({
      type: "success",
      text: added ? "به علاقه‌مندی‌ها اضافه شد." : "از علاقه‌مندی‌ها حذف شد.",
    });
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
          <span className="product-info__field-label">مقدار عطر را انتخاب کنید (گرم)</span>
          <div className="product-info__gram-options" role="radiogroup" aria-label="انتخاب گرم عطر">
            {PERFUME_GRAMS.map((option) => (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={gram === option}
                className={[
                  "product-info__gram-option",
                  gram === option ? "is-active" : "",
                ].filter(Boolean).join(" ")}
                onClick={() => setGram(option)}
              >
                {option.toLocaleString("fa-IR")}
                {option > 30 && <em>ارسال رایگان</em>}
              </button>
            ))}
          </div>
          <small className="product-info__free-shipping-hint">
            <FiTruck /> ارسال رایگان برای بالای ۳۰ گرم هر عطر
          </small>
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
      <button
        className={
          wishlisted
            ? "product-info__wishlist-btn product-info__wishlist-btn--active"
            : "product-info__wishlist-btn"
        }
        onClick={handleAddToWishlist}
      >
        {wishlisted ? "در علاقه‌مندی‌هاست — حذف" : "افزودن به علاقه‌مندی‌ها"}
        <FiHeart />
      </button>
    </div>
  );
};

export default ProductInfo;
