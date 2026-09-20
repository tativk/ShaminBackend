import React, { useState } from "react";
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
} from "react-icons/fi";

import "./Dashboard.css";

function Dashboard() {
  const [shaminOpenStatMenu, setShaminOpenStatMenu] = useState(null);
  const [shaminChartHover, setShaminChartHover] = useState(null);
  const [shaminPeriodOpen, setShaminPeriodOpen] = useState(false);
  const [shaminSelectedPeriod, setShaminSelectedPeriod] =
    useState("این هفته");
  const [shaminStatusHover, setShaminStatusHover] = useState(null);

  const shaminOverviewStats = [
    {
      id: "sales",
      title: "فروش امروز",
      value: "۱۲,۸۵۰,۰۰۰",
      unit: "تومان",
      change: "۱۸.۴٪",
      trend: "up",
      icon: FiDollarSign,
      caption: "نسبت به هفته قبل",
      progress: 78,
    },
    {
      id: "orders",
      title: "سفارش‌های امروز",
      value: "۳۸",
      unit: "سفارش",
      change: "۱۲.۸٪",
      trend: "up",
      icon: FiShoppingBag,
      caption: "نسبت به هفته قبل",
      progress: 64,
    },
    {
      id: "customers",
      title: "مشتریان فعال",
      value: "۱,۲۴۸",
      unit: "نفر",
      change: "۸.۲٪",
      trend: "up",
      icon: FiUsers,
      caption: "افزایش نسبت به هفته قبل",
      progress: 82,
    },
    {
      id: "products",
      title: "محصولات فعال",
      value: "۲۸۶",
      unit: "محصول",
      change: "۱۲ محصول",
      trend: "down",
      icon: FiBox,
      caption: "نیازمند بررسی موجودی",
      progress: 58,
    },
  ];

  const shaminQuickMetrics = [
    {
      id: "avg",
      label: "میانگین ارزش سفارش",
      value: "۱,۹۸۰,۰۰۰",
      unit: "تومان",
      icon: FiDollarSign,
    },
    {
      id: "rate",
      label: "نرخ تکمیل سفارش",
      value: "۸۷٪",
      unit: "",
      icon: FiCheckCircle,
    },
    {
      id: "stock",
      label: "محصولات کم‌موجودی",
      value: "۱۲",
      unit: "محصول",
      icon: FiAlertCircle,
    },
    {
      id: "pending",
      label: "سفارش‌های در انتظار",
      value: "۳",
      unit: "سفارش",
      icon: FiClock,
    },
  ];

  const shaminSalesPeriods = {
    "امروز": {
      title: "روند فروش امروز",
      total: "۱۲,۸۵۰,۰۰۰",
      growth: "۱۸.۴٪",
      salesMax: 15,
      visitsMax: 800,
      data: [
        { label: "۸ صبح", sales: 1.2, visits: 85 },
        { label: "۱۰ صبح", sales: 3.4, visits: 180 },
        { label: "۱۲ ظهر", sales: 5.8, visits: 320 },
        { label: "۲ بعدازظهر", sales: 8.2, visits: 450 },
        { label: "۴ بعدازظهر", sales: 10.4, visits: 590 },
        { label: "۶ عصر", sales: 11.8, visits: 680 },
        { label: "۸ شب", sales: 12.85, visits: 720 },
      ],
    },

    "این هفته": {
      title: "روند فروش این هفته",
      total: "۹۰,۰۰۰,۰۰۰",
      growth: "۲۱.۶٪",
      salesMax: 20,
      visitsMax: 800,
      data: [
        { label: "شنبه", sales: 8.4, visits: 420 },
        { label: "یکشنبه", sales: 11.2, visits: 510 },
        { label: "دوشنبه", sales: 9.6, visits: 465 },
        { label: "سه‌شنبه", sales: 14.8, visits: 620 },
        { label: "چهارشنبه", sales: 12.7, visits: 575 },
        { label: "پنجشنبه", sales: 17.9, visits: 710 },
        { label: "جمعه", sales: 15.4, visits: 655 },
      ],
    },

    "این ماه": {
      title: "روند فروش این ماه",
      total: "۳۸۴,۵۰۰,۰۰۰",
      growth: "۱۷.۸٪",
      salesMax: 80,
      visitsMax: 3200,
      data: [
        { label: "هفته اول", sales: 42, visits: 1850 },
        { label: "هفته دوم", sales: 56, visits: 2240 },
        { label: "هفته سوم", sales: 48, visits: 1980 },
        { label: "هفته چهارم", sales: 71, visits: 2860 },
        { label: "هفته پنجم", sales: 64, visits: 2510 },
      ],
    },

    "این فصل": {
      title: "روند فروش این فصل",
      total: "۱,۲۴۵,۰۰۰,۰۰۰",
      growth: "۲۴.۸٪",
      salesMax: 220,
      visitsMax: 9000,
      data: [
        { label: "فروردین", sales: 150, visits: 6400 },
        { label: "اردیبهشت", sales: 185, visits: 7800 },
        { label: "خرداد", sales: 210, visits: 8900 },
      ],
    },
  };

  const shaminCurrentChart = shaminSalesPeriods[shaminSelectedPeriod];
  const shaminSalesData = shaminCurrentChart.data;

  const shaminChartPoints = shaminSalesData.map((item, index) => {
    const chartWidth = 700;
    const chartHeight = 150;

    const x =
      shaminSalesData.length === 1
        ? chartWidth / 2
        : (index / (shaminSalesData.length - 1)) * chartWidth;

    const normalizedSales = item.sales / shaminCurrentChart.salesMax;
    const normalizedVisits = item.visits / shaminCurrentChart.visitsMax;

    const salesY = 220 - normalizedSales * chartHeight;
    const visitsY = 220 - normalizedVisits * chartHeight;

    return {
      x,
      salesY,
      visitsY,
      index,
      label: item.label,
      sales: item.sales,
      visits: item.visits,
    };
  });

  const shaminSalesTooltipData = shaminSalesData.map((item) => ({
    day: item.label,
    sales: `${item.sales.toLocaleString("fa-IR")} میلیون`,
    visits: item.visits.toLocaleString("fa-IR"),
  }));

  const shaminRecentOrders = [
    {
      id: "#SH-1048",
      customer: "سارا محمدی",
      product: "Chanel Coco Mademoiselle",
      items: 2,
      amount: "۴,۸۵۰,۰۰۰",
      status: "completed",
      statusLabel: "تکمیل شده",
      time: "۱۲ دقیقه پیش",
    },
    {
      id: "#SH-1047",
      customer: "علی رضایی",
      product: "Dior Sauvage",
      items: 1,
      amount: "۵,۲۵۰,۰۰۰",
      status: "shipping",
      statusLabel: "در حال ارسال",
      time: "۳۵ دقیقه پیش",
    },
    {
      id: "#SH-1046",
      customer: "نگار احمدی",
      product: "YSL Libre",
      items: 3,
      amount: "۴,۶۰۰,۰۰۰",
      status: "pending",
      statusLabel: "در انتظار",
      time: "۵۲ دقیقه پیش",
    },
    {
      id: "#SH-1045",
      customer: "محمد کریمی",
      product: "Tom Ford Oud Wood",
      items: 1,
      amount: "۷,۹۰۰,۰۰۰",
      status: "completed",
      statusLabel: "تکمیل شده",
      time: "۱ ساعت پیش",
    },
  ];

  const shaminTopProducts = [
    {
      id: 1,
      name: "Dior Sauvage",
      category: "عطر مردانه",
      sales: 86,
      stock: 14,
      revenue: "۴۵۲,۰۰۰,۰۰۰",
      rank: "01",
      stockLow: false,
    },
    {
      id: 2,
      name: "Chanel Coco Mademoiselle",
      category: "عطر زنانه",
      sales: 74,
      stock: 22,
      revenue: "۳۵۸,۰۰۰,۰۰۰",
      rank: "02",
      stockLow: false,
    },
    {
      id: 3,
      name: "YSL Libre",
      category: "عطر زنانه",
      sales: 68,
      stock: 9,
      revenue: "۳۱۲,۰۰۰,۰۰۰",
      rank: "03",
      stockLow: false,
    },
    {
      id: 4,
      name: "Tom Ford Oud Wood",
      category: "عطر مردانه",
      sales: 52,
      stock: 6,
      revenue: "۲۸۹,۰۰۰,۰۰۰",
      rank: "04",
      stockLow: true,
    },
  ];

  const shaminOrderStatus = [
    {
      label: "تکمیل شده",
      value: "۶۸٪",
      count: "۲۶ سفارش",
      type: "completed",
      icon: FiCheckCircle,
    },
    {
      label: "در حال ارسال",
      value: "۱۸٪",
      count: "۷ سفارش",
      type: "shipping",
      icon: FiTruck,
    },
    {
      label: "در انتظار",
      value: "۹٪",
      count: "۳ سفارش",
      type: "pending",
      icon: FiClock,
    },
    {
      label: "لغو شده",
      value: "۵٪",
      count: "۲ سفارش",
      type: "cancelled",
      icon: FiAlertCircle,
    },
  ];

  const shaminStatusHoverData = {
    completed: {
      label: "تکمیل شده",
      count: "۲۶",
      percent: "۶۸٪ از سفارش‌ها",
    },
    shipping: {
      label: "در حال ارسال",
      count: "۷",
      percent: "۱۸٪ از سفارش‌ها",
    },
    pending: {
      label: "در انتظار",
      count: "۳",
      percent: "۹٪ از سفارش‌ها",
    },
    cancelled: {
      label: "لغو شده",
      count: "۲",
      percent: "۵٪ از سفارش‌ها",
    },
  };

  const shaminActivities = [
    {
      id: 1,
      type: "order",
      title: "سفارش جدید ثبت شد",
      description: "سفارش #SH-1048 توسط سارا محمدی",
      time: "۱۲ دقیقه پیش",
      icon: FiShoppingBag,
    },
    {
      id: 2,
      type: "stock",
      title: "موجودی Dior Sauvage کاهش یافت",
      description: "موجودی این محصول به ۱۴ عدد رسید",
      time: "۳۵ دقیقه پیش",
      icon: FiAlertCircle,
    },
    {
      id: 3,
      type: "payment",
      title: "پرداخت سفارش #SH-1047 تأیید شد",
      description: "مبلغ ۵,۲۵۰,۰۰۰ تومان دریافت شد",
      time: "۱ ساعت پیش",
      icon: FiCheckCircle,
    },
    {
      id: 4,
      type: "product",
      title: "محصول Chanel به‌روزرسانی شد",
      description: "قیمت و موجودی محصول بروزرسانی شد",
      time: "۲ ساعت پیش",
      icon: FiBox,
    },
  ];

  const shaminPeriodOptions = [
    "امروز",
    "این هفته",
    "این ماه",
    "این فصل",
  ];

  return (
    <div className="shamin-overview">
      <section className="shamin-overview__hero">
        <img
          src="/Asets/Shamin baner1.png"
          alt="Shamin Gallery"
          className="shamin-overview__hero-image"
        />
      </section>

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
                {item.trend === "up" ? <FiArrowUp /> : <FiArrowDown />}

                <span>{item.change}</span>

                <small>{item.caption}</small>
              </div>

              <div className="shamin-overview__stat-progress">
                <span style={{ width: `${item.progress}%` }} />
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
              <h3>{shaminCurrentChart.title}</h3>

              <div className="shamin-overview__chart-legend">
                <span>
                  <i className="shamin-overview__legend-dot shamin-overview__legend-dot--sales" />
                  فروش
                </span>

                <span>
                  <i className="shamin-overview__legend-dot shamin-overview__legend-dot--visits" />
                  بازدید
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
              <strong>{shaminCurrentChart.total}</strong>
              <span>تومان فروش {shaminSelectedPeriod}</span>
            </div>

            <div className="shamin-overview__sales-growth">
              <FiArrowUp />
              <span>{shaminCurrentChart.growth}</span>
            </div>
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

              <polyline
                className="shamin-overview__chart-line-secondary"
                points={shaminChartPoints
                  .map(
                    (point) =>
                      `${point.x},${point.visitsY}`
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

                  <circle
                    className={`shamin-overview__chart-visit-point ${
                      shaminChartHover === point.index
                        ? "shamin-overview__chart-visit-point--active"
                        : ""
                    }`}
                    cx={point.x}
                    cy={point.visitsY}
                    r={
                      shaminChartHover === point.index ? 5 : 3
                    }
                  />
                </g>
              ))}
            </svg>

            {shaminChartHover !== null && (
              <div className="shamin-overview__chart-tooltip">
                <div className="shamin-overview__chart-tooltip-day">
                  {shaminSalesTooltipData[shaminChartHover].day}
                </div>

                <div className="shamin-overview__chart-tooltip-row">
                  <span>
                    <i className="shamin-overview__tooltip-dot shamin-overview__tooltip-dot--sales" />
                    فروش
                  </span>

                  <strong>
                    {shaminSalesTooltipData[shaminChartHover].sales}
                  </strong>
                </div>

                <div className="shamin-overview__chart-tooltip-row">
                  <span>
                    <i className="shamin-overview__tooltip-dot shamin-overview__tooltip-dot--visits" />
                    بازدید
                  </span>

                  <strong>
                    {shaminSalesTooltipData[shaminChartHover].visits}
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

                <circle
                  className="shamin-overview__status-ring-segment shamin-overview__status-ring-segment--completed"
                  cx="160"
                  cy="160"
                  r="120"
                  pathLength="100"
                  strokeDasharray="68 32"
                  strokeDashoffset="0"
                  onMouseEnter={() =>
                    setShaminStatusHover("completed")
                  }
                />

                <circle
                  className="shamin-overview__status-ring-segment shamin-overview__status-ring-segment--shipping"
                  cx="160"
                  cy="160"
                  r="120"
                  pathLength="100"
                  strokeDasharray="18 82"
                  strokeDashoffset="-68"
                  onMouseEnter={() =>
                    setShaminStatusHover("shipping")
                  }
                />

                <circle
                  className="shamin-overview__status-ring-segment shamin-overview__status-ring-segment--pending"
                  cx="160"
                  cy="160"
                  r="120"
                  pathLength="100"
                  strokeDasharray="9 91"
                  strokeDashoffset="-86"
                  onMouseEnter={() =>
                    setShaminStatusHover("pending")
                  }
                />

                <circle
                  className="shamin-overview__status-ring-segment shamin-overview__status-ring-segment--cancelled"
                  cx="160"
                  cy="160"
                  r="120"
                  pathLength="100"
                  strokeDasharray="5 95"
                  strokeDashoffset="-95"
                  onMouseEnter={() =>
                    setShaminStatusHover("cancelled")
                  }
                />
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

                    <strong>۳۸</strong>

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
            {shaminOrderStatus.map((item, index) => {
              const Icon = item.icon;

              return (
                <div
                  className={`shamin-overview__status-item shamin-overview__status-item--${item.type}`}
                  key={item.label}
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
                    <strong>{item.label}</strong>
                    <span>{item.count}</span>
                  </div>

                  <b>{item.value}</b>
                </div>
              );
            })}
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

            <button
              type="button"
              className="shamin-overview__view-all"
            >
              مشاهده همه
              <FiArrowLeft />
            </button>
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
                onClick={() => console.log("مشاهده سفارش")}
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

                  <small>{order.items} کالا</small>
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
                    <span>{product.sales} فروش</span>
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
                    <b>{product.stock} عدد</b>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="shamin-overview__activity-card">
        <div className="shamin-overview__section-head">
          <div>
            <span>فعالیت سیستم</span>
            <h3>آخرین فعالیت‌ها</h3>
          </div>

          <button
            type="button"
            className="shamin-overview__view-all"
          >
            مشاهده همه
            <FiArrowLeft />
          </button>
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
        </div>
      </section>
    </div>
  );
}

export default Dashboard;