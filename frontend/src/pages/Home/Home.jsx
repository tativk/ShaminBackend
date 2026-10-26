import React from "react";
import Header from "../../components/Header/Header";
import Footer from "../../components/Footer/Footer";
import Hero from "../../components/Home/Hero";
import Features from "../../components/Home/Features";
import CategorySection from "../../components/Home/CategorySection";
import BestSellingProducts from "../../components/Home/BestSellingProducts";
import BlogSection from "../../components/Home/BlogSection";
import usePageTitle from "../../usePageTitle";
import "./Home.css";

const Home = () => {
  usePageTitle(
    "",
    "خرید آنلاین عطر و ادکلن اصل، لوازم آرایشی و بهداشتی و اکسسوری از گالری شمین با ضمانت اصالت کالا و ارسال به سراسر ایران.",
  );
  return (
    <div className="home-page" dir="rtl">
      <Header />
      <main>
        <Hero />
        <Features />
        <CategorySection />
        <BestSellingProducts />
        <BlogSection />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
