import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FiMail, FiUser, FiEye, FiEyeOff, FiChevronLeft } from "react-icons/fi";
import "./Login.css";
import "./PasswordRecovery.css";

const normalizeDigits = (value) => value.replace(/[۰-۹٠-٩]/g, (digit) => String(digit.charCodeAt(0) - (digit >= "۰" ? 1776 : 1632)));
const authPost = async (path, body) => {
  const response = await fetch(`${(process.env.REACT_APP_API_URL || "http://localhost:8000/api").replace(/\/$/, "")}/auth/${path}/`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.detail || Object.values(data).flat().join(" ") || "درخواست انجام نشد.");
    error.retryAfter = data.retry_after;
    throw error;
  }
  return data;
};

const Login = () => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const recovering = params.get("recovery") === "1";
  const [step, setStep] = useState("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!seconds) return;
    const timer = setTimeout(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [form, setForm] = useState({ identifier: "", password: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true); setError("");
    try {
      const data = await authPost("login", { phone: normalizeDigits(form.identifier.trim()), password: form.password });
      ["access", "refresh", "access_token", "refresh_token", "user"].forEach((key) => localStorage.removeItem(key));
      localStorage.setItem("access", data.access);
      if (remember) localStorage.setItem("refresh", data.refresh);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate(data.user.role === "admin" ? "/admin" : "/dashboard");
    } catch (requestError) { setError(requestError.message === "Failed to fetch" ? "ارتباط با سرور برقرار نشد. دوباره تلاش کنید." : requestError.message); }
    finally { setBusy(false); }
  };

  const sendCode = async () => {
    const data = await authPost("password-reset/request", { phone });
    setSeconds(data.retry_after || 120); setCode(""); setStep("code");
  };
  const handleRecovery = async (event, resend = false) => {
    event.preventDefault();
    if (busy) return;
    setError(""); setBusy(true);
    try {
      if (step === "phone" || resend) await sendCode();
      else if (step === "code") {
        const data = await authPost("password-reset/verify", { phone, code });
        setToken(data.reset_token); setCode(""); setStep("password");
      } else if (step === "password") {
        if (password !== confirmation) throw new Error("رمز عبور و تکرار آن یکسان نیستند.");
        await authPost("password-reset/confirm", { reset_token: token, password, password_confirm: confirmation });
        setToken(""); setPassword(""); setConfirmation(""); setForm({ identifier: phone, password: "" }); setStep("success");
      }
    } catch (requestError) {
      if (requestError.retryAfter) setSeconds(requestError.retryAfter);
      setError(requestError.message === "Failed to fetch" ? "ارتباط با سرور برقرار نشد. دوباره تلاش کنید." : requestError.message);
    } finally { setBusy(false); }
  };

  if (recovering) return (
    <main className="password-recovery" dir="rtl">
      <section className="password-recovery__card" aria-labelledby="recovery-title">
        <img className="password-recovery__logo" src="/logo.png" alt="شمین گالری" />
        <p className="password-recovery__eyebrow">بازیابی حساب کاربری</p>
        <h1 id="recovery-title">{step === "success" ? "رمز عبور تغییر کرد" : step === "password" ? "رمز عبور جدید" : step === "code" ? "تأیید شماره موبایل" : "رمز عبورتان را فراموش کرده‌اید؟"}</h1>
        <p className="password-recovery__description">{step === "phone" ? "شماره موبایل حساب خود را وارد کنید تا کد بازیابی برایتان ارسال شود." : step === "code" ? `اگر حساب فعالی با شماره ${phone} وجود داشته باشد، کد ۶ رقمی برای آن ارسال می‌شود. کد ۵ دقیقه اعتبار دارد.` : step === "password" ? "یک رمز امن و تازه برای حساب شمین خود انتخاب کنید." : "رمز جدید شما ذخیره شد. اکنون می‌توانید وارد حساب خود شوید."}</p>
        {step !== "success" && <ol className="password-recovery__steps" aria-label="مراحل بازیابی">{["شماره موبایل", "کد تأیید", "رمز جدید"].map((label, index) => <li key={label} aria-current={index === ["phone", "code", "password"].indexOf(step) ? "step" : undefined}><span>{index + 1}</span>{label}</li>)}</ol>}
        {error && <p className="password-recovery__error" role="alert">{error}</p>}
        {step !== "success" && <form className="password-recovery__form" onSubmit={handleRecovery}>
          <fieldset disabled={busy}>
            {step === "phone" && <label>شماره موبایل<input autoFocus type="tel" autoComplete="tel" inputMode="numeric" dir="ltr" placeholder="09123456789" maxLength={11} pattern="09[0-9]{9}" required value={phone} onChange={(event) => setPhone(normalizeDigits(event.target.value).replace(/\D/g, ""))} /></label>}
            {step === "code" && <label>کد تأیید پیامکی<input key="code" autoFocus type="text" autoComplete="one-time-code" inputMode="numeric" dir="ltr" placeholder="------" maxLength={6} pattern="[0-9]{6}" required value={code} onChange={(event) => setCode(normalizeDigits(event.target.value).replace(/\D/g, ""))} /></label>}
            {step === "password" && <>
              <label>رمز عبور جدید<input key="password" autoFocus type={showPassword ? "text" : "password"} autoComplete="new-password" dir="ltr" minLength={8} maxLength={128} required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
              <small>حداقل ۸ نویسه؛ از رمز رایج، اطلاعات شخصی و رمز کاملاً عددی استفاده نکنید.</small>
              <label>تکرار رمز عبور<input type={showPassword ? "text" : "password"} autoComplete="new-password" dir="ltr" minLength={8} maxLength={128} required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} /></label>
              <button className="password-recovery__text-button" type="button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? "پنهان کردن رمزها" : "نمایش رمزها"}</button>
            </>}
            <button className="password-recovery__submit" type="submit">{busy ? "لطفاً صبر کنید..." : step === "phone" ? "ارسال کد بازیابی" : step === "code" ? "تأیید کد و ادامه" : "ذخیره رمز جدید"}<FiChevronLeft /></button>
          </fieldset>
          {step === "code" && <button className="password-recovery__text-button" type="button" disabled={busy || seconds > 0} onClick={(event) => handleRecovery(event, true)}>{seconds > 0 ? `ارسال مجدد تا ${seconds} ثانیه دیگر` : "ارسال مجدد کد"}</button>}
          {(step === "code" || step === "password") && <button className="password-recovery__text-button" type="button" disabled={busy} onClick={() => { setStep("phone"); setError(""); setToken(""); setPassword(""); setConfirmation(""); }}>ویرایش شماره / شروع دوباره</button>}
        </form>}
        <button className={step === "success" ? "password-recovery__submit" : "password-recovery__back"} disabled={busy} onClick={() => { setParams({}); setError(""); setToken(""); setPassword(""); setConfirmation(""); setShowPassword(false); }}>بازگشت به ورود</button>
      </section>
    </main>
  );

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
              {error && <p className="password-recovery__error" role="alert">{error}</p>}
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

                <a href="/Login?recovery=1" className="auth-form__link" onClick={(event) => { event.preventDefault(); setStep("phone"); setPhone(normalizeDigits(form.identifier.trim())); setError(""); setShowPassword(false); setParams({ recovery: "1" }); }}>
                  فراموشی رمز عبور؟
                </a>
              </div>

              <button type="submit" disabled={busy} className="auth-btn auth-btn--primary">
                <FiChevronLeft />
                {busy ? "در حال ورود..." : "ورود"}
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
