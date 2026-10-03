import React, { useEffect, useState } from "react";
import { FiAlertCircle, FiCheckCircle, FiRefreshCw, FiShield, FiTrash2, FiUserPlus } from "react-icons/fi";
import { apiRequest } from "../../api";
import "./admin.css";

const faDate = (iso) =>
  iso ? new Intl.DateTimeFormat("fa-IR", { year: "numeric", month: "short", day: "numeric" }).format(new Date(iso)) : "—";

const EMPTY_FORM = { phone: "", password: "", first_name: "", last_name: "", email: "" };

/** مدیریت مدیران پنل — فقط برای ادمین اصلی (ابروزر) نمایش داده می‌شود. */
const ManagersSection = () => {
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const load = () => {
    setLoading(true);
    setError("");
    apiRequest("/auth/admin/staff/")
      .then((data) => setManagers(Array.isArray(data) ? data : data?.results || []))
      .catch((err) => setError(err?.message || "خطا در دریافت مدیران"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const change = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const submit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setFormError("");
    const phone = form.phone.trim().replace(/[۰-۹]/g, (c) => "۰۱۲۳۴۵۶۷۸۹".indexOf(c));
    if (!/^09\d{9}$/.test(phone)) { setFormError("شماره موبایل معتبر نیست (مثال: 09123456789)"); return; }
    if (form.password.length < 8) { setFormError("رمز عبور مدیر باید حداقل ۸ کاراکتر باشد."); return; }
    if (!form.first_name.trim() || !form.last_name.trim()) { setFormError("نام و نام خانوادگی الزامی است."); return; }
    setSaving(true);
    try {
      const created = await apiRequest("/auth/admin/staff/", {
        method: "POST",
        body: JSON.stringify({
          phone,
          password: form.password,
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          email: form.email.trim(),
        }),
      });
      setManagers((prev) => [...prev, created]);
      setForm(EMPTY_FORM);
      setShowForm(false);
      setNotice(`مدیر جدید «${created.first_name} ${created.last_name}» اضافه شد.`);
    } catch (err) {
      setFormError(err?.message || "افزودن مدیر ناموفق بود.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (manager) => {
    if (!window.confirm(`دسترسی مدیریتی «${`${manager.first_name} ${manager.last_name}`.trim() || manager.phone}» گرفته شود؟`)) return;
    setBusyId(manager.id);
    setError("");
    setNotice("");
    try {
      const data = await apiRequest(`/auth/admin/staff/${manager.id}/`, { method: "DELETE" });
      setManagers((prev) => prev.filter((m) => m.id !== manager.id));
      setNotice(data?.detail || "دسترسی مدیریتی گرفته شد.");
    } catch (err) {
      setError(err?.message || "حذف مدیر ناموفق بود.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="adm-section" dir="rtl">
      <div className="adm-section__head">
        <div>
          <span className="adm-section__kicker"><FiShield /> مدیریت مدیران</span>
          <h1 className="adm-section__title">مدیران پنل</h1>
          <p className="adm-section__desc">افزودن مدیر جدید یا گرفتن دسترسی مدیریتی — فقط برای ادمین اصلی</p>
        </div>
        <div className="adm-actions">
          <button type="button" className="adm-btn" onClick={load}><FiRefreshCw /> بروزرسانی</button>
          <button type="button" className="adm-btn adm-btn--primary" onClick={() => { setShowForm((prev) => !prev); setFormError(""); }}>
            <FiUserPlus /> {showForm ? "بستن فرم" : "افزودن مدیر"}
          </button>
        </div>
      </div>

      {error && <div className="adm-state adm-state--error"><FiAlertCircle /> <span>{error}</span></div>}
      {notice && <div className="adm-state adm-state--success"><FiCheckCircle /> <span>{notice}</span></div>}

      {showForm && (
        <form className="adm-panel adm-manager-form" onSubmit={submit}>
          <div className="adm-form__grid">
            <label className="adm-field">
              <span>شماره موبایل *</span>
              <input type="tel" dir="ltr" value={form.phone} onChange={(e) => change("phone", e.target.value)} placeholder="09123456789" />
            </label>
            <label className="adm-field">
              <span>رمز عبور (حداقل ۸ کاراکتر) *</span>
              <input type="password" dir="ltr" value={form.password} onChange={(e) => change("password", e.target.value)} autoComplete="new-password" />
            </label>
            <label className="adm-field">
              <span>نام *</span>
              <input type="text" value={form.first_name} onChange={(e) => change("first_name", e.target.value)} />
            </label>
            <label className="adm-field">
              <span>نام خانوادگی *</span>
              <input type="text" value={form.last_name} onChange={(e) => change("last_name", e.target.value)} />
            </label>
            <label className="adm-field adm-field--full">
              <span>ایمیل</span>
              <input type="email" dir="ltr" value={form.email} onChange={(e) => change("email", e.target.value)} placeholder="admin@shamin.gallery" />
            </label>
          </div>
          {formError && <div className="adm-state adm-state--error"><FiAlertCircle /> <span>{formError}</span></div>}
          <div className="adm-form__actions">
            <button type="submit" className="adm-btn adm-btn--primary" disabled={saving}>
              {saving ? "در حال افزودن..." : "افزودن مدیر"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="adm-state"><FiRefreshCw /> <span>در حال دریافت مدیران...</span></div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>مدیر</th><th>شماره موبایل</th><th>ایمیل</th><th>تاریخ عضویت</th><th>نقش</th><th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {managers.map((m) => (
                <tr key={m.id}>
                  <td>
                    <div className="adm-customer">
                      <span className="adm-avatar">{`${m.first_name} ${m.last_name}`.trim().charAt(0) || "م"}</span>
                      <strong>{`${m.first_name} ${m.last_name}`.trim() || "بدون نام"}</strong>
                    </div>
                  </td>
                  <td dir="ltr">{m.phone}</td>
                  <td>{m.email || "—"}</td>
                  <td>{faDate(m.date_joined)}</td>
                  <td>
                    {m.is_superuser
                      ? <span className="adm-badge adm-badge--gold">ادمین اصلی</span>
                      : <span className="adm-badge adm-badge--green">مدیر</span>}
                  </td>
                  <td>
                    {m.is_superuser ? (
                      <span className="adm-table__empty">—</span>
                    ) : (
                      <button
                        type="button"
                        className="adm-btn adm-btn--danger-soft"
                        disabled={busyId === m.id}
                        onClick={() => remove(m)}
                      >
                        <FiTrash2 /> حذف مدیر
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {!managers.length && (
                <tr><td colSpan={6} className="adm-table__empty">مدیری ثبت نشده است.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManagersSection;
