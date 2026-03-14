/**
 * Axios instance with JWT authorization and auto-refresh interceptors.
 */

import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
});

// ── Request interceptor: attach access token ──────────────────────────────
api.interceptors.request.use((config) => {
  const tokens = getStoredTokens();
  if (tokens?.access) {
    config.headers["Authorization"] = `Bearer ${tokens.access}`;
  }
  return config;
});

// ── Response interceptor: auto-refresh on 401 ────────────────────────────
let isRefreshing = false;
let pendingQueue = [];

const processQueue = (error, token = null) => {
  pendingQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  pendingQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        })
          .then((token) => {
            original.headers["Authorization"] = `Bearer ${token}`;
            return api(original);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      const tokens = getStoredTokens();
      if (!tokens?.refresh) {
        clearStoredTokens();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${BASE_URL}/api/auth/token/refresh/`, {
          refresh: tokens.refresh,
        });
        const { access } = response.data;
        setStoredTokens({ ...tokens, access });
        processQueue(null, access);
        original.headers["Authorization"] = `Bearer ${access}`;
        return api(original);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearStoredTokens();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ── Token storage helpers ─────────────────────────────────────────────────
export const getStoredTokens = () => {
  try {
    const raw = localStorage.getItem("auth_tokens");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setStoredTokens = (tokens) => {
  localStorage.setItem("auth_tokens", JSON.stringify(tokens));
};

export const clearStoredTokens = () => {
  localStorage.removeItem("auth_tokens");
  localStorage.removeItem("auth_user");
};

// ── Auth API ──────────────────────────────────────────────────────────────
export const authApi = {
  register: (data) => api.post("/api/auth/register/", data),
  login: (data) => api.post("/api/auth/login/", data),
  logout: (refresh) => api.post("/api/auth/logout/", { refresh }),
  profile: () => api.get("/api/auth/profile/"),
};

// ── Chat API ──────────────────────────────────────────────────────────────
export const chatApi = {
  listSessions: () => api.get("/api/chats/"),
  createSession: (title) => api.post("/api/chats/", { title }),
  getSession: (id) => api.get(`/api/chats/${id}/`),
  deleteSession: (id) => api.delete(`/api/chats/${id}/`),
  renameSession: (id, title) => api.patch(`/api/chats/${id}/rename/`, { title }),
  getMessages: (chatId, page = 1) =>
    api.get(`/api/chats/${chatId}/messages/?page=${page}`),
  sendMessage: (chatId, content) =>
    api.post(`/api/chats/${chatId}/send/`, { content }),
};

export default api;
