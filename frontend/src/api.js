import { notifyAuthChanged } from './cart-notice';

const API_BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:8000/api').replace(/\/$/, '');

const TOKEN_KEYS = ['access', 'refresh', 'access_token', 'refresh_token'];

/* توکن‌ها در localStorage (ماندگار — «مرا به خاطر بسپار») یا sessionStorage
   (فقط همین نشست مرورگر) ذخیره می‌شوند؛ خواندن از هر دو پشتیبانی می‌شود. */
const findToken = (key) => {
  const local = localStorage.getItem(key);
  if (local) return { storage: localStorage, key, value: local };
  const session = sessionStorage.getItem(key);
  if (session) return { storage: sessionStorage, key, value: session };
  return null;
};

export const getAccessToken = () =>
  findToken('access')?.value || findToken('access_token')?.value || null;

export const hasAuthToken = () => Boolean(getAccessToken() || getRefreshToken());

const getRefreshToken = () =>
  findToken('refresh')?.value || findToken('refresh_token')?.value || null;

const saveToken = (key, value) => {
  const existing = findToken(key);
  const storage = existing?.storage || localStorage;
  storage.setItem(existing?.key || key, value);
};

const saveAccessToken = (token) => saveToken('access', token);
const saveRefreshToken = (token) => saveToken('refresh', token);

/* ذخیره توکن‌ها پس از ورود/ثبت‌نام؛ remember=false یعنی فقط تا بسته‌شدن مرورگر */
export const storeTokens = ({ access, refresh, remember = true, user } = {}) => {
  clearTokens();
  const storage = remember ? localStorage : sessionStorage;
  if (access) storage.setItem('access', access);
  if (refresh) storage.setItem('refresh', refresh);
  if (user) storage.setItem('user', JSON.stringify(user));
  notifyAuthChanged();
};

const getErrorMessage = async (response) => {
  try {
    const data = await response.json();
    if (typeof data.detail === 'string') return data.detail;
    const firstError = Object.values(data).flat().find(Boolean);
    return firstError || `خطا در ارتباط با سرور (${response.status})`;
  } catch {
    return `خطا در ارتباط با سرور (${response.status})`;
  }
};

const refreshAccessToken = async () => {
  const refresh = getRefreshToken();
  if (!refresh) return null;

  const response = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  });

  if (!response.ok) return null;
  const data = await response.json();
  saveAccessToken(data.access);
  // refresh چرخیده هم باید جایگزین شود تا نشست کاربر تمدید بماند
  if (data.refresh) saveRefreshToken(data.refresh);
  return data.access;
};

/* خروج از حساب — کلیدها از هر دو حافظه پاک می‌شوند */
export const clearStoredAuth = () => {
  TOKEN_KEYS.forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
  ['user'].forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
  notifyAuthChanged();
};

const clearTokens = clearStoredAuth;

export const apiRequest = async (path, options = {}, canRefresh = true) => {
  const headers = new Headers(options.headers || {});
  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const access = getAccessToken();
  if (access) headers.set('Authorization', `Bearer ${access}`);

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  if (response.status === 401 && canRefresh) {
    const refreshedAccess = await refreshAccessToken();
    if (refreshedAccess) return apiRequest(path, options, false);
    // توکن ذخیره‌شده کهنه است: پاکش کن و درخواست عمومی را بدون توکن تکرار کن
    clearTokens();
    const retryHeaders = new Headers(options.headers || {});
    if (options.body && !(options.body instanceof FormData)) {
      retryHeaders.set('Content-Type', 'application/json');
    }
    return apiRequest(path, { ...options, headers: retryHeaders }, false);
  }

  if (!response.ok) throw new Error(await getErrorMessage(response));
  if (response.status === 204) return null;
  return response.json();
};

export const getAssetUrl = (url) => {
  if (!url) return '/logo.png';
  if (url.startsWith('http')) return url;
  return `${API_BASE_URL.replace(/\/api$/, '')}${url.startsWith('/') ? url : `/${url}`}`;
};
