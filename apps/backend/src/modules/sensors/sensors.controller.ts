import { Request, Response } from 'express';
import { SensorService } from './sensors.service';
import { ApiResponse } from '../../utils/apiResponse';
import { createSensorSchema, updateSensorSchema } from './sensors.validation';

export class SensorController {
  static async getSensors(req: Request, res: Response) {
    const result = await SensorService.getSensors(req.query, req.user!);
    res.status(200).json(ApiResponse.success('Lấy danh sách cảm biến thành công', result));
  }

  static async getSensorById(req: Request, res: Response) {
    try {
      const result = await SensorService.getSensorById(req.params.id as string, req.user!);
      res.status(200).json(ApiResponse.success('Lấy thông tin cảm biến thành công', result));
    } catch (error: any) {
      res.status(404).json(ApiResponse.error(error.message));
    }
  }

  static async createSensor(req: Request, res: Response) {
    try {
      const validatedData = createSensorSchema.parse(req.body);
      const result = await SensorService.createSensor(validatedData, req.user!);
      res.status(201).json(ApiResponse.success('Tạo cảm biến thành công', result));
    } catch (error: any) {
      if (error.errors) {
        return res.status(400).json(ApiResponse.error('Lỗi validation', error.errors));
      }
      res.status(400).json(ApiResponse.error(error.message));
    }
  }

  static async updateSensor(req: Request, res: Response) {
    try {
      const validatedData = updateSensorSchema.parse(req.body);
      const result = await SensorService.updateSensor(req.params.id as string, validatedData, req.user!);
      res.status(200).json(ApiResponse.success('Cập nhật cảm biến thành công', result));
    } catch (error: any) {
      if (error.errors) {
        return res.status(400).json(ApiResponse.error('Lỗi validation', error.errors));
      }
      res.status(400).json(ApiResponse.error(error.message));
    }
  }

  static async deleteSensor(req: Request, res: Response) {
    try {
      await SensorService.deleteSensor(req.params.id as string, req.user!);
      res.status(200).json(ApiResponse.success('Xóa cảm biến thành công'));
    } catch (error: any) {
      res.status(400).json(ApiResponse.error(error.message));
    }
  }
}
