import React,{useEffect,useMemo,useRef,useState}from"react";
import{FiPlus,FiSearch,FiFilter,FiChevronDown,FiChevronLeft,FiChevronRight,FiPackage,FiCheckCircle,FiAlertTriangle,FiTag,FiEdit3,FiMoreHorizontal,FiTrash2,FiEye,FiX,FiImage,FiSave,FiBox,FiUpload}from"react-icons/fi";
import { apiRequest } from "../api";
import"./Products.css";
const SP_PRODUCTS=[
{id:1,name:"عطر مردانه ساواج",brand:"Dior",category:"مردانه",price:4850000,stock:18,status:"active",image:"https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=700&q=85"},
{id:2,name:"عطر زنانه لا ویه بل",brand:"Lancôme",category:"زنانه",price:5250000,stock:12,status:"active",image:"https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=700&q=85"},
{id:3,name:"عطر اونتوس",brand:"Creed",category:"مردانه",price:8900000,stock:7,status:"active",image:"https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=700&q=85"},
{id:4,name:"عطر بلک اوپیوم",brand:"YSL",category:"زنانه",price:6150000,stock:0,status:"out",image:"https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=700&q=85"},
{id:5,name:"عطر کرید اونتوس کلون",brand:"Shamin",category:"مردانه",price:2150000,stock:24,status:"active",image:"https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=700&q=85"},
{id:6,name:"عطر فلورال میست",brand:"Shamin",category:"زنانه",price:1950000,stock:4,status:"low",image:"https://images.unsplash.com/photo-1563170351-be82bc888aa4?auto=format&fit=crop&w=700&q=85"},
{id:7,name:"عطر مردانه بلو شنل",brand:"Chanel",category:"مردانه",price:7350000,stock:15,status:"active",image:"https://images.unsplash.com/photo-1557170334-a9632e77c6e4?auto=format&fit=crop&w=700&q=85"},
{id:8,name:"عطر زنانه گود گرل",brand:"Carolina Herrera",category:"زنانه",price:5750000,stock:2,status:"low",image:"https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&w=700&q=85"}
];
const SP_STATUS={active:{label:"فعال",icon:FiCheckCircle},low:{label:"موجودی کم",icon:FiAlertTriangle},out:{label:"ناموجود",icon:FiBox}};
const SP_EMPTY_FORM={name:"",brand:"",category:"مردانه",price:"",stock:"",image:"",description:""};
const SP_PRICE=value=>Number(value||0).toLocaleString("fa-IR");
const SP_NORMALIZE=value=>String(value||"").replace(/ي/g,"ی").replace(/ى/g,"ی").replace(/ك/g,"ک").toLowerCase().trim();
export default function Products(){
const[products,setProducts]=useState(SP_PRODUCTS);
const[search,setSearch]=useState("");

useEffect(() => {
  let ignore = false;

  apiRequest('/products/')
    .then((data) => {
      if (ignore) return;

      const mapped = (Array.isArray(data) ? data : data?.results || []).map((product) => ({
        id: product.id,
        name: product.name,
        brand: product.brand || 'Shamin',
        category: product.category || 'محصول',
        price: Number(product.price || 0),
        stock: Number(product.stock || 0),
        status: Number(product.stock || 0) <= 0 ? 'out' : Number(product.stock || 0) <= 5 ? 'low' : 'active',
        image: product.main_image || SP_PRODUCTS[0].image,
      }));

      if (mapped.length) setProducts(mapped);
    })
    .catch(() => {
      if (!ignore) setProducts(SP_PRODUCTS);
    });

  return () => {
    ignore = true;
  };
}, []);
const[category,setCategory]=useState("all");
const[status,setStatus]=useState("all");
const[sort,setSort]=useState("newest");
const[page,setPage]=useState(1);
const[perPage,setPerPage]=useState(8);
const[menuId,setMenuId]=useState(null);
const[menuPos,setMenuPos]=useState(null);
const[showModal,setShowModal]=useState(false);
const[editingProduct,setEditingProduct]=useState(null);
const[form,setForm]=useState(SP_EMPTY_FORM);
const[selectedProduct,setSelectedProduct]=useState(null);
const[productImages,setProductImages]=useState([]);
const[imageUrl,setImageUrl]=useState("");
const[selectedDetailImage,setSelectedDetailImage]=useState(0);
const imagesRef=useRef([]);
useEffect(()=>{imagesRef.current=productImages},[productImages]);
useEffect(()=>()=>{imagesRef.current.forEach(img=>{if(img.file)URL.revokeObjectURL(img.url)})},[]);
const categories=useMemo(()=>[...new Set(products.map(item=>item.category))],[products]);
const stats=useMemo(()=>{const total=products.length;const active=products.filter(item=>item.status==="active").length;const low=products.filter(item=>item.status==="low").length;const out=products.filter(item=>item.status==="out").length;return{total,active,low,out}},[products]);
const filteredProducts=useMemo(()=>{const query=SP_NORMALIZE(search);let result=products.filter(item=>{const matchesSearch=!query||SP_NORMALIZE(item.name).includes(query)||SP_NORMALIZE(item.brand).includes(query);const matchesCategory=category==="all"||item.category===category;const matchesStatus=status==="all"||item.status===status;return matchesSearch&&matchesCategory&&matchesStatus});if(sort==="price-low")result=[...result].sort((a,b)=>a.price-b.price);if(sort==="price-high")result=[...result].sort((a,b)=>b.price-a.price);if(sort==="stock")result=[...result].sort((a,b)=>b.stock-a.stock);return result},[products,search,category,status,sort]);
const totalPages=Math.max(1,Math.ceil(filteredProducts.length/perPage));
const currentPage=Math.min(page,totalPages);
const visibleProducts=filteredProducts.slice((currentPage-1)*perPage,currentPage*perPage);
const openMenu=(id,event)=>{if(menuId===id){setMenuId(null);setMenuPos(null);return}const rect=event.currentTarget.getBoundingClientRect();const width=175,height=142,gap=7;let top=rect.bottom+gap,left=rect.left;if(top+height>window.innerHeight-12)top=rect.top-height-gap;if(left+width>window.innerWidth-12)left=window.innerWidth-width-12;if(left<12)left=12;setMenuId(id);setMenuPos({top,left})};
const closeMenu=()=>{setMenuId(null);setMenuPos(null)};
const openAddModal=()=>{closeMenu();setEditingProduct(null);setForm(SP_EMPTY_FORM);setProductImages([]);setImageUrl("");setShowModal(true)};
const openEditModal=product=>{closeMenu();setEditingProduct(product);setForm({name:product.name,brand:product.brand,category:product.category,price:String(product.price),stock:String(product.stock),image:product.image,description:""});setProductImages(product.image?[{id:`existing-${product.id}`,url:product.image,file:null}]:[]);setImageUrl("");setShowModal(true)};
const closeModal=()=>{setShowModal(false);setEditingProduct(null);setForm(SP_EMPTY_FORM);productImages.forEach(img=>{if(img.file)URL.revokeObjectURL(img.url)});setProductImages([]);setImageUrl("")};
const changeForm=(field,value)=>setForm(prev=>({...prev,[field]:value}));
const handleProductImages=e=>{const files=Array.from(e.target.files||[]);const remaining=Math.max(0,6-productImages.length);const newImages=files.slice(0,remaining).map(file=>({id:`${file.name}-${file.lastModified}-${Math.random()}`,file,url:URL.createObjectURL(file)}));setProductImages(prev=>[...prev,...newImages]);e.target.value=""};
const addImageFromUrl=()=>{const url=imageUrl.trim();if(!url||productImages.length>=6)return;setProductImages(prev=>[...prev,{id:`url-${Date.now()}`,url,file:null}]);setImageUrl("")};
const removeProductImage=id=>{setProductImages(prev=>{const image=prev.find(item=>item.id===id);if(image?.file)URL.revokeObjectURL(image.url);return prev.filter(item=>item.id!==id)})};
const setMainProductImage=id=>{setProductImages(prev=>{const selected=prev.find(item=>item.id===id);if(!selected)return prev;return[selected,...prev.filter(item=>item.id!==id)]})};
const saveProduct=event=>{event.preventDefault();if(!form.name.trim()||!form.price)return;const price=Number(String(form.price).replace(/[^\d]/g,""));const stock=Number(String(form.stock).replace(/[^\d]/g,""));const nextStatus=stock<=0?"out":stock<=5?"low":"active";const primaryImage=productImages[0]?.url||form.image.trim()||SP_PRODUCTS[0].image;if(editingProduct){setProducts(prev=>prev.map(item=>item.id===editingProduct.id?{...item,name:form.name.trim(),brand:form.brand.trim()||"Shamin",category:form.category,price,stock,status:nextStatus,image:primaryImage}:item))}else{setProducts(prev=>[{id:Date.now(),name:form.name.trim(),brand:form.brand.trim()||"Shamin",category:form.category,price,stock,status:nextStatus,image:primaryImage},...prev]);setPage(1)}closeModal()};
const deleteProduct=id=>{if(!window.confirm("آیا از حذف این محصول مطمئن هستید؟"))return;setProducts(prev=>prev.filter(item=>item.id!==id));closeMenu()};
const openDetails=product=>{closeMenu();setSelectedProduct(product);setSelectedDetailImage(0)};
const resetFilters=()=>{setSearch("");setCategory("all");setStatus("all");setSort("newest");setPage(1)};
const handleSearch=value=>{setSearch(value);setPage(1)};
const handleCategory=value=>{setCategory(value);setPage(1)};
const handleStatus=value=>{setStatus(value);setPage(1)};
return(
<div className="sp" dir="rtl" onClick={event=>{if(!event.target.closest(".sp-product-menu-wrap"))closeMenu()}}>
<div className="sp-header">
<div className="sp-header-main">
<div className="sp-header-kicker"><span className="sp-header-dot"/><span>مرکز مدیریت محصولات</span></div>
<h1 className="sp-title">محصولات</h1>
<p className="sp-description">مدیریت محصولات، موجودی و اطلاعات کالاهای فروشگاه</p>
</div>
<div className="sp-header-actions">
<div className="sp-total-box"><span>کل محصولات</span><strong>{products.length.toLocaleString("fa-IR")}</strong><small>محصول</small></div>
<button type="button" className="sp-add-button" onClick={openAddModal}><FiPlus/><span>محصول جدید</span></button>
</div>
</div>
<div className="sp-stats">
<div className="sp-stat sp-stat-total"><div className="sp-stat-icon"><FiPackage/></div><div className="sp-stat-content"><span>کل محصولات</span><strong>{stats.total.toLocaleString("fa-IR")}</strong></div></div>
<div className="sp-stat sp-stat-active"><div className="sp-stat-icon"><FiCheckCircle/></div><div className="sp-stat-content"><span>محصولات فعال</span><strong>{stats.active.toLocaleString("fa-IR")}</strong></div></div>
<div className="sp-stat sp-stat-low"><div className="sp-stat-icon"><FiAlertTriangle/></div><div className="sp-stat-content"><span>موجودی کم</span><strong>{stats.low.toLocaleString("fa-IR")}</strong></div></div>
<div className="sp-stat sp-stat-out"><div className="sp-stat-icon"><FiTag/></div><div className="sp-stat-content"><span>ناموجود</span><strong>{stats.out.toLocaleString("fa-IR")}</strong></div></div>
</div>
<div className="sp-toolbar">
<div className="sp-search">
<FiSearch/>
<input type="text" value={search} onChange={event=>handleSearch(event.target.value)} placeholder="جستجو بین محصولات..."/>
{search&&<button type="button" className="sp-search-clear" onClick={()=>handleSearch("")} aria-label="پاک کردن جستجو"><FiX/></button>}
</div>
<div className="sp-filter-group">
<div className="sp-select-wrap">
<FiFilter/>
<select value={category} onChange={event=>handleCategory(event.target.value)}>
<option value="all">همه دسته‌بندی‌ها</option>
{categories.map(item=>(<option key={item} value={item}>{item}</option>))}
</select>
<FiChevronDown/>
</div>
<div className="sp-select-wrap">
<FiCheckCircle/>
<select value={status} onChange={event=>handleStatus(event.target.value)}>
<option value="all">همه وضعیت‌ها</option>
<option value="active">فعال</option>
<option value="low">موجودی کم</option>
<option value="out">ناموجود</option>
</select>
<FiChevronDown/>
</div>
<div className="sp-select-wrap sp-sort-select">
<select value={sort} onChange={event=>{setSort(event.target.value);setPage(1)}}>
<option value="newest">جدیدترین</option>
<option value="price-low">ارزان‌ترین</option>
<option value="price-high">گران‌ترین</option>
<option value="stock">بیشترین موجودی</option>
</select>
<FiChevronDown/>
</div>
{(search||category!=="all"||status!=="all"||sort!=="newest")&&<button type="button" className="sp-reset" onClick={resetFilters}><FiX/>پاک کردن فیلترها</button>}
</div>
</div>
<div className="sp-result-bar">
<div className="sp-result-title"><span>محصولات فروشگاه</span><b>{filteredProducts.length.toLocaleString("fa-IR")}</b><small>مورد</small></div>
<div className="sp-result-right">
<span>نمایش</span>
<select value={perPage} onChange={event=>{setPerPage(Number(event.target.value));setPage(1)}}>
<option value={8}>۸</option>
<option value={12}>۱۲</option>
<option value={16}>۱۶</option>
</select>
<span>محصول در صفحه</span>
</div>
</div>
{visibleProducts.length>0?(
<div className="sp-products-grid">
{visibleProducts.map(product=>{const statusInfo=SP_STATUS[product.status]||SP_STATUS.active;const StatusIcon=statusInfo.icon;return(
<article className="sp-product-card" key={product.id}>
<div className="sp-product-image">
<img src={product.image} alt={product.name} loading="lazy"/>
<div className="sp-product-actions">
<button type="button" onClick={()=>openDetails(product)} aria-label="مشاهده محصول"><FiEye/></button>
<div className="sp-product-menu-wrap">
<button type="button" className={menuId===product.id?"sp-menu-active":""} onClick={event=>openMenu(product.id,event)} aria-label="عملیات محصول"><FiMoreHorizontal/></button>
</div>
</div>
<span className={`sp-stock-badge sp-stock-${product.status}`}><StatusIcon/>{statusInfo.label}</span>
</div>
<div className="sp-product-body">
<div className="sp-product-brand">{product.brand}</div>
<h2>{product.name}</h2>
<div className="sp-product-meta"><span>دسته‌بندی</span><strong>{product.category}</strong></div>
<div className="sp-product-footer">
<div className="sp-product-price"><strong>{SP_PRICE(product.price)}</strong><span>تومان</span></div>
<div className={`sp-product-stock sp-product-stock-${product.status}`}><FiBox/><span>{product.stock.toLocaleString("fa-IR")}</span></div>
</div>
<div className="sp-product-bottom">
<button type="button" className="sp-edit-button" onClick={()=>openEditModal(product)}><FiEdit3/>ویرایش</button>
<button type="button" className="sp-view-button" onClick={()=>openDetails(product)}>مشاهده<FiChevronLeft/></button>
</div>
</div>
</article>)})}
</div>
):(
<div className="sp-empty">
<div className="sp-empty-icon"><FiPackage/></div>
<h3>محصولی پیدا نشد</h3>
<p>با تغییر عبارت جستجو یا فیلترها دوباره امتحان کنید.</p>
<button type="button" onClick={resetFilters}>پاک کردن فیلترها</button>
</div>
)}
{totalPages>1&&(
<div className="sp-pagination">
<button type="button" disabled={currentPage===1} onClick={()=>setPage(prev=>Math.max(1,prev-1))} aria-label="صفحه قبل"><FiChevronRight/></button>
{Array.from({length:totalPages},(_,index)=>index+1).map(item=>(<button type="button" key={item} className={currentPage===item?"sp-page-active":""} onClick={()=>setPage(item)}>{item.toLocaleString("fa-IR")}</button>))}
<button type="button" disabled={currentPage===totalPages} onClick={()=>setPage(prev=>Math.min(totalPages,prev+1))} aria-label="صفحه بعد"><FiChevronLeft/></button>
</div>
)}
{menuId!==null&&menuPos&&(
<div className="sp-product-menu" style={{top:menuPos.top,left:menuPos.left}}>
{(()=>{const product=products.find(item=>item.id===menuId);if(!product)return null;return(<>
<button type="button" onClick={()=>openDetails(product)}><FiEye/>مشاهده محصول</button>
<button type="button" onClick={()=>openEditModal(product)}><FiEdit3/>ویرایش محصول</button>
<button type="button" className="sp-danger-action" onClick={()=>deleteProduct(product.id)}><FiTrash2/>حذف محصول</button>
</>)})()}
</div>
)}
{showModal&&(
<div className="sp-modal-backdrop" onMouseDown={event=>{if(event.target===event.currentTarget)closeModal()}}>
<div className="sp-modal">
<div className="sp-modal-header">
<div>
<span className="sp-modal-kicker"><FiPackage/>مدیریت محصول</span>
<h2>{editingProduct?"ویرایش محصول":"افزودن محصول جدید"}</h2>
<p>اطلاعات محصول را وارد و ذخیره کنید.</p>
</div>
<button type="button" className="sp-modal-close" onClick={closeModal}><FiX/></button>
</div>
<form className="sp-product-form" onSubmit={saveProduct}>
<div className="sp-form-image">
<div className="sp-form-image-head">
<div>
<strong>تصاویر محصول</strong>
<span>حداکثر ۶ تصویر برای محصول</span>
</div>
<label className="sp-image-upload">
<input type="file" accept="image/*" multiple onChange={handleProductImages}/>
<FiUpload/>
افزودن تصویر
</label>
</div>
<div className="sp-form-gallery">
{productImages.map((image,index)=>(
<div className="sp-form-gallery-item" key={image.id}>
<img src={image.url} alt={`تصویر ${index+1}`}/>
{index===0&&(<span className="sp-main-image-label">تصویر اصلی</span>)}
<button type="button" className="sp-remove-image" onClick={()=>removeProductImage(image.id)}><FiX/></button>
{index!==0&&(<button type="button" className="sp-set-main-image" onClick={()=>setMainProductImage(image.id)}>اصلی</button>)}
</div>
))}
{productImages.length===0&&(
<label className="sp-image-empty">
<input type="file" accept="image/*" multiple onChange={handleProductImages}/>
<FiImage/>
<strong>افزودن تصاویر</strong>
<span>JPG / PNG / WEBP</span>
</label>
)}
</div>
<div className="sp-image-url-row">
<input type="text" value={imageUrl} onChange={e=>setImageUrl(e.target.value)} placeholder="یا آدرس تصویر را وارد کنید..."/>
<button type="button" onClick={addImageFromUrl}>افزودن</button>
</div>
</div>
<div className="sp-form-grid">
<label className="sp-field sp-field-full"><span>نام محصول <b>*</b></span><input type="text" value={form.name} onChange={event=>changeForm("name",event.target.value)} placeholder="مثلاً عطر مردانه ساواج" required/></label>
<label className="sp-field"><span>برند</span><input type="text" value={form.brand} onChange={event=>changeForm("brand",event.target.value)} placeholder="مثلاً Dior"/></label>
<label className="sp-field"><span>دسته‌بندی</span><div className="sp-field-select"><select value={form.category} onChange={event=>changeForm("category",event.target.value)}><option value="مردانه">مردانه</option><option value="زنانه">زنانه</option><option value="یونیسکس">یونیسکس</option><option value="هدیه">هدیه</option></select><FiChevronDown/></div></label>
<label className="sp-field"><span>قیمت <b>*</b></span><div className="sp-input-unit"><input type="text" inputMode="numeric" value={form.price} onChange={event=>changeForm("price",event.target.value.replace(/[^\d]/g,""))} placeholder="4,850,000" required/><span>تومان</span></div></label>
<label className="sp-field"><span>موجودی</span><input type="text" inputMode="numeric" value={form.stock} onChange={event=>changeForm("stock",event.target.value.replace(/[^\d]/g,""))} placeholder="10"/></label>
<label className="sp-field sp-field-full"><span>توضیحات کوتاه</span><textarea value={form.description} onChange={event=>changeForm("description",event.target.value)} placeholder="توضیحات کوتاه درباره محصول..." rows={3}/></label>
</div>
<div className="sp-modal-footer">
<button type="button" className="sp-cancel-button" onClick={closeModal}>انصراف</button>
<button type="submit" className="sp-save-button"><FiSave/>{editingProduct?"ذخیره تغییرات":"افزودن محصول"}</button>
</div>
</form>
</div>
</div>
)}
{selectedProduct&&(
<div className="sp-modal-backdrop" onMouseDown={event=>{if(event.target===event.currentTarget)setSelectedProduct(null)}}>
<div className="sp-details-modal">
<button type="button" className="sp-details-close" onClick={()=>setSelectedProduct(null)}><FiX/></button>
<div className="sp-details-media">
<div className="sp-details-image">
<img src={selectedProduct.image} alt={selectedProduct.name}/>
</div>
<div className="sp-details-gallery">
<button type="button" className={selectedDetailImage===0?"active":""} onClick={()=>setSelectedDetailImage(0)}>
<img src={selectedProduct.image} alt=""/>
</button>
</div>
</div>
<div className="sp-details-content">
<span className="sp-details-brand">{selectedProduct.brand}</span>
<h2>{selectedProduct.name}</h2>
<div className="sp-details-status">{(()=>{const statusInfo=SP_STATUS[selectedProduct.status];const StatusIcon=statusInfo.icon;return(<><StatusIcon/>{statusInfo.label}</>)})()}</div>
<div className="sp-details-grid">
<div><span>دسته‌بندی</span><strong>{selectedProduct.category}</strong></div>
<div><span>موجودی</span><strong>{selectedProduct.stock.toLocaleString("fa-IR")} عدد</strong></div>
<div className="sp-details-price"><span>قیمت فروش</span><strong>{SP_PRICE(selectedProduct.price)}</strong><small>تومان</small></div>
</div>
<div className="sp-details-info-list">
<div><span>برند</span><strong>{selectedProduct.brand}</strong></div>
<div><span>دسته‌بندی</span><strong>{selectedProduct.category}</strong></div>
<div><span>وضعیت</span><strong>{SP_STATUS[selectedProduct.status].label}</strong></div>
<div><span>موجودی</span><strong>{selectedProduct.stock.toLocaleString("fa-IR")} عدد</strong></div>
</div>
<div className="sp-details-description">
<span>توضیحات</span>
<p>توضیحات محصول در این قسمت نمایش داده می‌شود.</p>
</div>
<div className="sp-details-actions">
<button type="button" className="sp-edit-button" onClick={()=>openEditModal(selectedProduct)}><FiEdit3/>ویرایش محصول</button>
<button type="button" className="sp-cancel-button" onClick={()=>setSelectedProduct(null)}>بستن</button>
</div>
</div>
</div>
</div>
)}
</div>
);
}