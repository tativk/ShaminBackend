import React,{useCallback,useEffect,useMemo,useState}from"react";
import{FiPlus,FiSearch,FiFilter,FiChevronDown,FiChevronLeft,FiChevronRight,FiCalendar,FiUsers,FiDatabase,FiCheckCircle,FiTruck,FiClock,FiXCircle,FiEye,FiMoreHorizontal,FiCopy,FiPackage,FiRefreshCw,FiShoppingBag,FiX,FiMapPin,FiPhone,FiCreditCard,FiUser,FiCheck,FiEdit3,FiAlertCircle}from"react-icons/fi";
import"./Orders.css";
import{apiRequest}from"../api";
const nd=v=>v.replace(/[۰-۹]/g,c=>"۰۱۲۳۴۵۶۷۸۹".indexOf(c)).replace(/[٠-٩]/g,c=>"٠١٢٣٤٥٦٧٨٩".indexOf(c)).replace(/[^\d]/g,"");
const nt=v=>v.replace(/ي/g,"ی").replace(/ى/g,"ی").replace(/ك/g,"ک").replace(/\u200c/g," ").replace(/\s+/g," ").trim().toLowerCase();
const gi=n=>{const p=n.trim().split(/\s+/);return p.length>=2?p[0][0]+p[1][0]:p[0]?.[0]||"م"};
const fp=p=>Number(p||0).toLocaleString("fa-IR");
const SC={completed:{label:"تکمیل شده",icon:FiCheckCircle},paid:{label:"پرداخت شده",icon:FiCreditCard},shipping:{label:"در حال ارسال",icon:FiTruck},pending:{label:"در انتظار",icon:FiClock},failed:{label:"ناموفق",icon:FiAlertCircle},cancelled:{label:"لغو شده",icon:FiXCircle}};
const IMG=["https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=240&q=85","https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=240&q=85","https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=240&q=85"];
const CAT_LABEL={perfume:"عطر",cosmetic:"لوازم آرایشی",accessory:"اکسسوری"};
const GEN_LABEL={male:"مردانه",female:"زنانه",unisex:"یونیسکس"};
const TYPE_LABEL=item=>[CAT_LABEL[item.product_category]||"محصول",GEN_LABEL[item.product_gender]].filter(Boolean).join(" ").trim();
const faRel=iso=>{if(!iso)return"—";const diff=Date.now()-new Date(iso).getTime();if(diff<60000)return"همین الان";const m=Math.floor(diff/60000);if(m<60)return `${m.toLocaleString("fa-IR")} دقیقه پیش`;const h=Math.floor(m/60);if(h<24)return `${h.toLocaleString("fa-IR")} ساعت پیش`;const d=Math.floor(h/24);if(d===1)return"دیروز";if(d<30)return `${d.toLocaleString("fa-IR")} روز پیش`;return new Intl.DateTimeFormat("fa-IR",{year:"numeric",month:"short",day:"numeric"}).format(new Date(iso))};
const dayGroup=d=>{if(!d)return"قدیمی‌تر";const start=x=>new Date(x.getFullYear(),x.getMonth(),x.getDate()).getTime();const diff=(start(new Date())-start(new Date(d)))/86400000;if(diff<1)return"امروز";if(diff<2)return"دیروز";return"قدیمی‌تر"};
const mapOrder=o=>{const products=(o.items||[]).map(i=>({name:i.product_name,type:TYPE_LABEL(i),quantity:i.quantity,price:Number(i.unit_price||0),image:i.product_main_image||null}));return{_pk:o.id,id:`SH-${o.id}`,customer:o.customer||"مشتری",customerType:"مشتری",phone:o.customer_phone||"ثبت نشده",address:o.address||"",payment:o.status==="pending"?"در انتظار پرداخت":"پرداخت آنلاین",products,productCount:products.reduce((s,p)=>s+p.quantity,0),amount:Number(o.total_price||0),status:o.status,statusLabel:(SC[o.status]||SC.pending).label,time:faRel(o.created_at),date:dayGroup(o.created_at),createdAt:o.created_at}};
function Orders(){
const[rows,setRows]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState(""),[q,setQ]=useState(""),[fst,setFst]=useState("all"),[fcu,setFcu]=useState("all"),[fpy,setFpy]=useState("all"),[fdt,setFdt]=useState("all"),[srt,setSrt]=useState("newest"),[pg,setPg]=useState(1),[rpp,setRpp]=useState(6),[om,setOm]=useState(null),[omPos,setOmPos]=useState(null),[cp,setCp]=useState(null),[ct,setCt]=useState(false),[mf,setMf]=useState(false),[pmin,setPmin]=useState(""),[pmax,setPmax]=useState(""),[sel,setSel]=useState(null),[dop,setDop]=useState(false),[ed,setEd]=useState(false),[ec,setEc]=useState(""),[ep,setEp]=useState(""),[ea,setEa]=useState(""),[ect,setEct]=useState("مشتری عادی"),[epy,setEpy]=useState("پرداخت آنلاین"),[es,setEs]=useState("pending"),[epr,setEpr]=useState([]),[nop,setNop]=useState(false),[nc,setNc]=useState(""),[np,setNp]=useState(""),[nct,setNct]=useState("مشتری عادی"),[nad,setNad]=useState(""),[npy,setNpy]=useState("پرداخت آنلاین"),[npr,setNpr]=useState(""),[nq,setNq]=useState("1"),[na,setNa]=useState("");
const loadOrders=useCallback(()=>{setLoading(true);setError("");apiRequest("/orders/admin/").then(data=>{const list=Array.isArray(data)?data:(data?.results||[]);setRows(list.map(mapOrder))}).catch(err=>{setError(err?.message||"خطا در دریافت سفارش‌ها")}).finally(()=>{setLoading(false)})},[]);
useEffect(()=>{loadOrders()},[loadOrders]);
const stats=useMemo(()=>({total:rows.length,completed:rows.filter(o=>o.status==="completed").length,shipping:rows.filter(o=>o.status==="shipping").length,pending:rows.filter(o=>o.status==="pending").length,cancelled:rows.filter(o=>o.status==="cancelled").length,paid:rows.filter(o=>o.status==="paid").length,failed:rows.filter(o=>o.status==="failed").length}),[rows]);
const flt=useMemo(()=>{const s=nt(q);let r=rows.filter(o=>{const ms=!s||nt(o.id).includes(s)||nt(o.customer).includes(s)||nd(o.phone).includes(nd(s))||o.products.some(p=>nt(p.name).includes(s));const mst=fst==="all"||o.status===fst;const mc=fcu==="all"||(fcu==="vip"&&o.customerType==="مشتری ویژه")||(fcu==="normal"&&o.customerType==="مشتری عادی");const mp=fpy==="all"||(fpy==="online"&&o.payment==="پرداخت آنلاین")||(fpy==="cod"&&o.payment==="پرداخت در محل");const md=fdt==="all"||(fdt==="today"&&o.date==="امروز")||(fdt==="yesterday"&&o.date==="دیروز");const mn=Number(pmin)||0,mx=Number(pmax)||Infinity;return ms&&mst&&mc&&mp&&md&&o.amount>=mn&&o.amount<=mx});if(srt==="oldest")r=[...r].reverse();if(srt==="amount-high")r=[...r].sort((a,b)=>b.amount-a.amount);if(srt==="amount-low")r=[...r].sort((a,b)=>a.amount-b.amount);return r},[rows,q,fst,fcu,fpy,fdt,srt,pmin,pmax]);
const tp=Math.max(1,Math.ceil(flt.length/rpp));
const cur=flt.slice((pg-1)*rpp,pg*rpp);
const vp=useMemo(()=>{if(tp<=5)return Array.from({length:tp},(_,i)=>i+1);let st=Math.max(1,pg-2),en=Math.min(tp,st+4);if(en-st<4)st=Math.max(1,en-4);return Array.from({length:en-st+1},(_,i)=>st+i)},[tp,pg]);
const chf=(set,v)=>{set(v);setPg(1)};
const rst=()=>{setQ("");setFst("all");setFcu("all");setFpy("all");setFdt("all");setSrt("newest");setPmin("");setPmax("");setPg(1)};
const cop=async id=>{const text="#"+id;try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(text)}else{const ta=document.createElement("textarea");ta.value=text;ta.style.position="fixed";ta.style.opacity="0";document.body.appendChild(ta);ta.focus();ta.select();document.execCommand("copy");ta.remove()}setCp(id);setCt(true);setTimeout(()=>setCp(null),1400);setTimeout(()=>setCt(false),1800)}catch{setCp(null);setCt(false)}};
const opd=o=>{setSel(o);setDop(true);setOm(null);setOmPos(null)};
const cld=()=>{setDop(false);setTimeout(()=>setSel(null),250)};
const gtp=p=>{if(p>=1&&p<=tp)setPg(p)};
const oed=o=>{setSel(o);setEc(o.customer);setEp(o.phone);setEa(o.address);setEct(o.customerType);setEpy(o.payment);setEs(o.status);setEpr(o.products.map(p=>({...p})));setEd(true);setOm(null);setOmPos(null)};
const sed=()=>{if(!sel)return;const ps=epr.filter(p=>p.name.trim()&&Number(p.price)>0).map(p=>({...p,name:p.name.trim(),price:Number(p.price),quantity:Math.max(1,Number(p.quantity)||1)}));if(!ec.trim()||!ps.length)return;const amount=ps.reduce((s,p)=>s+Number(p.price)*Number(p.quantity),0);const upd={...sel,customer:ec.trim(),phone:ep.trim()||"ثبت نشده",address:ea.trim()||sel.address,customerType:ect,payment:epy,status:es,statusLabel:(SC[es]||SC.pending).label,products:ps,productCount:ps.reduce((s,p)=>s+Number(p.quantity),0),amount};setRows(p=>p.map(o=>o.id===sel.id?upd:o));setSel(upd);
if(sel._pk){const payload={};if(es!==sel.status)payload.status=es;if((ea.trim()||"")!==(sel.address||""))payload.address=ea.trim();if(Object.keys(payload).length){apiRequest(`/orders/admin/${sel._pk}/status/`,{method:"PATCH",body:JSON.stringify(payload)}).then(data=>{setRows(p=>p.map(o=>o.id===sel.id?{...o,status:data.status,statusLabel:(SC[data.status]||SC.pending).label,address:data.address,time:faRel(data.created_at)}:o));setSel(p=>p?{...p,status:data.status,statusLabel:(SC[data.status]||SC.pending).label,address:data.address}:p)}).catch(()=>window.alert("ذخیره وضعیت/آدرس روی سرور ناموفق بود."))}}
setEd(false)};
const aep=()=>setEpr(p=>[...p,{name:"",type:"محصول",quantity:1,price:0}]);
const dep=i=>setEpr(p=>p.filter((_,x)=>x!==i));
const uep=(i,k,v)=>setEpr(p=>p.map((x,idx)=>idx!==i?x:{...x,[k]:k==="quantity"||k==="price"?Number(nd(String(v))):v}));
const uepi=(i,f)=>{if(!f)return;const u=URL.createObjectURL(f);setEpr(p=>p.map((x,idx)=>idx!==i?x:{...x,image:u,imageFile:f}))};
const hsc=nx=>{
if(!sel)return;
if(nx==="cancelled"&&sel.status!=="cancelled"&&!window.confirm("آیا مطمئن هستید که می‌خواهید این سفارش لغو شود؟"))return;
if(!sel._pk){window.alert("سفارش‌های ثبت‌شده دستی از پنل فعلاً روی سرور ذخیره نمی‌شوند و تغییر وضعیت آن‌ها اعمال نمی‌شود.");return}
const previous=sel.status;
const applyLocal=status=>{setRows(p=>p.map(o=>o.id===sel.id?{...o,status,statusLabel:(SC[status]||SC.pending).label}:o));setSel(p=>p?{...p,status,statusLabel:(SC[status]||SC.pending).label}:p)};
applyLocal(nx);
apiRequest(`/orders/admin/${sel._pk}/status/`,{method:"PATCH",body:JSON.stringify({status:nx})}).then(data=>{const mapped=mapOrder(data);setRows(p=>p.map(o=>o.id===mapped.id?mapped:o));setSel(p=>p&&p.id===mapped.id?mapped:p)}).catch(()=>{applyLocal(previous);setRows(p=>p.map(o=>o.id===sel.id?{...o,time:faRel(sel.createdAt)}:o));window.alert("تغییر وضعیت سفارش روی سرور ناموفق بود.")})};
const hno=e=>{e.preventDefault();if(!nc.trim()||!npr.trim()||!Number(na))return;const n=Math.max(...rows.map(o=>Number(o.id.replace(/\D/g,""))),0)+1,qty=Math.max(1,Number(nq)||1),price=Number(na);const no={_pk:null,id:"SH-"+n,customer:nc.trim(),customerType:nct,phone:np.trim()||"ثبت نشده",address:nad.trim()||"آدرس ثبت نشده",payment:npy,products:[{name:npr.trim(),type:"محصول",quantity:qty,price}],productCount:qty,amount:price*qty,status:"pending",statusLabel:"در انتظار",time:"همین الان",date:"امروز"};setRows(p=>[no,...p]);setNc("");setNp("");setNpr("");setNa("");setNct("مشتری عادی");setNad("");setNpy("پرداخت آنلاین");setNq("1");setNop(false);setPg(1)};
const tglOm=(oId,e)=>{
if(om===oId){setOm(null);setOmPos(null);return}
const r=e.currentTarget.getBoundingClientRect();
const menuWidth=178;
const menuHeight=132;
const gap=7;
let top=r.bottom+gap;
let left=r.left;
if(top+menuHeight>window.innerHeight-12){top=r.top-menuHeight-gap}
if(left+menuWidth>window.innerWidth-12){left=window.innerWidth-menuWidth-12}
if(left<12){left=12}
if(top<12){top=12}
setOm(oId);
setOmPos({top,left});
};
useEffect(()=>{const oc=e=>{if(!e.target.closest(".so-mr")){setOm(null);setOmPos(null)}};const ek=e=>{if(e.key==="Escape"){setOm(null);setOmPos(null);setMf(false);if(dop)cld();if(ed)setEd(false);if(nop)setNop(false)}};const sc=()=>{if(om){setOm(null);setOmPos(null)}};document.addEventListener("mousedown",oc);document.addEventListener("keydown",ek);window.addEventListener("scroll",sc,true);window.addEventListener("resize",sc);return()=>{document.removeEventListener("mousedown",oc);document.removeEventListener("keydown",ek);window.removeEventListener("scroll",sc,true);window.removeEventListener("resize",sc)}},[dop,ed,nop,om]);
useEffect(()=>{if(!nop)return;const p=document.body.style.overflow;document.body.style.overflow="hidden";return()=>{document.body.style.overflow=p}},[nop]);
const step=sel?{pending:1,paid:2,shipping:3,completed:4,cancelled:0,failed:0}[sel.status]||0:0;
return(
<section className="so" dir="rtl">
<div className="so-ph">
<div className="so-phm">
<div className="so-trl"><div className="so-tbk">
<div className="so-tkk"><span className="so-tkkd"/><span>مرکز مدیریت سفارشات</span></div>
<h1 className="so-ttl">سفارش‌ها</h1>
<p className="so-desc">مدیریت، پیگیری و بررسی سفارش‌های ثبت‌شده در فروشگاه</p>
</div></div>
</div>
<div className="so-ha">
<div className="so-head-count">
<span className="so-head-count__label">کل سفارش‌ها</span>
<strong>{rows.length.toLocaleString("fa-IR")}</strong>
<span className="so-head-count__unit">سفارش</span>
</div>
<button type="button" className="so-nb" onClick={()=>setNop(true)}>
<span className="so-nbi"><FiPlus/></span><span className="so-nbt">سفارش جدید</span><span className="so-nba"><FiChevronLeft/></span>
</button>
</div>
</div>
<div className="so-st">
<div className="so-sc so-sct"><div className="so-si"><FiShoppingBag/></div><div className="so-sn"><span>کل سفارش‌ها</span><strong>{stats.total.toLocaleString("fa-IR")}</strong><small>سفارش ثبت‌شده</small></div></div>
<div className="so-sc so-scc"><div className="so-si"><FiCheckCircle/></div><div className="so-sn"><span>تکمیل شده</span><strong>{stats.completed.toLocaleString("fa-IR")}</strong><small>سفارش</small></div></div>
<div className="so-sc so-scs"><div className="so-si"><FiTruck/></div><div className="so-sn"><span>در حال ارسال</span><strong>{stats.shipping.toLocaleString("fa-IR")}</strong><small>سفارش</small></div></div>
<div className="so-sc so-scp"><div className="so-si"><FiClock/></div><div className="so-sn"><span>در انتظار</span><strong>{stats.pending.toLocaleString("fa-IR")}</strong><small>سفارش</small></div></div>
</div>
<div className="so-ws">
<aside className={"so-fl"+(mf?" so-flm":"")}>
<div className="so-flh"><div><span>جستجو و فیلتر</span><h2>فیلترها</h2></div><button type="button" className="so-flc" onClick={()=>setMf(false)} aria-label="بستن فیلترها"><FiX/></button></div>
<div className="so-fg"><label>وضعیت سفارش</label><div className="so-os">{[{value:"all",label:"همه",count:stats.total},{value:"completed",label:"تکمیل شده",count:stats.completed},{value:"shipping",label:"در حال ارسال",count:stats.shipping},{value:"paid",label:"پرداخت شده",count:stats.paid},{value:"pending",label:"در انتظار",count:stats.pending},{value:"failed",label:"ناموفق",count:stats.failed},{value:"cancelled",label:"لغو شده",count:stats.cancelled}].map(i=>(<button key={i.value} type="button" className={"so-op"+(fst===i.value?" so-opa":"")} onClick={()=>chf(setFst,i.value)}><span className="so-cb">{fst===i.value&&<FiCheck/>}</span><span>{i.label}</span><small>{i.count.toLocaleString("fa-IR")}</small></button>))}</div></div>
<div className="so-fd"/>
<div className="so-fg"><label><FiCalendar/>بازه زمانی</label><div className="so-qd"><button type="button" className={fdt==="today"?"so-qda":""} onClick={()=>chf(setFdt,fdt==="today"?"all":"today")}>امروز</button><button type="button" className={fdt==="yesterday"?"so-qda":""} onClick={()=>chf(setFdt,fdt==="yesterday"?"all":"yesterday")}>دیروز</button></div></div>
<div className="so-fd"/>
<div className="so-fg"><label><FiUsers/>نوع مشتری</label><div className="so-cs"><button type="button" className={fcu==="vip"?"so-csa":""} onClick={()=>chf(setFcu,fcu==="vip"?"all":"vip")}>ویژه</button><button type="button" className={fcu==="normal"?"so-csa":""} onClick={()=>chf(setFcu,fcu==="normal"?"all":"normal")}>عادی</button></div></div>
<div className="so-fd"/>
<div className="so-fg"><label><FiCreditCard/>روش پرداخت</label><div className="so-cs"><button type="button" className={fpy==="online"?"so-csa":""} onClick={()=>chf(setFpy,fpy==="online"?"all":"online")}>آنلاین</button><button type="button" className={fpy==="cod"?"so-csa":""} onClick={()=>chf(setFpy,fpy==="cod"?"all":"cod")}>در محل</button></div></div>
<div className="so-fd"/>
<div className="so-fg"><label><FiDatabase/>مبلغ سفارش</label><div className="so-pf"><div><span>از</span><input type="text" value={pmin?Number(pmin).toLocaleString("fa-IR"):""} onChange={e=>{setPmin(nd(e.target.value));setPg(1)}} placeholder="۰" inputMode="numeric"/><small>تومان</small></div><div><span>تا</span><input type="text" value={pmax?Number(pmax).toLocaleString("fa-IR"):""} onChange={e=>{setPmax(nd(e.target.value));setPg(1)}} placeholder="∞" inputMode="numeric"/><small>تومان</small></div></div></div>
<button type="button" className="so-af" onClick={()=>setMf(false)}><FiFilter/>اعمال فیلتر</button>
<button type="button" className="so-rf" onClick={rst}><FiRefreshCw/>بازنشانی فیلترها</button>
</aside>
{mf&&<div className="so-flo" onClick={()=>setMf(false)}/>}
<div className="so-pn">
<div className="so-mtb"><button type="button" onClick={()=>setMf(p=>!p)}><FiFilter/>فیلترها</button><span>{flt.length.toLocaleString("fa-IR")} سفارش</span></div>
<div className="so-th"><div className="so-rc"><span>لیست سفارش‌ها</span><strong>نمایش {flt.length.toLocaleString("fa-IR")} مورد</strong></div><div className="so-tlt"><div className="so-sr"><span>مرتب‌سازی</span><select value={srt} onChange={e=>chf(setSrt,e.target.value)}><option value="newest">جدیدترین</option><option value="oldest">قدیمی‌ترین</option><option value="amount-high">بیشترین مبلغ</option><option value="amount-low">کمترین مبلغ</option></select><FiChevronDown/></div></div></div>
<div className="so-se"><FiSearch/><input type="text" value={q} onChange={e=>{setQ(e.target.value);setPg(1)}} placeholder="جستجو بر اساس شماره سفارش، مشتری، شماره تماس یا محصول..."/>{q&&<button type="button" onClick={()=>{setQ("");setPg(1)}} aria-label="پاک کردن جستجو"><FiX/></button>}</div>
<div className="so-tw"><div className="so-tb">
<div className="so-tbh"><span>شماره سفارش</span><span>مشتری</span><span>محصولات</span><span>مبلغ کل</span><span>وضعیت</span><span>زمان</span><span>عملیات</span></div>
{loading?(
<div className="so-em"><div className="so-ei"><FiRefreshCw/></div><strong>در حال دریافت سفارش‌ها...</strong><span>لطفاً چند لحظه صبر کنید.</span></div>
):error?(
<div className="so-em"><div className="so-ei"><FiAlertCircle/></div><strong>خطا در دریافت سفارش‌ها</strong><span>{error}</span><button type="button" onClick={loadOrders}><FiRefreshCw/>تلاش مجدد</button></div>
):cur.length>0?cur.map(o=>{const I=(SC[o.status]||SC.pending).icon;return(
<div className="so-tr" key={o.id}>
<div className="so-on"><button type="button" title="کپی شماره سفارش" onClick={()=>cop(o.id)}><span>#{o.id}</span>{cp===o.id?<FiCheck/>:<FiCopy/>}</button></div>
<div className="so-cu"><div className="so-ca">{gi(o.customer)}</div><div><strong>{o.customer}</strong><span>{o.customerType}</span></div></div>
<div className="so-pd"><div className="so-pim">{o.products.slice(0,3).map((p,i)=>(<div className="so-pth" key={o.id+"-"+p.name}><img src={p.image||IMG[i%IMG.length]} alt={p.name||""}/></div>))}{o.productCount>3&&<span className="so-mp">+{(o.productCount-3).toLocaleString("fa-IR")}</span>}</div><div className="so-ps"><strong>{o.products[0]?.name}</strong>{o.productCount>1?<span>{o.productCount.toLocaleString("fa-IR")} کالا<em>+{(o.productCount-1).toLocaleString("fa-IR")} محصول دیگر</em></span>:<span>۱ کالا</span>}</div></div>
<div className="so-am"><strong>{fp(o.amount)}</strong><span>تومان</span></div>
<div className={"so-sb so-sb-"+o.status}><I/><span>{o.statusLabel}</span></div>
<div className="so-tm"><FiClock/><span>{o.time}</span></div>
<div className="so-ac">
<button type="button" className={"so-vb"+(om===o.id?" so-vb--menu-open":"")} onClick={()=>opd(o)}><FiEye/><span>مشاهده</span></button>
<div className="so-mr">
<button type="button" className={om===o.id?"so-mra":""} onClick={e=>tglOm(o.id,e)} aria-label="عملیات سفارش"><FiMoreHorizontal/></button>
{om===o.id&&<div className="so-mm" style={omPos?{top:omPos.top,left:omPos.left}:undefined}><button type="button" onClick={()=>opd(o)}><FiEye/>مشاهده جزئیات</button><button type="button" onClick={()=>oed(o)}><FiEdit3/>ویرایش سفارش</button><button type="button" onClick={()=>cop(o.id)}><FiCopy/>کپی شماره سفارش</button></div>}
</div>
</div>
</div>)}) : <div className="so-em"><div className="so-ei"><FiShoppingBag/></div><strong>سفارشی پیدا نشد</strong><span>با تغییر فیلترها یا عبارت جستجو دوباره تلاش کنید.</span><button type="button" onClick={rst}><FiRefreshCw/>حذف فیلترها</button></div>}
</div></div>
<div className="so-tf">
<div className="so-pgi">نمایش <strong>{flt.length===0?"۰":((pg-1)*rpp+1).toLocaleString("fa-IR")}</strong> تا <strong>{Math.min(pg*rpp,flt.length).toLocaleString("fa-IR")}</strong> از <strong>{flt.length.toLocaleString("fa-IR")}</strong> سفارش</div>
<div className="so-pg"><button type="button" disabled={pg===1} onClick={()=>gtp(pg-1)} aria-label="صفحه قبل"><FiChevronRight/></button>{vp.map(p=>(<button type="button" key={p} className={pg===p?"so-pga":""} onClick={()=>gtp(p)}>{p.toLocaleString("fa-IR")}</button>))}<button type="button" disabled={pg===tp} onClick={()=>gtp(pg+1)} aria-label="صفحه بعد"><FiChevronLeft/></button></div>
<label className="so-nc"><span>نمایش</span><select value={rpp} onChange={e=>{setRpp(Number(e.target.value));setPg(1)}}><option value="6">۶</option><option value="8">۸</option><option value="10">۱۰</option></select><FiChevronDown/><span>مورد</span></label>
</div>
</div>
</div>
{dop&&sel&&<>
<div className="so-dov" onClick={cld}/>
<aside className="so-dw">
<div className="so-dh"><div><span>جزئیات سفارش</span><strong>#{sel.id}</strong></div><button type="button" onClick={cld} aria-label="بستن جزئیات"><FiX/></button></div>
<div className="so-db">
<div className="so-dstt">{(()=>{const I=SC[sel.status].icon;return<div className={"so-dsti so-dsti-"+sel.status}><I/></div>})()}<div><span>وضعیت سفارش</span><strong>{sel.statusLabel}</strong></div><div className="so-dsc"><label htmlFor="so-sts">تغییر وضعیت</label><select id="so-sts" value={sel.status} onChange={e=>hsc(e.target.value)}><option value="pending">در انتظار</option><option value="paid">پرداخت شده</option><option value="shipping">در حال ارسال</option><option value="completed">تکمیل شده</option><option value="failed">ناموفق</option><option value="cancelled">لغو شده</option></select><FiChevronDown/></div></div>
<div className="so-dsec"><div className="so-dst"><span>اطلاعات مشتری</span></div><div className="so-dcu"><div className="so-dav">{gi(sel.customer)}</div><div><strong>{sel.customer}</strong><span>{sel.customerType}</span></div></div><div className="so-dil"><div><FiPhone/><span>شماره تماس</span><strong>{sel.phone}</strong></div><div><FiMapPin/><span>آدرس</span><strong>{sel.address}</strong></div><div><FiCreditCard/><span>روش پرداخت</span><strong>{sel.payment}</strong></div></div></div>
<div className="so-dsec"><div className="so-dst"><span>محصولات سفارش</span><small>{sel.productCount.toLocaleString("fa-IR")} کالا</small></div><div className="so-dps">{sel.products.map((p,i)=>(<div className="so-dp" key={sel.id+"-"+p.name+"-"+i}><div className="so-dpi"><img src={p.image||IMG[i%IMG.length]} alt={p.name}/><span><FiPackage/></span></div><div><strong>{p.name}</strong><span>{p.type} × {p.quantity.toLocaleString("fa-IR")}</span></div><div className="so-dpp"><strong>{fp(p.price)}</strong><span>تومان</span></div></div>))}</div></div>
<div className="so-dsm"><div><span>مبلغ سفارش</span><strong>{fp(sel.amount)} تومان</strong></div><div><span><FiClock/>زمان ثبت</span><strong>{sel.time}</strong></div></div>
<div className="so-dsec so-dts"><div className="so-dst"><span>روند سفارش</span></div><div className="so-dtl"><div className={"so-ti"+(step>=1?" so-tid":"")}><span className="so-tld">{step>=1?<FiCheck/>:<FiClock/>}</span><div><strong>ثبت سفارش</strong><small>{sel.time}</small></div></div><div className={"so-ti"+(step>=2?" so-tid":"")}><span className="so-tld">{step>=2?<FiCheck/>:<FiClock/>}</span><div><strong>پرداخت و تأیید سفارش</strong><small>{step>=2?"تأیید شده":"در انتظار پرداخت"}</small></div></div><div className={"so-ti"+(step>=3?" so-tid":"")}><span className="so-tld">{step>=3?<FiCheck/>:<FiPackage/>}</span><div><strong>آماده‌سازی سفارش</strong><small>{step>=3?"آماده شده":"در انتظار"}</small></div></div><div className={"so-ti"+(step>=4?" so-tid":"")}><span className="so-tld">{step>=4?<FiCheck/>:<FiTruck/>}</span><div><strong>ارسال سفارش</strong><small>{step>=4?"تحویل شده":step>=3?"در حال ارسال":"در انتظار"}</small></div></div></div></div>
</div>
<div className="so-df"><button type="button" onClick={()=>cop(sel.id)}>{cp===sel.id?<FiCheck/>:<FiCopy/>}کپی شماره</button><button type="button" className="so-deb" onClick={()=>oed(sel)}><FiEdit3/>ویرایش سفارش</button><button type="button" onClick={cld}>بستن</button></div>
</aside>
</>}
{ed&&sel&&<>
<div className="so-eov" onClick={()=>setEd(false)}>
<div className="so-edm" onClick={e=>e.stopPropagation()}>
<div className="so-edh"><div className="so-edt"><div><span>ویرایش سفارش</span><strong>#{sel.id}</strong></div></div><button type="button" onClick={()=>setEd(false)} aria-label="بستن ویرایش"><FiX/></button></div>
<div className="so-edb">
<div className="so-eds"><div className="so-edsl">اطلاعات مشتری</div><div className="so-edg">
<label><span>نام مشتری</span><div><FiUser/><input value={ec} onChange={e=>setEc(e.target.value)} placeholder="نام مشتری"/></div></label>
<label><span>شماره تماس</span><div><FiPhone/><input value={ep} onChange={e=>setEp(e.target.value)} placeholder="شماره تماس"/></div></label>
<label><span>نوع مشتری</span><div><FiUsers/><select value={ect} onChange={e=>setEct(e.target.value)}><option>مشتری عادی</option><option>مشتری ویژه</option></select><FiChevronDown/></div></label>
<label><span>روش پرداخت</span><div><FiCreditCard/><select value={epy} onChange={e=>setEpy(e.target.value)}><option>پرداخت آنلاین</option><option>پرداخت در محل</option><option>در انتظار پرداخت</option></select><FiChevronDown/></div></label>
<label className="so-edf"><span>آدرس</span><div><FiMapPin/><input value={ea} onChange={e=>setEa(e.target.value)} placeholder="آدرس مشتری"/></div></label>
<label><span>وضعیت سفارش</span><div><FiClock/><select value={es} onChange={e=>setEs(e.target.value)}><option value="pending">در انتظار</option><option value="paid">پرداخت شده</option><option value="shipping">در حال ارسال</option><option value="completed">تکمیل شده</option><option value="failed">ناموفق</option><option value="cancelled">لغو شده</option></select><FiChevronDown/></div></label>
</div></div>
<div className="so-eds">
<div className="so-edtr"><div className="so-edsl">محصولات سفارش<small>{epr.length.toLocaleString("fa-IR")} محصول</small></div><button type="button" className="so-eda" onClick={aep}><FiPlus/>افزودن محصول</button></div>
<div className="so-edps">{epr.map((p,i)=>(<div className="so-edp" key={i}><div className="so-edpi"><img src={p.image||IMG[i%IMG.length]} alt={p.name||"محصول"}/><label className="so-edpie"><FiEdit3/><span>تغییر عکس</span><input type="file" accept="image/*" onChange={e=>uepi(i,e.target.files?.[0])}/></label></div><div className="so-edpm"><label><span>نام محصول</span><input value={p.name} onChange={e=>uep(i,"name",e.target.value)} placeholder="نام محصول"/></label><label><span>نوع</span><input value={p.type} onChange={e=>uep(i,"type",e.target.value)} placeholder="عطر مردانه"/></label><label><span>تعداد</span><input type="number" min="1" value={p.quantity} onChange={e=>uep(i,"quantity",e.target.value)}/></label><label><span>قیمت واحد</span><input inputMode="numeric" value={p.price?Number(p.price).toLocaleString("fa-IR"):""} onChange={e=>uep(i,"price",e.target.value)} placeholder="۰"/></label></div><button type="button" className="so-edpd" onClick={()=>dep(i)} aria-label="حذف محصول"><FiX/></button></div>))}{!epr.length&&<div className="so-ede">محصولی در سفارش وجود ندارد.<button type="button" onClick={aep}><FiPlus/>افزودن محصول</button></div>}</div>
</div>
<div className="so-edtt"><span>مبلغ نهایی سفارش</span><strong>{epr.reduce((s,p)=>s+(Number(p.price)||0)*(Number(p.quantity)||0),0).toLocaleString("fa-IR")}<small>تومان</small></strong></div>
</div>
<div className="so-edft"><button type="button" onClick={()=>setEd(false)}>انصراف</button><button type="button" className="so-edsc" onClick={sed}><FiCheck/>ذخیره تغییرات</button></div>
</div>
</div>
</>}
{nop&&(
<div className="so-mol" onMouseDown={e=>{if(e.target===e.currentTarget)setNop(false)}}>
<div className="so-nom" role="dialog" aria-modal="true" aria-labelledby="so-nomt">
<div className="so-nomh"><div className="so-nomhg"><div className="so-nomi"><FiShoppingBag/></div><div><span className="so-nome">ثبت سفارش</span><h2 id="so-nomt">سفارش جدید</h2><p>اطلاعات سفارش را وارد کنید تا سفارش جدید ثبت شود.</p></div></div><button type="button" className="so-nomc" onClick={()=>setNop(false)} aria-label="بستن"><FiX/></button></div>
<div className="so-nomd"/>
<form className="so-nomf" onSubmit={hno}>
<div className="so-noms">
<div className="so-nomst"><span className="so-nomsn">01</span><div><strong>اطلاعات مشتری</strong><span>مشخصات خریدار سفارش</span></div></div>
<div className="so-nomg">
<label className="so-fld"><span>نام مشتری</span><div className="so-fldi"><FiUser/><input type="text" value={nc} onChange={e=>setNc(e.target.value)} placeholder="مثلاً سارا محمدی" required/></div></label>
<label className="so-fld"><span>شماره تماس</span><div className="so-fldi"><FiPhone/><input type="tel" value={np} onChange={e=>setNp(e.target.value)} placeholder="۰۹۱۲..." dir="ltr"/></div></label>
<label className="so-fld"><span>نوع مشتری</span><div className="so-fldi"><FiUsers/><select value={nct} onChange={e=>setNct(e.target.value)}><option>مشتری عادی</option><option>مشتری ویژه</option></select><FiChevronDown className="so-fldsa"/></div></label>
<label className="so-fld"><span>روش پرداخت</span><div className="so-fldi"><FiCreditCard/><select value={npy} onChange={e=>setNpy(e.target.value)}><option>پرداخت آنلاین</option><option>پرداخت در محل</option><option>در انتظار پرداخت</option></select><FiChevronDown className="so-fldsa"/></div></label>
<label className="so-fld so-fldw"><span>آدرس</span><div className="so-fldi"><FiMapPin/><input type="text" value={nad} onChange={e=>setNad(e.target.value)} placeholder="آدرس مشتری"/></div></label>
</div>
</div>
<div className="so-noms">
<div className="so-nomst"><span className="so-nomsn">02</span><div><strong>اطلاعات سفارش</strong><span>محصول و مبلغ سفارش</span></div></div>
<div className="so-nomg">
<label className="so-fld so-fldw"><span>محصول</span><div className="so-fldi"><FiPackage/><input type="text" value={npr} onChange={e=>setNpr(e.target.value)} placeholder="نام محصول یا عطر" required/></div></label>
<label className="so-fld"><span>تعداد</span><div className="so-fldi"><FiPackage/><input type="number" min="1" value={nq} onChange={e=>setNq(e.target.value)} placeholder="۱"/></div></label>
<label className="so-fld"><span>قیمت واحد</span><div className="so-fldi"><FiDatabase/><input type="text" inputMode="numeric" value={na?Number(na).toLocaleString("fa-IR"):""} onChange={e=>setNa(nd(e.target.value))} placeholder="مثلاً ۳,۵۰۰,۰۰۰" dir="ltr"/><small>تومان</small></div></label>
</div>
</div>
<div className="so-nomsu"><div><span>مبلغ نهایی سفارش</span><strong>{((Number(na)||0)*(Number(nq)||1)).toLocaleString("fa-IR")} <small>تومان</small></strong></div><span className="so-nomss"><span/>در انتظار پرداخت</span></div>
<div className="so-nomfo"><button type="button" className="so-nomca" onClick={()=>setNop(false)}>انصراف</button><button type="submit" className="so-nomsub"><FiCheckCircle/><span>ثبت سفارش</span></button></div>
</form>
</div>
</div>
)}
{ct&&(
<div className="so-copy-toast" role="status">
<span className="so-copy-toast__icon"><FiCheck/></span>
<div><strong>کپی شد</strong><span>شماره سفارش با موفقیت کپی شد</span></div>
</div>
)}
</section>
);
}
export default Orders;