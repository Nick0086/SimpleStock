import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useSearchParams } from 'react-router';

export function MagicLinkVerification() {
  const { verifyMagicLink } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        toast({
          title: "Error",
          description: "Invalid magic link. Please request a new one.",
          variant: "destructive",
        });
        navigate('/auth/magic-link');
        return;
      }

      try {
        await verifyMagicLink(token);
        toast({
          title: "Success",
          description: "Login successful!",
        });
        navigate('/dashboard');
      } catch (error) {
        console.error('Magic link verification error:', error);
        toast({
          title: "Error",
          description: error.message || "Invalid or expired magic link. Please request a new one.",
          variant: "destructive",
        });
        navigate('/auth/magic-link');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [verifyMagicLink, toast, navigate, searchParams]);

  if (isVerifying) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <h2 className="text-xl font-semibold">Verifying magic link...</h2>
        <p className="text-muted-foreground">Please wait while we log you in</p>
      </div>
    );
  }

  return null;
} 