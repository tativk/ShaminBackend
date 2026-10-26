import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiRequest, getAssetUrl } from "../../api";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import ProductGallery from "../../components/Product/ProductGallery";
import ProductInfo from "../../components/Product/ProductInfo";
import ProductTabs from "../../components/Product/ProductTabs";
import RelatedProducts from "../../components/Product/RelatedProducts";
import { CATEGORY_LABEL, GENDER_LABEL, FALLBACK_IMAGE, formatPrice } from "../../components/Product/shared";
import usePageTitle, { setJsonLd } from "../../usePageTitle";
import "../Home/Home.css";
import "./Product.css";

const Product = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  usePageTitle(
    product?.name || "جزئیات محصول",
    product ? `${product.name} — خرید با ضمانت اصالت کالا از گالری شمین.` : undefined,
  );

  // داده ساختاریافته محصول برای نتایج غنی گوگل
  useEffect(() => {
    if (!product) return undefined;
    setJsonLd({
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      description: product.description || `${product.name} — گالری شمین`,
      image: product.images?.[0] ? [product.images[0]] : undefined,
      category: product.badge,
      offers: {
        "@type": "Offer",
        priceCurrency: "IRR",
        price: String(Math.round(product.price * 10)),
        availability: product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      },
    });
    return () => setJsonLd(null);
  }, [product]);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError("");
    setProduct(null);
    window.scrollTo(0, 0);
    apiRequest(`/products/${id}/`)
      .then((data) => {
        if (ignore) return;
        const images = (data.images || []).map((img) => getAssetUrl(img.image));
        const mapped = {
          id: data.id,
          category: data.category,
          badge: CATEGORY_LABEL[data.category] || data.category,
          name: data.name,
          brand: typeof data.brand === "string" ? data.brand : "",
          gender: data.gender,
          stock: Number(data.stock || 0),
          rating: data.average_rating != null ? Number(data.average_rating) : null,
          description: data.description || "",
          longDescription: data.description || "",
          price: Number(data.final_price ?? data.price ?? 0),
          oldPrice: Number(data.discount_percent || 0) > 0 ? Number(data.price) : null,
          images: images.length ? images : [FALLBACK_IMAGE],
          specs: [
            { label: "نوع محصول", value: CATEGORY_LABEL[data.category] || data.category },
            { label: "جنسیت", value: GENDER_LABEL[data.gender] || data.gender },
            { label: "برند", value: (typeof data.brand === "string" && data.brand) || "بدون برند" },
            { label: "موجودی", value: Number(data.stock || 0) > 0 ? `${Number(data.stock).toLocaleString("fa-IR")} عدد` : "ناموجود" },
            { label: "قیمت واحد", value: formatPrice(Number(data.final_price ?? data.price ?? 0)) },
            { label: "درصد تخفیف", value: `${Number(data.discount_percent || 0).toLocaleString("fa-IR")}٪` },
          ],
        };
        setProduct(mapped);
      })
      .catch((err) => {
        if (!ignore) setError(err?.message || "خطا در دریافت محصول");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    apiRequest("/products/")
      .then((list) => {
        if (ignore) return;
        const rows = Array.isArray(list) ? list : list?.results || [];
        setRelated(
          rows
            .filter((p) => String(p.id) !== String(id))
            .slice(0, 5)
            .map((p) => ({
              id: p.id,
              name: p.name,
              price: Number(p.final_price ?? p.price ?? 0),
              image: p.main_image ? getAssetUrl(p.main_image) : FALLBACK_IMAGE,
            })),
        );
      })
      .catch(() => {});
    return () => {
      ignore = true;
    };
  }, [id]);

  return (
    <div className="home-page" dir="rtl">
      <Header />
      <main>
        {loading ? (
          <section className="container product-detail">
            <p>در حال دریافت محصول...</p>
          </section>
        ) : error || !product ? (
          <section className="container product-detail">
            <p>{/No Product matches/i.test(error) ? "محصول مورد نظر یافت نشد یا حذف شده است." : error || "محصول یافت نشد."}</p>
            <Link to="/products" className="product-info__add-btn">بازگشت به لیست محصولات</Link>
          </section>
        ) : (
          <>
            <section className="container product-detail">
              <ProductGallery product={product} />
              <ProductInfo product={product} />
            </section>

            <section className="container">
              <ProductTabs product={product} />
            </section>

            <RelatedProducts products={related} />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Product;
