import csrf from 'csurf';
import { createError } from '../utils/errorUtils.js';

/**
 * CSRF protection middleware
 */
export const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
});

/**
 * CSRF error handler
 */
export const handleCSRFError = (err, req, res, next) => {
  if (err.code !== 'EBADCSRFTOKEN') {
    return next(err);
  }

  next(createError('Invalid CSRF token', 403));
};

/**
 * CSRF token provider
 */
export const provideCSRFToken = (req, res, next) => {
  res.cookie('XSRF-TOKEN', req.csrfToken(), {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  next();
}; 