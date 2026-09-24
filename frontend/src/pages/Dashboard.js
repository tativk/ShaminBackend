import React, { useEffect, useMemo, useState } from "react";
import { FiArrowLeft, FiCheck, FiEdit3, FiHeart, FiHome, FiLogOut, FiMapPin, FiMenu, FiPackage, FiSave, FiShoppingBag, FiUser, FiX } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest, getAssetUrl } from "../api";
import { getFavorites } from "../favorites";
import "./UserDashboard.css";

const emptyProfile = { first_name: "", last_name: "", email: "", phone: "" };
const emptyAddress = { province: "", city: "", street: "", postal_code: "", detail: "" };
const toPrice = (value) => `${new Intl.NumberFormat("fa-IR").format(Number(value || 0))} تومان`;

const Dashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(emptyProfile);
  const [address, setAddress] = useState(emptyAddress);
  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);
  const [section, setSection] = useState("overview");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([apiRequest("/auth/profile/"), apiRequest("/auth/address/"), apiRequest("/auth/purchased-products/"), apiRequest("/products/?page_size=100")])
      .then(([user, savedAddress, bought, productData]) => {
        if (!active) return;
        if (user.role === "admin") return navigate("/admin");
        setProfile({ ...emptyProfile, ...user });
        setAddress({ ...emptyAddress, ...(savedAddress || {}) });
        setPurchases(Array.isArray(bought) ? bought : []);
        setProducts(productData.results || productData || []);
      })
      .catch((requestError) => { if (active) setError(requestError.message || "اطلاعات حساب دریافت نشد."); })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [navigate]);

  const productById = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);
  const uniquePurchases = useMemo(() => Array.from(new Map(purchases.map((item) => [item.product_id, item])).values()), [purchases]);
  const name = [profile.first_name, profile.last_name].filter(Boolean).join(" ") || "کاربر شمین";
  const profileProgress = [profile.first_name, profile.last_name, profile.email, address.city, address.street, address.postal_code].filter(Boolean).length;
  const menu = [["overview", "نمای کلی", FiHome], ["purchases", "خریدهای من", FiShoppingBag], ["profile", "اطلاعات حساب", FiUser], ["address", "آدرس من", FiMapPin]];

  const chooseSection = (nextSection) => { setSection(nextSection); setMobileMenu(false); setMessage(""); setError(""); };
  const saveProfile = async (event) => {
    event.preventDefault(); setSaving(true); setError("");
    try { setProfile({ ...profile, ...(await apiRequest("/auth/profile/", { method: "PATCH", body: JSON.stringify({ first_name: profile.first_name, last_name: profile.last_name, email: profile.email }) })) }); setEditingProfile(false); setMessage("پروفایل شما ذخیره شد."); }
    catch (requestError) { setError(requestError.message); } finally { setSaving(false); }
  };
  const saveAddress = async (event) => {
    event.preventDefault(); setSaving(true); setError("");
    try { setAddress(await apiRequest("/auth/address/", { method: "PUT", body: JSON.stringify(address) })); setEditingAddress(false); setMessage("آدرس شما ذخیره شد."); }
    catch (requestError) { setError(requestError.message); } finally { setSaving(false); }
  };
  const logout = () => { ["access", "refresh", "access_token", "refresh_token", "user"].forEach((key) => localStorage.removeItem(key)); navigate("/Login"); };
  const renderPurchase = (item) => { const product = productById.get(item.product_id); return <article className="user-dashboard__purchase" key={`${item.order_id}-${item.product_id}`}><div className="user-dashboard__purchase-image"><img src={getAssetUrl(product?.main_image)} alt={item.product_name} /></div><div><strong>{item.product_name}</strong><span>{item.quantity.toLocaleString("fa-IR")} عدد · سفارش #{item.order_id.toLocaleString("fa-IR")}</span><small>{toPrice(item.unit_price)}</small></div><FiCheck className="user-dashboard__purchase-check" /></article>; };

  if (loading) return <div className="user-dashboard user-dashboard--state" dir="rtl"><FiUser /><p>در حال آماده‌سازی حساب شما...</p></div>;
  return <div className="user-dashboard" dir="rtl">
    <aside className={`user-dashboard__sidebar ${mobileMenu ? "is-open" : ""}`}><div className="user-dashboard__brand"><span>ش</span><div><strong>گالری شمین</strong><small>حساب کاربری</small></div><button onClick={() => setMobileMenu(false)} aria-label="بستن منو"><FiX /></button></div><nav>{menu.map(([id, label, Icon]) => <button key={id} className={section === id ? "is-active" : ""} onClick={() => chooseSection(id)}><Icon /><span>{label}</span><FiArrowLeft /></button>)}</nav><div className="user-dashboard__sidebar-bottom"><Link to="/favorites"><FiHeart /> علاقه‌مندی‌های من</Link><button onClick={logout}><FiLogOut /> خروج از حساب</button></div></aside>
    {mobileMenu && <button className="user-dashboard__backdrop" onClick={() => setMobileMenu(false)} aria-label="بستن منو" />}
    <main className="user-dashboard__main"><header className="user-dashboard__header"><button className="user-dashboard__menu-button" onClick={() => setMobileMenu(true)} aria-label="باز کردن منو"><FiMenu /></button><div><span>حساب کاربری</span><h1>{section === "overview" ? `سلام ${name}` : menu.find(([id]) => id === section)?.[1]}</h1></div><div className="user-dashboard__header-user"><span>{name.charAt(0)}</span><strong>{name}</strong></div></header>
      {(error || message) && <div className={`user-dashboard__notice ${error ? "is-error" : ""}`}>{error || message}</div>}
      <div className="user-dashboard__content">
        {section === "overview" && <><section className="user-dashboard__welcome"><div><span>داشبورد شما</span><h2>همه چیز برای خرید بعدی آماده است</h2><p>سفارش‌ها، اطلاعات حساب و علاقه‌مندی‌هایتان را از همین‌جا مدیریت کنید.</p></div><div className="user-dashboard__welcome-mark"><FiPackage /></div></section><div className="user-dashboard__stats"><div><FiShoppingBag /><strong>{uniquePurchases.length.toLocaleString("fa-IR")}</strong><span>محصول خریداری‌شده</span></div><div><FiHeart /><strong>{getFavorites().length.toLocaleString("fa-IR")}</strong><span>علاقه‌مندی</span></div><div><FiCheck /><strong>{profileProgress.toLocaleString("fa-IR")} / ۶</strong><span>تکمیل اطلاعات</span></div></div><div className="user-dashboard__columns"><section className="user-dashboard__panel"><div className="user-dashboard__panel-title"><h2>آخرین خریدها</h2><button onClick={() => chooseSection("purchases")}>مشاهده همه <FiArrowLeft /></button></div>{uniquePurchases.length ? uniquePurchases.slice(0, 3).map(renderPurchase) : <p className="user-dashboard__empty">هنوز خریدی ثبت نشده است.</p>}</section><section className="user-dashboard__panel user-dashboard__completion"><div className="user-dashboard__panel-title"><h2>وضعیت حساب</h2><FiUser /></div><div className="user-dashboard__progress"><span style={{ width: `${(profileProgress / 6) * 100}%` }} /></div><strong>{Math.round((profileProgress / 6) * 100).toLocaleString("fa-IR")}٪ تکمیل شده</strong><p>با تکمیل اطلاعات، ثبت سفارش سریع‌تر انجام می‌شود.</p><button onClick={() => chooseSection("profile")}>تکمیل اطلاعات <FiArrowLeft /></button></section></div></>}
        {section === "purchases" && <section className="user-dashboard__panel user-dashboard__wide-panel"><div className="user-dashboard__panel-title"><h2>محصولات خریداری‌شده</h2><span>{purchases.length.toLocaleString("fa-IR")} مورد</span></div>{purchases.length ? purchases.map(renderPurchase) : <p className="user-dashboard__empty">هنوز محصول خریداری‌شده‌ای ندارید.</p>}</section>}
        {section === "profile" && <section className="user-dashboard__panel user-dashboard__form-panel"><div className="user-dashboard__panel-title"><h2>اطلاعات حساب</h2>{!editingProfile && <button onClick={() => setEditingProfile(true)}><FiEdit3 /> ویرایش</button>}</div>{editingProfile ? <form onSubmit={saveProfile} className="user-dashboard__form"><label>نام<input value={profile.first_name} onChange={(event) => setProfile({ ...profile, first_name: event.target.value })} /></label><label>نام خانوادگی<input value={profile.last_name} onChange={(event) => setProfile({ ...profile, last_name: event.target.value })} /></label><label>ایمیل<input type="email" value={profile.email} onChange={(event) => setProfile({ ...profile, email: event.target.value })} /></label><label>شماره موبایل<input value={profile.phone} disabled /></label><button className="user-dashboard__save" disabled={saving}><FiSave /> {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}</button></form> : <div className="user-dashboard__details"><div><span>نام و نام خانوادگی</span><strong>{name}</strong></div><div><span>شماره موبایل</span><strong dir="ltr">{profile.phone || "ثبت نشده"}</strong></div><div><span>ایمیل</span><strong>{profile.email || "ثبت نشده"}</strong></div></div>}</section>}
        {section === "address" && <section className="user-dashboard__panel user-dashboard__form-panel"><div className="user-dashboard__panel-title"><h2>آدرس ارسال</h2>{!editingAddress && <button onClick={() => setEditingAddress(true)}><FiEdit3 /> ویرایش</button>}</div>{editingAddress ? <form onSubmit={saveAddress} className="user-dashboard__form"><label>استان<input value={address.province} onChange={(event) => setAddress({ ...address, province: event.target.value })} required /></label><label>شهر<input value={address.city} onChange={(event) => setAddress({ ...address, city: event.target.value })} required /></label><label className="user-dashboard__form-full">نشانی<input value={address.street} onChange={(event) => setAddress({ ...address, street: event.target.value })} required /></label><label>کد پستی<input inputMode="numeric" value={address.postal_code} onChange={(event) => setAddress({ ...address, postal_code: event.target.value })} required /></label><label>جزئیات بیشتر<input value={address.detail} onChange={(event) => setAddress({ ...address, detail: event.target.value })} /></label><button className="user-dashboard__save" disabled={saving}><FiSave /> {saving ? "در حال ذخیره..." : "ذخیره آدرس"}</button></form> : <div className="user-dashboard__address"><FiMapPin /><div><strong>{address.city && address.province ? `${address.province}، ${address.city}` : "آدرسی ثبت نشده است"}</strong><p>{address.street || "برای ارسال سریع، آدرس خود را اضافه کنید."}{address.detail && `، ${address.detail}`}</p>{address.postal_code && <small>کد پستی: {address.postal_code}</small>}</div></div>}</section>}
      </div></main>
  </div>;
};
export default Dashboard;
