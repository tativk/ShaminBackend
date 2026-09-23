import React, { useState } from "react";
import { FiMail, FiUser, FiEye, FiEyeOff, FiChevronLeft } from "react-icons/fi";
import "./Login.css";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [form, setForm] = useState({ identifier: "", password: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: connect to authentication API
    console.log({ ...form, remember });
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

              <button type="submit" className="auth-btn auth-btn--primary">
                <FiChevronLeft />
                <a href="/verify">ورود</a>
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
