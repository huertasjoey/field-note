import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, setCsrfToken, setSessionExpiredHandler } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true until the first /auth/me check finishes
  const [expired, setExpired] = useState(false);

  // Restore the session on page load by asking the backend (the cookie is HttpOnly).
  useEffect(() => {
    const controller = new AbortController();
    api
      .me(controller.signal)
      .then((data) => {
        setCsrfToken(data?.csrfToken);
        setUser(data?.user ?? null);
      })
      .catch((err) => {
        if (err.name !== "AbortError") setUser(null);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    setSessionExpiredHandler(() => {
      setCsrfToken("");
      setUser(null);
      setExpired(true);
    });
    return () => setSessionExpiredHandler(null);
  }, []);

  const value = useMemo(() => {
    const start = (data) => {
      setCsrfToken(data.csrfToken);
      setExpired(false);
      setUser(data.user);
      return data.user;
    };
    return {
      user,
      loading,
      expired,
      isAdmin: user?.role === "admin",
      login: async (credentials) => start(await api.login(credentials)),
      register: async (details) => start(await api.register(details)),
      logout: async () => {
        try {
          await api.logout();
        } finally {
          setCsrfToken("");
          setUser(null);
        }
      },
    };
  }, [user, loading, expired]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
