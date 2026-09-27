import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

/* =========================================================
   علاقه‌مندی‌ها — بک‌اند ندارد؛ تا اتصال سرور، در localStorage
   ذخیره می‌شود تا بین صفحه‌ها و رفرش‌ها حفظ بماند.
   ========================================================= */

const STORAGE_KEY = "shamin_wishlist";

const WishlistContext = createContext(null);

const readStorage = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const WishlistProvider = ({ children }) => {
  const [items, setItems] = useState(readStorage);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* حافظه پر یا غیرفعال است؛ لیست فقط در همین نشست کار می‌کند */
    }
  }, [items]);

  const has = (id) => items.some((item) => String(item.id) === String(id));

  /* افزودن/حذف؛ خروجی true یعنی «الان اضافه شد» و false یعنی «حذف شد» */
  const toggle = (product) => {
    const snapshot = {
      id: product.id,
      name: product.name,
      brand: product.brand || "",
      price: product.price,
      oldPrice: product.oldPrice ?? null,
      image: product.image || (Array.isArray(product.images) ? product.images[0] : null) || "/logo.png",
      rating: product.rating ?? null,
    };
    let added = false;
    setItems((prev) => {
      if (prev.some((item) => String(item.id) === String(snapshot.id))) {
        return prev.filter((item) => String(item.id) !== String(snapshot.id));
      }
      added = true;
      return [snapshot, ...prev];
    });
    return added;
  };

  const remove = (id) =>
    setItems((prev) => prev.filter((item) => String(item.id) !== String(id)));

  const clear = () => setItems([]);

  const value = useMemo(
    () => ({ items, count: items.length, has, toggle, remove, clear }),
    [items],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist باید داخل WishlistProvider استفاده شود");
  return ctx;
};
