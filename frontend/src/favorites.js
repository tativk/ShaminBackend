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