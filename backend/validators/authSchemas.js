import { z } from 'zod';

export const authSchemas = {
  register: z.object({
    body: z.object({
      email: z.string().email('Invalid email address'),
      password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
          'Password must contain at least one uppercase letter, one lowercase letter, and one number'
        )
    })
  }),

  login: z.object({
    body: z.object({
      email: z.string().email('Invalid email address'),
      password: z.string().min(1, 'Password is required')
    })
  }),

  magicLink: z.object({
    body: z.object({
      email: z.string().email('Invalid email address')
    })
  }),

  magicLinkVerify: z.object({
    query: z.object({
      token: z.string().min(1, 'Token is required')
    })
  }),

  sendOTP: z.object({
    body: z.object({
      email: z.string().email('Invalid email address'),
      type: z.enum(['login', 'registration', 'password_reset'])
    })
  }),

  verifyOTP: z.object({
    body: z.object({
      email: z.string().email('Invalid email address'),
      otp: z.string().length(6, 'OTP must be 6 digits'),
      type: z.enum(['login', 'registration', 'password_reset'])
    })
  }),

  forgotPassword: z.object({
    body: z.object({
      email: z.string().email('Invalid email address')
    })
  }),

  resetPassword: z.object({
    body: z.object({
      token: z.string().min(1, 'Token is required'),
      newPassword: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
          'Password must contain at least one uppercase letter, one lowercase letter, and one number'
        )
    })
  }),

  otp: z.object({
    body: z.object({
      email: z.string().email('Invalid email address'),
      otp: z.string().length(6, 'OTP must be 6 digits'),
      type: z.enum(['registration', 'login', 'password_reset'])
    }),
    query: z.object({}).optional(),
    params: z.object({}).optional()
  }),

  refreshToken: z.object({
    body: z.object({
      refreshToken: z.string().min(1, 'Refresh token is required')
    }),
    query: z.object({}).optional(),
    params: z.object({}).optional()
  })
};

/**
 * Validation middleware
 */
export const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      next(createError('Validation Error', 400, error.errors));
    }
  };
}; 