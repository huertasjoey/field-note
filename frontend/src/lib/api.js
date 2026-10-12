// Single place that knows where the API lives and how to talk to it.
export const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "");

async function request(path, { method = "GET", body, signal } = {}) {
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      signal,
      headers: body ? { "Content-Type": "application/json" } : undefined,
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
  subscribe: (email) => request("/newsletter/subscribe", { method: "POST", body: { email } }),
};
