import React,{useEffect,useRef,useState}from"react";
import{useNavigate}from"react-router-dom";
import{FiHome,FiShoppingBag,FiBox,FiUsers,FiTag,FiBarChart2,FiSettings,FiLogOut,FiBell,FiSearch,FiMenu,FiX,FiSun,FiMoon,FiCalendar,FiChevronLeft,FiChevronDown,FiUser,FiMessageSquare,FiSave}from"react-icons/fi";
import DashboardOverview from"../components/Dashboard";
import Orders from"../components/Orders";
import Products from"../components/Products";
import CustomersSection from"../components/admin/CustomersSection";
import DiscountsSection from"../components/admin/DiscountsSection";
import ReportsSection from"../components/admin/ReportsSection";
import StoreSettingsSection from"../components/admin/StoreSettingsSection";
import ReviewsSection from"../components/admin/ReviewsSection";
import{apiRequest}from"../api";
import"./AdminPanel.css";
const shaminDashboardMenu=[
{id:"dashboard",title:"پنل ادمین",icon:FiHome},
{id:"orders",title:"سفارشات",icon:FiShoppingBag},
{id:"products",title:"محصولات",icon:FiBox},
{id:"reviews",title:"نظرها",icon:FiMessageSquare},
{id:"customers",title:"مشتریان",icon:FiUsers},
{id:"discounts",title:"تخفیف‌ها و پیشنهادها",icon:FiTag},
{id:"reports",title:"گزارش‌ها",icon:FiBarChart2},
{id:"store-settings",title:"تنظیمات فروشگاه",icon:FiSettings}
];
function AdminPanel({children}){
const navigate=useNavigate();
const[activeSection,setActiveSection]=useState("dashboard");
const[mobileSidebarOpen,setMobileSidebarOpen]=useState(false);
const[adminMenuOpen,setAdminMenuOpen]=useState(false);
const[darkMode,setDarkMode]=useState(false);
const[searchValue,setSearchValue]=useState("");
const[adminUser,setAdminUser]=useState(null);
const[profileModalOpen,setProfileModalOpen]=useState(false);
const[profileForm,setProfileForm]=useState({first_name:"",last_name:"",email:""});
const[profileLoading,setProfileLoading]=useState(false);
const[profileSaving,setProfileSaving]=useState(false);
const[profileMessage,setProfileMessage]=useState(null);
const shaminAdminRef=useRef(null);
useEffect(()=>{const savedTheme=localStorage.getItem("shamin-dashboard-theme");if(savedTheme==="dark"){setDarkMode(true)}},[]);
useEffect(()=>{localStorage.setItem("shamin-dashboard-theme",darkMode?"dark":"light")},[darkMode]);
useEffect(()=>{
let ignore=false;
apiRequest("/auth/profile/")
.then(user=>{
if(ignore)return;
if(user.role!=="admin"){navigate("/Login");return}
setAdminUser(user);
})
.catch(()=>{if(!ignore)navigate("/Login")});
return()=>{ignore=true};
},[navigate]);
useEffect(()=>{
const shaminHandleOutsideClick=event=>{if(shaminAdminRef.current&&!shaminAdminRef.current.contains(event.target)){setAdminMenuOpen(false)}};
const shaminHandleEscape=event=>{if(event.key==="Escape"){setAdminMenuOpen(false)}};
document.addEventListener("mousedown",shaminHandleOutsideClick);
document.addEventListener("keydown",shaminHandleEscape);
return()=>{document.removeEventListener("mousedown",shaminHandleOutsideClick);document.removeEventListener("keydown",shaminHandleEscape)}
},[]);
const shaminHandleLogout=()=>{
["access","refresh","access_token","refresh_token","user"].forEach(key=>localStorage.removeItem(key));
navigate("/Login");
};
useEffect(()=>{
if(!profileModalOpen)return;
let ignore=false;
setProfileLoading(true);
setProfileMessage(null);
apiRequest("/auth/profile/")
.then(user=>{if(!ignore)setProfileForm({first_name:user.first_name||"",last_name:user.last_name||"",email:user.email||""})})
.catch(err=>{if(!ignore)setProfileMessage({type:"error",text:err?.message||"دریافت پروفایل ناموفق بود."})})
.finally(()=>{if(!ignore)setProfileLoading(false)});
return()=>{ignore=true};
},[profileModalOpen]);
const shaminSaveProfile=e=>{
e.preventDefault();
setProfileSaving(true);
setProfileMessage(null);
apiRequest("/auth/profile/",{method:"PATCH",body:JSON.stringify({
first_name:profileForm.first_name.trim(),
last_name:profileForm.last_name.trim(),
email:profileForm.email.trim(),
})})
.then(user=>{setProfileForm({first_name:user.first_name||"",last_name:user.last_name||"",email:user.email||""});setProfileMessage({type:"success",text:"پروفایل ذخیره شد."})})
.catch(err=>setProfileMessage({type:"error",text:err?.message||"ذخیره پروفایل ناموفق بود."}))
.finally(()=>setProfileSaving(false));
};
const shaminAdminName=adminUser?[adminUser.first_name,adminUser.last_name].filter(Boolean).join(" ")||"مدیر سایت":"مدیر سایت";
const shaminAdminPhone=adminUser?adminUser.phone:"";
const shaminTodayLabel=new Intl.DateTimeFormat("fa-IR",{weekday:"long",day:"numeric",month:"long",year:"numeric"}).format(new Date());
const shaminTimeLabel=new Intl.DateTimeFormat("fa-IR",{hour:"2-digit",minute:"2-digit"}).format(new Date());
const shaminHandleSectionChange=id=>{setActiveSection(id);setMobileSidebarOpen(false);setAdminMenuOpen(false)};
const shaminHandleAdminMenu=()=>{setAdminMenuOpen(previous=>!previous)};
const shaminHandleThemeChange=()=>{setDarkMode(previous=>!previous)};
const shaminHandleSearchClear=()=>{setSearchValue("")};
const shaminHandleProfileOpen=()=>{setAdminMenuOpen(false);setProfileModalOpen(true)};
const shaminRenderMenu=()=>shaminDashboardMenu.map(item=>{
const Icon=item.icon;
const isActive=activeSection===item.id;
return(
<button key={item.id} type="button" className={`shamin-dashboard__nav-item ${isActive?"shamin-dashboard__nav-item--active":""}`} onClick={()=>shaminHandleSectionChange(item.id)}>
<span className="shamin-dashboard__nav-icon"><Icon/></span>
<span className="shamin-dashboard__nav-label">{item.title}</span>
<span className="shamin-dashboard__nav-arrow"><FiChevronLeft/></span>
</button>
);
});
const shaminRenderContent=()=>{
if(children){return children}
if(activeSection==="dashboard"){return<DashboardOverview/>}
if(activeSection==="orders"){return<Orders/>}
if(activeSection==="products"){return<Products/>}
if(activeSection==="reviews"){return<ReviewsSection/>}
if(activeSection==="customers"){return<CustomersSection/>}
if(activeSection==="discounts"){return<DiscountsSection/>}
if(activeSection==="reports"){return<ReportsSection/>}
if(activeSection==="store-settings"){return<StoreSettingsSection/>}
return null;
};
if(!adminUser){return null}
return(
<div className={`shamin-dashboard ${mobileSidebarOpen?"shamin-dashboard--sidebar-open":""} ${darkMode?"shamin-dashboard--dark":""}`} dir="rtl">
<div className="shamin-dashboard__overlay" onClick={()=>setMobileSidebarOpen(false)}/>
<aside className="shamin-dashboard__sidebar">
<div className="shamin-dashboard__brand">
<div className="shamin-dashboard__brand-logo">
<img src="/Asets/Shamin gallery.png" alt="Shamin Gallery" className="shamin-dashboard__brand-image"/>
</div>
<div className="shamin-dashboard__brand-text">
<strong>پنل ادمین</strong>
<span>Shamin Gallery</span>
</div>
<button type="button" className="shamin-dashboard__mobile-close" onClick={()=>setMobileSidebarOpen(false)} aria-label="بستن منو"><FiX/></button>
</div>
<div className="shamin-dashboard__sidebar-scroll">
<nav className="shamin-dashboard__navigation">{shaminRenderMenu()}</nav>
</div>
<div className="shamin-dashboard__sidebar-bottom">
<button type="button" className="shamin-dashboard__logout" onClick={shaminHandleLogout}><FiLogOut/><span>خروج از پنل ادمین</span></button>
</div>
</aside>
<main className="shamin-dashboard__main">
<header className="shamin-dashboard__topbar">
<button type="button" className="shamin-dashboard__mobile-menu" onClick={()=>setMobileSidebarOpen(true)} aria-label="باز کردن منو"><FiMenu/></button>
<div className="shamin-dashboard__topbar-center">
<div className="shamin-dashboard__search">
<span className="shamin-dashboard__search-icon"><FiSearch/></span>
<input type="text" value={searchValue} onChange={event=>setSearchValue(event.target.value)} placeholder="جستجو در بخش‌های مختلف..." aria-label="جستجو"/>
{searchValue&&(<button type="button" className="shamin-dashboard__search-clear" onClick={shaminHandleSearchClear} aria-label="پاک کردن جستجو"><FiX/></button>)}
</div>
</div>
<div className="shamin-dashboard__topbar-left">
<div className="shamin-dashboard__date">
<FiCalendar/>
<div>
<strong>{shaminTodayLabel}</strong>
<span>ساعت {shaminTimeLabel}</span>
</div>
</div>
<button type="button" className="shamin-dashboard__topbar-button" onClick={shaminHandleThemeChange} aria-label={darkMode?"فعال کردن حالت روشن":"فعال کردن حالت تاریک"}>{darkMode?<FiSun/>:<FiMoon/>}</button>
<button type="button" className="shamin-dashboard__topbar-button shamin-dashboard__notification" aria-label="اعلان‌ها">
<FiBell/>
<span className="shamin-dashboard__notification-badge">۳</span>
</button>
<div className="shamin-dashboard__admin-wrapper" ref={shaminAdminRef}>
<button type="button" className={`shamin-dashboard__admin ${adminMenuOpen?"shamin-dashboard__admin--open":""}`} onClick={shaminHandleAdminMenu} aria-expanded={adminMenuOpen} aria-haspopup="true">
<div className="shamin-dashboard__admin-avatar"><span>{shaminAdminName.charAt(0)}</span></div>
<div className="shamin-dashboard__admin-info">
<strong>{shaminAdminName}</strong>
<span>{shaminAdminPhone||"admin"}</span>
</div>
<span className="shamin-dashboard__admin-arrow"><FiChevronDown/></span>
</button>
<div className={`shamin-dashboard__admin-dropdown ${adminMenuOpen?"shamin-dashboard__admin-dropdown--open":""}`}>
<div className="shamin-dashboard__admin-dropdown-head">
<div className="shamin-dashboard__admin-dropdown-avatar">{shaminAdminName.charAt(0)}</div>
<div>
<strong>{shaminAdminName}</strong>
<span>حساب مدیریت فروشگاه</span>
</div>
</div>
<div className="shamin-dashboard__admin-dropdown-divider"/>
<button type="button" className="shamin-dashboard__admin-dropdown-item" onClick={shaminHandleProfileOpen}>
<span className="shamin-dashboard__admin-dropdown-icon"><FiUser/></span>
<span>پروفایل من</span>
</button>
<button type="button" className="shamin-dashboard__admin-dropdown-item" onClick={()=>{setAdminMenuOpen(false);shaminHandleSectionChange("store-settings")}}>
<span className="shamin-dashboard__admin-dropdown-icon"><FiSettings/></span>
<span>تنظیمات فروشگاه</span>
</button>
<div className="shamin-dashboard__admin-dropdown-divider"/>
<button type="button" className="shamin-dashboard__admin-dropdown-item shamin-dashboard__admin-dropdown-item--logout" onClick={shaminHandleLogout}>
<span className="shamin-dashboard__admin-dropdown-icon"><FiLogOut/></span>
<span>خروج از پنل</span>
</button>
</div>
</div>
</div>
</header>
<section className="shamin-dashboard__content">{shaminRenderContent()}</section>
</main>
{profileModalOpen&&(
<div className="shamin-modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setProfileModalOpen(false)}}>
<div className="shamin-modal" role="dialog" aria-modal="true" aria-label="پروفایل من">
<div className="shamin-modal__head">
<div>
<span className="shamin-modal__kicker"><FiUser/> حساب مدیریت</span>
<h2>پروفایل من</h2>
</div>
<button type="button" className="shamin-modal__close" onClick={()=>setProfileModalOpen(false)} aria-label="بستن"><FiX/></button>
</div>
{profileLoading?(
<div className="shamin-modal__state">در حال دریافت اطلاعات...</div>
):(
<form className="shamin-modal__body" onSubmit={shaminSaveProfile}>
<label className="shamin-field"><span>نام</span><input type="text" value={profileForm.first_name} onChange={e=>setProfileForm(p=>({...p,first_name:e.target.value}))}/></label>
<label className="shamin-field"><span>نام خانوادگی</span><input type="text" value={profileForm.last_name} onChange={e=>setProfileForm(p=>({...p,last_name:e.target.value}))}/></label>
<label className="shamin-field"><span>ایمیل</span><input type="email" dir="ltr" value={profileForm.email} onChange={e=>setProfileForm(p=>({...p,email:e.target.value}))}/></label>
<label className="shamin-field"><span>شماره موبایل</span><input type="text" dir="ltr" value={shaminAdminPhone||""} disabled/></label>
{profileMessage&&(
<p className={profileMessage.type==="success"?"shamin-modal__msg shamin-modal__msg--success":"shamin-modal__msg shamin-modal__msg--error"}>{profileMessage.text}</p>
)}
<div className="shamin-modal__actions">
<button type="button" className="shamin-btn shamin-btn--ghost" onClick={()=>setProfileModalOpen(false)}>بستن</button>
<button type="submit" className="shamin-btn shamin-btn--primary" disabled={profileSaving}><FiSave/> {profileSaving?"در حال ذخیره...":"ذخیره تغییرات"}</button>
</div>
</form>
)}
</div>
</div>
)}
</div>
);
}
export default AdminPanel;