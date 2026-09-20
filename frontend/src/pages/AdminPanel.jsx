import React,{useEffect,useRef,useState}from"react";
import{FiHome,FiShoppingBag,FiBox,FiUsers,FiGrid,FiTag,FiBarChart2,FiSettings,FiFileText,FiHeadphones,FiLogOut,FiBell,FiSearch,FiMenu,FiX,FiSun,FiMoon,FiCalendar,FiChevronLeft,FiChevronDown,FiUser}from"react-icons/fi";
import DashboardOverview from"../components/Dashboard";
import Orders from"../components/Orders";
import Products from"../components/Products";
import"./AdminPanel.css";
const shaminDashboardMenu=[
{id:"dashboard",title:"پنل ادمین",icon:FiHome},
{id:"orders",title:"سفارشات",icon:FiShoppingBag},
{id:"products",title:"محصولات",icon:FiBox},
{id:"customers",title:"مشتریان",icon:FiUsers},
{id:"categories",title:"دسته‌بندی‌ها",icon:FiGrid},
{id:"discounts",title:"تخفیف‌ها و پیشنهادها",icon:FiTag},
{id:"reports",title:"گزارش‌ها",icon:FiBarChart2},
{id:"store-settings",title:"تنظیمات فروشگاه",icon:FiSettings},
{id:"content",title:"مدیریت محتوا",icon:FiFileText},
{id:"support",title:"پشتیبانی",icon:FiHeadphones}
];
function AdminPanel({children}){
const[activeSection,setActiveSection]=useState("dashboard");
const[mobileSidebarOpen,setMobileSidebarOpen]=useState(false);
const[adminMenuOpen,setAdminMenuOpen]=useState(false);
const[darkMode,setDarkMode]=useState(false);
const[searchValue,setSearchValue]=useState("");
const shaminAdminRef=useRef(null);
useEffect(()=>{const savedTheme=localStorage.getItem("shamin-dashboard-theme");if(savedTheme==="dark"){setDarkMode(true)}},[]);
useEffect(()=>{localStorage.setItem("shamin-dashboard-theme",darkMode?"dark":"light")},[darkMode]);
useEffect(()=>{
const shaminHandleOutsideClick=event=>{if(shaminAdminRef.current&&!shaminAdminRef.current.contains(event.target)){setAdminMenuOpen(false)}};
const shaminHandleEscape=event=>{if(event.key==="Escape"){setAdminMenuOpen(false)}};
document.addEventListener("mousedown",shaminHandleOutsideClick);
document.addEventListener("keydown",shaminHandleEscape);
return()=>{document.removeEventListener("mousedown",shaminHandleOutsideClick);document.removeEventListener("keydown",shaminHandleEscape)}
},[]);
const shaminHandleSectionChange=id=>{setActiveSection(id);setMobileSidebarOpen(false);setAdminMenuOpen(false)};
const shaminHandleAdminMenu=()=>{setAdminMenuOpen(previous=>!previous)};
const shaminHandleThemeChange=()=>{setDarkMode(previous=>!previous)};
const shaminHandleSearchClear=()=>{setSearchValue("")};
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
return null;
};
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
<div className="shamin-dashboard__support-box">
<div className="shamin-dashboard__support-icon"><FiHeadphones/></div>
<div className="shamin-dashboard__support-text">
<strong>پشتیبانی آنلاین</strong>
<span>در خدمت مدیران فروشگاه هستیم</span>
</div>
</div>
<button type="button" className="shamin-dashboard__logout"><FiLogOut/><span>خروج از پنل ادمین</span></button>
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
<strong>دوشنبه، ۲۳ شهریور ۱۴۰۴</strong>
<span>ساعت ۱۴:۲۵</span>
</div>
</div>
<button type="button" className="shamin-dashboard__topbar-button" onClick={shaminHandleThemeChange} aria-label={darkMode?"فعال کردن حالت روشن":"فعال کردن حالت تاریک"}>{darkMode?<FiSun/>:<FiMoon/>}</button>
<button type="button" className="shamin-dashboard__topbar-button shamin-dashboard__notification" aria-label="اعلان‌ها">
<FiBell/>
<span className="shamin-dashboard__notification-badge">۳</span>
</button>
<div className="shamin-dashboard__admin-wrapper" ref={shaminAdminRef}>
<button type="button" className={`shamin-dashboard__admin ${adminMenuOpen?"shamin-dashboard__admin--open":""}`} onClick={shaminHandleAdminMenu} aria-expanded={adminMenuOpen} aria-haspopup="true">
<div className="shamin-dashboard__admin-avatar"><span>م</span></div>
<div className="shamin-dashboard__admin-info">
<strong>مدیر سایت</strong>
<span>admin</span>
</div>
<span className="shamin-dashboard__admin-arrow"><FiChevronDown/></span>
</button>
<div className={`shamin-dashboard__admin-dropdown ${adminMenuOpen?"shamin-dashboard__admin-dropdown--open":""}`}>
<div className="shamin-dashboard__admin-dropdown-head">
<div className="shamin-dashboard__admin-dropdown-avatar">م</div>
<div>
<strong>مدیر سایت</strong>
<span>حساب مدیریت فروشگاه</span>
</div>
</div>
<div className="shamin-dashboard__admin-dropdown-divider"/>
<button type="button" className="shamin-dashboard__admin-dropdown-item" onClick={()=>setAdminMenuOpen(false)}>
<span className="shamin-dashboard__admin-dropdown-icon"><FiUser/></span>
<span>پروفایل من</span>
</button>
<button type="button" className="shamin-dashboard__admin-dropdown-item" onClick={()=>setAdminMenuOpen(false)}>
<span className="shamin-dashboard__admin-dropdown-icon"><FiSettings/></span>
<span>تنظیمات حساب</span>
</button>
<div className="shamin-dashboard__admin-dropdown-divider"/>
<button type="button" className="shamin-dashboard__admin-dropdown-item shamin-dashboard__admin-dropdown-item--logout" onClick={()=>setAdminMenuOpen(false)}>
<span className="shamin-dashboard__admin-dropdown-icon"><FiLogOut/></span>
<span>خروج از پنل</span>
</button>
</div>
</div>
</div>
</header>
<section className="shamin-dashboard__content">{shaminRenderContent()}</section>
</main>
</div>
);
}
export default AdminPanel;