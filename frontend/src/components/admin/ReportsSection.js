import React, { useEffect, useMemo, useState } from "react";
import { FiBarChart2, FiRefreshCw, FiAlertCircle, FiArrowUp, FiArrowDown } from "react-icons/fi";
import { apiRequest } from "../../api";
import "./admin.css";

const fa = (value) => Number(value || 0).toLocaleString("fa-IR");

const PERIODS = [
  { key: "today", label: "امروز" },
  { key: "week", label: "۷ روز اخیر" },
  { key: "month", label: "۳۰ روز اخیر" },
  { key: "quarter", label: "۳ ماه اخیر" },
];

const STATUS_LABELS = {
  pending: "در انتظار پرداخت",
  paid: "پرداخت شده",
  shipping: "در حال ارسال",
  completed: "تحویل شده",
  failed: "ناموفق",
  cancelled: "لغو شده",
};

const ReportsSection = () => {
  const [period, setPeriod] = useState("month");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    setError("");
    apiRequest(`/orders/admin/stats/?period=${period}`)
      .then((data) => setStats(data))
      .catch((err) => setError(err?.message || "خطا در دریافت گزارش‌ها"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [period]);

  const statusRows = useMemo(() => {
    if (!stats?.status_counts) return [];
    return Object.entries(stats.status_counts)
      .map(([key, count]) => ({ key, label: STATUS_LABELS[key] || key, count: Number(count || 0) }))
      .sort((a, b) => b.count - a.count);
  }, [stats]);

  const statusTotal = statusRows.reduce((s, r) => s + r.count, 0) || 1;

  const chartRows = useMemo(() => {
    const points = stats?.chart?.points || [];
    if (!points.length) return [];
    const max = Math.max(...points.map((p) => Number(p.total || 0)), 1);
    return points.map((p) => ({
      label: p.hour != null ? `${fa(p.hour)}:۰۰` : new Intl.DateTimeFormat("fa-IR", { month: "short", day: "numeric" }).format(new Date(p.date)),
      total: Number(p.total || 0),
      percent: Math.round((Number(p.total || 0) / max) * 100),
    }));
  }, [stats]);

  return (
    <div className="adm-section" dir="rtl">
      <div className="adm-section__head">
        <div>
          <span className="adm-section__kicker"><FiBarChart2 /> گزارش‌ها</span>
          <h1 className="adm-section__title">گزارش فروش</h1>
          <p className="adm-section__desc">عملکرد فروشگاه در بازه‌های زمانی مختلف</p>
        </div>
        <div className="adm-periods">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              type="button"
              className={period === p.key ? "adm-btn adm-btn--active" : "adm-btn"}
              onClick={() => setPeriod(p.key)}
            >
              {p.label}
            </button>
          ))}
          <button type="button" className="adm-btn" onClick={load} aria-label="بروزرسانی"><FiRefreshCw /></button>
        </div>
      </div>

      {loading ? (
        <div className="adm-state"><FiRefreshCw /> <span>در حال دریافت گزارش...</span></div>
      ) : error ? (
        <div className="adm-state adm-state--error"><FiAlertCircle /> <span>{error}</span><button type="button" className="adm-btn" onClick={load}>تلاش مجدد</button></div>
      ) : (
        <>
          <div className="adm-cards-row">
            <div className="adm-card-stat">
              <span>فروش بازه انتخابی</span>
              <strong>{fa(Math.round(stats?.chart?.period_total || 0))} <small>تومان</small></strong>
            </div>
            <div className="adm-card-stat">
              <span>سفارش‌های امروز</span>
              <strong>{fa(stats?.cards?.orders_today)}</strong>
            </div>
            <div className="adm-card-stat">
              <span>مشتریان</span>
              <strong>{fa(stats?.cards?.customers)}</strong>
            </div>
            <div className="adm-card-stat">
              <span>سفارش‌های در انتظار</span>
              <strong>{fa(stats?.quick?.pending_orders)}</strong>
            </div>
          </div>

          <div className="adm-panels-row">
            <section className="adm-panel">
              <h2 className="adm-panel__title">فروش در بازه</h2>
              <div className="adm-bars">
                {chartRows.map((row) => (
                  <div className="adm-bars__row" key={row.label}>
                    <span className="adm-bars__label">{row.label}</span>
                    <div className="adm-bars__track">
                      <span className="adm-bars__fill" style={{ width: `${Math.max(row.percent, 2)}%` }} />
                    </div>
                    <span className="adm-bars__value">{fa(Math.round(row.total))}</span>
                  </div>
                ))}
                {!chartRows.length && <p className="adm-table__empty">فروشی در این بازه ثبت نشده است.</p>}
              </div>
              {stats?.chart?.sales_growth_percent != null && (
                <p className={`adm-growth ${stats.chart.sales_growth_percent >= 0 ? "adm-growth--up" : "adm-growth--down"}`}>
                  {stats.chart.sales_growth_percent >= 0 ? <FiArrowUp /> : <FiArrowDown />}
                  رشد نسبت به بازه قبل: {fa(Math.abs(stats.chart.sales_growth_percent))}٪
                </p>
              )}
            </section>

            <section className="adm-panel">
              <h2 className="adm-panel__title">وضعیت سفارش‌های امروز</h2>
              <table className="adm-table adm-table--compact">
                <thead><tr><th>وضعیت</th><th>تعداد</th><th>سهم</th></tr></thead>
                <tbody>
                  {statusRows.map((row) => (
                    <tr key={row.key}>
                      <td>{row.label}</td>
                      <td>{fa(row.count)}</td>
                      <td>
                        <div className="adm-share">
                          <span style={{ width: `${Math.round((row.count / statusTotal) * 100)}%` }} />
                          <b>{fa(Math.round((row.count / statusTotal) * 100))}٪</b>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!statusRows.length && <tr><td colSpan={3} className="adm-table__empty">سفارشی ثبت نشده است.</td></tr>}
                </tbody>
              </table>
            </section>
          </div>

          <section className="adm-panel">
            <h2 className="adm-panel__title">پرفروش‌ترین محصولات</h2>
            <table className="adm-table">
              <thead><tr><th>#</th><th>محصول</th><th>تعداد فروش</th><th>درآمد</th><th>موجودی</th></tr></thead>
              <tbody>
                {(stats?.top_products || []).map((p, i) => (
                  <tr key={p.id || i}>
                    <td>{fa(i + 1)}</td>
                    <td><strong>{p.name}</strong></td>
                    <td>{fa(p.sold)}</td>
                    <td>{fa(p.revenue)} تومان</td>
                    <td>{fa(p.stock)}</td>
                  </tr>
                ))}
                {!(stats?.top_products || []).length && (
                  <tr><td colSpan={5} className="adm-table__empty">فروشی ثبت نشده است.</td></tr>
                )}
              </tbody>
            </table>
          </section>
        </>
      )}
    </div>
  );
};

export default ReportsSection;
