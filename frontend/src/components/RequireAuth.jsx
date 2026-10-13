import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loading } from "./StateMessage";

// UX guard only: the API independently rejects unauthenticated requests.
// Also covers session expiry: the API client clears the user on a 401, which lands here.
function RequireAuth() {
  const { user, loading } = useAuth();
  if (loading) return <Loading label="Checking your session…" />;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export default RequireAuth;
