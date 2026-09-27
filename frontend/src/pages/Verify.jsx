import React, { useState, useRef, useEffect } from "react";
import { FiChevronLeft, FiCheckCircle, FiRefreshCw, FiAlertCircle } from "react-icons/fi";
import { useLocation, useNavigate } from "react-router-dom";
import { apiRequest } from "../api";
import "./Verify.css";

const CODE_LENGTH = 6;
const RESEND_SECONDS = 60;


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


const Verify = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // شماره و اطلاعات ثبت‌نام از صفحه Register با route state می‌آید؛
  // ?identifier= فقط برای ورود مستقیم به این صفحه نگه داشته شده است.
  const registration = location.state || {};
  const [phone] = useState(
    () =>
      registration.identifier ||
      (typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("identifier") || ""
        : ""),
  );

  const [digits, setDigits] = useState(Array(CODE_LENGTH).fill(""));
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorMessage, setErrorMessage] = useState("");
  const [completionError, setCompletionError] = useState("");
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

    const code = codeOverride ?? digits.join("");
    if (code.length !== CODE_LENGTH || status === "loading") return;

    setStatus("loading");
    setErrorMessage("");
    try {
      const data = await authPost("verify-otp", { phone, code });

      // مثل Login توکن‌ها و کاربر ذخیره می‌شوند
      ["access", "refresh", "access_token", "refresh_token", "user"].forEach((key) =>
        localStorage.removeItem(key),
      );
      localStorage.setItem("access", data.access);
      if (data.refresh) localStorage.setItem("refresh", data.refresh);
      localStorage.setItem("user", JSON.stringify(data.user));

      // اگر حساب تازه ساخته شده، نام/ایمیل/رمز فرم ثبت‌نام ذخیره می‌شود
      if (data.next_step === "complete_registration") {
        const words = (registration.fullName || "").trim().split(/\s+/).filter(Boolean);
        if (words.length || registration.email || registration.password) {
          try {
            await apiRequest("/auth/complete-registration/", {
              method: "POST",
              body: JSON.stringify({
                first_name: words[0] || "",
                last_name: words.slice(1).join(" ") || words[0] || "",
                email: registration.email || "",
                password: registration.password || undefined,
                password_confirm: registration.password || undefined,
              }),
            });
          } catch (registrationError) {
            setCompletionError(
              registrationError?.message ||
                "ذخیره اطلاعات ثبت‌نام انجام نشد؛ بعداً از داشبورد تکمیل کنید.",
            );
          }
        }
      }

      setStatus("success");
    } catch (requestError) {
      setErrorMessage(
        requestError.message === "Failed to fetch"
          ? "ارتباط با سرور برقرار نشد. دوباره تلاش کنید."
          : requestError.message,
      );

      setStatus("error");
      inputsRef.current[0]?.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleVerify();
  };

  const handleResend = async () => {

    if (resending) return;
    setResending(true);
    setErrorMessage("");
    try {
      const data = await authPost("request-otp", { phone });
      setResendSeconds(data.retry_after || RESEND_SECONDS);
      setDigits(Array(CODE_LENGTH).fill(""));
      setStatus("idle");
      focusInput(0);
    } catch (requestError) {
      setErrorMessage(
        requestError.message === "Failed to fetch"
          ? "ارتباط با سرور برقرار نشد. دوباره تلاش کنید."
          : requestError.message,
      );
      if (requestError.retryAfter) setResendSeconds(requestError.retryAfter);
    } finally {
      setResending(false);
    }

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

              {completionError && (
                <p className="verify-message verify-message--error" role="alert">
                  <FiAlertCircle />
                  {completionError}
                </p>
              )}
              <button
                type="button"
                className="auth-btn auth-btn--primary"
                onClick={() => navigate("/dashboard")}
              >

                <FiChevronLeft />
                ورود به داشبورد
              </button>
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
              {phone ? <strong className="verify-identifier"> {phone} </strong> : " شماره موبایل شما "}
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

              {status === "error" && errorMessage && (
                <p className="verify-message verify-message--error">
                  <FiAlertCircle />
                  {errorMessage}
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
