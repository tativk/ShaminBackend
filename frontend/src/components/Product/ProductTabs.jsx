import React, { useState } from "react";
import { FiDroplet, FiSun, FiClock } from "react-icons/fi";
import ProductReviews from "./ProductReviews";

const ProductTabs = ({ product }) => {
  const [activeTab, setActiveTab] = useState("description");

  const tabs = [
    { id: "description", label: "توضیحات محصول" },
    { id: "specs", label: "مشخصات" },
    { id: "reviews", label: "نظرات کاربران" },
  ];

  const specIcons = {
    "نوع محصول": <FiDroplet />,
    "جنسیت": <FiSun />,
    "موجودی": <FiClock />,
  };

  const quickSpecs = product.specs.filter((s) => specIcons[s.label]);

  return (
    <div className="product-tabs">
      <div className="product-tabs__nav">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={
              activeTab === tab.id
                ? "product-tabs__tab product-tabs__tab--active"
                : "product-tabs__tab"
            }
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="product-tabs__panel">
        {activeTab === "description" && (
          <div className="product-tabs__description">
            <p>{product.longDescription || "توضیحی برای این محصول ثبت نشده است."}</p>
            <div className="product-tabs__specs-box">
              {quickSpecs.map((spec) => (
                <div className="product-tabs__spec-row" key={spec.label}>
                  <div className="product-tabs__spec-text">
                    <span className="product-tabs__spec-label">{spec.label}</span>
                    <span className="product-tabs__spec-value">{spec.value}</span>
                  </div>
                  <span className="product-tabs__spec-icon">{specIcons[spec.label]}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "specs" && (
          <table className="product-tabs__specs-table">
            <tbody>
              {product.specs.map((spec) => (
                <tr key={spec.label}>
                  <th>{spec.label}</th>
                  <td>{spec.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === "reviews" && <ProductReviews productId={product.id} averageRating={product.rating} />}
      </div>
    </div>
  );
};

export default ProductTabs;
