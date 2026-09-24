import React, { useState } from "react";
import { FiMail, FiUser, FiEye, FiEyeOff, FiChevronLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api";
import "./Login.css";

const toEnDigits = (value) =>
  String(value || "")
    .replace(/[۰-۹]/g, (c) => "۰۱۲۳۴۵۶۷۸۹".indexOf(c))
    .replace(/[٠-٩]/g, (c) => "٠١٢٣٤٥٦٧٨٩".indexOf(c));

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ identifier: "", password: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const phone = toEnDigits(form.identifier).replace(/\s/g, "");
    if (!/^09\d{9}$/.test(phone)) {
      setError("شماره موبایل معتبر نیست (مثال: 09123456789)");
      return;
    }
    if (!form.password) {
      setError("رمز عبور را وارد کنید.");
      return;
    }
    setLoading(true);
    setError("");
    apiRequest("/auth/login/", {
      method: "POST",
      body: JSON.stringify({ phone, password: form.password }),
    })
      .then((data) => {
        if (data.access) localStorage.setItem("access", data.access);
        if (data.refresh) localStorage.setItem("refresh", data.refresh);
        if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
        navigate(data.user && data.user.role === "admin" ? "/admin" : "/dashboard");
      })
      .catch((err) => setError(err.message || "ورود ناموفق بود."))
      .finally(() => setLoading(false));
  };

  return (
    <div className="auth-page" dir="rtl">
      <div className="auth-page__form-side">
        <div className="auth-form-wrap">
          <div className="auth-card">
            <img className="auth-card__logo" src="/logo.png" alt="لوگوی شمین گالری" />

            <h2 className="auth-card__title">ورود به شمین گالری</h2>
            <p className="auth-card__subtitle">
              برای دسترسی به حساب کاربری خود، اطلاعات زیر را وارد کنید.
            </p>

            <form className="auth-form" onSubmit={handleSubmit}>
              <label className="auth-field">
                <input
                  type="text"
                  name="identifier"
                  placeholder="شماره موبایل"
                  value={form.identifier}
                  onChange={handleChange}
                  required
                />
                <FiUser className="auth-field__icon" />
              </label>

              <label className="auth-field">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="رمز عبور"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="auth-field__icon auth-field__icon--btn"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "پنهان کردن رمز عبور" : "نمایش رمز عبور"}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </label>

              <div className="auth-form__row">
                <label className="auth-checkbox">
                  <span>مرا به خاطر بسپار</span>
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  <span className="auth-checkbox__box" />
                </label>

                <a href="#" className="auth-form__link">
                  فراموشی رمز عبور؟
                </a>
              </div>

              {error && <p className="auth-form__error">{error}</p>}

              <button type="submit" className="auth-btn auth-btn--primary" disabled={loading}>
                <FiChevronLeft />
                {loading ? "در حال ورود..." : "ورود"}
              </button>

              <div className="auth-divider">
                <span>یا</span>
              </div>

              <a href="./Register" className="auth-btn auth-btn--ghost">
                <FiMail />
                حساب کاربری ندارید؟ ثبت نام کنید
              </a>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
