import { queryUtils } from '../utils/query.utils.js';
import { createError } from '../utils/errorUtils.js';

/**
 * Repository for handling authentication-related database operations
 */
export const authRepository = {
  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user object
   */
  async createUser(userData) {
    const query = `
      INSERT INTO users (email, password, role)
      VALUES ($1, $2, $3)
      RETURNING id, email, role, created_at
    `;
    
    return queryUtils.executeQuerySingle(query, [
      userData.email,
      userData.password,
      userData.role || 'staff'
    ]);
  },

  /**
   * Find user by email
   * @param {string} email - User's email
   */
  async findUserByEmail(email) {
    const query = `
      SELECT id, email, password, role, created_at, updated_at
      FROM users
      WHERE email = $1
    `;
    
    return queryUtils.executeQuerySingle(query, [email]);
  },

  /**
   * Find user by ID
   * @param {string} id - User ID
   */
  async findUserById(id) {
    const query = `
      SELECT id, email, role, created_at, updated_at
      FROM users
      WHERE id = $1
    `;
    
    return queryUtils.executeQuerySingle(query, [id]);
  },

  /**
   * Store refresh token
   * @param {string} userId - User ID
   * @param {string} token - Refresh token
   * @param {Date} expiresAt - Token expiration date
   */
  async storeRefreshToken(userId, token, expiresAt) {
    const query = `
      INSERT INTO refresh_tokens (user_id, token, expires_at)
      VALUES ($1, $2, $3)
      RETURNING id
    `;
    
    return queryUtils.executeQuerySingle(query, [userId, token, expiresAt]);
  },

  /**
   * Find refresh token
   * @param {string} token - Refresh token
   */
  async findRefreshToken(token) {
    const query = `
      SELECT id, user_id, token, expires_at
      FROM refresh_tokens
      WHERE token = $1
    `;
    
    return queryUtils.executeQuerySingle(query, [token]);
  },

  /**
   * Delete refresh token
   * @param {string} token - Refresh token
   */
  async deleteRefreshToken(token) {
    const query = `
      DELETE FROM refresh_tokens
      WHERE token = $1;
    `;
    await queryUtils.executeQuery(query, [token]);
  },

  /**
   * Store OTP
   * @param {string} userId - User ID
   * @param {string} otp - OTP code
   * @param {string} type - OTP type
   */
  async storeOTP(userId, otp, type) {
    const query = `
      INSERT INTO otp_tokens (user_id, token, type, expires_at)
      VALUES ($1, $2, $3, NOW() + INTERVAL '15 minutes')
      RETURNING id
    `;
    
    return queryUtils.executeQuerySingle(query, [userId, otp, type]);
  },

  /**
   * Find OTP
   * @param {string} userId - User ID
   * @param {string} type - OTP type
   */
  async findOTP(userId, type) {
    const query = `
      SELECT id, token, expires_at
      FROM otp_tokens
      WHERE user_id = $1 AND type = $2
      ORDER BY created_at DESC
      LIMIT 1
    `;
    
    return queryUtils.executeQuerySingle(query, [userId, type]);
  },

  /**
   * Delete OTP
   * @param {string} userId - User ID
   * @param {string} type - OTP type
   */
  async deleteOTP(userId, type) {
    const query = `
      DELETE FROM otp_tokens
      WHERE user_id = $1 AND type = $2;
    `;
    await queryUtils.executeQuery(query, [userId, type]);
  },

  /**
   * Store magic link
   * @param {string} email - User's email
   * @param {string} token - Magic link token
   */
  async storeMagicLink(email, token) {
    const query = `
      INSERT INTO magic_links (email, token, expires_at)
      VALUES ($1, $2, NOW() + INTERVAL '1 hour')
      RETURNING id;
    `;
    await queryUtils.executeQuery(query, [email, token]);
  },

  /**
   * Find magic link
   * @param {string} token - Magic link token
   */
  async findMagicLink(token) {
    const query = `
      SELECT id, email, token, expires_at
      FROM magic_links
      WHERE token = $1;
    `;
    const result = await queryUtils.executeQuery(query, [token]);
    return result[0] || null;
  },

  /**
   * Delete magic link
   * @param {string} token - Magic link token
   */
  async deleteMagicLink(token) {
    const query = `
      DELETE FROM magic_links
      WHERE token = $1;
    `;
    await queryUtils.executeQuery(query, [token]);
  },

  /**
   * Mark email as verified
   * @param {string} userId - User ID
   */
  async markEmailAsVerified(userId) {
    const query = `
      UPDATE users
      SET email_verified = true,
          updated_at = NOW()
      WHERE id = $1;
    `;
    await queryUtils.executeQuery(query, [userId]);
  },

  /**
   * Replace refresh token
   * @param {string} oldToken - Old refresh token
   * @param {string} newToken - New refresh token
   * @param {string} userId - User ID
   */
  async replaceRefreshToken(oldToken, newToken, userId) {
    return queryUtils.executeTransaction(async (client) => {
      // Delete old token
      await client.query(
        'DELETE FROM refresh_tokens WHERE token = $1 AND user_id = $2',
        [oldToken, userId]
      );

      // Insert new token
      await client.query(
        `INSERT INTO refresh_tokens (user_id, token, expires_at)
         VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
        [userId, newToken]
      );

      return newToken;
    });
  },

  /**
   * Store verification token
   */
  async storeVerificationToken(userId, token) {
    const query = `
      INSERT INTO verification_tokens (user_id, token, expires_at)
      VALUES ($1, $2, NOW() + INTERVAL '24 hours')
      RETURNING id
    `;
    return queryUtils.executeQuerySingle(query, [userId, token]);
  },

  /**
   * Find verification token
   */
  async findVerificationToken(token) {
    const query = `
      SELECT id, user_id, token, expires_at
      FROM verification_tokens
      WHERE token = $1
    `;
    return queryUtils.executeQuerySingle(query, [token]);
  },

  /**
   * Delete verification token
   */
  async deleteVerificationToken(token) {
    const query = `
      DELETE FROM verification_tokens
      WHERE token = $1
    `;
    await queryUtils.executeQuery(query, [token]);
  },

  /**
   * Store password reset token
   * @param {string} userId - User ID
   * @param {string} token - Reset token
   */
  async storePasswordResetToken(userId, token) {
    const query = `
      INSERT INTO password_reset_tokens (user_id, token, expires_at)
      VALUES ($1, $2, NOW() + INTERVAL '1 hour')
      RETURNING id
    `;
    return queryUtils.executeQuerySingle(query, [userId, token]);
  },

  /**
   * Find password reset token
   * @param {string} token - Reset token
   */
  async findPasswordResetToken(token) {
    const query = `
      SELECT id, user_id, token, expires_at
      FROM password_reset_tokens
      WHERE token = $1
      AND expires_at > NOW()
      AND used_at IS NULL
    `;
    return queryUtils.executeQuerySingle(query, [token]);
  },

  /**
   * Delete password reset token
   * @param {string} token - Reset token
   */
  async deletePasswordResetToken(token) {
    const query = `
      UPDATE password_reset_tokens
      SET used_at = NOW()
      WHERE token = $1
    `;
    await queryUtils.executeQuery(query, [token]);
  },

  /**
   * Update user password
   * @param {string} userId - User ID
   * @param {string} hashedPassword - New hashed password
   */
  async updateUserPassword(userId, hashedPassword) {
    const query = `
      UPDATE users
      SET password = $1,
          updated_at = NOW()
      WHERE id = $2
      RETURNING id
    `;
    return queryUtils.executeQuerySingle(query, [hashedPassword, userId]);
  },

  /**
   * Log auth event
   * @param {string} userId - User ID
   * @param {string} action - Action type
   * @param {string} status - Status
   * @param {object} details - Additional details
   */
  async logAuthEvent(userId, action, status, details = {}) {
    const query = `
      INSERT INTO auth_logs (user_id, action, status, ip_address, user_agent, details)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;
    await queryUtils.executeQuery(query, [
      userId,
      action,
      status,
      details.ip_address,
      details.user_agent,
      JSON.stringify(details)
    ]);
  }
}; 