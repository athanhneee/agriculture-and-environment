import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../../utils/apiResponse';

export const AuthValidation = {
  register: z.object({
    body: z.object({
      name: z.string().min(2, 'Tên phải có ít nhất 2 ký tự'),
      email: z.string().email('Email không hợp lệ'),
      password: z.string()
        .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
        .regex(/^(?=.*[a-zA-Z])(?=.*[0-9])/, 'Mật khẩu phải chứa ít nhất 1 chữ cái và 1 chữ số'),
      confirmPassword: z.string()
    }).refine((data) => data.password === data.confirmPassword, {
      message: 'Mật khẩu xác nhận không khớp',
      path: ['confirmPassword'],
    })
  }),

  login: z.object({
    body: z.object({
      email: z.string().email('Email không hợp lệ'),
      password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
    })
  })
};

// Middleware bọc Zod để validate request
export const validate = (schema: z.AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error: any) {
      res.status(400).json(ApiResponse.error('Lỗi kiểm tra dữ liệu đầu vào (Validation Error)', error.errors));
    }
  };
};