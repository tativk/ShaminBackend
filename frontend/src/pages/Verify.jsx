import React, { useState, useRef, useEffect } from "react";
import { FiChevronLeft, FiCheckCircle, FiRefreshCw, FiAlertCircle } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import { apiRequest } from "../api";
import "./Verify.css";

const CODE_LENGTH = 6;
const RESEND_SECONDS = 60;

const toEnDigits = (value) =>
  String(value || "")
    .replace(/[۰-۹]/g, (c) => "۰۱۲۳۴۵۶۷۸۹".indexOf(c))
    .replace(/[٠-٩]/g, (c) => "٠١٢٣٤٥٦٧٨٩".indexOf(c));

const Verify = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [digits, setDigits] = useState(Array(CODE_LENGTH).fill(""));
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [resendSeconds, setResendSeconds] = useState(RESEND_SECONDS);
  const [resending, setResending] = useState(false);
  const inputsRef = useRef([]);

  // شماره از ثبت‌نام به این صفحه منتقل می‌شود (route state) یا از query خوانده می‌شود
  const identifier =
    location.state?.phone ||
    (typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("identifier")
      : null);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const timer = setInterval(() => {
      setResendSeconds((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendSeconds]);

  const focusInput = (index) => {
    inputsRef.current[index]?.focus();
  };

  const handleChange = (index, rawValue) => {
    const value = rawValue.replace(/[^0-9]/g, "").slice(-1);
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    setStatus("idle");

    if (value && index < CODE_LENGTH - 1) {
      focusInput(index + 1);
    }

    if (value && index === CODE_LENGTH - 1 && next.every((d) => d !== "")) {
      handleVerify(next.join(""));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      focusInput(index - 1);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, CODE_LENGTH);
    if (!pasted) return;
    const next = Array(CODE_LENGTH).fill("");
    pasted.split("").forEach((char, i) => {
      next[i] = char;
    });
    setDigits(next);
    const lastIndex = Math.min(pasted.length, CODE_LENGTH) - 1;
    focusInput(lastIndex);
    if (pasted.length === CODE_LENGTH) {
      handleVerify(pasted);
    }
  };

  const handleVerify = async (codeOverride) => {
    const code = toEnDigits(codeOverride ?? digits.join(""));
    const phone = toEnDigits(identifier || "").replace(/\s/g, "");
    if (code.length !== CODE_LENGTH) return;
    if (!/^09\d{9}$/.test(phone)) {
      setStatus("error");
      return;
    }

    setStatus("loading");
    try {
      const data = await apiRequest("/auth/verify-otp/", {
        method: "POST",
        body: JSON.stringify({ phone, code }),
      });
      if (data.access) localStorage.setItem("access", data.access);
      if (data.refresh) localStorage.setItem("refresh", data.refresh);
      if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
      setStatus("success");
      setTimeout(() => {
        navigate(data.user && data.user.role === "admin" ? "/admin" : "/dashboard");
      }, 1800);
    } catch (err) {
      setStatus("error");
      inputsRef.current[0]?.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleVerify();
  };

  const handleResend = async () => {
    const phone = toEnDigits(identifier || "").replace(/\s/g, "");
    if (!/^09\d{9}$/.test(phone)) return;
    setResending(true);
    try {
      await apiRequest("/auth/request-otp/", {
        method: "POST",
        body: JSON.stringify({ phone }),
      });
    } catch (err) {
      // در صورت خطا تایمر ریست نمی‌شود تا اسپم نشود
      setResending(false);
      return;
    }
    setResending(false);
    setDigits(Array(CODE_LENGTH).fill(""));
    setStatus("idle");
    setResendSeconds(RESEND_SECONDS);
    focusInput(0);
  };

  if (status === "success") {
    return (
      <div className="auth-page" dir="rtl">
        <div className="auth-page__form-side">
          <div className="auth-form-wrap">
            <div className="auth-card auth-card--success">
              <img className="auth-card__logo" src="/logo.png" alt="لوگوی شمین گالری" />
              <span className="verify-success__icon">
                <FiCheckCircle />
              </span>
              <h2 className="auth-card__title">خوش آمدید به شمین گالری</h2>
              <p className="auth-card__subtitle">
                حساب کاربری شما با موفقیت تأیید شد. اکنون می‌توانید از خرید در شمین گالری لذت ببرید.
              </p>
              <a href="/dashboard" className="auth-btn auth-btn--primary">
                <FiChevronLeft />
                ورود به حساب کاربری
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page" dir="rtl">
      <div className="auth-page__form-side">
        <div className="auth-form-wrap">
          <div className="auth-card">
            <img className="auth-card__logo" src="/logo.png" alt="لوگوی شمین گالری" />

            <h2 className="auth-card__title">تأیید شماره موبایل</h2>
            <p className="auth-card__subtitle">
              کد ۶ رقمی ارسال‌شده به
              {identifier ? <strong className="verify-identifier"> {identifier} </strong> : " شماره موبایل شما "}
              را وارد کنید.
            </p>

            <form className="auth-form" onSubmit={handleSubmit}>
              <div
                className={
                  status === "error" ? "otp-inputs otp-inputs--error" : "otp-inputs"
                }
                onPaste={handlePaste}
              >
                {digits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputsRef.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="otp-inputs__cell"
                    aria-label={`رقم ${index + 1} کد تأیید`}
                  />
                ))}
              </div>

              {status === "error" && (
                <p className="verify-message verify-message--error">
                  <FiAlertCircle />
                  کد وارد شده صحیح نیست. دوباره تلاش کنید.
                </p>
              )}

              <button
                type="submit"
                className="auth-btn auth-btn--primary"
                disabled={status === "loading" || digits.some((d) => !d)}
              >
                {status === "loading" ? (
                  "در حال بررسی..."
                ) : (
                  <>
                    <FiChevronLeft />
                    تأیید کد
                  </>
                )}
              </button>

              <div className="verify-resend">
                {resendSeconds > 0 ? (
                  <span>
                    ارسال مجدد کد تا {resendSeconds} ثانیه دیگر
                  </span>
                ) : (
                  <button
                    type="button"
                    className="verify-resend__btn"
                    onClick={handleResend}
                    disabled={resending}
                  >
                    <FiRefreshCw className={resending ? "spin" : ""} />
                    {resending ? "در حال ارسال..." : "ارسال مجدد کد"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Verify;
