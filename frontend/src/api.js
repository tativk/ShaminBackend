const API_BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:8000/api').replace(/\/$/, '');

const getAccessToken = () => localStorage.getItem('access') || localStorage.getItem('access_token');
const getRefreshToken = () => localStorage.getItem('refresh') || localStorage.getItem('refresh_token');

const saveAccessToken = (token) => {
  if (localStorage.getItem('access_token')) {
    localStorage.setItem('access_token', token);
  } else {
    localStorage.setItem('access', token);
  }
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
  return data.access;
};

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
  }

  if (!response.ok) throw new Error(await getErrorMessage(response));
  if (response.status === 204) return null;
  return response.json();
};

export const getAssetUrl = (url) => {
  if (!url) return '/logo512.png';
  if (url.startsWith('http')) return url;
  return `${API_BASE_URL.replace(/\/api$/, '')}${url.startsWith('/') ? url : `/${url}`}`;
};
