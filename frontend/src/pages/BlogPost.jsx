import React from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { FiChevronLeft, FiClock, FiUser, FiTag } from "react-icons/fi";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import blogPosts, { getPostBySlug } from "../data/blogPosts";
import "./Home.css";
import "./Blog.css";

/* رندر بلوک‌های محتوا؛ ترتیب بلوک‌ها همان ترتیب نوشتار روزنامه‌ای است */
const ContentBlock = ({ block }) => {
  switch (block.type) {
    case "heading":
      return <h2 className="newspaper__heading">{block.text}</h2>;
    case "paragraph":
      return <p className="newspaper__paragraph">{block.text}</p>;
    case "quote":
      return (
        <blockquote className="newspaper__quote">
          <span className="newspaper__quote-mark">”</span>
          {block.text}
        </blockquote>
      );
    case "list":
      return (
        <ul className="newspaper__list">
          {block.items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
    default:
      return null;
  }
};

const BlogPost = () => {
  const { slug } = useParams();
  const post = getPostBySlug(slug);

  if (!post) return <Navigate to="/blog" replace />;

  const relatedPosts = blogPosts
    .filter((p) => p.slug !== post.slug)
    .slice(0, 3);

  return (
    <div className="home-page blog-page" dir="rtl">
      <Header />
      <main>
        <nav className="container blog-breadcrumb" aria-label="مسیر صفحه">
          <Link to="/">خانه</Link>
          <FiChevronLeft />
          <Link to="/blog">وبلاگ</Link>
          <FiChevronLeft />
          <span>{post.title}</span>
        </nav>

        <article className="container">
          <div className="newspaper">
            <header className="newspaper__masthead">
              <span>روزنامهٔ زیبایی و سبک زندگی شمین</span>
              <span>شمارهٔ {post.date}</span>
            </header>

            <div className="newspaper__meta">
              <span className="newspaper__category">
                <FiTag /> {post.category}
              </span>
              <span>
                <FiUser /> {post.author}
              </span>
              <span>
                <FiClock /> {post.readingTime}
              </span>
            </div>

            <h1 className="newspaper__title">{post.title}</h1>
            <p className="newspaper__lead">{post.excerpt}</p>

            <figure className="newspaper__figure">
              <img src={post.image} alt={post.title} />
              <figcaption>{post.imageCaption}</figcaption>
            </figure>

            <div className="newspaper__body">
              {post.content.map((block, i) => (
                <ContentBlock block={block} key={i} />
              ))}
            </div>

            <footer className="newspaper__footer">
              <span>تهیه و تنظیم: {post.author} — فروشگاه شمین</span>
              <Link to="/blog" className="newspaper__back">
                بازگشت به وبلاگ
                <FiChevronLeft />
              </Link>
            </footer>
          </div>
        </article>

        <section className="container blog-related">
          <div className="section-title">
            <h2>مطالب مرتبط</h2>
          </div>
          <div className="blog-grid blog-grid--related">
            {relatedPosts.map((p) => (
              <Link to={`/blog/${p.slug}`} className="blog-card" key={p.slug}>
                <div className="blog-card__image-wrap">
                  <img src={p.image} alt={p.title} />
                </div>
                <div className="blog-card__body">
                  <span className="blog-card__date">
                    {p.category} · {p.date}
                  </span>
                  <h3>{p.title}</h3>
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

export default BlogPost;
