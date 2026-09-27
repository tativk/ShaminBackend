import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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


// مثل صفحات ارقام فارسی/عربی را به لاتین تبدیل می‌کند
const normalizeDigits = (value) =>
  value.replace(/[۰-۹٠-٩]/g, (digit) =>
    String(digit.charCodeAt(0) - (digit >= "۰" ? 1776 : 1632)),
  );

const authPost = async (path, body) => {
  const response = await fetch(
    `${(process.env.REACT_APP_API_URL || "http://localhost:8000/api").replace(/\/$/, "")}/auth/${path}/`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(
      data.detail || Object.values(data).flat().join(" ") || "درخواست انجام نشد.",
    );
    error.retryAfter = data.retry_after;
    throw error;
  }
  return data;
};


const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agree, setAgree] = useState(false);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (busy) return;
    setError("");

    const phone = normalizeDigits(form.phone.trim()).replace(/\D/g, "");
    if (!/^09[0-9]{9}$/.test(phone)) {
      setError("شماره موبایل معتبر نیست (مثال: 09123456789).");

      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("رمز عبور و تکرار آن یکسان نیستند.");
      return;
    }
    // بدون تیک قوانین کاربر به مرحله بعد (تأیید کد پیامکی) نمی‌رود
    if (!agree) {

      setError("برای ادامه ثبت‌نام باید با قوانین و مقررات موافقت کنید.");
      return;
    }

    setBusy(true);
    try {
      await authPost("request-otp", { phone });
      navigate("/Verify", {
        state: {
          identifier: phone,
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          password: form.password,
        },
      });
    } catch (requestError) {
      setError(
        requestError.message === "Failed to fetch"
          ? "ارتباط با سرور برقرار نشد. دوباره تلاش کنید."
          : requestError.message,
      );
    } finally {
      setBusy(false);
    }

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
                  placeholder="ایمیل (اختیاری)"
                  value={form.email}
                  onChange={handleChange}
                />
                <FiMail className="auth-field__icon" />
              </label>

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

                    onChange={(e) => {
                      setAgree(e.target.checked);
                      if (e.target.checked) setError("");
                    }}

                  />
                  <span className="auth-checkbox__box" />
                </label>
              </div>


              {/* اینپوت چک‌باکس با CSS مخفی است؛ required مرورگر بی‌صدا سابمیت را
                  بلاک می‌کند، پس اعتبارسنجی آن با پیام مرئی همین‌جا انجام می‌شود */}
              {error && (
                <p className="auth-form__error" role="alert">
                  {error}
                </p>
              )}

              <button type="submit" disabled={busy} className="auth-btn auth-btn--primary">
                <FiChevronLeft />
                {busy ? "در حال ارسال کد..." : "ثبت نام"}

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
