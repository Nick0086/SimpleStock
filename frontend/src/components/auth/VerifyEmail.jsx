import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useSearchParams } from 'react-router';

export function VerifyEmail() {
  const { verifyEmail } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      toast({
        title: "Error",
        description: "Invalid verification link",
        variant: "destructive",
      });
      navigate('/auth/login');
      return;
    }

    verifyEmail(token)
      .then(() => {
        toast({
          title: "Success",
          description: "Email verified successfully",
        });
        navigate('/auth/login', {
          state: { message: 'Email verified successfully. Please login.' }
        });
      })
      .catch((error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        navigate('/auth/login');
      })
      .finally(() => {
        setIsVerifying(false);
      });
  }, []);

  if (isVerifying) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold">Verifying Email</h1>
        <p className="text-muted-foreground mt-2">
          Please wait while we verify your email...
        </p>
      </div>
    );
  }

  return null;
} 