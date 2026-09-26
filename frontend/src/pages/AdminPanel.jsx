import React,{useCallback,useEffect,useRef,useState}from"react";
import{useNavigate}from"react-router-dom";

import{FiHome,FiShoppingBag,FiBox,FiUsers,FiGrid,FiTag,FiBarChart2,FiSettings,FiFileText,FiLogOut,FiBell,FiSearch,FiMenu,FiX,FiSun,FiMoon,FiCalendar,FiChevronLeft,FiChevronDown,FiUser}from"react-icons/fi";import DashboardOverview from"../components/Dashboard";

import{FiHome,FiShoppingBag,FiBox,FiUsers,FiTag,FiBarChart2,FiSettings,FiLogOut,FiBell,FiSearch,FiMenu,FiX,FiSun,FiMoon,FiCalendar,FiChevronLeft,FiChevronDown,FiUser,FiMessageSquare,FiSave,FiEye,FiEyeOff,FiCheckCircle,FiAlertCircle,FiShield,FiPhone}from"react-icons/fi";
import DashboardOverview from"../components/Dashboard";

import Orders from"../components/Orders";
import Products from"../components/Products";
import CustomersSection from"../components/admin/CustomersSection";
import DiscountsSection from"../components/admin/DiscountsSection";
import ReportsSection from"../components/admin/ReportsSection";
import StoreSettingsSection from"../components/admin/StoreSettingsSection";
import ReviewsSection from"../components/admin/ReviewsSection";
import{apiRequest,getAssetUrl}from"../api";
import"./AdminPanel.css";
import"./AdminNotifications.css";
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
const shaminExtraSections=[{id:"profile",title:"پروفایل من",icon:FiUser},{id:"account-settings",title:"تنظیمات حساب",icon:FiSettings}];
const shaminNormalizeText=value=>String(value||"").replace(/ي/g,"ی").replace(/ى/g,"ی").replace(/ك/g,"ک").replace(/\u200c/g," ").replace(/\s+/g," ").toLowerCase().trim();
function AdminPanel({children}){
const navigate=useNavigate();
const[activeSection,setActiveSection]=useState("dashboard");
const[mobileSidebarOpen,setMobileSidebarOpen]=useState(false);
const[adminMenuOpen,setAdminMenuOpen]=useState(false);
const[darkMode,setDarkMode]=useState(false);
const[searchValue,setSearchValue]=useState("");
const[searchResults,setSearchResults]=useState({products:[],orders:[]});
const[searchLoading,setSearchLoading]=useState(false);
const[searchError,setSearchError]=useState("");
const[searchOpen,setSearchOpen]=useState(false);
const[adminUser,setAdminUser]=useState(null);
const[profileForm,setProfileForm]=useState({first_name:"",last_name:"",email:""});
const[profileSaving,setProfileSaving]=useState(false);
const[profileFeedback,setProfileFeedback]=useState(null);
const[passwordForm,setPasswordForm]=useState({current_password:"",password:"",password_confirm:""});
const[passwordSaving,setPasswordSaving]=useState(false);
const[passwordFeedback,setPasswordFeedback]=useState(null);
const[passwordVisible,setPasswordVisible]=useState(false);
const shaminAdminRef=useRef(null);
const notificationRef=useRef(null);
const notificationButtonRef=useRef(null);
const notificationRequest=useRef(0);
const notificationWrite=useRef(false);
const[notificationsOpen,setNotificationsOpen]=useState(false);
const[notifications,setNotifications]=useState([]);
const[unreadCount,setUnreadCount]=useState(0);
const[unreadOnly,setUnreadOnly]=useState(false);
const[notificationLoading,setNotificationLoading]=useState(false);
const[notificationError,setNotificationError]=useState("");
const[notificationSaving,setNotificationSaving]=useState(false);
const[nextNotification,setNextNotification]=useState(null);
const[latestNotification,setLatestNotification]=useState(null);
const loadNotifications=useCallback(async(before=null,quiet=false)=>{
if(notificationWrite.current)return;
const requestId=++notificationRequest.current;
if(!quiet)setNotificationLoading(true);
try{
const data=await apiRequest(`/admin/notifications/?unread=${unreadOnly}${before?`&before=${before}`:""}`);
if(requestId!==notificationRequest.current)return;
setNotifications(previous=>before?[...previous,...data.results.filter(item=>!previous.some(old=>old.id===item.id))]:quiet&&!unreadOnly?[...data.results,...previous.filter(item=>item.id<(data.results[data.results.length-1]?.id||0))]:data.results);
setUnreadCount(data.unread_count);if(!quiet||unreadOnly)setNextNotification(data.next_before);setLatestNotification(data.latest_id);setNotificationError("");
}catch(error){if(requestId===notificationRequest.current)setNotificationError("اعلان‌ها دریافت نشدند. اتصال را بررسی و دوباره تلاش کنید.")}
finally{if(requestId===notificationRequest.current)setNotificationLoading(false)}
},[unreadOnly]);
useEffect(()=>{
if(!adminUser)return;
loadNotifications();
const timer=setInterval(()=>{if(!document.hidden)loadNotifications(null,true)},30000);
const refresh=()=>{if(!document.hidden)loadNotifications(null,true)};
document.addEventListener("visibilitychange",refresh);
return()=>{clearInterval(timer);document.removeEventListener("visibilitychange",refresh);notificationRequest.current++};
},[adminUser,loadNotifications,notificationsOpen]);
useEffect(()=>{
if(!notificationsOpen)return;
notificationRef.current?.querySelector('[aria-label="بستن اعلان‌ها"]')?.focus();
const outside=event=>{if(notificationRef.current&&!notificationRef.current.contains(event.target))setNotificationsOpen(false)};
const keyboard=event=>{if(event.key==="Escape"){setNotificationsOpen(false);notificationButtonRef.current?.focus()}};
document.addEventListener("pointerdown",outside);document.addEventListener("keydown",keyboard);
return()=>{document.removeEventListener("pointerdown",outside);document.removeEventListener("keydown",keyboard)};
},[notificationsOpen]);
const markNotificationsRead=async(item=null)=>{
if(notificationWrite.current||(!item&&!latestNotification))return;
notificationWrite.current=true;
setNotificationSaving(true);setNotificationError("");
notificationRequest.current++;
try{
const data=await apiRequest("/admin/notifications/",{method:"POST",body:JSON.stringify(item?{id:item.id}:{through:latestNotification})});
setUnreadCount(data.unread_count);
setNotifications(previous=>previous.map(row=>(item?row.id===item.id:row.id<=latestNotification)?{...row,is_read:true}:row).filter(row=>!unreadOnly||!row.is_read));
if(item?.section){setActiveSection(item.section);setNotificationsOpen(false);setMobileSidebarOpen(false)}
}catch(error){setNotificationError("ثبت وضعیت خواندن انجام نشد. دوباره تلاش کنید.")}
finally{notificationWrite.current=false;setNotificationSaving(false);setNotificationLoading(false)}
};
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
const shaminAdminName=adminUser?[adminUser.first_name,adminUser.last_name].filter(Boolean).join(" ")||"مدیر سایت":"مدیر سایت";
const shaminAdminPhone=adminUser?adminUser.phone:"";
const shaminTodayLabel=new Intl.DateTimeFormat("fa-IR",{weekday:"long",day:"numeric",month:"long",year:"numeric"}).format(new Date());
const shaminTimeLabel=new Intl.DateTimeFormat("fa-IR",{hour:"2-digit",minute:"2-digit"}).format(new Date());
const shaminHandleSectionChange=id=>{
if(id==="profile"&&adminUser){setProfileForm({first_name:adminUser.first_name||"",last_name:adminUser.last_name||"",email:adminUser.email||""});setProfileFeedback(null)}
if(id==="account-settings"){setPasswordForm({current_password:"",password:"",password_confirm:""});setPasswordFeedback(null);setPasswordVisible(false)}
setActiveSection(id);setMobileSidebarOpen(false);setAdminMenuOpen(false);setNotificationsOpen(false)
};
const shaminHandleProfileChange=field=>event=>{setProfileForm(previous=>({...previous,[field]:event.target.value}))};
const shaminHandleProfileSave=async event=>{
event.preventDefault();
if(profileSaving)return;
setProfileFeedback(null);
const email=profileForm.email.trim();
if(email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){setProfileFeedback({type:"error",text:"ایمیل واردشده معتبر نیست."});return}
setProfileSaving(true);
try{
const user=await apiRequest("/auth/profile/",{method:"PATCH",body:JSON.stringify({first_name:profileForm.first_name.trim(),last_name:profileForm.last_name.trim(),email})});
setAdminUser(user);
setProfileForm({first_name:user.first_name||"",last_name:user.last_name||"",email:user.email||""});
setProfileFeedback({type:"success",text:"اطلاعات پروفایل با موفقیت ذخیره شد."});
}catch(error){setProfileFeedback({type:"error",text:error.message||"ذخیره اطلاعات پروفایل انجام نشد. دوباره تلاش کنید."})}
finally{setProfileSaving(false)}
};
const shaminHandleProfileReset=()=>{
if(!adminUser)return;
setProfileForm({first_name:adminUser.first_name||"",last_name:adminUser.last_name||"",email:adminUser.email||""});
setProfileFeedback(null);
};
const shaminHandlePasswordChange=field=>event=>{setPasswordForm(previous=>({...previous,[field]:event.target.value}))};
const shaminHandlePasswordSave=async event=>{
event.preventDefault();
if(passwordSaving)return;
setPasswordFeedback(null);
if(!passwordForm.current_password||!passwordForm.password||!passwordForm.password_confirm){setPasswordFeedback({type:"error",text:"همه فیلدهای رمز عبور را کامل کنید."});return}
if(passwordForm.password.length<8){setPasswordFeedback({type:"error",text:"رمز عبور جدید باید حداقل ۸ کاراکتر باشد."});return}
if(passwordForm.password!==passwordForm.password_confirm){setPasswordFeedback({type:"error",text:"رمز عبور جدید و تکرار آن یکسان نیستند."});return}
setPasswordSaving(true);
try{
await apiRequest("/auth/change-password/",{method:"POST",body:JSON.stringify(passwordForm)});
setPasswordForm({current_password:"",password:"",password_confirm:""});
setPasswordFeedback({type:"success",text:"رمز عبور با موفقیت تغییر کرد."});
}catch(error){setPasswordFeedback({type:"error",text:error.message||"تغییر رمز عبور انجام نشد. دوباره تلاش کنید."})}
finally{setPasswordSaving(false)}
};
const shaminHandleAdminMenu=()=>{setAdminMenuOpen(previous=>!previous);setNotificationsOpen(false)};
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
const shaminRenderProfile=()=>(
<section className="shamin-account" aria-label="پروفایل من">
<header className="shamin-account__head">
<h2>پروفایل من</h2>
<p>مشخصات حساب مدیریت فروشگاه را اینجا ببینید و ویرایش کنید.</p>
</header>
<div className="shamin-account__grid">
<aside className="shamin-account__card shamin-account__identity">
<div className="shamin-account__avatar"><span>{shaminAdminName.charAt(0)}</span></div>
<strong className="shamin-account__identity-name">{shaminAdminName}</strong>
<span className="shamin-account__identity-phone" dir="ltr">{shaminAdminPhone||"—"}</span>
<span className="shamin-account__role-badge">حساب مدیریت فروشگاه</span>
<div className="shamin-account__identity-rows">
<div className="shamin-account__identity-row"><span><FiPhone/></span><div><small>موبایل</small><strong dir="ltr">{shaminAdminPhone||"—"}</strong></div></div>
<div className="shamin-account__identity-row"><span><FiShield/></span><div><small>نقش</small><strong>مدیر فروشگاه</strong></div></div>
<div className="shamin-account__identity-row"><span><FiUser/></span><div><small>شناسه کاربری</small><strong dir="ltr">#{adminUser.id}</strong></div></div>
</div>
</aside>
<form className="shamin-account__card" onSubmit={shaminHandleProfileSave}>
<header className="shamin-account__card-head">
<span className="shamin-account__card-icon"><FiUser/></span>
<div><h3>ویرایش اطلاعات</h3><p>نام و ایمیل حساب مدیریت را به‌روز کنید؛ بلافاصله در سربرگ پنل هم اعمال می‌شود.</p></div>
</header>
<div className="shamin-account__fields">
<label className="shamin-account__field">
<span>نام</span>
<input type="text" value={profileForm.first_name} onChange={shaminHandleProfileChange("first_name")} placeholder="مثلاً آرمین" maxLength={50}/>
</label>
<label className="shamin-account__field">
<span>نام خانوادگی</span>
<input type="text" value={profileForm.last_name} onChange={shaminHandleProfileChange("last_name")} placeholder="مثلاً محمدی" maxLength={50}/>
</label>
<label className="shamin-account__field shamin-account__field--wide">
<span>ایمیل</span>
<input type="email" dir="ltr" value={profileForm.email} onChange={shaminHandleProfileChange("email")} placeholder="admin@shamin.gallery"/>
</label>
</div>
{profileFeedback&&<div className={`shamin-account__feedback shamin-account__feedback--${profileFeedback.type}`} role={profileFeedback.type==="error"?"alert":"status"}>{profileFeedback.type==="error"?<FiAlertCircle/>:<FiCheckCircle/>}<span>{profileFeedback.text}</span></div>}
<footer className="shamin-account__actions">
<button type="submit" className="shamin-account__submit" disabled={profileSaving}>{profileSaving?"در حال ذخیره...":"ذخیره تغییرات"}</button>
<button type="button" className="shamin-account__ghost" onClick={shaminHandleProfileReset} disabled={profileSaving}>انصراف</button>
</footer>
</form>
</div>
</section>
);
const shaminRenderSettings=()=>(
<section className="shamin-account" aria-label="تنظیمات حساب">
<header className="shamin-account__head">
<h2>تنظیمات حساب</h2>
<p>امنیت حساب مدیریت و حالت نمایش پنل را از اینجا تنظیم کنید.</p>
</header>
<div className="shamin-account__grid shamin-account__grid--settings">
<form className="shamin-account__card" onSubmit={shaminHandlePasswordSave}>
<header className="shamin-account__card-head">
<span className="shamin-account__card-icon"><FiShield/></span>
<div><h3>تغییر رمز عبور</h3><p>برای امنیت بیشتر فروشگاه، از رمزی غیرقابل حدس استفاده کنید.</p></div>
</header>
<div className="shamin-account__fields">
<label className="shamin-account__field shamin-account__field--wide">
<span>رمز عبور فعلی</span>
<div className="shamin-account__password">
<input type={passwordVisible?"text":"password"} value={passwordForm.current_password} onChange={shaminHandlePasswordChange("current_password")} placeholder="••••••••" autoComplete="current-password"/>
<button type="button" className="shamin-account__password-toggle" onClick={()=>setPasswordVisible(previous=>!previous)} aria-label={passwordVisible?"پنهان کردن رمزها":"نمایش رمزها"}>{passwordVisible?<FiEyeOff/>:<FiEye/>}</button>
</div>
</label>
<label className="shamin-account__field">
<span>رمز عبور جدید</span>
<input type={passwordVisible?"text":"password"} value={passwordForm.password} onChange={shaminHandlePasswordChange("password")} placeholder="حداقل ۸ کاراکتر" autoComplete="new-password"/>
</label>
<label className="shamin-account__field">
<span>تکرار رمز عبور جدید</span>
<input type={passwordVisible?"text":"password"} value={passwordForm.password_confirm} onChange={shaminHandlePasswordChange("password_confirm")} placeholder="تکرار رمز عبور جدید" autoComplete="new-password"/>
</label>
</div>
{passwordFeedback&&<div className={`shamin-account__feedback shamin-account__feedback--${passwordFeedback.type}`} role={passwordFeedback.type==="error"?"alert":"status"}>{passwordFeedback.type==="error"?<FiAlertCircle/>:<FiCheckCircle/>}<span>{passwordFeedback.text}</span></div>}
<footer className="shamin-account__actions">
<button type="submit" className="shamin-account__submit" disabled={passwordSaving}>{passwordSaving?"در حال تغییر...":"ذخیره رمز عبور جدید"}</button>
</footer>
</form>
<section className="shamin-account__card">
<header className="shamin-account__card-head">
<span className="shamin-account__card-icon"><FiSettings/></span>
<div><h3>حالت نمایش پنل</h3><p>انتخاب شما در همین مرورگر برای دفعات بعد هم ذخیره می‌شود.</p></div>
</header>
<div className="shamin-account__theme">
<button type="button" className={`shamin-account__theme-option ${!darkMode?"shamin-account__theme-option--active":""}`} aria-pressed={!darkMode} onClick={()=>setDarkMode(false)}>
<span className="shamin-account__theme-icon shamin-account__theme-icon--light"><FiSun/></span>
<strong>حالت روشن</strong>
<span>پیش‌فرض روشن پنل</span>
{!darkMode&&<FiCheckCircle className="shamin-account__theme-check"/>}
</button>
<button type="button" className={`shamin-account__theme-option ${darkMode?"shamin-account__theme-option--active":""}`} aria-pressed={darkMode} onClick={()=>setDarkMode(true)}>
<span className="shamin-account__theme-icon shamin-account__theme-icon--dark"><FiMoon/></span>
<strong>حالت تاریک</strong>
<span>مناسب کار در شب</span>
{darkMode&&<FiCheckCircle className="shamin-account__theme-check"/>}
</button>
</div>
</section>
</div>
</section>
);
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
if(activeSection==="profile"){return shaminRenderProfile()}
if(activeSection==="account-settings"){return shaminRenderSettings()}
return null;
};
if(!adminUser){return null}
return(
<div className={`shamin-dashboard ${mobileSidebarOpen?"shamin-dashboard--sidebar-open":""} ${darkMode?"shamin-dashboard--dark":""}`} dir="rtl">
<div className="shamin-dashboard__overlay" onClick={()=>setMobileSidebarOpen(false)}/>
<aside className="shamin-dashboard__sidebar">
<div className="shamin-dashboard__brand">
<div className="shamin-dashboard__brand-logo">
<img src="/logo.png" alt="Shamin Gallery" className="shamin-dashboard__brand-image"/>
</div>
<div className="shamin-dashboard__brand-text">
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
<div className="shamin-notifications" ref={notificationRef}>
<button ref={notificationButtonRef} type="button" className="shamin-dashboard__topbar-button shamin-dashboard__notification" aria-label={`اعلان‌ها، ${unreadCount.toLocaleString("fa-IR")} خوانده‌نشده`} aria-expanded={notificationsOpen} aria-controls="shamin-notifications-panel" onClick={()=>{setNotificationsOpen(previous=>!previous);setAdminMenuOpen(false);setMobileSidebarOpen(false)}}>
<FiBell/>
{unreadCount>0&&<span className="shamin-dashboard__notification-badge">{unreadCount>99?"۹۹+":unreadCount.toLocaleString("fa-IR")}</span>}
</button>
{notificationsOpen&&<section id="shamin-notifications-panel" className="shamin-notifications__panel" aria-label="اعلان‌های سایت" aria-busy={notificationLoading}>
<div className="shamin-notifications__head"><div><strong>اعلان‌های سایت</strong><span>{unreadCount.toLocaleString("fa-IR")} اعلان خوانده‌نشده</span></div><button type="button" aria-label="بستن اعلان‌ها" onClick={()=>{setNotificationsOpen(false);notificationButtonRef.current?.focus()}}><FiX/></button></div>
<div className="shamin-notifications__tools"><div><button type="button" aria-pressed={!unreadOnly} onClick={()=>{if(unreadOnly){setNotifications([]);setUnreadOnly(false)}}}>همه</button><button type="button" aria-pressed={unreadOnly} onClick={()=>{if(!unreadOnly){setNotifications([]);setUnreadOnly(true)}}}>خوانده‌نشده</button></div><button type="button" disabled={notificationSaving||!unreadCount||!latestNotification} onClick={()=>markNotificationsRead()}>خواندن همه</button></div>
{notificationError&&<div className="shamin-notifications__error" role="alert">{notificationError}<button type="button" disabled={notificationLoading} onClick={()=>loadNotifications()}>تلاش دوباره</button></div>}
<div className="shamin-notifications__list">
{!notificationLoading&&!notificationError&&notifications.length===0&&<div className="shamin-notifications__empty"><FiBell/><strong>{unreadOnly?"همه اعلان‌ها را خوانده‌اید":"هنوز اعلانی ثبت نشده"}</strong><p>رویدادهای جدید سایت در این بخش نمایش داده می‌شوند.</p></div>}
{notifications.map(item=><button type="button" disabled={notificationSaving} className={`shamin-notifications__item ${!item.is_read?"shamin-notifications__item--unread":""}`} key={item.id} onClick={()=>markNotificationsRead(item)}>
<span className="shamin-notifications__icon">{item.kind==="order"?<FiShoppingBag/>:item.kind==="product"?<FiBox/>:item.kind==="login"||item.kind==="account"?<FiUser/>:<FiBell/>}</span>
<span className="shamin-notifications__body"><strong>{item.title}{!item.is_read&&<span className="shamin-notifications__dot" aria-label="خوانده‌نشده"/>}</strong><span>{item.message}</span><time dateTime={item.created_at}>{new Intl.DateTimeFormat("fa-IR",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}).format(new Date(item.created_at))}</time>{item.section&&<small>مشاهده {item.section==="orders"?"سفارش‌ها":"محصولات"} ←</small>}</span>
</button>)}
{notificationLoading&&<p className="shamin-notifications__status" role="status">در حال دریافت اعلان‌ها...</p>}
{nextNotification&&<button type="button" className="shamin-notifications__more" disabled={notificationLoading} onClick={()=>loadNotifications(nextNotification)}>نمایش اعلان‌های قدیمی‌تر</button>}
</div><div className="shamin-notifications__footer"><span>رویدادهای ثبت‌شده سایت</span><button type="button" disabled={notificationLoading||notificationSaving} onClick={()=>loadNotifications()}>به‌روزرسانی</button></div>
</section>}
</div>
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
<button type="button" className="shamin-dashboard__admin-dropdown-item" onClick={()=>shaminHandleSectionChange("profile")}>
<span className="shamin-dashboard__admin-dropdown-icon"><FiUser/></span>
<span>پروفایل من</span>
</button>
<button type="button" className="shamin-dashboard__admin-dropdown-item" onClick={()=>shaminHandleSectionChange("account-settings")}>
<span className="shamin-dashboard__admin-dropdown-icon"><FiSettings/></span>
<span>تنظیمات حساب</span>
</button>
<button type="button" className="shamin-dashboard__admin-dropdown-item" onClick={()=>shaminHandleSectionChange("store-settings")}>
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
</div>
);
}
export default AdminPanel;
