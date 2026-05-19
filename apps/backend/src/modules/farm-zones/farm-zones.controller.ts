import { Request, Response } from 'express';
import { FarmZoneService } from './farm-zones.service';
import { ApiResponse } from '../../utils/apiResponse';
import { createFarmZoneSchema, updateFarmZoneSchema } from './farm-zones.validation';

export class FarmZoneController {
  static async getFarmZones(req: Request, res: Response) {
    const result = await FarmZoneService.getFarmZones(req.query, req.user!);
    res.status(200).json(ApiResponse.success('Lấy danh sách vùng canh tác thành công', result));
  }

  static async getFarmZoneById(req: Request, res: Response) {
    try {
      const result = await FarmZoneService.getFarmZoneById(req.params.id as string, req.user!);
      res.status(200).json(ApiResponse.success('Lấy thông tin vùng canh tác thành công', result));
    } catch (error: any) {
      res.status(404).json(ApiResponse.error(error.message));
    }
  }

  static async createFarmZone(req: Request, res: Response) {
    try {
      const validatedData = createFarmZoneSchema.parse(req.body);
      const result = await FarmZoneService.createFarmZone(validatedData, req.user!);
      res.status(201).json(ApiResponse.success('Tạo vùng canh tác thành công', result));
    } catch (error: any) {
      if (error.errors) {
        return res.status(400).json(ApiResponse.error('Lỗi validation', error.errors));
      }
      res.status(400).json(ApiResponse.error(error.message));
    }
  }

  static async updateFarmZone(req: Request, res: Response) {
    try {
      const validatedData = updateFarmZoneSchema.parse(req.body);
      const result = await FarmZoneService.updateFarmZone(req.params.id as string, validatedData, req.user!);
      res.status(200).json(ApiResponse.success('Cập nhật vùng canh tác thành công', result));
    } catch (error: any) {
      if (error.errors) {
        return res.status(400).json(ApiResponse.error('Lỗi validation', error.errors));
      }
      res.status(400).json(ApiResponse.error(error.message));
    }
  }

  static async deleteFarmZone(req: Request, res: Response) {
    try {
      await FarmZoneService.deleteFarmZone(req.params.id as string, req.user!);
      res.status(200).json(ApiResponse.success('Xóa vùng canh tác thành công'));
    } catch (error: any) {
      res.status(400).json(ApiResponse.error(error.message));
    }
  }
}
