import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/apiResponse';

export const validate = (schema: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error: any) {
      const errorMessage = error.errors?.[0]?.message || 'Lỗi kiểm tra dữ liệu đầu vào (Validation Error)';
      res.status(400).json(ApiResponse.error(errorMessage, error.errors));
    }
  };
};
