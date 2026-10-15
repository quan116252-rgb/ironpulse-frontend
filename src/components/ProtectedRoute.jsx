import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Auth Guard: chỉ cho phép đúng role truy cập
export default function ProtectedRoute({ allow }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (allow && !allow.includes(user.role)) return <Navigate to="/" replace />;
  return <Outlet />;
}
