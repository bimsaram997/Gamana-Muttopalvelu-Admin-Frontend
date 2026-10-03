import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";


export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Remember where the user was trying to go, so login can send them back
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Renders the matched child route (Layout, in this case)
  return <Outlet />;
}