import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from 'react-router';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address')
});

export function ForgotPassword() {
  const { requestPasswordReset } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema)
  });

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      await requestPasswordReset(data.email);
      
      toast({
        title: "Success",
        description: "Password reset instructions have been sent to your email",
      });

      // Navigate to OTP verification if your flow uses OTP
      navigate('/auth/verify-otp', {
        state: { 
          email: data.email,
          type: 'password_reset'
        }
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to send reset instructions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Reset Password</h1>
        <p className="text-muted-foreground mt-2">
          Enter your email to receive password reset instructions
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Input
            type="email"
            placeholder="Email"
            {...register('email')}
            error={errors.email?.message}
          />
          {errors.email && (
            <span className="text-sm text-red-500">
              {errors.email.message}
            </span>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send Reset Instructions'}
        </Button>
      </form>

      <div className="text-center">
        <Link 
          to="/auth/login" 
          className="text-sm text-primary hover:underline"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
} 