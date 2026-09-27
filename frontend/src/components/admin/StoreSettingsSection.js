import React, { useEffect, useState } from "react";
import { FiSettings, FiSave, FiRefreshCw, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import { apiRequest } from "../../api";
import "./admin.css";

const EMPTY = {
  store_name: "",
  support_phone: "",
  support_email: "",
  address: "",
  instagram_url: "",
  telegram_url: "",
  announcement: "",
};

const StoreSettingsSection = () => {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = () => {
    setLoading(true);
    setError("");
    apiRequest("/store/settings/")
      .then((data) => setForm({ ...EMPTY, ...data }))
      .catch((err) => setError(err?.message || "خطا در دریافت تنظیمات"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const change = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const data = await apiRequest("/store/settings/", {
        method: "PUT",
        body: JSON.stringify({
          store_name: form.store_name.trim(),
          support_phone: form.support_phone.trim(),
          support_email: form.support_email.trim(),
          address: form.address.trim(),
          instagram_url: form.instagram_url.trim(),
          telegram_url: form.telegram_url.trim(),
          announcement: form.announcement.trim(),
        }),
      });
      setForm({ ...EMPTY, ...data });
      setNotice("تنظیمات فروشگاه ذخیره شد.");
    } catch (err) {
      setError(err?.message || "ذخیره تنظیمات ناموفق بود.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="adm-section" dir="rtl">
        <div className="adm-state"><FiRefreshCw /> <span>در حال دریافت تنظیمات...</span></div>
      </div>
    );
  }

  return (
    <div className="adm-section" dir="rtl">
      <div className="adm-section__head">
        <div>
          <span className="adm-section__kicker"><FiSettings /> تنظیمات فروشگاه</span>
          <h1 className="adm-section__title">تنظیمات فروشگاه</h1>
          <p className="adm-section__desc">اطلاعات پایه فروشگاه — نام، راه‌های ارتباطی و اعلان سایت</p>
        </div>
        <button type="button" className="adm-btn" onClick={load}><FiRefreshCw /> بازگردانی</button>
      </div>

      {error && <div className="adm-state adm-state--error"><FiAlertCircle /> <span>{error}</span></div>}
      {notice && <div className="adm-state adm-state--success"><FiCheckCircle /> <span>{notice}</span></div>}

      <form className="adm-form" onSubmit={save}>
        <section className="adm-panel">
          <h2 className="adm-panel__title">اطلاعات فروشگاه</h2>
          <div className="adm-form__grid">
            <label className="adm-field">
              <span>نام فروشگاه</span>
              <input type="text" value={form.store_name} onChange={(e) => change("store_name", e.target.value)} required />
            </label>
            <label className="adm-field">
              <span>تلفن پشتیبانی</span>
              <input type="tel" dir="ltr" value={form.support_phone} onChange={(e) => change("support_phone", e.target.value)} placeholder="021xxxxxxxx" />
            </label>
            <label className="adm-field">
              <span>ایمیل پشتیبانی</span>
              <input type="email" dir="ltr" value={form.support_email} onChange={(e) => change("support_email", e.target.value)} placeholder="support@example.com" />
            </label>
            <label className="adm-field adm-field--full">
              <span>آدرس</span>
              <input type="text" value={form.address} onChange={(e) => change("address", e.target.value)} />
            </label>
          </div>
        </section>

        <section className="adm-panel">
          <h2 className="adm-panel__title">شبکه‌های اجتماعی و اعلان</h2>
          <div className="adm-form__grid">
            <label className="adm-field">
              <span>آدرس اینستاگرام</span>
              <input type="url" dir="ltr" value={form.instagram_url} onChange={(e) => change("instagram_url", e.target.value)} placeholder="https://instagram.com/..." />
            </label>
            <label className="adm-field">
              <span>آدرس تلگرام</span>
              <input type="url" dir="ltr" value={form.telegram_url} onChange={(e) => change("telegram_url", e.target.value)} placeholder="https://t.me/..." />
            </label>
            <label className="adm-field adm-field--full">
              <span>اعلان سایت (در صفحه اصلی نمایش داده می‌شود)</span>
              <input type="text" value={form.announcement} onChange={(e) => change("announcement", e.target.value)} placeholder="مثلاً: ارسال رایگان برای خرید بالای ۲ میلیون تومان" />
            </label>
          </div>
        </section>

        <div className="adm-form__actions">
          <button type="submit" className="adm-btn adm-btn--primary" disabled={saving}>
            <FiSave /> {saving ? "در حال ذخیره..." : "ذخیره تنظیمات"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default StoreSettingsSection;
