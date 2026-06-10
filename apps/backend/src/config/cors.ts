import { CorsOptions } from 'cors';
import { env } from './env';

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Cho phép gọi API nếu không có origin (như Postman), 
    // hoặc origin từ localhost, hoặc bất kỳ domain nào của Vercel
    if (!origin || origin.includes('vercel.app') || origin.includes('localhost') || origin === env.clientUrl) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Bắt buộc phải có để gửi nhận cookie
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
};