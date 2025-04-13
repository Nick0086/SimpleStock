import { api } from '@/lib/api';

/**
 * Authentication service for handling auth-related API calls
 */
export const authService = {
  /**
   * Register a new user
   * @param {Object} userData Registration data
   */
  async register(userData) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  /**
   * Login with email and password
   * @param {Object} credentials Login credentials
   */
  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  /**
   * Request magic link login
   * @param {string} email User's email
   */
  async requestMagicLink(email) {
    const response = await api.post('/auth/magic-link', { email });
    return response.data;
  },

  /**
   * Verify magic link token
   * @param {string} token Magic link token
   */
  async verifyMagicLink(token) {
    try {
      const response = await api.get(`/auth/magic-link/verify?token=${token}`);
      const { accessToken, user } = response.data;
      
      // Store the token
      localStorage.setItem('accessToken', accessToken);
      
      return { user, accessToken };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to verify magic link');
    }
  },

  /**
   * Request OTP
   * @param {string} email User's email
   * @param {string} type OTP type
   */
  async requestOTP(email, type) {
    const response = await api.post('/auth/send-otp', { email, type });
    return response.data;
  },

  /**
   * Verify OTP
   * @param {string} email User's email
   * @param {string} otp OTP code
   * @param {string} type OTP type
   */
  async verifyOTP(email, otp, type) {
    const response = await api.post('/auth/verify-otp', { email, otp, type });
    return response.data;
  },

  /**
   * Logout user
   */
  async logout() {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  /**
   * Get current user
   */
  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async requestPasswordReset(email) {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  async resetPassword(token, newPassword) {
    const response = await api.post('/auth/reset-password', {
      token,
      newPassword
    });
    return response.data;
  },

  async verifyEmail(token) {
    await api.post('/auth/verify-email', { token });
  },

  /**
   * Refresh token
   */
  async refreshToken() {
    const response = await api.post('/auth/refresh');
    return response.data;
  }
}; 