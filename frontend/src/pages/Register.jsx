import React, { useState } from "react";
import {
  FiPhone,
  FiLock,
  FiEye,
  FiEyeOff,
  FiChevronLeft,
} from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { apiRequest } from "../api";
import "./Register.css";

const toEnDigits = (value) =>
  String(value || "")
    .replace(/[۰-۹]/g, (c) => "۰۱۲۳۴۵۶۷۸۹".indexOf(c))
    .replace(/[٠-٩]/g, (c) => "٠١٢٣٤٥٦٧٨٩".indexOf(c));

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ phone: "", password: "", confirmPassword: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const phone = toEnDigits(form.phone).replace(/\s/g, "");
    if (!/^09\d{9}$/.test(phone)) {
      setError("شماره موبایل معتبر نیست (مثال: 09123456789)");
      return;
    }
    if (form.password.length < 4) {
      setError("رمز عبور باید حداقل ۴ کاراکتر باشد.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("رمز عبور و تکرار آن یکسان نیستند.");
      return;
    }
    if (!agree) {
      setError("لطفاً با قوانین و مقررات موافقت کنید.");
      return;
    }
    setLoading(true);
    setError("");
    apiRequest("/auth/register/", {
      method: "POST",
      body: JSON.stringify({ phone, password: form.password }),
    })
      .then(() => {
        navigate("/Verify", { state: { phone } });
      })
      .catch((err) => setError(err.message || "ثبت‌نام ناموفق بود."))
      .finally(() => setLoading(false));
  };

  return (
    <div className="auth-page" dir="rtl">
      <div className="auth-page__form-side">
        <div className="auth-form-wrap">
          <div className="auth-card">
            <img className="auth-card__logo" src="/logo.png" alt="لوگوی شمین گالری" />

            <h2 className="auth-card__title">ثبت نام در شمین گالری</h2>
            <p className="auth-card__subtitle">
              شماره موبایل و رمز عبور خود را انتخاب کنید؛ سپس با کد پیامکی حساب شما فعال می‌شود.
            </p>

            <form className="auth-form" onSubmit={handleSubmit}>
              <label className="auth-field">
                <input
                  type="tel"
                  name="phone"
                  placeholder="شماره موبایل (0912...)"
                  value={form.phone}
                  onChange={handleChange}
                  inputMode="numeric"
                  dir="ltr"
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
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="تکرار رمز عبور"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="auth-field__icon auth-field__icon--btn"
                  onClick={() => setShowConfirm((prev) => !prev)}
                  aria-label={showConfirm ? "پنهان کردن رمز عبور" : "نمایش رمز عبور"}
                >
                  {showConfirm ? <FiEyeOff /> : <FiEye />}
                </button>
              </label>

              <div className="auth-form__row auth-form__row--single">
                <label className="auth-checkbox">
                  <span>با قوانین و مقررات موافقم</span>
                  <input
                    type="checkbox"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                  />
                  <span className="auth-checkbox__box" />
                </label>
              </div>

              {error && <p className="auth-form__error">{error}</p>}

              <button
                type="submit"
                className="auth-btn auth-btn--primary"
                disabled={loading}
              >
                <FiChevronLeft />
                {loading ? "در حال ثبت..." : "ثبت نام و دریافت کد"}
              </button>

              <div className="auth-divider">
                <span>یا</span>
              </div>

              <Link to="/Login" className="auth-btn auth-btn--ghost">
                <FiLock />
                قبلاً ثبت نام کرده‌اید؟ وارد شوید
              </Link>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
