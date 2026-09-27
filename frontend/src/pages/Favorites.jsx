import React, { useEffect, useState } from "react";
import { FiArrowRight, FiHeart, FiShoppingCart, FiTrash2 } from "react-icons/fi";
import { Link } from "react-router-dom";
import { apiRequest, getAssetUrl } from "../api";
import { notifyCartAdded } from "../cart-notice";
import { getFavorites, removeFavorite } from "../favorites";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import "./Home.css";
import "./Favorites.css";

const formatPrice = (value) => `${new Intl.NumberFormat("fa-IR").format(Number(value || 0))} تومان`;
const FALLBACK_IMAGE = "/logo.png";
/* آدرس ذخیره‌شده در علاقه‌مندی‌ها یا resolve شده یا asset عمومی فرانت است؛
   فقط مسیر خام بک‌اند (مثل /media/...) از getAssetUrl عبور کند. */
const favoriteImage = (fav) => {
  const raw = fav.image || fav.main_image;
  return raw && raw !== FALLBACK_IMAGE && !raw.startsWith("http") ? getAssetUrl(raw) : raw || FALLBACK_IMAGE;
};
const Favorites = () => {
  const [items, setItems] = useState(getFavorites);
  const [notice, setNotice] = useState("");
  useEffect(() => { const update = () => setItems(getFavorites()); window.addEventListener("favorites:changed", update); return () => window.removeEventListener("favorites:changed", update); }, []);
  const addToCart = async (product) => { try { const data = await apiRequest("/cart/items/", { method: "POST", body: JSON.stringify({ product: product.id, quantity: 1 }) }); notifyCartAdded({ added: 1, totalItems: data?.total_items, productName: product.name }); } catch (error) { setNotice(error.message || "افزودن به سبد خرید انجام نشد."); } };
  return <div className="home-page favorites-page" dir="rtl"><Header /><main className="container favorites-content"><Link to="/products" className="favorites-back"><FiArrowRight /> بازگشت به محصولات</Link><div className="favorites-heading"><div><span><FiHeart /> انتخاب‌های شما</span><h1>علاقه‌مندی‌ها</h1><p>محصولاتی که برای خرید بعدی نشان کرده‌اید.</p></div><strong>{items.length.toLocaleString("fa-IR")} محصول</strong></div>{notice && <p className="favorites-notice">{notice}</p>}{items.length ? <section className="favorites-grid">{items.map((product) => <article className="favorite-card" key={product.id}><div className="favorite-card__image"><img src={favoriteImage(product)} alt={product.name} /><button onClick={() => setItems(removeFavorite(product.id))} aria-label="حذف از علاقه‌مندی‌ها"><FiTrash2 /></button></div><div className="favorite-card__body"><span>{product.brand || "شمین"}</span><h2>{product.name}</h2><strong>{formatPrice(product.final_price || product.price)}</strong><button onClick={() => addToCart(product)}><FiShoppingCart /> افزودن به سبد</button></div></article>)}</section> : <section className="favorites-empty"><FiHeart /><h2>هنوز محصولی نشان نکرده‌اید</h2><p>محصولات مورد علاقه‌تان را اینجا جمع کنید تا راحت‌تر پیدایشان کنید.</p><Link to="/products">مشاهده محصولات</Link></section>}</main><Footer /></div>;
};
export default Favorites;
