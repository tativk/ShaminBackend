import React, { useState } from "react";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiLock,
  FiEye,
  FiEyeOff,
  FiChevronLeft,
} from "react-icons/fi";
import "./Register.css";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agree, setAgree] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      // TODO: show a proper validation message in the UI
      console.warn("رمز عبور و تکرار آن یکسان نیستند");
      return;
    }
    if (!agree) {
      console.warn("لطفاً با قوانین و مقررات موافقت کنید");
      return;
    }
    // TODO: connect to authentication API
    console.log(form);
  };

  return (
    <div className="auth-page" dir="rtl">
      <div className="auth-page__form-side">
        <div className="auth-form-wrap">
          <div className="auth-card">
            <img className="auth-card__logo" src="/logo.png" alt="لوگوی شمین گالری" />

            <h2 className="auth-card__title">ثبت نام در شمین گالری</h2>
            <p className="auth-card__subtitle">
              برای دسترسی به حساب کاربری خود، اطلاعات زیر را وارد کنید.
            </p>

            <form className="auth-form" onSubmit={handleSubmit}>
              <label className="auth-field">
                <input
                  type="text"
                  name="fullName"
                  placeholder="نام و نام خانوادگی"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                />
                <FiUser className="auth-field__icon" />
              </label>

              <label className="auth-field">
                <input
                  type="email"
                  name="email"
                  placeholder="ایمیل"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
                <FiMail className="auth-field__icon" />
              </label>

              <label className="auth-field">
                <input
                  type="tel"
                  name="phone"
                  placeholder="شماره موبایل"
                  value={form.phone}
                  onChange={handleChange}
                  required
                />
                <FiPhone className="auth-field__icon" />
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

              <label className="auth-field">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="تکرار رمز عبور"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="auth-field__icon auth-field__icon--btn"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={
                    showConfirmPassword ? "پنهان کردن رمز عبور" : "نمایش رمز عبور"
                  }
                >
                  {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </label>

              <div className="auth-form__row auth-form__row--single">
                <label className="auth-checkbox">
                  <span>با قوانین و مقررات موافقم</span>
                  <input
                    type="checkbox"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                    required
                  />
                  <span className="auth-checkbox__box" />
                </label>
              </div>

              <button type="submit" className="auth-btn auth-btn--primary">
                <FiChevronLeft />
                ثبت نام
              </button>

              <div className="auth-divider">
                <span>یا</span>
              </div>

              <a href="/login" className="auth-btn auth-btn--ghost">
                <FiLock />
                قبلاً ثبت نام کرده‌اید؟ وارد شوید
              </a>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
