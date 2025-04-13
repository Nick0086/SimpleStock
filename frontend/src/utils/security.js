/**
 * Security utility functions
 */
import { AES, enc } from 'crypto-js';

export const security = {
  /**
   * Encrypt sensitive data
   */
  encryptData(data, key) {
    return AES.encrypt(JSON.stringify(data), key).toString();
  },

  /**
   * Decrypt sensitive data
   */
  decryptData(encryptedData, key) {
    try {
      const bytes = AES.decrypt(encryptedData, key);
      return JSON.parse(bytes.toString(enc.Utf8));
    } catch (error) {
      return null;
    }
  },

  /**
   * Sanitize user input
   * @param {string} input User input
   */
  sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    return input
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '');
  },

  /**
   * Generate secure random string
   */
  generateSecureToken(length = 32) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  },

  /**
   * Rate limiting for client-side operations
   */
  createRateLimiter(maxAttempts = 5, timeWindow = 60000) {
    const attempts = new Map();

    return (key) => {
      const now = Date.now();
      const attempt = attempts.get(key) || { count: 0, timestamp: now };

      if (now - attempt.timestamp > timeWindow) {
        attempt.count = 1;
        attempt.timestamp = now;
      } else if (attempt.count >= maxAttempts) {
        return false;
      } else {
        attempt.count++;
      }

      attempts.set(key, attempt);
      return true;
    };
  },

  /**
   * Check password strength
   * @param {string} password Password to check
   */
  checkPasswordStrength(password) {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*]/.test(password)
    };

    const strength = Object.values(checks).filter(Boolean).length;
    return {
      score: strength,
      checks,
      isStrong: strength >= 4
    };
  },

  /**
   * Generate CSRF token
   */
  generateCSRFToken() {
    return Math.random().toString(36).slice(2);
  }
}; 