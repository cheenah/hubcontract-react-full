import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '@/store/authStore';

const ProtectedRoute = ({ allowedRole }) => {
  const user = useAuthStore(s => s.user);
  if (!user) return <Navigate to="/" replace />;
  if (allowedRole && user.role !== allowedRole) return <Navigate to="/" replace />;
  return <Outlet />;
};

export default ProtectedRoute;
