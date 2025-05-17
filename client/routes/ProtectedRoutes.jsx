import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ allowedRoles }) => {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    return <Navigate to="/" replace />; // Redirect to login if not authenticated
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />; // Redirect unauthorized users
  }

  return <Outlet />; // Render the requested route
};

export default ProtectedRoute;
