import { Outlet } from 'react-router';
import { Logo } from '@/components/ui/Logo';
import { PublicOnlyRoute } from '@/components/auth/ProtectedRoute';

export function AuthLayout() {
  return (
    <PublicOnlyRoute>
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
          <div className="text-center">
            <Logo className="mx-auto h-12 w-auto" />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Welcome to SimpleStock
            </h2>
          </div>
          <Outlet />
        </div>
      </div>
    </PublicOnlyRoute>
  );
} 