import React, { useEffect, useMemo, useState } from "react";
import { FiAlertCircle, FiCheckCircle, FiRefreshCw, FiShield, FiUserPlus, FiXCircle, FiEye, FiEyeOff } from "react-icons/fi";
import { apiRequest } from "../../../api";
import "./admin.css";

const fa = (value) => Number(value || 0).toLocaleString("fa-IR");
const faDate = (iso) =>
  iso ? new Intl.DateTimeFormat("fa-IR", { year: "numeric", month: "short", day: "numeric" }).format(new Date(iso)) : "—";

/* تب ادمین‌ها — افزودن ادمین جدید به‌صورت دستی و مدیریت آن‌ها */
const AdminsSection = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [form, setForm] = useState({ phone: "", first_name: "", last_name: "", password: "" });
  const [adding, setAdding] = useState(false);
  const [formError, setFormError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const load = () => {
    setLoading(true);
    setError("");
    apiRequest("/auth/admin/admins/")
      .then((data) => setAdmins(Array.isArray(data) ? data : data?.results || []))
      .catch((err) => setError(err?.message || "خطا در دریافت ادمین‌ها"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const stats = useMemo(() => ({
    total: admins.length,
    blocked: admins.filter((a) => !a.is_active).length,
  }), [admins]);

  const handleAdd = async (event) => {
    event.preventDefault();
    if (adding) return;
    setFormError("");
    setNotice("");
    setAdding(true);
    try {
      const created = await apiRequest("/auth/admin/admins/", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setAdmins((prev) => [...prev, created]);
      setForm({ phone: "", first_name: "", last_name: "", password: "" });
      setNotice(`ادمین ${created.phone} با موفقیت اضافه شد.`);
    } catch (err) {
      setFormError(err?.message || "افزودن ادمین ناموفق بود.");
    } finally {
      setAdding(false);
    }
  };

  const toggleActive = async (admin) => {
    setBusyId(admin.id);
    setError("");
    try {
      const data = await apiRequest(`/auth/admin/admins/${admin.id}/`, {
        method: "PATCH",
        body: JSON.stringify({ is_active: !admin.is_active }),
      });
      setAdmins((prev) => prev.map((a) => (a.id === admin.id ? { ...a, is_active: data.is_active } : a)));
    } catch (err) {
      setError(err?.message || "تغییر وضعیت ادمین ناموفق بود.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="adm-section" dir="rtl">
      <div className="adm-section__head">
        <div>
          <span className="adm-section__kicker"><FiShield /> مدیریت ادمین‌ها</span>
          <h1 className="adm-section__title">ادمین‌ها</h1>
          <p className="adm-section__desc">افزودن ادمین جدید به‌صورت دستی و مدیریت دسترسی آن‌ها</p>
        </div>
        <button type="button" className="adm-btn" onClick={load}><FiRefreshCw /> بروزرسانی</button>
      </div>

      <div className="adm-cards-row">
        <div className="adm-card-stat"><span>کل ادمین‌ها</span><strong>{fa(stats.total)}</strong></div>
        <div className="adm-card-stat adm-card-stat--danger"><span>غیرفعال</span><strong>{fa(stats.blocked)}</strong></div>
      </div>

      {/* فرم افزودن ادمین */}
      <form className="adm-add-card" onSubmit={handleAdd}>
        <div className="adm-add-card__head"><FiUserPlus /> افزودن ادمین جدید</div>
        {formError && <div className="adm-form-error" role="alert"><FiAlertCircle /> {formError}</div>}
        {notice && <div className="adm-form-notice" role="status"><FiCheckCircle /> {notice}</div>}
        <div className="adm-add-card__grid">
          <label>شماره موبایل
            <input
              type="tel"
              dir="ltr"
              inputMode="numeric"
              placeholder="09123456789"
              maxLength={11}
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "").slice(0, 11) })}
            />
          </label>
          <label>نام
            <input
              type="text"
              placeholder="نام ادمین"
              value={form.first_name}
              onChange={(e) => setForm({ ...form, first_name: e.target.value })}
            />
          </label>
          <label>نام خانوادگی
            <input
              type="text"
              placeholder="نام خانوادگی ادمین"
              value={form.last_name}
              onChange={(e) => setForm({ ...form, last_name: e.target.value })}
            />
          </label>
          <label>رمز عبور
            <span className="adm-password-wrap">
              <input
                type={showPassword ? "text" : "password"}
                dir="ltr"
                placeholder="رمز عبور ادمین"
                minLength={4}
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label="نمایش رمز">
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </span>
          </label>
        </div>
        <button type="submit" className="adm-btn adm-btn--primary" disabled={adding}>
          {adding ? "در حال افزودن..." : <>افزودن ادمین</>}
        </button>
      </form>

      {loading ? (
        <div className="adm-state"><FiRefreshCw /> <span>در حال دریافت ادمین‌ها...</span></div>
      ) : error ? (
        <div className="adm-state adm-state--error"><FiAlertCircle /> <span>{error}</span><button type="button" className="adm-btn" onClick={load}>تلاش مجدد</button></div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>ادمین</th><th>شماره موبایل</th><th>ایمیل</th><th>تاریخ عضویت</th><th>وضعیت</th><th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => (
                <tr key={a.id} className={a.is_active ? "" : "adm-row--blocked"}>
                  <td>
                    <div className="adm-customer">
                      <span className="adm-avatar">{`${a.first_name} ${a.last_name}`.trim().charAt(0) || "ا"}</span>
                      <strong>{`${a.first_name} ${a.last_name}`.trim() || "بدون نام"}</strong>
                    </div>
                  </td>
                  <td dir="ltr">{a.phone}</td>
                  <td>{a.email || "—"}</td>
                  <td>{faDate(a.date_joined)}</td>
                  <td>
                    <span className={a.is_active ? "adm-badge adm-badge--green" : "adm-badge adm-badge--red"}>
                      {a.is_active ? "فعال" : "غیرفعال"}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className={a.is_active ? "adm-btn adm-btn--danger-soft" : "adm-btn adm-btn--green-soft"}
                      disabled={busyId === a.id}
                      onClick={() => toggleActive(a)}
                    >
                      {a.is_active ? <><FiXCircle /> غیرفعال‌سازی</> : <><FiCheckCircle /> فعال‌سازی</>}
                    </button>
                  </td>
                </tr>
              ))}
              {!admins.length && (
                <tr><td colSpan={6} className="adm-table__empty">هنوز ادمینی ثبت نشده است.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminsSection;
