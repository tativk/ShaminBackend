import React,{useEffect,useRef,useState}from"react";
import{useNavigate}from"react-router-dom";
import{FiHome,FiShoppingBag,FiBox,FiUsers,FiTag,FiBarChart2,FiSettings,FiLogOut,FiBell,FiSearch,FiMenu,FiX,FiSun,FiMoon,FiCalendar,FiChevronLeft,FiChevronDown,FiUser,FiMessageSquare,FiEye,FiEyeOff,FiCheckCircle,FiAlertCircle,FiShield,FiPhone,FiCamera}from"react-icons/fi";
import DashboardOverview from"../../components/AdminPanel/DashboardOverview";
import Orders from"../../components/AdminPanel/Orders";
import Products from"../../components/AdminPanel/Products";
import CustomersSection from"../../components/AdminPanel/sections/CustomersSection";
import AdminsSection from"../../components/AdminPanel/sections/AdminsSection";
import DiscountsSection from"../../components/AdminPanel/sections/DiscountsSection";
import ReportsSection from"../../components/AdminPanel/sections/ReportsSection";
import StoreSettingsSection from"../../components/AdminPanel/sections/StoreSettingsSection";
import ReviewsSection from"../../components/AdminPanel/sections/ReviewsSection";
import NotificationsBell from"../../components/AdminPanel/NotificationsBell";
import{apiRequest,clearStoredAuth,getAssetUrl}from"../../api";
import"./AdminPanel.css";
const shaminDashboardMenu=[
{id:"dashboard",title:"پنل ادمین",icon:FiHome},
{id:"orders",title:"سفارشات",icon:FiShoppingBag},
{id:"products",title:"محصولات",icon:FiBox},
{id:"customers",title:"مشتریان",icon:FiUsers},
{id:"admins",title:"ادمین‌ها",icon:FiShield},
{id:"reviews",title:"نظرات",icon:FiMessageSquare},
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
const[profileForm,setProfileForm]=useState({first_name:"",last_name:"",email:""});
const[profileSaving,setProfileSaving]=useState(false);
const[profileFeedback,setProfileFeedback]=useState(null);
const[passwordForm,setPasswordForm]=useState({current_password:"",password:"",password_confirm:""});
const[passwordSaving,setPasswordSaving]=useState(false);
const[passwordFeedback,setPasswordFeedback]=useState(null);
const[passwordVisible,setPasswordVisible]=useState(false);
const[avatarFile,setAvatarFile]=useState(null);
const[avatarPreview,setAvatarPreview]=useState(null);
const avatarInputRef=useRef(null);
const[phoneForm,setPhoneForm]=useState({phone:"",current_password:""});
const[phoneSaving,setPhoneSaving]=useState(false);
const[phoneFeedback,setPhoneFeedback]=useState(null);
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
clearStoredAuth();
navigate("/Login");
};
const shaminAdminName=adminUser?[adminUser.first_name,adminUser.last_name].filter(Boolean).join(" ")||"مدیر سایت":"مدیر سایت";
const shaminAdminPhone=adminUser?adminUser.phone:"";
const shaminTodayLabel=new Intl.DateTimeFormat("fa-IR",{weekday:"long",day:"numeric",month:"long",year:"numeric"}).format(new Date());
const shaminTimeLabel=new Intl.DateTimeFormat("fa-IR",{hour:"2-digit",minute:"2-digit"}).format(new Date());
const shaminHandleSectionChange=id=>{
if(id==="profile"&&adminUser){setProfileForm({first_name:adminUser.first_name||"",last_name:adminUser.last_name||"",email:adminUser.email||""});setProfileFeedback(null)}
if(id==="account-settings"){setPasswordForm({current_password:"",password:"",password_confirm:""});setPasswordFeedback(null);setPasswordVisible(false)}
setActiveSection(id);setMobileSidebarOpen(false);setAdminMenuOpen(false)
};
const shaminHandleProfileChange=field=>event=>{setProfileForm(previous=>({...previous,[field]:event.target.value}))};
const shaminHandleAvatarChange=event=>{
const file=event.target.files&&event.target.files[0];
if(!file)return;
if(!file.type.startsWith("image/")){setProfileFeedback({type:"error",text:"فقط فایل تصویری انتخاب کنید."});return}
if(file.size>5*1024*1024){setProfileFeedback({type:"error",text:"حجم عکس پروفایل باید کمتر از ۵ مگابایت باشد."});return}
setProfileFeedback(null);
setAvatarFile(file);
setAvatarPreview(URL.createObjectURL(file));
};
const shaminRemoveAvatarPreview=()=>{
setAvatarFile(null);setAvatarPreview(null);
if(avatarInputRef.current){avatarInputRef.current.value=""}
};
const shaminProfileImageSrc=avatarPreview||(adminUser&&adminUser.profile_image?getAssetUrl(adminUser.profile_image):null);
const shaminHandleProfileSave=async event=>{
event.preventDefault();
if(profileSaving)return;
setProfileFeedback(null);
const email=profileForm.email.trim();
if(email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){setProfileFeedback({type:"error",text:"ایمیل واردشده معتبر نیست."});return}
setProfileSaving(true);
try{
let user;
if(avatarFile){
// با انتخاب عکس، درخواست multipart ارسال می‌شود
const formData=new FormData();
formData.append("first_name",profileForm.first_name.trim());
formData.append("last_name",profileForm.last_name.trim());
formData.append("email",email);
formData.append("profile_image",avatarFile);
user=await apiRequest("/auth/profile/",{method:"PATCH",body:formData});
}else{
user=await apiRequest("/auth/profile/",{method:"PATCH",body:JSON.stringify({first_name:profileForm.first_name.trim(),last_name:profileForm.last_name.trim(),email})});
}
setAdminUser(user);
setProfileForm({first_name:user.first_name||"",last_name:user.last_name||"",email:user.email||""});
shaminRemoveAvatarPreview();
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
const shaminHandlePhoneChange=field=>event=>{setPhoneForm(previous=>({...previous,[field]:event.target.value}))};
const shaminHandlePhoneSave=async event=>{
event.preventDefault();
if(phoneSaving)return;
setPhoneFeedback(null);
if(!phoneForm.phone||!phoneForm.current_password){setPhoneFeedback({type:"error",text:"شماره موبایل جدید و رمز عبور فعلی الزامی است."});return}
setPhoneSaving(true);
try{
const user=await apiRequest("/auth/change-phone/",{method:"POST",body:JSON.stringify(phoneForm)});
setAdminUser(user);
setPhoneForm({phone:"",current_password:""});
setPhoneFeedback({type:"success",text:"شماره موبایل حساب با موفقیت تغییر کرد. از این پس با شماره جدید وارد شوید."});
}catch(error){setPhoneFeedback({type:"error",text:error.message||"تغییر شماره موبایل انجام نشد."})}
finally{setPhoneSaving(false)}
};
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
const shaminRenderProfile=()=>(
<section className="shamin-account" aria-label="پروفایل من">
<header className="shamin-account__head">
<h2>پروفایل من</h2>
<p>مشخصات حساب مدیریت فروشگاه را اینجا ببینید و ویرایش کنید.</p>
</header>
<div className="shamin-account__grid">
<aside className="shamin-account__card shamin-account__identity">
<div className={`shamin-account__avatar ${shaminProfileImageSrc?"has-image":""}`}>
<button type="button" className="shamin-account__avatar-edit" onClick={()=>avatarInputRef.current&&avatarInputRef.current.click()} aria-label="تغییر عکس پروفایل" title="تغییر عکس پروفایل">
{shaminProfileImageSrc?<img src={shaminProfileImageSrc} alt="عکس پروفایل"/>:<span>{shaminAdminName.charAt(0)}</span>}
<span className="shamin-account__avatar-badge"><FiCamera/></span>
</button>
<input ref={avatarInputRef} type="file" accept="image/*" hidden onChange={shaminHandleAvatarChange}/>
</div>
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
<form className="shamin-account__card" onSubmit={shaminHandlePhoneSave}>
<header className="shamin-account__card-head">
<span className="shamin-account__card-icon"><FiPhone/></span>
<div><h3>تغییر شماره موبایل</h3><p>شماره ورود حساب مدیریت را تغییر دهید؛ برای تأیید، رمز عبور فعلی لازم است.</p></div>
</header>
<div className="shamin-account__fields">
<label className="shamin-account__field">
<span>شماره موبایل جدید</span>
<input type="tel" dir="ltr" inputMode="numeric" maxLength={11} value={phoneForm.phone} onChange={shaminHandlePhoneChange("phone")} placeholder="09123456789"/>
</label>
<label className="shamin-account__field">
<span>رمز عبور فعلی</span>
<div className="shamin-account__password">
<input type={passwordVisible?"text":"password"} value={phoneForm.current_password} onChange={shaminHandlePhoneChange("current_password")} placeholder="••••••••" autoComplete="current-password"/>
<button type="button" className="shamin-account__password-toggle" onClick={()=>setPasswordVisible(previous=>!previous)} aria-label={passwordVisible?"پنهان کردن رمز":"نمایش رمز"}>{passwordVisible?<FiEyeOff/>:<FiEye/>}</button>
</div>
</label>
</div>
{phoneFeedback&&<div className={`shamin-account__feedback shamin-account__feedback--${phoneFeedback.type}`} role={phoneFeedback.type==="error"?"alert":"status"}>{phoneFeedback.type==="error"?<FiAlertCircle/>:<FiCheckCircle/>}<span>{phoneFeedback.text}</span></div>}
<footer className="shamin-account__actions">
<button type="submit" className="shamin-account__submit" disabled={phoneSaving}>{phoneSaving?"در حال تغییر...":"ذخیره شماره جدید"}</button>
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
if(activeSection==="admins"){return<AdminsSection/>}
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
<a className="shamin-dashboard__logout" href="/"><FiHome/><span>بازگشت به صفحه اصلی</span></a>
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
<NotificationsBell active={Boolean(adminUser)} onNavigate={shaminHandleSectionChange} onMenusClose={()=>{setAdminMenuOpen(false);setMobileSidebarOpen(false)}}/>
<div className="shamin-dashboard__admin-wrapper" ref={shaminAdminRef}>
<button type="button" className={`shamin-dashboard__admin ${adminMenuOpen?"shamin-dashboard__admin--open":""}`} onClick={shaminHandleAdminMenu} aria-expanded={adminMenuOpen} aria-haspopup="true">
<div className="shamin-dashboard__admin-avatar">{shaminProfileImageSrc?<img src={shaminProfileImageSrc} alt="ادمین"/>:<span>{shaminAdminName.charAt(0)}</span>}</div>
<div className="shamin-dashboard__admin-info">
<strong>{shaminAdminName}</strong>
<span>{shaminAdminPhone||"admin"}</span>
</div>
<span className="shamin-dashboard__admin-arrow"><FiChevronDown/></span>
</button>
<div className={`shamin-dashboard__admin-dropdown ${adminMenuOpen?"shamin-dashboard__admin-dropdown--open":""}`}>
<div className="shamin-dashboard__admin-dropdown-head">
<div className="shamin-dashboard__admin-dropdown-avatar">{shaminProfileImageSrc?<img src={shaminProfileImageSrc} alt="ادمین"/>:shaminAdminName.charAt(0)}</div>
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
