import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import { apiRequest } from "../../api";
import { isLoggedIn, Stars } from "./shared";

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

export default ProductReviews;
