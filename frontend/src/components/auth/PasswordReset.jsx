import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useResetPassword } from '@/hooks/auth/useResetPassword';
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useSearchParams } from 'react-router';

const requestResetSchema = z.object({
  email: z.string().email('Please enter a valid email')
});

const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});

export function PasswordReset() {
  const { resetPassword } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  // Get token from URL
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      toast({
        title: "Error",
        description: "Invalid password reset link. Please request a new one.",
        variant: "destructive",
      });
      navigate('/auth/forgot-password');
    }
  }, [token, toast, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(resetPasswordSchema)
  });

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      await resetPassword(token, data.password);
      
      toast({
        title: "Success",
        description: "Password has been reset successfully",
      });
      
      navigate('/auth/login', {
        state: { message: 'Password reset successful. Please login with your new password.' }
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to reset password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Reset Password</h1>
        <p className="text-muted-foreground mt-2">
          Enter your new password
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Input
            type="password"
            placeholder="New Password"
            {...register('password')}
          />
          {errors.password && (
            <span className="text-sm text-red-500">
              {errors.password.message}
            </span>
          )}
        </div>

        <div>
          <Input
            type="password"
            placeholder="Confirm New Password"
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && (
            <span className="text-sm text-red-500">
              {errors.confirmPassword.message}
            </span>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Resetting...' : 'Reset Password'}
        </Button>
      </form>
    </div>
  );
}

export function ResetPasswordForm({ token }) {
  const { resetPassword } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(resetPasswordSchema)
  });

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      await resetPassword(token, data.password);
      setIsComplete(true);
      toast.success('Password reset successful');
    } catch (error) {
      toast.error('Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  if (isComplete) {
    return (
      <div className="text-center space-y-4">
        <h3 className="text-lg font-medium">Password Reset Complete</h3>
        <p className="text-gray-600">
          Your password has been reset successfully.
        </p>
        <Button onClick={() => window.location.href = '/login'}>
          Go to Login
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input
          type="password"
          placeholder="New password"
          {...register('password')}
          aria-label="New password"
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? 'password-error' : undefined}
        />
        {errors.password && (
          <span id="password-error" className="text-sm text-red-500">
            {errors.password.message}
          </span>
        )}
      </div>

      <div>
        <Input
          type="password"
          placeholder="Confirm new password"
          {...register('confirmPassword')}
          aria-label="Confirm new password"
          aria-invalid={!!errors.confirmPassword}
          aria-describedby={errors.confirmPassword ? 'confirm-error' : undefined}
        />
        {errors.confirmPassword && (
          <span id="confirm-error" className="text-sm text-red-500">
            {errors.confirmPassword.message}
          </span>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Resetting...' : 'Reset Password'}
      </Button>
    </form>
  );
} 