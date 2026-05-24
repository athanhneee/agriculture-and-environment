import rateLimit from 'express-rate-limit';
import { ApiResponse } from '../utils/apiResponse';

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 10, 
  handler: (req, res) => {
    res.status(429).json(ApiResponse.error('Quá nhiều yêu cầu, vui lòng thử lại sau 15 phút.'));
  },
});