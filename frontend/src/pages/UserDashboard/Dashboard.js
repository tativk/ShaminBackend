import React, { useEffect, useMemo, useRef, useState } from "react";
import { FiArrowLeft, FiCamera, FiCheck, FiEdit3, FiHeart, FiHome, FiLogOut, FiMapPin, FiMenu, FiMoon, FiPackage, FiSave, FiShoppingBag, FiSun, FiUser, FiX } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest, clearStoredAuth, getAssetUrl } from "../../api";
import { useWishlist } from "../../context/WishlistContext";
import usePageTitle from "../../usePageTitle";
import "./UserDashboard.css";

const emptyProfile = { first_name: "", last_name: "", email: "", phone: "" };
const emptyAddress = { province: "", city: "", street: "", postal_code: "", detail: "" };
const toPrice = (value) => `${new Intl.NumberFormat("fa-IR").format(Number(value || 0))} تومان`;

const Dashboard = () => {
  usePageTitle("حساب کاربری من", "مدیریت سفارش‌ها، اطلاعات حساب و آدرس ارسال در گالری شمین.");
  const { count: favoritesCount } = useWishlist();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(emptyProfile);
  const [address, setAddress] = useState(emptyAddress);
  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);
  const [section, setSection] = useState("overview");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const avatarInputRef = useRef(null);
  // دارک‌مد — همان کلید ذخیره پنل ادمین تا ترجیح کاربر بین پنل‌ها مشترک باشد
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("shamin-dashboard-theme") === "dark");

  useEffect(() => {
    localStorage.setItem("shamin-dashboard-theme", darkMode ? "dark" : "light");
  }, [darkMode]);
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

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("فقط فایل تصویری انتخاب کنید."); return; }
    if (file.size > 5 * 1024 * 1024) { setError("حجم عکس باید کمتر از ۵ مگابایت باشد."); return; }
    setError("");
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const removeAvatarPreview = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (avatarInputRef.current) avatarInputRef.current.value = "";
  };

  const saveProfile = async (event) => {
    event.preventDefault(); setSaving(true); setError("");
    try {
      let updated;
      if (avatarFile) {
        // با انتخاب عکس، درخواست multipart ارسال می‌شود
        const formData = new FormData();
        formData.append("first_name", profile.first_name);
        formData.append("last_name", profile.last_name);
        formData.append("email", profile.email);
        formData.append("profile_image", avatarFile);
        updated = await apiRequest("/auth/profile/", { method: "PATCH", body: formData });
      } else {
        updated = await apiRequest("/auth/profile/", { method: "PATCH", body: JSON.stringify({ first_name: profile.first_name, last_name: profile.last_name, email: profile.email }) });
      }
      setProfile({ ...profile, ...updated });
      removeAvatarPreview();
      setEditingProfile(false);
      setMessage("پروفایل شما ذخیره شد.");
    }
    catch (requestError) { setError(requestError.message); } finally { setSaving(false); }
  };
  const saveAddress = async (event) => {
    event.preventDefault(); setSaving(true); setError("");
    try { setAddress(await apiRequest("/auth/address/", { method: "PUT", body: JSON.stringify(address) })); setEditingAddress(false); setMessage("آدرس شما ذخیره شد."); }
    catch (requestError) { setError(requestError.message); } finally { setSaving(false); }
  };
  const logout = () => { clearStoredAuth(); navigate("/Login"); };
  const renderPurchase = (item) => { const product = productById.get(item.product_id); return <article className="user-dashboard__purchase" key={`${item.order_id}-${item.product_id}`}><div className="user-dashboard__purchase-image"><img src={getAssetUrl(product?.main_image)} alt={item.product_name} /></div><div><strong>{item.product_name}</strong><span>{item.quantity.toLocaleString("fa-IR")} عدد · سفارش #{item.order_id.toLocaleString("fa-IR")}</span><small>{toPrice(item.unit_price)}</small></div><FiCheck className="user-dashboard__purchase-check" /></article>; };
  const profileImageSrc = avatarPreview || (profile.profile_image ? getAssetUrl(profile.profile_image) : null);

  if (loading) return <div className="user-dashboard user-dashboard--state" dir="rtl"><FiUser /><p>در حال آماده‌سازی حساب شما...</p></div>;
  return <div className={`user-dashboard ${darkMode ? "user-dashboard--dark" : ""}`} dir="rtl">
    <aside className={`user-dashboard__sidebar ${mobileMenu ? "is-open" : ""}`}><div className="user-dashboard__brand"><img src="/logo.png" alt="لوگوی گالری شمین" className="user-dashboard__brand-logo" /><div><strong>گالری شمین</strong><small>حساب کاربری</small></div><button onClick={() => setMobileMenu(false)} aria-label="بستن منو"><FiX /></button></div><nav>{menu.map(([id, label, Icon]) => <button key={id} className={section === id ? "is-active" : ""} onClick={() => chooseSection(id)}><Icon /><span>{label}</span><FiArrowLeft /></button>)}</nav><div className="user-dashboard__sidebar-bottom"><Link to="/"><FiHome /> بازگشت به صفحه اصلی</Link><Link to="/favorites"><FiHeart /> علاقه‌مندی‌های من</Link><button onClick={logout}><FiLogOut /> خروج از حساب</button></div></aside>
    {mobileMenu && <button className="user-dashboard__backdrop" onClick={() => setMobileMenu(false)} aria-label="بستن منو" />}
    <main className="user-dashboard__main"><header className="user-dashboard__header"><button className="user-dashboard__menu-button" onClick={() => setMobileMenu(true)} aria-label="باز کردن منو"><FiMenu /></button><div><span>حساب کاربری</span><h1>{section === "overview" ? `سلام ${name}` : menu.find(([id]) => id === section)?.[1]}</h1></div><div className="user-dashboard__header-side"><button className="user-dashboard__theme-toggle" onClick={() => setDarkMode(!darkMode)} aria-label={darkMode ? "حالت روشن" : "حالت تاریک"} title={darkMode ? "حالت روشن" : "حالت تاریک"}>{darkMode ? <FiSun /> : <FiMoon />}</button><div className="user-dashboard__header-user">{profileImageSrc ? <img src={profileImageSrc} alt={name} className="user-dashboard__header-avatar" /> : <span>{name.charAt(0)}</span>}<strong>{name}</strong></div></div></header>
      {(error || message) && <div className={`user-dashboard__notice ${error ? "is-error" : ""}`}>{error || message}</div>}
      <div className="user-dashboard__content">
        {section === "overview" && <><section className="user-dashboard__welcome"><div><span>داشبورد شما</span><h2>همه چیز برای خرید بعدی آماده است</h2><p>سفارش‌ها، اطلاعات حساب و علاقه‌مندی‌هایتان را از همین‌جا مدیریت کنید.</p></div><div className="user-dashboard__welcome-mark"><FiPackage /></div></section><div className="user-dashboard__stats"><div><FiShoppingBag /><strong>{uniquePurchases.length.toLocaleString("fa-IR")}</strong><span>محصول خریداری‌شده</span></div><div><FiHeart /><strong>{favoritesCount.toLocaleString("fa-IR")}</strong><span>علاقه‌مندی</span></div><div><FiCheck /><strong>{profileProgress.toLocaleString("fa-IR")} / ۶</strong><span>تکمیل اطلاعات</span></div></div><div className="user-dashboard__columns"><section className="user-dashboard__panel"><div className="user-dashboard__panel-title"><h2>آخرین خریدها</h2><button onClick={() => chooseSection("purchases")}>مشاهده همه <FiArrowLeft /></button></div>{uniquePurchases.length ? uniquePurchases.slice(0, 3).map(renderPurchase) : <p className="user-dashboard__empty">هنوز خریدی ثبت نشده است.</p>}</section><section className="user-dashboard__panel user-dashboard__completion"><div className="user-dashboard__panel-title"><h2>وضعیت حساب</h2><FiUser /></div><div className="user-dashboard__progress"><span style={{ width: `${(profileProgress / 6) * 100}%` }} /></div><strong>{Math.round((profileProgress / 6) * 100).toLocaleString("fa-IR")}٪ تکمیل شده</strong><p>با تکمیل اطلاعات، ثبت سفارش سریع‌تر انجام می‌شود.</p><button onClick={() => chooseSection("profile")}>تکمیل اطلاعات <FiArrowLeft /></button></section></div></>}
        {section === "purchases" && <section className="user-dashboard__panel user-dashboard__wide-panel"><div className="user-dashboard__panel-title"><h2>محصولات خریداری‌شده</h2><span>{purchases.length.toLocaleString("fa-IR")} مورد</span></div>{purchases.length ? purchases.map(renderPurchase) : <p className="user-dashboard__empty">هنوز محصول خریداری‌شده‌ای ندارید.</p>}</section>}
        {section === "profile" && <section className="user-dashboard__panel user-dashboard__form-panel"><div className="user-dashboard__panel-title"><h2>اطلاعات حساب</h2>{!editingProfile && <button onClick={() => setEditingProfile(true)}><FiEdit3 /> ویرایش</button>}</div>{editingProfile ? <form onSubmit={saveProfile} className="user-dashboard__form"><div className="user-dashboard__avatar-block"><button type="button" className={`user-dashboard__avatar user-dashboard__avatar--editable ${profileImageSrc ? "has-image" : ""}`} onClick={() => avatarInputRef.current?.click()} aria-label="تغییر عکس پروفایل" title="تغییر عکس پروفایل">{profileImageSrc ? <img src={profileImageSrc} alt="عکس پروفایل" /> : <FiUser />}<span className="user-dashboard__avatar-badge"><FiCamera /></span></button><div className="user-dashboard__avatar-hint"><strong>{avatarFile ? "عکس جدید انتخاب شد — با «ذخیره تغییرات» اعمال می‌شود." : profile.profile_image ? "برای تغییر عکس، روی تصویر کلیک کنید." : "روی دایره کلیک کنید و عکس پروفایل انتخاب کنید."}</strong><span>مثل پیام‌رسان‌ها؛ عکس بلافاصله پیش‌نمایش می‌شود.</span><small>JPG یا PNG · حداکثر ۵ مگابایت</small>{avatarFile && <button type="button" className="user-dashboard__avatar-remove" onClick={removeAvatarPreview}>حذف عکس انتخاب‌شده</button>}</div><input ref={avatarInputRef} type="file" accept="image/*" hidden onChange={handleAvatarChange} /></div><label>نام<input value={profile.first_name} onChange={(event) => setProfile({ ...profile, first_name: event.target.value })} /></label><label>نام خانوادگی<input value={profile.last_name} onChange={(event) => setProfile({ ...profile, last_name: event.target.value })} /></label><label>ایمیل<input type="email" value={profile.email} onChange={(event) => setProfile({ ...profile, email: event.target.value })} /></label><label>شماره موبایل<input value={profile.phone} disabled /></label><button className="user-dashboard__save" disabled={saving}><FiSave /> {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}</button></form> : <div className="user-dashboard__details"><div className="user-dashboard__details-avatar"><div className={`user-dashboard__avatar user-dashboard__avatar--lg ${profileImageSrc ? "has-image" : ""}`}>{profileImageSrc ? <img src={profileImageSrc} alt="عکس پروفایل" /> : <FiUser />}</div><div><strong>{name}</strong><span dir="ltr">{profile.phone || "ثبت نشده"}</span></div></div><div><span>نام و نام خانوادگی</span><strong>{name}</strong></div><div><span>شماره موبایل</span><strong dir="ltr">{profile.phone || "ثبت نشده"}</strong></div><div><span>ایمیل</span><strong>{profile.email || "ثبت نشده"}</strong></div></div>}</section>}
        {section === "address" && <section className="user-dashboard__panel user-dashboard__form-panel"><div className="user-dashboard__panel-title"><h2>آدرس ارسال</h2>{!editingAddress && <button onClick={() => setEditingAddress(true)}><FiEdit3 /> ویرایش</button>}</div>{editingAddress ? <form onSubmit={saveAddress} className="user-dashboard__form"><label>استان<input value={address.province} onChange={(event) => setAddress({ ...address, province: event.target.value })} required /></label><label>شهر<input value={address.city} onChange={(event) => setAddress({ ...address, city: event.target.value })} required /></label><label className="user-dashboard__form-full">نشانی<input value={address.street} onChange={(event) => setAddress({ ...address, street: event.target.value })} required /></label><label>کد پستی<input inputMode="numeric" value={address.postal_code} onChange={(event) => setAddress({ ...address, postal_code: event.target.value })} required /></label><label>جزئیات بیشتر<input value={address.detail} onChange={(event) => setAddress({ ...address, detail: event.target.value })} /></label><button className="user-dashboard__save" disabled={saving}><FiSave /> {saving ? "در حال ذخیره..." : "ذخیره آدرس"}</button></form> : <div className="user-dashboard__address"><FiMapPin /><div><strong>{address.city && address.province ? `${address.province}، ${address.city}` : "آدرسی ثبت نشده است"}</strong><p>{address.street || "برای ارسال سریع، آدرس خود را اضافه کنید."}{address.detail && `، ${address.detail}`}</p>{address.postal_code && <small>کد پستی: {address.postal_code}</small>}</div></div>}</section>}
      </div></main>
  </div>;
};
export default Dashboard;
