import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useLocation, Link } from 'react-router';

const emailSchema = z.object({
  email: z.string().email('Invalid email address')
});

const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits')
});

export function OTPVerification() {
  const { verifyOTP, requestOTP } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [email, setEmail] = useState('');
  const [isEmailStep, setIsEmailStep] = useState(true);
  const [otpRequestTime, setOtpRequestTime] = useState(null);
  const [countdown, setCountdown] = useState(0);

  // Initialize email from location state if available
  useEffect(() => {
    const { email: stateEmail } = location.state || {};
    if (stateEmail) {
      setEmail(stateEmail);
      setIsEmailStep(false);
      emailForm.reset({ email: '' }); // Clear the form
      handleOTPRequest(stateEmail);
    }
  }, [location.state]);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Email form
  const emailForm = useForm({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' }
  });

  // OTP form
  const otpForm = useForm({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' }
  });

  // Handle OTP request
  const handleOTPRequest = async (emailValue) => {
    try {
      setIsLoading(true);
      const type = location.state?.type || 'login';
      await requestOTP(emailValue, type);

      // Set countdown for resend button
      setOtpRequestTime(Date.now());
      setCountdown(30); // 30 seconds cooldown

      toast({
        title: "OTP Sent",
        description: "Please check your email for the OTP code",
      });

      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Handle email submission
  const onEmailSubmit = async (data) => {
    const success = await handleOTPRequest(data.email);
    if (success) {
      setEmail(data.email);
      emailForm.reset({ email: '' }); // Clear the email form after submission
      setIsEmailStep(false);
    }
  };

  // Handle OTP verification
  const onOTPSubmit = async (data) => {
    try {
      setIsLoading(true);
      const type = location.state?.type || 'login';

      await verifyOTP({
        email,
        otp: data.otp,
        type
      });

      toast({
        title: "Success",
        description: "OTP verified successfully",
      });

      // Reset both forms
      emailForm.reset({ email: '' });
      otpForm.reset({ otp: '' });

      // Navigate based on OTP type
      switch (type) {
        case 'registration':
          navigate('/auth/login', {
            state: { message: 'Registration completed. Please login.' }
          });
          break;
        case 'login':
          navigate('/dashboard');
          break;
        case 'password_reset':
          navigate('/auth/reset-password', {
            state: { email, verified: true }
          });
          break;
        default:
          navigate('/dashboard');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });

      // If token expired, go back to email step
      if (error.message.includes('expired')) {
        setIsEmailStep(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP resend
  const handleResendOTP = async () => {
    if (countdown > 0) return;

    setIsResending(true);
    await handleOTPRequest(email);
    setIsResending(false);
  };

  // Handle changing email
  const handleChangeEmail = () => {
    setIsEmailStep(true);
    // Don't reset the email state yet, but prepare the form with current email
    emailForm.setValue('email', email);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">
          {isEmailStep ? 'Enter Your Email' : 'Enter OTP'}
        </h1>
        <p className="text-muted-foreground mt-2">
          {isEmailStep
            ? 'We\'ll send you an OTP code'
            : `Enter the OTP code sent to ${email}`
          }
        </p>
      </div>

      {isEmailStep ? (
        // Email Form
        <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Enter your email"
              {...emailForm.register('email')}
              disabled={isLoading}
            />
            {emailForm.formState.errors.email && (
              <span className="text-sm text-red-500">
                {emailForm.formState.errors.email.message}
              </span>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send OTP'}
          </Button>
        </form>
      ) : (
        // OTP Form
        <form onSubmit={otpForm.handleSubmit(onOTPSubmit)} className="space-y-4">
          <div>
            <Input
              type="text"
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              {...otpForm.register('otp')}
              disabled={isLoading}
              autoFocus
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

          <div className="flex justify-between items-center mt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={handleResendOTP}
              disabled={isResending || countdown > 0}
            >
              {isResending
                ? 'Sending...'
                : countdown > 0
                  ? `Resend in ${countdown}s`
                  : 'Resend OTP'
              }
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={handleChangeEmail}
              disabled={isLoading}
            >
              Change Email
            </Button>
          </div>
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