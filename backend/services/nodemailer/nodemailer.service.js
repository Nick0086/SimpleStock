import { transporter } from '../../config/nodemailer.js';
import { config } from 'dotenv';
config();

/**
 * Email service for handling all email operations
 */
export const emailService = {
  /**
   * Send verification email
   * @param {string} to - Recipient email
   * @param {string} otp - OTP code
   */
  async sendVerificationEmail(to, otp) {
    try {
      await this.sendEmail({
        from: process.env.EMAIL_FROM,
        to,
        subject: 'Verify Your Email',
        html: `
          <h1>Verify Your Email</h1>
          <p>Your verification code is: <strong>${otp}</strong></p>
          <p>This code will expire in 15 minutes.</p>
        `
      });
    } catch (error) {
      throw new Error('Failed to send verification email');
    }
  },

  /**
   * Send magic link email
   */
  async sendMagicLinkEmail(email, magicLinkUrl) {
    const mailOptions = {
      to: email,
      subject: 'Your Magic Link - SimpleStock',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333; text-align: center;">Login with Magic Link</h1>
          <p style="color: #666;">Click the button below to log in to your account:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${magicLinkUrl}" 
               style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Log In
            </a>
          </div>
          <p style="color: #666;">Or copy and paste this URL in your browser:</p>
          <p style="color: #666; word-break: break-all;">${magicLinkUrl}</p>
          <p style="color: #666;">This link will expire in 1 hour.</p>
          <p style="color: #666;">If you didn't request this link, please ignore this email.</p>
          <hr style="border: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; text-align: center; font-size: 12px;">
            This is an automated email from SimpleStock. Please do not reply to this email.
          </p>
        </div>
      `
    };

    return this.sendEmail(mailOptions);
  },

  /**
   * Send password reset email
   * @param {string} email - User's email
   * @param {string} resetUrl - Password reset URL
   */
  async sendPasswordResetEmail(email, resetUrl) {
    const mailOptions = {
      to: email,
      subject: 'Reset Your Password - SimpleStock',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333; text-align: center;">Reset Your Password</h1>
          <p style="color: #666;">You requested to reset your password. Click the button below to set a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color: #666;">Or copy and paste this URL in your browser:</p>
          <p style="color: #666; word-break: break-all;">${resetUrl}</p>
          <p style="color: #666;">This link will expire in 1 hour.</p>
          <p style="color: #666;">If you didn't request this password reset, please ignore this email.</p>
          <hr style="border: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; text-align: center; font-size: 12px;">
            This is an automated email from SimpleStock. Please do not reply to this email.
          </p>
        </div>
      `
    };

    return this.sendEmail(mailOptions);
  },

  /**
   * Send OTP email
   * @param {string} email - Recipient email
   * @param {string} otp - OTP code
   * @param {string} type - OTP type
   */
  async sendOTPEmail(email, otp, type) {
    const subjects = {
      login: 'Login OTP Code - SimpleStock',
      registration: 'Registration OTP Code - SimpleStock',
      password_reset: 'Password Reset OTP Code - SimpleStock'
    };

    const messages = {
      login: 'to log in to your account',
      registration: 'to complete your registration',
      password_reset: 'to reset your password'
    };

    const mailOptions = {
      to: email,
      subject: subjects[type] || 'OTP Code - SimpleStock',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333; text-align: center;">Your OTP Code</h1>
          <p style="color: #666;">Use the following OTP code ${messages[type]}:</p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 4px; font-size: 24px; letter-spacing: 4px;">
              <strong>${otp}</strong>
            </div>
          </div>
          <p style="color: #666;">This code will expire in 15 minutes.</p>
          <p style="color: #666;">If you didn't request this code, please ignore this email.</p>
          <hr style="border: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; text-align: center; font-size: 12px;">
            This is an automated email from SimpleStock. Please do not reply to this email.
          </p>
        </div>
      `
    };

    return this.sendEmail(mailOptions);
  },

  /**
   * Generic email sending function
   */
  async sendEmail(mailOptions) {
    try {
      const info = await transporter.sendMail({
        from: `"SimpleStock" <${process.env.NODEMAILER_AUTH_USER}>`,
        ...mailOptions
      });

      console.log('Email sent successfully:', info.messageId);
      return info;
    } catch (error) {
      console.error('Email sending error:', error);
      throw new Error('Failed to send email: ' + error.message);
    }
  }
};
