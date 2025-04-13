import crypto from 'crypto';

/**
 * Generate a random OTP of specified length
 * @param {number} length - Length of OTP (default: 6)
 * @returns {string} Generated OTP
 */
export const generateOTP = (length = 6) => {
  const digits = '0123456789';
  let OTP = '';
  
  for (let i = 0; i < length; i++) {
    OTP += digits[crypto.randomInt(0, digits.length)];
  }
  
  return OTP;
};

/**
 * Verify if OTP is valid
 * @param {string} storedOTP - The OTP stored in database
 * @param {string} providedOTP - The OTP provided by user
 * @returns {boolean} Whether OTP is valid
 */
export const verifyOTP = (storedOTP, providedOTP) => {
  return storedOTP === providedOTP;
};

/**
 * Check if OTP is expired
 * @param {Date} expiryDate - OTP expiry date
 * @returns {boolean} Whether OTP is expired
 */
export const isOTPExpired = (expiryDate) => {
  return new Date() > new Date(expiryDate);
}; 