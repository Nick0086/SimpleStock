import { useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const TIMEOUT_WARNING = 5 * 60 * 1000; // 5 minutes
const TIMEOUT_LOGOUT = 15 * 60 * 1000; // 15 minutes

export function useSessionTimeout() {
  const { logout } = useAuth();
  const warningTimerRef = useRef(null);
  const logoutTimerRef = useRef(null);

  const resetTimers = useCallback(() => {
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);

    warningTimerRef.current = setTimeout(() => {
      toast.warning('Your session will expire soon. Please save your work.', {
        duration: 10000,
        action: {
          label: 'Keep Session',
          onClick: resetTimers
        }
      });
    }, TIMEOUT_WARNING);

    logoutTimerRef.current = setTimeout(() => {
      toast.error('Session expired. Please log in again.');
      logout();
    }, TIMEOUT_LOGOUT);
  }, [logout]);

  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'mousemove'];
    
    const handleActivity = () => {
      resetTimers();
    };

    events.forEach(event => {
      document.addEventListener(event, handleActivity);
    });

    resetTimers();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    };
  }, [resetTimers]);
} 