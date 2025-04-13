import jwt from 'jsonwebtoken';
import { createError } from '../utils/errorUtils.js';
import { authService } from '../services/auth/auth.service.js';

/**
 * Authentication middleware
 */
export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw createError('No token provided', 401);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw createError('Invalid token format', 401);
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        // Try to refresh the token
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
          throw createError('Token expired', 401);
        }

        const { accessToken, newRefreshToken } = await authService.refreshTokens(refreshToken);

        // Set new refresh token
        res.cookie('refreshToken', newRefreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000
        });

        // Set new access token in response header
        res.setHeader('X-New-Access-Token', accessToken);

        // Verify new token and continue
        const newDecoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
        req.user = newDecoded;
        next();
      } else {
        throw createError('Invalid token', 401);
      }
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Role-based authorization middleware
 */
export const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      throw createError('Unauthorized', 401);
    }

    if (roles.length && !roles.includes(req.user.role)) {
      throw createError('Forbidden', 403);
    }

    next();
  };
}; 