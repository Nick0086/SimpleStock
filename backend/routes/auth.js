import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import { authSchemas } from '../validators/authSchemas.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = Router();

// Regular auth routes
router.post('/register', 
  validateRequest(authSchemas.register),
  authController.register
);

router.post('/login',
  validateRequest(authSchemas.login),
  authController.login
);

// Magic link routes
router.post('/magic-link',
  validateRequest(authSchemas.magicLink),
  authController.requestMagicLink
);

router.get('/magic-link/verify',
  validateRequest(authSchemas.magicLinkVerify),
  authController.verifyMagicLink
);

// OTP routes
router.post('/send-otp',
  validateRequest(authSchemas.sendOTP),
  authController.sendOTP
);

router.post('/verify-otp',
  validateRequest(authSchemas.verifyOTP),
  authController.verifyOTP
);

// Password reset routes
router.post('/forgot-password',
  validateRequest(authSchemas.forgotPassword),
  authController.forgotPassword
);

router.post('/reset-password',
  validateRequest(authSchemas.resetPassword),
  authController.resetPassword
);

// Protected routes
router.get('/me', 
  authMiddleware,
  authController.getCurrentUser
);

router.post('/logout', 
  authMiddleware,
  authController.logout
);

router.post('/refresh',
  authController.refresh
);

router.get('/verify-email',
  validateRequest(authSchemas.verifyEmail),
  authController.verifyEmail
);

export default router; 