import { createBrowserRouter, Navigate } from 'react-router';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { OTPVerification } from '@/components/auth/OTPVerification';
import { MagicLinkForm } from '@/components/auth/MagicLinkForm';
import { MagicLinkVerification } from '@/components/auth/MagicLinkVerification';
import { PasswordReset } from '@/components/auth/PasswordReset';
import { ForgotPassword } from '@/components/auth/ForgotPassword';
import { VerifyEmail } from '@/components/auth/VerifyEmail';
import { Dashboard } from '@/pages/Dashboard';
import { Orders } from '@/pages/Orders';
import { Purchases } from '@/pages/Purchases';
import { Admin } from '@/pages/Admin';
import { NotFound } from '@/pages/NotFound';
import { MainLayout } from '@/layouts/MainLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { AuthProvider } from '@/contexts/AuthContext';

// Create a wrapper component that includes the AuthProvider
const AppWrapper = ({ children }) => {
  return <AuthProvider>{children}</AuthProvider>;
};

export const Router = createBrowserRouter([
  {
    path: "/",
    element: <AppWrapper><Navigate to="/dashboard" replace /></AppWrapper>,
  },
  {
    path: "/dashboard",
    element: <AppWrapper><MainLayout /></AppWrapper>,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        )
      },
      {
        path: "orders",
        element: (
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        )
      },
      {
        path: "purchases",
        element: (
          <ProtectedRoute>
            <Purchases />
          </ProtectedRoute>
        )
      },
      {
        path: "admin",
        element: (
          <ProtectedRoute>
            <RoleGuard roles={['admin']}>
              <Admin />
            </RoleGuard>
          </ProtectedRoute>
        )
      }
    ]
  },
  {
    path: "/auth",
    element: <AppWrapper><AuthLayout /></AppWrapper>,
    children: [
      {
        index: true,
        element: <Navigate to="/auth/login" replace />
      },
      {
        path: "login",
        element: <LoginForm />
      },
      {
        path: "register",
        element: <RegisterForm />
      },
      {
        path: "magic-link",
        element: <MagicLinkForm />
      },
      {
        path: "verify-magic-link",
        element: <MagicLinkVerification />
      },
      {
        path: "verify-otp",
        element: <OTPVerification />
      },
      {
        path: "verify-email",
        element: <VerifyEmail />
      },
      {
        path: "forgot-password",
        element: <ForgotPassword />
      },
      {
        path: "reset-password",
        element: <PasswordReset />
      }
    ]
  },
  {
    path: "*",
    element: <Navigate to="/dashboard" replace />
  }
]); 