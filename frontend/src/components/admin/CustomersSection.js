import React, { useEffect, useMemo, useState } from "react";
import { FiRefreshCw, FiSearch, FiUsers, FiXCircle, FiCheckCircle, FiAlertCircle } from "react-icons/fi";
import { apiRequest } from "../../api";
import "./admin.css";

const fa = (value) => Number(value || 0).toLocaleString("fa-IR");
const faDate = (iso) =>
  iso ? new Intl.DateTimeFormat("fa-IR", { year: "numeric", month: "short", day: "numeric" }).format(new Date(iso)) : "—";

const CustomersSection = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    setLoading(true);
    setError("");
    apiRequest("/auth/admin/customers/")
      .then((data) => setCustomers(Array.isArray(data) ? data : data?.results || []))
      .catch((err) => setError(err?.message || "خطا در دریافت مشتریان"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const toggleActive = async (customer) => {
    setBusyId(customer.id);
    setError("");
    try {
      const data = await apiRequest(`/auth/admin/customers/${customer.id}/`, {
        method: "PATCH",
        body: JSON.stringify({ is_active: !customer.is_active }),
      });
      setCustomers((prev) => prev.map((c) => (c.id === customer.id ? { ...c, is_active: data.is_active } : c)));
    } catch (err) {
      setError(err?.message || "تغییر وضعیت مشتری ناموفق بود.");
    } finally {
      setBusyId(null);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((c) =>
      `${c.phone} ${c.first_name} ${c.last_name} ${c.email}`.toLowerCase().includes(q),
    );
  }, [customers, search]);

  const stats = useMemo(() => ({
    total: customers.length,
    blocked: customers.filter((c) => !c.is_active).length,
    withOrders: customers.filter((c) => c.orders_count > 0).length,
  }), [customers]);

  return (
    <div className="adm-section" dir="rtl">
      <div className="adm-section__head">
        <div>
          <span className="adm-section__kicker"><FiUsers /> مدیریت مشتریان</span>
          <h1 className="adm-section__title">مشتریان</h1>
          <p className="adm-section__desc">مشاهده و مدیریت کاربران ثبت‌نام‌شده فروشگاه</p>
        </div>
        <button type="button" className="adm-btn" onClick={load}><FiRefreshCw /> بروزرسانی</button>
      </div>

      <div className="adm-cards-row">
        <div className="adm-card-stat"><span>کل مشتریان</span><strong>{fa(stats.total)}</strong></div>
        <div className="adm-card-stat"><span>مشتریان با خرید</span><strong>{fa(stats.withOrders)}</strong></div>
        <div className="adm-card-stat adm-card-stat--danger"><span>مسدود شده</span><strong>{fa(stats.blocked)}</strong></div>
      </div>

      <div className="adm-toolbar">
        <div className="adm-search">
          <FiSearch />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجو بر اساس نام، شماره موبایل یا ایمیل..."
          />
          {search && <button type="button" onClick={() => setSearch("")} aria-label="پاک کردن جستجو"><FiXCircle /></button>}
        </div>
      </div>

      {loading ? (
        <div className="adm-state"><FiRefreshCw /> <span>در حال دریافت مشتریان...</span></div>
      ) : error ? (
        <div className="adm-state adm-state--error"><FiAlertCircle /> <span>{error}</span><button type="button" className="adm-btn" onClick={load}>تلاش مجدد</button></div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>مشتری</th><th>شماره موبایل</th><th>ایمیل</th>
                <th>تاریخ عضویت</th><th>سفارش‌ها</th><th>مجموع خرید</th><th>وضعیت</th><th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className={c.is_active ? "" : "adm-row--blocked"}>
                  <td>
                    <div className="adm-customer">
                      <span className="adm-avatar">{`${c.first_name} ${c.last_name}`.trim().charAt(0) || "م"}</span>
                      <strong>{`${c.first_name} ${c.last_name}`.trim() || "بدون نام"}</strong>
                    </div>
                  </td>
                  <td dir="ltr">{c.phone}</td>
                  <td>{c.email || "—"}</td>
                  <td>{faDate(c.date_joined)}</td>
                  <td>{fa(c.orders_count)}</td>
                  <td>{fa(Math.round(c.total_spent))} تومان</td>
                  <td>
                    <span className={c.is_active ? "adm-badge adm-badge--green" : "adm-badge adm-badge--red"}>
                      {c.is_active ? "فعال" : "مسدود"}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className={c.is_active ? "adm-btn adm-btn--danger-soft" : "adm-btn adm-btn--green-soft"}
                      disabled={busyId === c.id}
                      onClick={() => toggleActive(c)}
                    >
                      {c.is_active ? <><FiXCircle /> مسدودسازی</> : <><FiCheckCircle /> فعال‌سازی</>}
                    </button>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr><td colSpan={8} className="adm-table__empty">مشتری‌ای پیدا نشد.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CustomersSection;
