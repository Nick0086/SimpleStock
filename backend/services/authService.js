import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { authRepository } from '../repositories/authRepository';
import { emailService } from './emailService';
import { createError } from '../utils/errorUtils';
import { generateOTP } from '../utils/otpUtils';

/**
 * Service for handling authentication business logic
 */
export const authService = {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   */
  async register(userData) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const user = await authRepository.createUser({
      ...userData,
      password: hashedPassword,
      role: 'staff' // Default role
    });

    return user;
  },

  /**
   * Generate and store OTP
   * @param {string} userId - User ID
   * @param {string} type - OTP type
   */
  async generateOTP(userId, type = 'email_verification') {
    const otp = generateOTP(6);
    await authRepository.storeOTP(userId, otp, type);
    return otp;
  },

  /**
   * Send verification email
   * @param {string} email - User's email
   * @param {string} otp - OTP code
   */
  async sendVerificationEmail(email, otp) {
    await emailService.sendEmail({
      to: email,
      subject: 'Verify your email',
      template: 'email-verification',
      context: { otp }
    });
  },

  /**
   * Login user
   * @param {Object} credentials - Login credentials
   */
  async login(credentials) {
    const user = await authRepository.findUserByEmail(credentials.email);
    if (!user) {
      throw createError('Invalid credentials', 401);
    }

    const isValidPassword = await bcrypt.compare(credentials.password, user.password);
    if (!isValidPassword) {
      throw createError('Invalid credentials', 401);
    }

    const { accessToken, refreshToken } = await this.generateTokens(user);

    return {
      user,
      accessToken,
      refreshToken
    };
  },

  /**
   * Create magic link
   * @param {string} email - User's email
   */
  async createMagicLink(email) {
    const token = uuidv4();
    await authRepository.storeMagicLink(email, token);
    return token;
  },

  /**
   * Send magic link email
   * @param {string} email - User's email
   * @param {string} token - Magic link token
   */
  async sendMagicLinkEmail(email, token) {
    const magicLink = `${process.env.FRONTEND_URL}/auth/magic-link?token=${token}`;
    await emailService.sendEmail({
      to: email,
      subject: 'Login with Magic Link',
      template: 'magic-link',
      context: { magicLink }
    });
  },

  /**
   * Verify magic link token
   * @param {string} token - Magic link token
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

    await authRepository.deleteMagicLink(token);
    const tokens = await this.generateTokens(user);

    return {
      user,
      ...tokens
    };
  },

  /**
   * Verify OTP
   * @param {string} email - User's email
   * @param {string} otp - OTP code
   * @param {string} type - OTP type
   */
  async verifyOTP(email, otp, type) {
    const user = await authRepository.findUserByEmail(email);
    if (!user) {
      throw createError('User not found', 404);
    }

    const storedOTP = await authRepository.findOTP(user.id, type);
    if (!storedOTP || storedOTP.token !== otp || this.isTokenExpired(storedOTP.expires_at)) {
      throw createError('Invalid or expired OTP', 401);
    }

    await authRepository.deleteOTP(user.id, type);
    return true;
  },

  /**
   * Generate access and refresh tokens
   * @param {Object} user - User object
   */
  async generateTokens(user) {
    const accessToken = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        role: user.role 
      },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = uuidv4();
    await authRepository.storeRefreshToken(
      user.id,
      refreshToken,
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    );

    return { accessToken, refreshToken };
  },

  /**
   * Refresh tokens
   * @param {string} refreshToken - Current refresh token
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

    await authRepository.deleteRefreshToken(refreshToken);
    return this.generateTokens(user);
  },

  /**
   * Revoke refresh token
   * @param {string} refreshToken - Refresh token to revoke
   */
  async revokeRefreshToken(refreshToken) {
    await authRepository.deleteRefreshToken(refreshToken);
  },

  /**
   * Check if token is expired
   * @private
   */
  isTokenExpired(expiryDate) {
    return new Date() > new Date(expiryDate);
  }
}; 