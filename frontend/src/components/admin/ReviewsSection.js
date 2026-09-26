import React, { useEffect, useMemo, useState } from "react";
import { FiRefreshCw, FiStar, FiAlertCircle, FiCheckCircle, FiXCircle, FiTrash2, FiMessageSquare } from "react-icons/fi";
import { apiRequest } from "../../api";
import "./admin.css";

const fa = (value) => Number(value || 0).toLocaleString("fa-IR");
const faDate = (iso) =>
  iso ? new Intl.DateTimeFormat("fa-IR", { year: "numeric", month: "short", day: "numeric" }).format(new Date(iso)) : "—";

const FILTERS = [
  { key: "all", label: "همه" },
  { key: "pending", label: "در انتظار تأیید" },
  { key: "approved", label: "تأییدشده" },
];

const Stars = ({ rating }) => (
  <span className="adm-stars">
    {Array.from({ length: 5 }).map((_, i) => (
      <FiStar key={i} className={i < rating ? "is-filled" : ""} />
    ))}
  </span>
);

const ReviewsSection = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    setLoading(true);
    setError("");
    apiRequest("/reviews/")
      .then((data) => setReviews(Array.isArray(data) ? data : data?.results || []))
      .catch((err) => setError(err?.message || "خطا در دریافت نظرها"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const moderate = async (review, approved) => {
    setBusyId(review.id);
    setError("");
    try {
      const data = await apiRequest(`/reviews/${review.id}/moderate/`, {
        method: "PATCH",
        body: JSON.stringify({ is_approved: approved }),
      });
      setReviews((prev) => prev.map((r) => (r.id === review.id ? { ...r, is_approved: data.is_approved } : r)));
    } catch (err) {
      setError(err?.message || "تغییر وضعیت نظر ناموفق بود.");
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (review) => {
    if (!window.confirm("آیا از حذف این نظر مطمئن هستید؟")) return;
    setBusyId(review.id);
    setError("");
    try {
      await apiRequest(`/reviews/${review.id}/`, { method: "DELETE" });
      setReviews((prev) => prev.filter((r) => r.id !== review.id));
    } catch (err) {
      setError(err?.message || "حذف نظر ناموفق بود.");
    } finally {
      setBusyId(null);
    }
  };

  const filtered = useMemo(() => {
    if (filter === "pending") return reviews.filter((r) => !r.is_approved);
    if (filter === "approved") return reviews.filter((r) => r.is_approved);
    return reviews;
  }, [reviews, filter]);

  const stats = useMemo(() => ({
    total: reviews.length,
    pending: reviews.filter((r) => !r.is_approved).length,
    approved: reviews.filter((r) => r.is_approved).length,
  }), [reviews]);

  return (
    <div className="adm-section" dir="rtl">
      <div className="adm-section__head">
        <div>
          <span className="adm-section__kicker"><FiMessageSquare /> مدیریت نظرها</span>
          <h1 className="adm-section__title">نظرهای مشتریان</h1>
          <p className="adm-section__desc">تأیید، رد یا حذف نظرهای ثبت‌شده برای محصولات</p>
        </div>
        <button type="button" className="adm-btn" onClick={load}><FiRefreshCw /> بروزرسانی</button>
      </div>

      <div className="adm-cards-row">
        <div className="adm-card-stat"><span>کل نظرها</span><strong>{fa(stats.total)}</strong></div>
        <div className="adm-card-stat adm-card-stat--gold"><span>در انتظار تأیید</span><strong>{fa(stats.pending)}</strong></div>
        <div className="adm-card-stat"><span>تأییدشده</span><strong>{fa(stats.approved)}</strong></div>
      </div>

      <div className="adm-filters">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            className={filter === f.key ? "adm-btn adm-btn--active" : "adm-btn"}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && <div className="adm-state adm-state--error"><FiAlertCircle /> <span>{error}</span></div>}

      {loading ? (
        <div className="adm-state"><FiRefreshCw /> <span>در حال دریافت نظرها...</span></div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>محصول</th><th>کاربر</th><th>امتیاز</th><th>متن نظر</th>
                <th>تاریخ</th><th>وضعیت</th><th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className={r.is_approved ? "" : "adm-row--pending"}>
                  <td><strong>{r.product_name || `محصول #${r.product}`}</strong></td>
                  <td>
                    <div className="adm-customer">
                      <span className="adm-avatar">{(r.user_name || r.user_phone || "م").charAt(0)}</span>
                      <div>
                        <strong>{r.user_name || "بدون نام"}</strong>
                        <small dir="ltr">{r.user_phone}</small>
                      </div>
                    </div>
                  </td>
                  <td><Stars rating={r.rating} /></td>
                  <td className="adm-review-text">{r.text || "—"}</td>
                  <td>{faDate(r.created_at)}</td>
                  <td>
                    <span className={r.is_approved ? "adm-badge adm-badge--green" : "adm-badge adm-badge--gold"}>
                      {r.is_approved ? "تأییدشده" : "در انتظار"}
                    </span>
                  </td>
                  <td>
                    <div className="adm-actions">
                      {r.is_approved ? (
                        <button type="button" className="adm-btn adm-btn--danger-soft" disabled={busyId === r.id} onClick={() => moderate(r, false)}>
                          <FiXCircle /> رد
                        </button>
                      ) : (
                        <button type="button" className="adm-btn adm-btn--green-soft" disabled={busyId === r.id} onClick={() => moderate(r, true)}>
                          <FiCheckCircle /> تأیید
                        </button>
                      )}
                      <button type="button" className="adm-btn adm-btn--danger-soft" disabled={busyId === r.id} onClick={() => remove(r)}>
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr><td colSpan={7} className="adm-table__empty">نظری در این دسته وجود ندارد.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ReviewsSection;
