import jwt from 'jsonwebtoken';
import { createError } from '../utils/errorUtils';

/**
 * Middleware to verify JWT access token
 */
export const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw createError('No token provided', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    next(createError('Invalid token', 401));
  }
};

/**
 * Middleware to check user roles
 * @param {string[]} roles - Allowed roles
 */
export const checkRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      next(createError('Unauthorized', 403));
      return;
    }
    next();
  };
}; 