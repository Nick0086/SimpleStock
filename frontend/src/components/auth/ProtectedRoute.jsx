import { Navigate, useLocation } from 'react-router';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Protected route component
 */
export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>; // Or your loading component
  }

  if (!user) {
    // Save the attempted URL for redirecting after login
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return children;
}

/**
 * Public only route component (accessible only when not authenticated)
 */
export function PublicOnlyRoute({ children, redirectTo = '/' }) {
  const { user, isLoadingUser } = useAuth();
  const location = useLocation();

  if (isLoadingUser) {
    return <div>Loading...</div>;
  }

  if (user) {
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  return children;
} 