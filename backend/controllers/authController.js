import { authService } from '../services/auth/auth.service.js';
import { createError } from '../utils/errorUtils.js';

/**
 * Authentication controller handling all auth-related requests
 */
export const authController = {
  /**
   * Register new user
   * @route POST /auth/register
   */
  async register(req, res, next) {
    try {
      const { email, password } = req.body;
      const { user, verificationToken } = await authService.register({ email, password });
      res.status(201).json({
        message: 'Registration successful. Please verify your email.',
        userId: user.id
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * User login
   * @route POST /auth/login
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const { user, accessToken, refreshToken } = await authService.login({ email, password });

      // Set refresh token in HTTP-only cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.json({
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Refresh access token
   * @route POST /auth/refresh
   */
  async refresh(req, res, next) {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        throw createError('Refresh token not found', 401);
      }

      const { accessToken, newRefreshToken } = await authService.refreshTokens(refreshToken);

      // Set new refresh token
      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      res.json({ accessToken });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Request magic link login
   * @route POST /auth/magic-link
   */
  async requestMagicLink(req, res, next) {
    try {
      const { email } = req.body;
      await authService.createMagicLink(email);
      res.json({
        message: 'If an account exists with this email, a magic link has been sent.'
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Verify magic link token
   * @route GET /auth/magic-link/verify
   */
  async verifyMagicLink(req, res, next) {
    try {
      const { token } = req.query;
      const { user, accessToken, refreshToken } = await authService.verifyMagicLink(token);

      // Set refresh token in HTTP-only cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.json({
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get current user
   * @route GET /auth/me
   */
  async getCurrentUser(req, res, next) {
    try {
      console.log("getCurrentUser",req.user)
      const user = await authService.getCurrentUser(req.user.userId);
      
      res.json({
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Send OTP
   * @route POST /auth/send-otp
   */
  async sendOTP(req, res, next) {
    try {
      const { email, type } = req.body;
      await authService.generateAndSendOTP(email, type);
      
      res.json({
        message: 'If an account exists with this email, an OTP has been sent.'
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Verify OTP
   * @route POST /auth/verify-otp
   */
  async verifyOTP(req, res, next) {
    try {
      const { email, otp, type } = req.body;
      const { user, accessToken, refreshToken } = await authService.verifyOTP(email, otp, type);

      // Set refresh token in HTTP-only cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      res.json({
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Logout user
   * @route POST /auth/logout
   */
  async logout(req, res, next) {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (refreshToken) {
        await authService.logout(refreshToken);
      }

      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });

      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Request password reset
   */
  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      await authService.requestPasswordReset(email);
      
      res.json({
        message: 'If an account exists with this email, password reset instructions have been sent.'
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Reset password
   */
  async resetPassword(req, res, next) {
    try {
      const { token, newPassword } = req.body;
      await authService.resetPassword(token, newPassword);
      
      res.json({
        message: 'Password has been reset successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Verify email
   */
  async verifyEmail(req, res, next) {
    try {
      const { token } = req.query;
      await authService.verifyEmail(token);
      
      res.json({
        message: 'Email verified successfully'
      });
    } catch (error) {
      next(error);
    }
  }
};