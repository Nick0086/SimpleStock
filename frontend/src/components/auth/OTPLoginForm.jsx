import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from "@/hooks/use-toast";
import { useNavigate, Link } from 'react-router';

const emailSchema = z.object({
  email: z.string().email('Invalid email address')
});

const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits')
});

export function OTPLoginForm() {
  const { loginWithOTP } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState('email'); // 'email' or 'otp'
  const [email, setEmail] = useState('');

  const emailForm = useForm({
    resolver: zodResolver(emailSchema)
  });

  const otpForm = useForm({
    resolver: zodResolver(otpSchema)
  });

  const handleRequestOTP = async (data) => {
    try {
      setIsLoading(true);
      // Call API to request OTP
      await fetch('/api/v1/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: data.email,
          type: 'login'
        })
      });

      setEmail(data.email);
      setStep('otp');
      toast({
        title: "OTP Sent",
        description: "Please check your email for the OTP",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (data) => {
    try {
      setIsLoading(true);
      await loginWithOTP(email, data.otp);
      toast({
        title: "Success",
        description: "Logged in successfully",
      });
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Login with OTP</h1>
        <p className="text-muted-foreground mt-2">
          {step === 'email' 
            ? 'Enter your email to receive an OTP'
            : 'Enter the OTP sent to your email'
          }
        </p>
      </div>

      {step === 'email' ? (
        <form onSubmit={emailForm.handleSubmit(handleRequestOTP)} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Email"
              {...emailForm.register('email')}
              error={emailForm.formState.errors.email?.message}
            />
            {emailForm.formState.errors.email && (
              <span className="text-sm text-red-500">
                {emailForm.formState.errors.email.message}
              </span>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Sending OTP...' : 'Send OTP'}
          </Button>
        </form>
      ) : (
        <form onSubmit={otpForm.handleSubmit(handleVerifyOTP)} className="space-y-4">
          <div>
            <Input
              type="text"
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              {...otpForm.register('otp')}
              error={otpForm.formState.errors.otp?.message}
            />
            {otpForm.formState.errors.otp && (
              <span className="text-sm text-red-500">
                {otpForm.formState.errors.otp.message}
              </span>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Verifying...' : 'Verify OTP'}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => handleRequestOTP({ email })}
            disabled={isLoading}
          >
            Resend OTP
          </Button>
        </form>
      )}

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