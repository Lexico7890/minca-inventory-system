import { useUserStore } from '@/entities/user';
import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
  routeKey: string;
}

export const ProtectedRoute = ({ routeKey }: ProtectedRouteProps) => {
  const canViewRoute = useUserStore((state) => state.canViewRoute);

  // console.log(`ProtectedRoute: Checking ${routeKey}`);
  const allowed = canViewRoute(routeKey);

  if (!allowed) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
