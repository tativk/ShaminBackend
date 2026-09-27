import React from "react";
import { Link } from "react-router-dom";
import { FiChevronLeft, FiAward } from "react-icons/fi";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import blogPosts from "../data/blogPosts";
import "./Home.css";
import "./Blog.css";

const Blog = () => {
  return (
    <div className="home-page blog-page" dir="rtl">
      <Header />
      <main>
        <section className="blog-hero">
          <div className="container">
            <span className="blog-hero__kicker">
              <FiAward /> روزنامه زیبایی و سبک زندگی
            </span>
            <h1>وبلاگ شمین</h1>
            <p>
              تازه‌ترین گزارش‌ها، راهنماهای خرید و نکته‌های تخصصی دنیای عطر،
              لوازم آرایشی و اکسسوری؛ مثل یک روزنامه تخصصی در خدمت شما.
            </p>
          </div>
        </section>

        <section className="container blog-list">
          <div className="blog-grid">
            {blogPosts.map((post) => (
              <Link to={`/blog/${post.slug}`} className="blog-card" key={post.slug}>
                <div className="blog-card__image-wrap">
                  <img src={post.image} alt={post.title} />
                </div>
                <div className="blog-card__body">
                  <span className="blog-card__date">
                    {post.category} · {post.date} · {post.readingTime}
                  </span>
                  <h3>{post.title}</h3>
                  <p className="blog-card__excerpt">{post.excerpt}</p>
                  <span className="blog-card__arrow">
                    <FiChevronLeft />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Blog;
