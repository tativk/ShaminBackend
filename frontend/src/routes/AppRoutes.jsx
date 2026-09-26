import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "../pages/Home";
import AdminPanel from "../pages/AdminPanel";
import Cart from "../pages/Cart";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ProductList from "../pages/ProductList";

import Dashboard from "../pages/Dashboard";
import Favorites from "../pages/Favorites";

import Product from "../pages/Product";
import Verify from "../pages/Verify";

import Blog from "../pages/Blog";
import BlogPost from "../pages/BlogPost";

import PaymentCallback from "../pages/PaymentCallback";
import PaymentCallbackConnected from "../pages/PaymentCallbackConnected";



const AppRoutes = () => {
  return (
    <Routes>
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
  );
};

export default AppRoutes;