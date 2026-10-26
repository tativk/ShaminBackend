import React, { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";

// صفحات به‌صورت lazy لود می‌شوند تا حجم باندل اولیه کم بماند
const Home = lazy(() => import("../pages/Home/Home"));
const AdminPanel = lazy(() => import("../pages/AdminPanel/AdminPanel"));
const Cart = lazy(() => import("../pages/Cart/Cart"));
const Login = lazy(() => import("../pages/Login/Login"));
const Register = lazy(() => import("../pages/Register/Register"));
const ProductList = lazy(() => import("../pages/ProductList/ProductList"));
const Dashboard = lazy(() => import("../pages/UserDashboard/Dashboard"));
const Favorites = lazy(() => import("../pages/Favorites/Favorites"));
const Product = lazy(() => import("../pages/Product/Product"));
const Verify = lazy(() => import("../pages/Verify/Verify"));
const Blog = lazy(() => import("../pages/Blog/Blog"));
const BlogPost = lazy(() => import("../pages/BlogPost/BlogPost"));
const AboutUs = lazy(() => import("../pages/AboutUs/AboutUs"));
const Faq = lazy(() => import("../pages/Faq/Faq"));
const PaymentCallbackConnected = lazy(() => import("../pages/PaymentCallback/PaymentCallbackConnected"));

const AppRoutes = () => {
  return (
    <Suspense fallback={<div style={{ padding: "48px", textAlign: "center" }}>در حال بارگذاری...</div>}>
      <Routes>
        <Route path="/faq" element={<Faq />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/ProductList" element={<ProductList />} />
        <Route path="/products/:id" element={<Product />} />
        <Route path="/product/:id" element={<Product />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/Favorites" element={<Favorites />} />
        <Route path="/Cart" element={<Cart />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Register" element={<Register />} />
        <Route path="/Verify" element={<Verify />} />
        <Route path="/payment/callback" element={<PaymentCallbackConnected />} />
        <Route path="/PaymentCallback" element={<PaymentCallbackConnected />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
