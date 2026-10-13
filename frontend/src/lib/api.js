// Single place that knows where the API lives and how to talk to it.
export const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "");

// CSRF token for the current session. Kept in memory only (never localStorage); the session itself
// lives in an HttpOnly cookie that JavaScript cannot read.
let csrfToken = "";
let onSessionExpired = null;
export const setCsrfToken = (t) => {
  csrfToken = t || "";
};
export const setSessionExpiredHandler = (fn) => {
  onSessionExpired = fn;
};

async function request(path, { method = "GET", body, signal } = {}) {
  let res;
  try {
    const headers = {};
    if (body) headers["Content-Type"] = "application/json";
    if (csrfToken && method !== "GET") headers["X-CSRF-Token"] = csrfToken;
    res = await fetch(`${API_URL}${path}`, {
      method,
      signal,
      credentials: "include",
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    if (err.name === "AbortError") throw err;
    throw new Error("Cannot reach the server. Make sure the backend is running.", { cause: err });
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    // non-JSON response
  }
  if (!res.ok) {
    const error = new Error(data?.details?.join(". ") || data?.message || `Request failed (${res.status})`);
    error.status = res.status;
    // A 401 on a protected call (not the login form itself) means the session has ended.
    if (res.status === 401 && !path.startsWith("/auth/")) onSessionExpired?.();
    throw error;
  }
  return data;
}

export const api = {
  getArticles: ({ category, search, page, limit } = {}, signal) => {
    const params = new URLSearchParams();
    if (category && category !== "All") params.set("category", category);
    if (search) params.set("search", search);
    if (page) params.set("page", page);
    if (limit) params.set("limit", limit);
    const qs = params.toString();
    return request(`/articles${qs ? `?${qs}` : ""}`, { signal });
  },
  getFeatured: (signal) => request("/articles/featured", { signal }),
  getArticle: (id, signal) => request(`/articles/${encodeURIComponent(id)}`, { signal }),
  createArticle: (article) => request("/articles", { method: "POST", body: article }),
  updateArticle: (id, article) => request(`/articles/${id}`, { method: "PUT", body: article }),
  deleteArticle: (id) => request(`/articles/${id}`, { method: "DELETE" }),
  me: (signal) => request("/auth/me", { signal }),
  login: (credentials) => request("/auth/login", { method: "POST", body: credentials }),
  register: (details) => request("/auth/register", { method: "POST", body: details }),
  logout: () => request("/auth/logout", { method: "POST" }),
  subscribe: (email) => request("/newsletter/subscribe", { method: "POST", body: { email } }),
};
