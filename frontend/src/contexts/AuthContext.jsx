import { createContext, useCallback, useEffect, useState, useContext } from 'react';
import { authService } from '@/services/authService';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router';

// Export the context so it can be imported in other files
const AuthContext = createContext(null);

/**
 * Authentication provider component
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Request OTP
  const requestOTP = useCallback(async (email, type = 'login') => {
    try {
      setLoading(true);
      await authService.requestOTP(email, type);
      
      toast({
        title: "Success",
        description: "OTP sent successfully",
      });

      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Verify OTP
  const verifyOTP = useCallback(async ({ email, otp, type = 'login' }) => {
    try {
      setLoading(true);
      const data = await authService.verifyOTP(email, otp, type);
      
      setUser(data.user);
      setAccessToken(data.accessToken);

      toast({
        title: "Success",
        description: "OTP verified successfully",
      });

      return data;
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Login
  const login = useCallback(async (credentials) => {
    try {
      setLoading(true);
      const data = await authService.login(credentials);
      
      setUser(data.user);
      setAccessToken(data.accessToken);

      toast({
        title: "Success",
        description: "Logged in successfully",
      });

      return data;
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Logout
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setAccessToken(null);
      setLoading(false);
      navigate('/auth/login');
    }
  }, [navigate]);

  // Check auth status
  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      const data = await authService.getCurrentUser();
      if (data.user) {
        setUser(data.user);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh token
  const refreshToken = useCallback(async () => {
    try {
      const data = await authService.refreshToken();
      setAccessToken(data.accessToken);
      return data.accessToken;
    } catch (error) {
      setUser(null);
      setAccessToken(null);
      navigate('/auth/login');
      throw error;
    }
  }, [navigate]);

  // Initialize auth state
  const initializeAuth = useCallback(async () => {
    try {
      setLoading(true);
      await checkAuth();
    } finally {
      setLoading(false);
    }
  }, [checkAuth]);

  const value = {
    user,
    accessToken,
    loading,
    login,
    logout,
    requestOTP,
    verifyOTP,
    checkAuth,
    refreshToken,
    initializeAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook for using authentication context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 