import React, { useEffect, useState } from "react";
import { FiAward } from "react-icons/fi";
import { apiRequest, getAssetUrl } from "../../api";
import ProductCard from "./ProductCard";

const FALLBACK_IMAGE = "/logo.png";

const BestSellingProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    apiRequest("/products/")
      .then((data) => {
        if (ignore) return;
        const rows = Array.isArray(data) ? data : data?.results || [];
        setProducts(rows.map((product) => ({
          id: product.id,
          name: product.name,
          brand: typeof product.brand === "string" ? product.brand : "",
          price: Number(product.final_price ?? product.price ?? 0),
          oldPrice: Number(product.discount_percent || 0) > 0 ? Number(product.price) : null,
          rating: null,
          badge: product.discount_percent > 0 ? `${new Intl.NumberFormat("fa-IR").format(product.discount_percent)}٪ تخفیف` : null,
          image: product.main_image ? getAssetUrl(product.main_image) : FALLBACK_IMAGE,
        })));
      })
      .catch((err) => { if (!ignore) setError(err?.message || "خطا در دریافت محصولات"); })
      .finally(() => { if (!ignore) setLoading(false); });
    return () => { ignore = true; };
  }, []);

  return (
    <section className="container products-section" id="products">
      <div className="section-title">
        <FiAward />
        <h2>محصولات پرفروش</h2>
      </div>
      {loading ? (
        <p className="products-state">در حال دریافت محصولات...</p>
      ) : error ? (
        <p className="products-state">{error}</p>
      ) : products.length === 0 ? (
        <p className="products-state">هنوز محصولی ثبت نشده است.</p>
      ) : (
        <div className="products-grid">
          {products.map((p) => (
            <ProductCard product={p} key={p.id} />
          ))}
        </div>
      )}
    </section>
  );
};

export default BestSellingProducts;
