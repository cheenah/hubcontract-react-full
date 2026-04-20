import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AppContext } from '@/App';

const ProtectedRoute = ({ allowedRole }) => {
  const { user } = useContext(AppContext);

  if (!user) return <Navigate to="/" replace />;
  if (user.onboarding_completed === false) return <Navigate to="/complete-registration" replace />;
  if (allowedRole && user.role !== allowedRole) return <Navigate to="/" replace />;

  return <Outlet />;
};

export default ProtectedRoute;
