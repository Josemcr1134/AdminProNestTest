import { Box, CircularProgress } from '@mui/material';
import type { Role } from "../lib/types";
import { useAuth } from "./AuthContext";
import { Navigate, Outlet, useLocation } from 'react-router';

export function ProtectedRoute({ roles }: { roles?: Role[] }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', height: '100vh' }}>
        <CircularProgress/>
      </Box>
    )
  }

  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />

  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;

  return <Outlet />

}
