import React from "react";
import { FiChevronLeft } from "react-icons/fi";
import { Link } from "react-router-dom";

// دسته‌بندی‌های واقعی بک‌اند (products.Product.CATEGORY_CHOICES)
const CATEGORIES = [
  {
    code: "perfume",
    title: "عطر و ادکلن",
    desc: "رایحه‌ای خاص، لحظاتی ماندگار",
    image:
      "/cat-perfume.jpg",
  },
  {
    code: "cosmetic",
    title: "لوازم آرایشی و بهداشتی",
    desc: "زیبایی، مراقبت، اعتماد به نفس",
    image:
      "/cat-cosmetics.jpg",
  },
  {
    code: "accessory",
    title: "اکسسوری",
    desc: "جزئیات کوچک، تفاوت‌های بزرگ",
    image:
      "/cat-acsesory.jpg",
  },
];

const CategoryCard = ({ category }) => (
  <Link to={`/products?category=${category.code}`} className="category-card">
    <img src={category.image} alt={category.title} className="category-card__image" />
    <div className="category-card__overlay" />
    <div className="category-card__body">
      <h3>{category.title}</h3>
      <p>{category.desc}</p>
    </div>
    <span className="category-card__arrow">
      <FiChevronLeft />
    </span>
  </Link>
);

const CategorySection = () => (
  <section className="container category-section">
    {CATEGORIES.map((c) => (
      <CategoryCard category={c} key={c.title} />
    ))}
  </section>
);

export default CategorySection;
