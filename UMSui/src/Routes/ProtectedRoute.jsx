import { Navigate } from "react-router-dom";
import { useAuth } from "@/Context/AuthContext";

export default function ProtectedRoute({ children, AllowedRoles }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/" replace />;
  }
  if (!AllowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  return children;
}
