import React,{useCallback,useEffect,useRef,useState}from"react";
import{FiBell,FiX,FiShoppingBag,FiBox,FiUser}from"react-icons/fi";
import{apiRequest}from"../../api";
import"./AdminNotifications.css";

/* زنگوله‌ی اعلان‌های ادمین — بارگذاری، شمارش خوانده‌نشده، علامت‌گذاری و صفحه‌بندی */
const NotificationsBell=({active,onNavigate,onMenusClose})=>{
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
if(!active)return;
loadNotifications();
const timer=setInterval(()=>{if(!document.hidden)loadNotifications(null,true)},30000);
const refresh=()=>{if(!document.hidden)loadNotifications(null,true)};
document.addEventListener("visibilitychange",refresh);
return()=>{clearInterval(timer);document.removeEventListener("visibilitychange",refresh);notificationRequest.current++};
},[active,loadNotifications,notificationsOpen]);
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
if(item?.section){setNotificationsOpen(false);onNavigate(item.section)}
}catch(error){setNotificationError("ثبت وضعیت خواندن انجام نشد. دوباره تلاش کنید.")}
finally{notificationWrite.current=false;setNotificationSaving(false);setNotificationLoading(false)}
};
return(
<div className="shamin-notifications" ref={notificationRef}>
<button ref={notificationButtonRef} type="button" className="shamin-dashboard__topbar-button shamin-dashboard__notification" aria-label={`اعلان‌ها، ${unreadCount.toLocaleString("fa-IR")} خوانده‌نشده`} aria-expanded={notificationsOpen} aria-controls="shamin-notifications-panel" onClick={()=>{setNotificationsOpen(previous=>!previous);onMenusClose()}}>
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
);
};
export default NotificationsBell;
