import nodemailer from 'nodemailer';
import { createError } from '../utils/errorUtils';

/**
 * Service for handling email operations
 */
export const emailService = {
  transporter: null,

  /**
   * Initialize email transporter
   */
  init() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  },

  /**
   * Send email
   * @param {Object} options - Email options
   */
  async sendEmail({ to, subject, template, context }) {
    if (!this.transporter) {
      this.init();
    }

    try {
      const html = await this.renderTemplate(template, context);
      
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to,
        subject,
        html
      });
    } catch (error) {
      throw createError('Failed to send email', 500, error);
    }
  },

  /**
   * Render email template
   * @private
   */
  async renderTemplate(template, context) {
    // Here you would implement your template rendering logic
    // This could use a template engine like handlebars or ejs
    switch (template) {
      case 'email-verification':
        return this.renderVerificationEmail(context);
      case 'magic-link':
        return this.renderMagicLinkEmail(context);
      default:
        throw createError('Invalid email template', 400);
    }
  },

  /**
   * Render verification email
   * @private
   */
  renderVerificationEmail({ otp }) {
    return `
      <h1>Verify Your Email</h1>
      <p>Your verification code is: <strong>${otp}</strong></p>
      <p>This code will expire in 15 minutes.</p>
    `;
  },

  /**
   * Render magic link email
   * @private
   */
  renderMagicLinkEmail({ magicLink }) {
    return `
      <h1>Login with Magic Link</h1>
      <p>Click the link below to log in:</p>
      <a href="${magicLink}">Login to Your Account</a>
      <p>This link will expire in 1 hour.</p>
    `;
  }
}; 