import React, { useEffect, useMemo, useState } from "react";
import { FiRefreshCw, FiSearch, FiTag, FiAlertCircle, FiSave, FiXCircle } from "react-icons/fi";
import { apiRequest, getAssetUrl } from "../../api";
import "./admin.css";

const fa = (value) => Number(value || 0).toLocaleString("fa-IR");
const price = (value) => `${fa(Math.round(value))} تومان`;

const DiscountsSection = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [drafts, setDrafts] = useState({}); // {id: discount string}
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    setLoading(true);
    setError("");
    apiRequest("/products/admin/")
      .then((data) => setProducts(Array.isArray(data) ? data : data?.results || []))
      .catch((err) => setError(err?.message || "خطا در دریافت محصولات"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const setDraft = (id, value) =>
    setDrafts((prev) => ({ ...prev, [id]: value.replace(/[^\d]/g, "").slice(0, 3) }));

  const saveDiscount = async (product) => {
    const raw = drafts[product.id];
    const discount = Number(raw === undefined ? product.discount_percent : raw) || 0;
    if (discount > 100) { setError("درصد تخفیف نمی‌تواند بیش از ۱۰۰ باشد."); return; }
    setBusyId(product.id);
    setError("");
    try {
      const data = await apiRequest(`/products/admin/${product.id}/`, {
        method: "PATCH",
        body: JSON.stringify({ discount_percent: discount }),
      });
      setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, ...data } : p)));
      setDrafts((prev) => { const next = { ...prev }; delete next[product.id]; return next; });
    } catch (err) {
      setError(err?.message || "ذخیره تخفیف ناموفق بود.");
    } finally {
      setBusyId(null);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => `${p.name} ${p.brand_name || ""}`.toLowerCase().includes(q));
  }, [products, search]);

  const stats = useMemo(() => ({
    discounted: products.filter((p) => Number(p.discount_percent) > 0).length,
    avg: products.length
      ? Math.round(products.reduce((s, p) => s + Number(p.discount_percent || 0), 0) / products.length)
      : 0,
  }), [products]);

  return (
    <div className="adm-section" dir="rtl">
      <div className="adm-section__head">
        <div>
          <span className="adm-section__kicker"><FiTag /> تخفیف‌ها و پیشنهادها</span>
          <h1 className="adm-section__title">تخفیف‌ها</h1>
          <p className="adm-section__desc">تعیین درصد تخفیف برای محصولات فروشگاه</p>
        </div>
        <button type="button" className="adm-btn" onClick={load}><FiRefreshCw /> بروزرسانی</button>
      </div>

      <div className="adm-cards-row">
        <div className="adm-card-stat"><span>کل محصولات</span><strong>{fa(products.length)}</strong></div>
        <div className="adm-card-stat"><span>تخفیف‌دار</span><strong>{fa(stats.discounted)}</strong></div>
        <div className="adm-card-stat"><span>میانگین تخفیف</span><strong>{fa(stats.avg)}٪</strong></div>
      </div>

      <div className="adm-toolbar">
        <div className="adm-search">
          <FiSearch />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجوی محصول..."
          />
          {search && <button type="button" onClick={() => setSearch("")} aria-label="پاک کردن جستجو"><FiXCircle /></button>}
        </div>
      </div>

      {error && <div className="adm-state adm-state--error"><FiAlertCircle /> <span>{error}</span></div>}

      {loading ? (
        <div className="adm-state"><FiRefreshCw /> <span>در حال دریافت محصولات...</span></div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>محصول</th><th>قیمت اصلی</th><th>تخفیف فعلی</th>
                <th>قیمت با تخفیف</th><th>تخفیف جدید</th><th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const draft = drafts[p.id];
                const current = Number(p.discount_percent || 0);
                const pending = Number(draft === undefined ? current : draft) || 0;
                const finalPrice = Math.round(Number(p.price || 0) * (100 - pending) / 100);
                return (
                  <tr key={p.id}>
                    <td>
                      <div className="adm-product">
                        <img src={getAssetUrl(p.images?.find((i) => i.is_main)?.image || null)} alt="" />
                        <strong>{p.name}</strong>
                      </div>
                    </td>
                    <td>{price(Number(p.price || 0))}</td>
                    <td>
                      {current > 0
                        ? <span className="adm-badge adm-badge--gold">{fa(current)}٪</span>
                        : <span className="adm-badge">بدون تخفیف</span>}
                    </td>
                    <td>{price(finalPrice)}</td>
                    <td>
                      <div className="adm-discount-input">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={draft === undefined ? (current ? fa(current) : "") : (draft ? fa(Number(draft)) : "")}
                          onChange={(e) => setDraft(p.id, e.target.value.replace(/[۰-۹]/g, (c) => "۰۱۲۳۴۵۶۷۸۹".indexOf(c)))}
                          placeholder="۰"
                        />
                        <span>٪</span>
                      </div>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="adm-btn adm-btn--green-soft"
                        disabled={busyId === p.id || (draft === undefined && !current)}
                        onClick={() => saveDiscount(p)}
                      >
                        <FiSave /> {busyId === p.id ? "..." : "ذخیره"}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {!filtered.length && (
                <tr><td colSpan={6} className="adm-table__empty">محصولی پیدا نشد.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DiscountsSection;
