import { Router } from 'express';
import { body } from 'express-validator';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

const router = Router();

router.post(
  '/register',
  [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('role')
      .optional()
      .isIn(['admin', 'developer', 'viewer'])
      .withMessage('Invalid role'),
    validate,
  ],
  authController.register
);

router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
    validate,
  ],
  authController.login
);

router.post(
  '/refresh-token',
  [
    body('refreshToken')
      .notEmpty()
      .withMessage('Refresh token is required'),
    validate,
  ],
  authController.refreshToken
);

router.post(
  '/logout',
  authenticate,
  [
    body('refreshToken')
      .notEmpty()
      .withMessage('Refresh token is required'),
    validate,
  ],
  authController.logout
);

router.get('/me', authenticate, authController.getCurrentUser);

export default router;
