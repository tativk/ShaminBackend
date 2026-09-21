import React from "react";
import { Route, Routes } from "react-router-dom";

import Home from "../pages/Home";
import AdminPanel from "../pages/AdminPanel";
import Cart from "../pages/Cart";
import Login from "../pages/Login";
import Register from "../pages/Register";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/admin" element={<AdminPanel />} />
      <Route path="/dashboard" element={<AdminPanel />} />

      <Route path="/Cart" element={<Cart />} />
      <Route path="/Login" element={<Login />} />
      <Route path="/Register" element={<Register />} />
    </Routes>
  );
};

export default AppRoutes;