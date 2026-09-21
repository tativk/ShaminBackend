import React, { useEffect, useState } from "react";
import {
  FiArrowLeft,
  FiArrowUp,
  FiArrowDown,
  FiBox,
  FiShoppingBag,
  FiUsers,
  FiDollarSign,
  FiMoreHorizontal,
  FiClock,
  FiCheckCircle,
  FiTruck,
  FiAlertCircle,
  FiStar,
  FiEye,
  FiBarChart2,
  FiCalendar,
  FiChevronDown,
  FiRefreshCw,
  FiXCircle,
} from "react-icons/fi";

import { apiRequest } from "../api";
import "./Dashboard.css";

const fa = (value) => Number(value || 0).toLocaleString("fa-IR");

const PERIOD_API = { "امروز": "today", "این هفته": "week", "این ماه": "month", "این فصل": "quarter" };
const PERIOD_OPTIONS = ["امروز", "این هفته", "این ماه", "این فصل"];

const STATUS_META = {
  completed: { label: "تکمیل شده", icon: FiCheckCircle, ring: "completed", item: "completed" },
  shipping: { label: "در حال ارسال", icon: FiTruck, ring: "shipping", item: "shipping" },
  paid: { label: "پرداخت شده", icon: FiDollarSign, ring: "paid", item: "paid" },
  pending: { label: "در انتظار", icon: FiClock, ring: "pending", item: "pending" },
  failed: { label: "ناموفق", icon: FiAlertCircle, ring: "failed", item: "failed" },
  cancelled: { label: "لغو شده", icon: FiXCircle, ring: "cancelled", item: "cancelled" },
};
const RING_ORDER = ["completed", "shipping", "paid", "pending", "cancelled", "failed"];

const CATEGORY_LABEL = { perfume: "عطر", cosmetic: "لوازم آرایشی", accessory: "اکسسوری" };

const faRel = (iso) => {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60000) return "همین الان";
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${fa(m)} دقیقه پیش`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${fa(h)} ساعت پیش`;
  const d = Math.floor(h / 24);
  if (d === 1) return "دیروز";
  if (d < 30) return `${fa(d)} روز پیش`;
  return new Intl.DateTimeFormat("fa-IR", { year: "numeric", month: "short", day: "numeric" }).format(new Date(iso));
};

const hourLabel = (hour) => {
  if (hour === 0) return "۱۲ شب";
  if (hour === 12) return "۱۲ ظهر";
  return hour < 12 ? `${fa(hour)} صبح` : `${fa(hour - 12)} بعدازظهر`;
};

const pointLabel = (point, index) => {
  if (point.hour != null) return hourLabel(point.hour);
  const date = new Date(point.date);
  if (PERIOD_CURRENT === "این هفته") return new Intl.DateTimeFormat("fa-IR", { weekday: "long" }).format(date);
  if (PERIOD_CURRENT === "این فصل") return new Intl.DateTimeFormat("fa-IR", { month: "long" }).format(date);
  return new Intl.DateTimeFormat("fa-IR", { month: "short", day: "numeric" }).format(date);
};

// برچسب بازه جاری برای ساخت لیبل نقاط نمودار — قبل از رندر ست می‌شود
let PERIOD_CURRENT = "این هفته";

function Dashboard() {
  const [shaminOpenStatMenu, setShaminOpenStatMenu] = useState(null);
  const [shaminChartHover, setShaminChartHover] = useState(null);
  const [shaminPeriodOpen, setShaminPeriodOpen] = useState(false);
  const [shaminSelectedPeriod, setShaminSelectedPeriod] = useState("این هفته");
  const [shaminStatusHover, setShaminStatusHover] = useState(null);

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError("");
    apiRequest(`/orders/admin/stats/?period=${PERIOD_API[shaminSelectedPeriod]}`)
      .then((data) => { if (!ignore) setStats(data); })
      .catch((err) => { if (!ignore) setError(err?.message || "خطا در دریافت آمار"); })
      .finally(() => { if (!ignore) setLoading(false); });
    return () => { ignore = true; };
  }, [shaminSelectedPeriod]);

  PERIOD_CURRENT = shaminSelectedPeriod;

  const cards = stats?.cards || {};
  const quick = stats?.quick || {};
  const chartData = stats?.chart || {};
  const statusCounts = stats?.status_counts || {};

  const shaminOverviewStats = [
    {
      id: "sales",
      title: "فروش امروز",
      value: fa(cards.sales_today),
      unit: "تومان",
      change: chartData.sales_growth_percent != null ? `${fa(Math.abs(chartData.sales_growth_percent))}٪` : null,
      trend: (chartData.sales_growth_percent || 0) >= 0 ? "up" : "down",
      icon: FiDollarSign,
      caption: chartData.sales_growth_percent != null ? "نسبت به بازه قبل" : "مجموع فروش امروز",
    },
    {
      id: "orders",
      title: "سفارش‌های امروز",
      value: fa(cards.orders_today),
      unit: "سفارش",
      change: null,
      trend: "up",
      icon: FiShoppingBag,
      caption: "سفارش ثبت‌شده امروز",
    },
    {
      id: "customers",
      title: "مشتریان",
      value: fa(cards.customers),
      unit: "نفر",
      change: null,
      trend: "up",
      icon: FiUsers,
      caption: "کاربران ثبت‌نام‌شده",
    },
    {
      id: "products",
      title: "محصولات فعال",
      value: fa(cards.active_products),
      unit: "محصول",
      change: quick.low_stock_count ? `${fa(quick.low_stock_count)} محصول` : null,
      trend: "down",
      icon: FiBox,
      caption: quick.low_stock_count ? "نیازمند بررسی موجودی" : "محصولات فعال فروشگاه",
    },
  ];

  const shaminQuickMetrics = [
    { id: "avg", label: "میانگین ارزش سفارش", value: fa(Math.round(quick.avg_order_value || 0)), unit: "تومان", icon: FiDollarSign },
    { id: "rate", label: "نرخ تکمیل سفارش", value: quick.completion_rate != null ? `${fa(quick.completion_rate)}٪` : "—", unit: "", icon: FiCheckCircle },
    { id: "stock", label: "محصولات کم‌موجودی", value: fa(quick.low_stock_count || 0), unit: "محصول", icon: FiAlertCircle },
    { id: "pending", label: "سفارش‌های در انتظار", value: fa(quick.pending_orders || 0), unit: "سفارش", icon: FiClock },
  ];

  // نقاط نمودار — برای بازه ماه، روزها سمت کلاینت به ۶ سگمنت تقسیم می‌شوند
  const chartPointsRaw = chartData.points || [];
  const shaminSalesData = (() => {
    if (PERIOD_API[shaminSelectedPeriod] !== "month") {
      return chartPointsRaw.map((point) => ({ label: pointLabel(point), sales: point.total }));
    }
    const bucketSize = Math.max(1, Math.ceil(chartPointsRaw.length / 6));
    const buckets = [];
    for (let i = 0; i < chartPointsRaw.length; i += bucketSize) {
      const slice = chartPointsRaw.slice(i, i + bucketSize);
      buckets.push({
        label: `هفته ${fa(buckets.length + 1)}`,
        sales: slice.reduce((sum, p) => sum + p.total, 0),
      });
    }
    return buckets;
  })();

  const salesMax = Math.max(...shaminSalesData.map((item) => item.sales), 1) * 1.15;

  const shaminChartPoints = shaminSalesData.map((item, index) => {
    const chartWidth = 700;
    const chartHeight = 150;
    const x = shaminSalesData.length === 1 ? chartWidth / 2 : (index / (shaminSalesData.length - 1)) * chartWidth;
    const salesY = 220 - (item.sales / salesMax) * chartHeight;
    return { x, salesY, index, label: item.label, sales: item.sales };
  });

  const shaminRecentOrders = (stats?.recent_orders || []).map((order) => ({
    id: `#SH-${order.id}`,
    customer: order.customer || "مشتری",
    product: order.items?.[0]?.product_name || "—",
    items: (order.items || []).reduce((sum, item) => sum + item.quantity, 0),
    amount: fa(order.total_price),
    status: order.status,
    statusLabel: (STATUS_META[order.status] || STATUS_META.pending).label,
    time: faRel(order.created_at),
  }));

  const shaminTopProducts = (stats?.top_products || []).map((product, index) => ({
    id: product.id,
    name: product.name,
    category: CATEGORY_LABEL[product.category] || product.category,
    sales: product.sold,
    stock: product.stock,
    revenue: fa(product.revenue),
    rank: String(index + 1).padStart(2, "0"),
    stockLow: product.stock <= 5,
  }));

  const statusEntries = RING_ORDER
    .map((key) => ({ key, ...STATUS_META[key], count: statusCounts[key] || 0 }))
    .filter((entry) => entry.count > 0);
  const totalToday = statusEntries.reduce((sum, entry) => sum + entry.count, 0);
  const ringSegments = (() => {
    let cumulative = 0;
    return statusEntries.map((entry) => {
      const percent = totalToday ? (entry.count / totalToday) * 100 : 0;
      const segment = {
        key: entry.key,
        percent,
        dasharray: `${percent} ${100 - percent}`,
        offset: -cumulative,
      };
      cumulative += percent;
      return segment;
    });
  })();

  const shaminStatusHoverData = {};
  statusEntries.forEach((entry) => {
    shaminStatusHoverData[entry.key] = {
      label: entry.label,
      count: fa(entry.count),
      percent: `${fa(totalToday ? Math.round((entry.count / totalToday) * 100) : 0)}٪ از سفارش‌ها`,
    };
  });

  const shaminActivities = [
    ...(quick.low_stock_count
      ? [{
          id: "low-stock",
          type: "stock",
          title: "محصولات کم‌موجودی",
          description: `${fa(quick.low_stock_count)} محصول موجودی کم دارند`,
          time: "بررسی شود",
          icon: FiAlertCircle,
        }]
      : []),
    ...shaminRecentOrders.slice(0, 4).map((order) => ({
      id: `order-${order.id}`,
      type: "order",
      title: "سفارش جدید ثبت شد",
      description: `سفارش ${order.id} توسط ${order.customer}`,
      time: order.time,
      icon: FiShoppingBag,
    })),
  ].slice(0, 4);

  const shaminPeriodOptions = PERIOD_OPTIONS;

  return (
    <div className="shamin-overview">
      <section className="shamin-overview__hero">
        <img
          src="/Asets/Shamin baner1.png"
          alt="Shamin Gallery"
          className="shamin-overview__hero-image"
        />
      </section>

      {loading ? (
        <div className="shamin-overview__stats">
          <article className="shamin-overview__stat-card">
            <div className="shamin-overview__stat-info">
              <span>در حال دریافت آمار...</span>
              <strong><FiRefreshCw /></strong>
            </div>
          </article>
        </div>
      ) : error ? (
        <div className="shamin-overview__stats">
          <article className="shamin-overview__stat-card">
            <div className="shamin-overview__stat-info">
              <span>خطا در دریافت آمار</span>
              <strong>{error}</strong>
            </div>
          </article>
        </div>
      ) : (
        <>
      <section className="shamin-overview__stats">
        {shaminOverviewStats.map((item) => {
          const Icon = item.icon;

          return (
            <article
              className={`shamin-overview__stat-card ${
                shaminOpenStatMenu === item.id
                  ? "shamin-overview__stat-card--menu-open"
                  : ""
              }`}
              key={item.id}
            >
              <div className="shamin-overview__stat-top">
                <div className="shamin-overview__stat-icon">
                  <Icon />
                </div>

                <div className="shamin-overview__stat-actions">
                  <button
                    type="button"
                    className={`shamin-overview__stat-more ${
                      shaminOpenStatMenu === item.id
                        ? "shamin-overview__stat-more--active"
                        : ""
                    }`}
                    aria-label={`گزینه‌های ${item.title}`}
                    aria-expanded={shaminOpenStatMenu === item.id}
                    onClick={() =>
                      setShaminOpenStatMenu((previous) =>
                        previous === item.id ? null : item.id
                      )
                    }
                  >
                    <FiMoreHorizontal />
                  </button>

                  {shaminOpenStatMenu === item.id && (
                    <div className="shamin-overview__stat-menu">
                      <button
                        type="button"
                        onClick={() => setShaminOpenStatMenu(null)}
                      >
                        <FiEye />
                        <span>مشاهده جزئیات</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShaminOpenStatMenu(null)}
                      >
                        <FiBarChart2 />
                        <span>مشاهده گزارش</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="shamin-overview__stat-info">
                <span>{item.title}</span>

                <strong>
                  {item.value}
                  <small>{item.unit}</small>
                </strong>
              </div>

              <div
                className={`shamin-overview__stat-change shamin-overview__stat-change--${item.trend}`}
              >
                {item.change != null && (item.trend === "up" ? <FiArrowUp /> : <FiArrowDown />)}

                <span>{item.change != null ? item.change : item.caption}</span>

                <small>{item.change != null ? item.caption : ""}</small>
              </div>
            </article>
          );
        })}
      </section>

      <section className="shamin-overview__mini-stats">
        {shaminQuickMetrics.map((item) => {
          const Icon = item.icon;

          return (
            <article
              className="shamin-overview__mini-card"
              key={item.id}
            >
              <div className="shamin-overview__mini-icon">
                <Icon />
              </div>

              <div className="shamin-overview__mini-content">
                <span>{item.label}</span>

                <strong>
                  {item.value}
                  {item.unit && <small>{item.unit}</small>}
                </strong>
              </div>
            </article>
          );
        })}
      </section>

      <section className="shamin-overview__main-grid">
        <article className="shamin-overview__sales-card">
          <div className="shamin-overview__section-head">
            <div>
              <span>عملکرد فروش</span>
              <h3>{`روند فروش ${shaminSelectedPeriod}`}</h3>

              <div className="shamin-overview__chart-legend">
                <span>
                  <i className="shamin-overview__legend-dot shamin-overview__legend-dot--sales" />
                  فروش
                </span>
              </div>
            </div>

            <div className="shamin-overview__period-wrapper">
              <button
                type="button"
                className="shamin-overview__period-button"
                aria-expanded={shaminPeriodOpen}
                onClick={() =>
                  setShaminPeriodOpen((previous) => !previous)
                }
              >
                <span className="shamin-overview__period-icon">
                  <FiCalendar />
                </span>

                <span>{shaminSelectedPeriod}</span>

                <FiChevronDown
                  className={`shamin-overview__period-arrow ${
                    shaminPeriodOpen
                      ? "shamin-overview__period-arrow--open"
                      : ""
                  }`}
                />
              </button>

              {shaminPeriodOpen && (
                <div className="shamin-overview__period-menu">
                  {shaminPeriodOptions.map((period) => (
                    <button
                      key={period}
                      type="button"
                      className={
                        shaminSelectedPeriod === period
                          ? "shamin-overview__period-option--active"
                          : ""
                      }
                      onClick={() => {
                        setShaminSelectedPeriod(period);
                        setShaminPeriodOpen(false);
                        setShaminChartHover(null);
                      }}
                    >
                      <span>{period}</span>

                      {shaminSelectedPeriod === period && (
                        <span className="shamin-overview__period-check">
                          ✓
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="shamin-overview__sales-summary">
            <div>
              <strong>{fa(chartData.period_total)}</strong>
              <span>تومان فروش {shaminSelectedPeriod}</span>
            </div>

            {chartData.sales_growth_percent != null && (
              <div className="shamin-overview__sales-growth">
                <FiArrowUp />
                <span>{`${fa(Math.abs(chartData.sales_growth_percent))}٪`}</span>
              </div>
            )}
          </div>

          <div className="shamin-overview__chart">
            <div className="shamin-overview__chart-grid">
              {[100, 75, 50, 25, 0].map((value) => (
                <div
                  className="shamin-overview__chart-grid-row"
                  key={value}
                >
                  <span>{value}%</span>
                  <i />
                </div>
              ))}
            </div>

            <svg
              className="shamin-overview__line-chart"
              viewBox="0 0 700 250"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient
                  id="shaminSalesGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="#17483f"
                    stopOpacity="0.17"
                  />
                  <stop
                    offset="100%"
                    stopColor="#17483f"
                    stopOpacity="0"
                  />
                </linearGradient>

                <filter
                  id="shaminChartShadow"
                  x="-20%"
                  y="-20%"
                  width="140%"
                  height="140%"
                >
                  <feDropShadow
                    dx="0"
                    dy="3"
                    stdDeviation="3"
                    floodOpacity="0.12"
                  />
                </filter>
              </defs>

              <path
                className="shamin-overview__chart-area"
                d={`
                  M ${shaminChartPoints[0]?.x || 0}
                    ${shaminChartPoints[0]?.salesY || 220}
                  ${shaminChartPoints
                    .slice(1)
                    .map(
                      (point) =>
                        `L ${point.x} ${point.salesY}`
                    )
                    .join(" ")}
                  L 700 250
                  L 0 250
                  Z
                `}
              />

              <polyline
                className="shamin-overview__chart-line"
                points={shaminChartPoints
                  .map(
                    (point) =>
                      `${point.x},${point.salesY}`
                  )
                  .join(" ")}
              />

              {shaminChartPoints.map((point) => (
                <g key={point.index}>
                  <circle
                    className="shamin-overview__chart-point-hit"
                    cx={point.x}
                    cy={point.salesY}
                    r="20"
                    onMouseEnter={() =>
                      setShaminChartHover(point.index)
                    }
                    onMouseLeave={() =>
                      setShaminChartHover(null)
                    }
                  />

                  <circle
                    className={`shamin-overview__chart-point ${
                      shaminChartHover === point.index
                        ? "shamin-overview__chart-point--active"
                        : ""
                    }`}
                    cx={point.x}
                    cy={point.salesY}
                    r={
                      shaminChartHover === point.index ? 6 : 4
                    }
                  />
                </g>
              ))}
            </svg>

            {shaminChartHover !== null && shaminChartPoints[shaminChartHover] && (
              <div className="shamin-overview__chart-tooltip">
                <div className="shamin-overview__chart-tooltip-day">
                  {shaminChartPoints[shaminChartHover].label}
                </div>

                <div className="shamin-overview__chart-tooltip-row">
                  <span>
                    <i className="shamin-overview__tooltip-dot shamin-overview__tooltip-dot--sales" />
                    فروش
                  </span>

                  <strong>
                    {fa(Math.round(shaminChartPoints[shaminChartHover].sales))} تومان
                  </strong>
                </div>
              </div>
            )}

            <div
              className="shamin-overview__chart-labels"
              style={{
                "--shamin-chart-columns": shaminSalesData.length,
              }}
            >
              {shaminSalesData.map((item) => (
                <span key={item.label}>{item.label}</span>
              ))}
            </div>
          </div>
        </article>

        <article className="shamin-overview__orders-status">
          <div className="shamin-overview__section-head">
            <div>
              <span>وضعیت سفارش‌ها</span>
              <h3>سفارش‌های امروز</h3>
            </div>

            <button
              type="button"
              className="shamin-overview__round-button"
              aria-label="مشاهده سفارش‌ها"
            >
              <FiArrowLeft />
            </button>
          </div>

          <div className="shamin-overview__status-ring-wrap">
            <div
              className="shamin-overview__status-ring"
              onMouseLeave={() => setShaminStatusHover(null)}
            >
              <svg
                className="shamin-overview__status-ring-svg"
                viewBox="0 0 320 320"
              >
                <circle
                  className="shamin-overview__status-ring-base"
                  cx="160"
                  cy="160"
                  r="120"
                />

                {ringSegments.map((segment) => (
                  <circle
                    key={segment.key}
                    className={`shamin-overview__status-ring-segment shamin-overview__status-ring-segment--${segment.key}`}
                    cx="160"
                    cy="160"
                    r="120"
                    pathLength="100"
                    strokeDasharray={segment.dasharray}
                    strokeDashoffset={String(segment.offset)}
                    onMouseEnter={() =>
                      setShaminStatusHover(segment.key)
                    }
                  />
                ))}
              </svg>

              <div
                className={`shamin-overview__status-ring-inner ${
                  shaminStatusHover
                    ? "shamin-overview__status-ring-inner--hover"
                    : ""
                }`}
              >
                {!shaminStatusHover ? (
                  <>
                    <span className="shamin-overview__status-total-label">
                      مجموع سفارش‌ها
                    </span>

                    <strong>{fa(totalToday)}</strong>

                    <span className="shamin-overview__status-total-unit">
                      سفارش امروز
                    </span>
                  </>
                ) : (
                  <>
                    <span
                      className={`shamin-overview__status-hover-label shamin-overview__status-hover-label--${shaminStatusHover}`}
                    >
                      {shaminStatusHoverData[shaminStatusHover].label}
                    </span>

                    <strong>
                      {shaminStatusHoverData[shaminStatusHover].count}
                    </strong>

                    <span className="shamin-overview__status-total-unit">
                      {shaminStatusHoverData[shaminStatusHover].percent}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="shamin-overview__status-list">
            {statusEntries.map((entry, index) => {
              const Icon = entry.icon;
              const percent = totalToday ? Math.round((entry.count / totalToday) * 100) : 0;

              return (
                <div
                  className={`shamin-overview__status-item shamin-overview__status-item--${entry.item}`}
                  key={entry.key}
                  style={{
                    "--shamin-status-delay": `${
                      0.25 + index * 0.09
                    }s`,
                  }}
                >
                  <div className="shamin-overview__status-icon">
                    <Icon />
                  </div>

                  <div className="shamin-overview__status-name">
                    <strong>{entry.label}</strong>
                    <span>{`${fa(entry.count)} سفارش`}</span>
                  </div>

                  <b>{`${fa(percent)}٪`}</b>
                </div>
              );
            })}
            {statusEntries.length === 0 && (
              <div className="shamin-overview__status-item">
                <div className="shamin-overview__status-name">
                  <strong>سفارشی امروز ثبت نشده است</strong>
                </div>
              </div>
            )}
          </div>
        </article>
      </section>

      <section className="shamin-overview__bottom-grid">
        <article className="shamin-overview__orders-card">
          <div className="shamin-overview__section-head">
            <div>
              <span>سفارش‌ها</span>
              <h3>آخرین سفارش‌ها</h3>
            </div>
          </div>

          <div className="shamin-overview__table">
            <div className="shamin-overview__table-head">
              <span>شماره سفارش</span>
              <span>مشتری</span>
              <span>محصول</span>
              <span>مبلغ</span>
              <span>وضعیت</span>
              <span>زمان</span>
            </div>

            {shaminRecentOrders.map((order) => (
              <div
                className="shamin-overview__table-row"
                key={order.id}
                role="button"
                tabIndex={0}
              >
                <div className="shamin-overview__order-id">
                  <strong>{order.id}</strong>
                  <span>سفارش</span>
                </div>

                <div className="shamin-overview__customer-cell">
                  <span className="shamin-overview__customer-avatar">
                    <FiUsers />
                  </span>

                  <div>
                    <strong>{order.customer}</strong>
                    <small>مشتری</small>
                  </div>
                </div>

                <div className="shamin-overview__product-cell">
                  <span className="shamin-overview__product-name">
                    {order.product}
                  </span>

                  <small>{fa(order.items)} کالا</small>
                </div>

                <div className="shamin-overview__amount-cell">
                  <strong>{order.amount}</strong>
                  <small>تومان</small>
                </div>

                <span
                  className={`shamin-overview__order-status shamin-overview__order-status--${order.status}`}
                >
                  <i></i>
                  {order.statusLabel}
                </span>

                <small>{order.time}</small>
              </div>
            ))}
            {shaminRecentOrders.length === 0 && (
              <div className="shamin-overview__table-row">
                <div className="shamin-overview__product-cell">
                  <span className="shamin-overview__product-name">
                    هنوز سفارشی ثبت نشده است
                  </span>
                </div>
              </div>
            )}
          </div>
        </article>

        <article className="shamin-overview__products-card">
          <div className="shamin-overview__section-head">
            <div>
              <span>محصولات</span>
              <h3>پرفروش‌ترین‌ها</h3>
            </div>

            <button
              type="button"
              className="shamin-overview__round-button"
              aria-label="مشاهده محصولات"
            >
              <FiArrowLeft />
            </button>
          </div>

          <div className="shamin-overview__products-list">
            {shaminTopProducts.map((product) => (
              <div
                className="shamin-overview__product-item"
                key={product.id}
              >
                <div className="shamin-overview__product-rank">
                  {product.rank}
                </div>

                <div className="shamin-overview__product-image">
                  <FiBox />
                </div>

                <div className="shamin-overview__product-info">
                  <strong>{product.name}</strong>
                  <span>{product.category}</span>
                </div>

                <div className="shamin-overview__product-sales">
                  <div className="shamin-overview__product-sales-count">
                    <FiStar />
                    <span>{`${fa(product.sales)} فروش`}</span>
                  </div>

                  <strong>{product.revenue}</strong>

                  <div
                    className={`shamin-overview__stock ${
                      product.stockLow
                        ? "shamin-overview__stock--low"
                        : ""
                    }`}
                  >
                    <span>موجودی</span>
                    <b>{`${fa(product.stock)} عدد`}</b>
                  </div>
                </div>
              </div>
            ))}
            {shaminTopProducts.length === 0 && (
              <div className="shamin-overview__product-item">
                <div className="shamin-overview__product-info">
                  <strong>فروشی ثبت نشده است</strong>
                </div>
              </div>
            )}
          </div>
        </article>
      </section>

      <section className="shamin-overview__activity-card">
        <div className="shamin-overview__section-head">
          <div>
            <span>فعالیت سیستم</span>
            <h3>آخرین فعالیت‌ها</h3>
          </div>
        </div>

        <div className="shamin-overview__activity-list">
          {shaminActivities.map((activity) => {
            const Icon = activity.icon;

            return (
              <div
                className="shamin-overview__activity-item"
                key={activity.id}
              >
                <div className="shamin-overview__activity-track">
                  <div
                    className={`shamin-overview__activity-icon shamin-overview__activity-icon--${activity.type}`}
                  >
                    <Icon />
                  </div>
                </div>

                <div className="shamin-overview__activity-content">
                  <div className="shamin-overview__activity-title">
                    <strong>{activity.title}</strong>
                    <span>{activity.time}</span>
                  </div>

                  <p>{activity.description}</p>
                </div>
              </div>
            );
          })}
          {shaminActivities.length === 0 && (
            <div className="shamin-overview__activity-item">
              <div className="shamin-overview__activity-content">
                <p>فعالیتی ثبت نشده است.</p>
              </div>
            </div>
          )}
        </div>
      </section>
      </>
      )}
    </div>
  );
}

export default Dashboard;
