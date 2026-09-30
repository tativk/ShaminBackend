import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { apiRequest } from "../api";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [totalItems, setTotalItems] = useState(0);

  const refreshCart = useCallback(async () => {
    try {
      const data = await apiRequest("/cart/items/");
      const rows = Array.isArray(data) ? data : data?.results || [];
      const count =
        typeof data?.total_items === "number"
          ? data.total_items
          : rows.reduce((sum, item) => sum + (item.quantity || 0), 0);
      setTotalItems(count);
    } catch (err) {
      setTotalItems(0);
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  useEffect(() => {
    const handleUpdate = () => refreshCart();
    window.addEventListener("cart:updated", handleUpdate);
    return () => window.removeEventListener("cart:updated", handleUpdate);
  }, [refreshCart]);

  return (
    <CartContext.Provider value={{ totalItems, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
};