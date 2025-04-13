import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { authRepository } from '../../repositories/authRepository.js';
import { emailService } from '../nodemailer/nodemailer.service.js';
import { createError } from '../../utils/errorUtils.js';
import { generateOTP, verifyOTP, isOTPExpired } from '../../utils/otpUtils.js';
import { config } from 'dotenv';
config();

/**
 * Authentication service handling business logic
 */
export const authService = {
  /**
   * Register new user
   */
  async register(userData) {
    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    // Create user
    const user = await authRepository.createUser({
      ...userData,
      password: hashedPassword,
      role: 'staff' // Default role
    });

    // Generate verification token
    const verificationToken = uuidv4();
    await authRepository.storeVerificationToken(user.id, verificationToken);

    // Send verification email
    await emailService.sendVerificationEmail(userData.email, verificationToken);

    return { user, verificationToken };
  },

  /**
   * User login
   */
  async login({ email, password }) {
    // Find user
    const user = await authRepository.findUserByEmail(email);
    console.log("user", user)
    if (!user) {
      throw createError('Invalid credentials', 401);
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw createError('Invalid credentials', 401);
    }

    // Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken();

    // Store refresh token
    await authRepository.storeRefreshToken(
      user.id,
      refreshToken,
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    );

    return { user, accessToken, refreshToken };
  },

  /**
   * Refresh tokens
   */
  async refreshTokens(refreshToken) {
    const storedToken = await authRepository.findRefreshToken(refreshToken);
    if (!storedToken || this.isTokenExpired(storedToken.expires_at)) {
      throw createError('Invalid or expired refresh token', 401);
    }

    const user = await authRepository.findUserById(storedToken.user_id);
    if (!user) {
      throw createError('User not found', 404);
    }

    // Generate new tokens
    const accessToken = this.generateAccessToken(user);
    const newRefreshToken = this.generateRefreshToken();

    // Replace old refresh token
    await authRepository.replaceRefreshToken(
      refreshToken,
      newRefreshToken,
      user.id,
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    );

    return { accessToken, newRefreshToken };
  },

  /**
   * Create magic link
   */
  async createMagicLink(email) {
    const user = await authRepository.findUserByEmail(email);
    if (!user) {
      // Return silently for security
      return;
    }

    const token = uuidv4();
    await authRepository.storeMagicLink(email, token);

    // Use FRONTEND_URL_DEV from environment variables
    const magicLinkUrl = `${process.env.FRONTEND_URL_DEV}/auth/verify-magic-link?token=${token}`;
    
    // Send magic link email
    await emailService.sendMagicLinkEmail(email, magicLinkUrl);
  },

  /**
   * Verify magic link
   */
  async verifyMagicLink(token) {
    const magicLink = await authRepository.findMagicLink(token);
    if (!magicLink || this.isTokenExpired(magicLink.expires_at)) {
      throw createError('Invalid or expired magic link', 401);
    }

    const user = await authRepository.findUserByEmail(magicLink.email);
    if (!user) {
      throw createError('User not found', 404);
    }

    // Delete used magic link
    await authRepository.deleteMagicLink(token);

    // Generate tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken();

    // Store refresh token
    await authRepository.storeRefreshToken(
      user.id,
      refreshToken,
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    );

    return { user, accessToken, refreshToken };
  },

  /**
   * Generate and send OTP
   * @param {string} email - User's email
   * @param {string} type - OTP type (login, registration, password_reset)
   */
  async generateAndSendOTP(email, type) {
    const user = await authRepository.findUserByEmail(email);
    if (!user) {
      // Return silently for security
      return;
    }

    const otp = generateOTP(6);
    await authRepository.storeOTP(user.id, otp, type);
    await emailService.sendOTPEmail(email, otp, type);

    await authRepository.logAuthEvent(
      user.id,
      'otp_requested',
      'success',
      { type }
    );
  },

  /**
   * Verify OTP and handle login if type is 'login'
   * @param {string} email - User's email
   * @param {string} otp - OTP code
   * @param {string} type - OTP type
   */
  async verifyOTP(email, otp, type) {
    const user = await authRepository.findUserByEmail(email);
    if (!user) {
      throw createError('Invalid OTP', 401);
    }

    const storedOTP = await authRepository.findOTP(user.id, type);
    if (!storedOTP || storedOTP.token !== otp || this.isTokenExpired(storedOTP.expires_at)) {
      await authRepository.logAuthEvent(
        user.id,
        'otp_verification_failed',
        'failure',
        { type }
      );
      throw createError('Invalid or expired OTP', 401);
    }

    // Delete used OTP
    await authRepository.deleteOTP(user.id, type);

    await authRepository.logAuthEvent(
      user.id,
      'otp_verification_success',
      'success',
      { type }
    );

    if (type === 'login') {
      // Generate tokens for login
      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken();

      // Store refresh token
      await authRepository.storeRefreshToken(
        user.id,
        refreshToken,
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      );

      await authRepository.logAuthEvent(
        user.id,
        'login_with_otp',
        'success'
      );

      return { user, accessToken, refreshToken };
    }

    return { user };
  },

  /**
   * Get current user
   */
  async getCurrentUser(userId) {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw createError('User not found', 404);
    }
    return user;
  },

  /**
   * Revoke refresh token
   */
  async revokeRefreshToken(refreshToken) {
    await authRepository.deleteRefreshToken(refreshToken);
  },

  /**
   * Generate access token
   */
  generateAccessToken(user) {
    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: '15m' }
    );
  },

  /**
   * Generate refresh token
   */
  generateRefreshToken() {
    return uuidv4();
  },

  /**
   * Check if token is expired
   */
  isTokenExpired(expiryDate) {
    return new Date() > new Date(expiryDate);
  },

  /**
   * Request password reset
   * @param {string} email - User's email
   */
  async requestPasswordReset(email) {
    const user = await authRepository.findUserByEmail(email);
    if (!user) {
      // Return silently for security
      return;
    }

    const token = uuidv4();
    await authRepository.storePasswordResetToken(user.id, token);

    const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}`;
    await emailService.sendPasswordResetEmail(email, resetUrl);

    await authRepository.logAuthEvent(
      user.id,
      'password_reset_requested',
      'success',
      { email }
    );
  },

  /**
   * Reset password
   * @param {string} token - Reset token
   * @param {string} newPassword - New password
   */
  async resetPassword(token, newPassword) {
    const resetToken = await authRepository.findPasswordResetToken(token);
    if (!resetToken) {
      throw createError('Invalid or expired reset token', 401);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await authRepository.updateUserPassword(resetToken.user_id, hashedPassword);
    await authRepository.deletePasswordResetToken(token);

    await authRepository.logAuthEvent(
      resetToken.user_id,
      'password_reset_completed',
      'success'
    );

    // Revoke all existing sessions for security
    await authRepository.revokeUserTokens(resetToken.user_id);
  },

  /**
   * Verify email
   */
  async verifyEmail(token) {
    const verificationToken = await authRepository.findVerificationToken(token);
    if (!verificationToken || this.isTokenExpired(verificationToken.expires_at)) {
      throw createError('Invalid or expired verification token', 401);
    }

    await authRepository.markEmailAsVerified(verificationToken.user_id);
    await authRepository.deleteVerificationToken(token);
  }
};