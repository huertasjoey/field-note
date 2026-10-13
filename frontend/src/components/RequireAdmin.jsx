import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loading } from "./StateMessage";
import NotFound from "../pages/NotFound";

// UX guard only: the API enforces admin permissions independently on every write.
function RequireAdmin() {
  const { user, loading, isAdmin } = useAuth();

  if (loading) return <Loading label="Checking your session…" />;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <NotFound message="You need an administrator account to view this page." />;
  return <Outlet />;
}

export default RequireAdmin;
