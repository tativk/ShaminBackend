import React from "react";
import { FiChevronLeft, FiAward } from "react-icons/fi";
import { Link } from "react-router-dom";
import blogPosts from "../../data/blogPosts";

const BlogCard = ({ post }) => (
  <Link to={`/blog/${post.slug}`} className="blog-card">
    <div className="blog-card__image-wrap">
      <img src={post.image} alt={post.title} />
    </div>
    <div className="blog-card__body">
      <span className="blog-card__date">{post.date} · {post.readingTime}</span>
      <h3>{post.title}</h3>
      <span className="blog-card__arrow">
        <FiChevronLeft />
      </span>
    </div>
  </Link>
);

const BlogSection = () => (
  <section className="container blog-section">
    <div className="section-title">
      <FiAward />
      <h2>آخرین مطالب وبلاگ</h2>
      <Link to="/blog" className="blog-section__all">
        مشاهده همه مطالب
        <FiChevronLeft />
      </Link>
    </div>
    <div className="blog-grid">
      {blogPosts.map((post) => (
        <BlogCard post={post} key={post.slug} />
      ))}
    </div>
  </section>
);

export default BlogSection;
