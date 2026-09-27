import { useEffect, useState } from "react";

const FAVORITES_KEY = "shamin-favorites";

export const getFavorites = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
};

export const isFavorite = (id) => getFavorites().some((product) => product.id === id);

export const toggleFavorite = (product) => {
  const favorites = getFavorites();
  const exists = favorites.some((item) => item.id === product.id);
  const next = exists ? favorites.filter((item) => item.id !== product.id) : [...favorites, product];
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("favorites:changed"));
  return next;
};

export const removeFavorite = (id) => {
  const next = getFavorites().filter((product) => product.id !== id);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("favorites:changed"));
  return next;
};

/* هوک اشتراکی: وضعیت قلب هر محصول با رویداد سراسری «favorites:changed»
   بین هدر، کارت‌ها و صفحه علاقه‌مندی‌ها هم‌گام می‌ماند. */
export const useFavorite = (product) => {
  const [favorite, setFavorite] = useState(() => isFavorite(product?.id));
  useEffect(() => {
    const update = () => setFavorite(isFavorite(product?.id));
    update();
    window.addEventListener("favorites:changed", update);
    return () => window.removeEventListener("favorites:changed", update);
  }, [product?.id]);
  return [favorite, () => toggleFavorite(product)];
};