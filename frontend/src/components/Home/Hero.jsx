import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const HERO_SLIDES = [
  {
    eyebrow: "عطر؛ امضای شخصیت شماست.",
    title: "عطر و ادکلن",
    description: "رایحه‌ای که حس خوب را ماندگار می‌کند؛.",
    cta: "مشاهده محصولات",
    image:
      "/banner-perfume.jpg",
  },
  {
    eyebrow: "زیبایی روزمره شما",
    title: "لوازم آرایشی",
    description: "محصولاتی که پوست شما شایسته آن است.",
    cta: "مشاهده محصولات",
    image:
      "/banner-cosmetics.jpg",
  },
  {
    eyebrow: "جزئیاتی که فرق می‌کنند",
    title: "اکسسوری ",
    description: "اکسسوری‌هایی برای تکمیل جذابیت شما.",
    cta: "مشاهده محصولات",
    image:
      "/baner-acsesory.png",
  },
];

const Hero = () => {
  const [active, setActive] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timerRef.current);
  }, []);

  const goTo = (index) => {
    clearInterval(timerRef.current);
    setActive(index);
  };

  const next = () => goTo((active + 1) % HERO_SLIDES.length);
  const prev = () => goTo((active - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);

  const slide = HERO_SLIDES[active];

  return (
    <section className="hero container">
      <div className="hero__banner">
        <div className="hero__content">
          <span className="hero__eyebrow">{slide.eyebrow}</span>
          <h1 className="hero__title">{slide.title}</h1>
          <p className="hero__desc">{slide.description}</p>
          <Link to="/products" className="btn btn--primary hero__cta">
            {slide.cta}
            <FiChevronLeft />
          </Link>
        </div>
        <div className="hero__image-wrap">
          <img src={slide.image} alt={slide.title} className="hero__image" />
        </div>
      </div>

      <div className="hero__controls">
        <button className="hero__arrow" onClick={next} aria-label="اسلاید بعدی">
          <FiChevronRight />
        </button>
        <div className="hero__dots">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              className={i === active ? "hero__dot hero__dot--active" : "hero__dot"}
              onClick={() => goTo(i)}
              aria-label={`اسلاید ${i + 1}`}
            />
          ))}
        </div>
        <button className="hero__arrow" onClick={prev} aria-label="اسلاید قبلی">
          <FiChevronLeft />
        </button>
      </div>
    </section>
  );
};

export default Hero;
