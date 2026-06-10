import { Router } from 'express';
import { AuthController } from './auth.controller';
import { AuthValidation, validate } from './auth.validation';
import { asyncHandler } from '../../utils/asyncHandler';
import { authenticate } from '../../middlewares/auth.middleware';
import { authRateLimiter } from '../../middlewares/rateLimit.middleware';

const router = Router();

router.post('/register', authRateLimiter, validate(AuthValidation.register), asyncHandler(AuthController.register));
router.post('/login', authRateLimiter, validate(AuthValidation.login), asyncHandler(AuthController.login));
router.post('/refresh', asyncHandler(AuthController.refresh));
router.post('/logout', asyncHandler(AuthController.logout));

router.get('/me', authenticate, asyncHandler(AuthController.getMe));
router.put('/change-password', authenticate, validate(AuthValidation.changePassword), asyncHandler(AuthController.changePassword));

export default router;