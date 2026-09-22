import React, { useEffect, useState } from "react";
import { FiArrowRight, FiChevronLeft, FiPhone, FiShield } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api";
import "./Login.css";

const toEnDigits = (value) =>
  String(value || "")
    .replace(/[۰-۹]/g, (c) => "۰۱۲۳۴۵۶۷۸۹".indexOf(c))
    .replace(/[٠-٩]/g, (c) => "٠١٢٣٤٥٦٧٨٩".indexOf(c));

const Login = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState("phone"); // phone | code
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleRequestOtp = (e) => {
    e.preventDefault();
    const normalized = toEnDigits(phone).replace(/\s/g, "");
    if (!/^09\d{9}$/.test(normalized)) {
      setError("شماره موبایل معتبر نیست (مثال: 09123456789)");
      return;
    }
    setLoading(true);
    setError("");
    apiRequest("/auth/request-otp/", {
      method: "POST",
      body: JSON.stringify({ phone: normalized }),
    })
      .then(() => {
        setPhone(normalized);
        setStep("code");
        setCooldown(60);
      })
      .catch((err) => setError(err.message || "ارسال کد ناموفق بود."))
      .finally(() => setLoading(false));
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    const normalized = toEnDigits(code).replace(/\s/g, "");
    if (!/^\d{6}$/.test(normalized)) {
      setError("کد تأیید ۶ رقمی را وارد کنید.");
      return;
    }
    setLoading(true);
    setError("");
    apiRequest("/auth/verify-otp/", {
      method: "POST",
      body: JSON.stringify({ phone, code: normalized }),
    })
      .then((data) => {
        if (data.access) localStorage.setItem("access", data.access);
        if (data.refresh) localStorage.setItem("refresh", data.refresh);
        if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
        navigate(data.user && data.user.role === "admin" ? "/admin" : "/dashboard");
      })
      .catch((err) => setError(err.message || "کد تأیید نامعتبر است."))
      .finally(() => setLoading(false));
  };

  const handleResend = () => {
    if (cooldown > 0 || loading) return;
    setLoading(true);
    setError("");
    apiRequest("/auth/request-otp/", {
      method: "POST",
      body: JSON.stringify({ phone }),
    })
      .then(() => setCooldown(60))
      .catch((err) => setError(err.message || "ارسال مجدد کد ناموفق بود."))
      .finally(() => setLoading(false));
  };

  return (
    <div className="auth-page" dir="rtl">
      <div className="auth-page__form-side">
        <div className="auth-form-wrap">
          <div className="auth-card">
            <img className="auth-card__logo" src="/logo.png" alt="لوگوی شمین گالری" />

            {step === "phone" ? (
              <>
                <h2 className="auth-card__title">ورود به شمین گالری</h2>
                <p className="auth-card__subtitle">
                  شماره موبایل خود را وارد کنید تا کد تأیید برایتان ارسال شود.
                </p>

                <form className="auth-form" onSubmit={handleRequestOtp}>
                  <label className="auth-field">
                    <input
                      type="tel"
                      name="phone"
                      placeholder="شماره موبایل (0912...)"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      inputMode="numeric"
                      dir="ltr"
                      required
                    />
                    <FiPhone className="auth-field__icon" />
                  </label>

                  {error && <p className="auth-form__error">{error}</p>}

                  <button
                    type="submit"
                    className="auth-btn auth-btn--primary"
                    disabled={loading}
                  >
                    <FiChevronLeft />
                    {loading ? "در حال ارسال کد..." : "دریافت کد ورود"}
                  </button>
                </form>
              </>
            ) : (
              <>
                <h2 className="auth-card__title">کد تأیید</h2>
                <p className="auth-card__subtitle">
                  کد ۶ رقمی ارسال‌شده به شماره{" "}
                  <span dir="ltr">{phone}</span> را وارد کنید.
                </p>

                <form className="auth-form" onSubmit={handleVerifyOtp}>
                  <label className="auth-field">
                    <input
                      type="text"
                      name="code"
                      placeholder="------"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      inputMode="numeric"
                      dir="ltr"
                      maxLength={6}
                      required
                    />
                    <FiShield className="auth-field__icon" />
                  </label>

                  {error && <p className="auth-form__error">{error}</p>}

                  <button
                    type="submit"
                    className="auth-btn auth-btn--primary"
                    disabled={loading}
                  >
                    <FiChevronLeft />
                    {loading ? "در حال بررسی..." : "ورود"}
                  </button>
                </form>

                <div className="auth-form__row">
                  <button
                    type="button"
                    className="auth-form__link auth-form__link--button"
                    onClick={handleResend}
                    disabled={cooldown > 0 || loading}
                  >
                    {cooldown > 0
                      ? `ارسال مجدد کد تا ${cooldown.toLocaleString("fa-IR")} ثانیه`
                      : "ارسال مجدد کد"}
                  </button>

                  <button
                    type="button"
                    className="auth-form__link auth-form__link--button"
                    onClick={() => {
                      setStep("phone");
                      setCode("");
                      setError("");
                    }}
                  >
                    <FiArrowRight /> تغییر شماره
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
