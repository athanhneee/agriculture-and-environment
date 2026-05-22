import { Request, Response } from 'express';
import { CropService } from './crops.service';
import { ApiResponse } from '../../utils/apiResponse';
import { createCropSchema, updateCropSchema } from './crops.validation';

export class CropController {
  static async getCrops(req: Request, res: Response) {
    const result = await CropService.getCrops(req.query, req.user!);
    res.status(200).json(ApiResponse.success('Lấy danh sách cây trồng thành công', result));
  }

  static async getCropById(req: Request, res: Response) {
    try {
      const result = await CropService.getCropById(req.params.id as string, req.user!);
      res.status(200).json(ApiResponse.success('Lấy thông tin cây trồng thành công', result));
    } catch (error: any) {
      res.status(404).json(ApiResponse.error(error.message));
    }
  }

  static async createCrop(req: Request, res: Response) {
    try {
      const validatedData = createCropSchema.parse(req.body);
      const result = await CropService.createCrop(validatedData, req.user!);
      res.status(201).json(ApiResponse.success('Tạo cây trồng thành công', result));
    } catch (error: any) {
      if (error.errors) {
        return res.status(400).json(ApiResponse.error('Lỗi validation', error.errors));
      }
      res.status(400).json(ApiResponse.error(error.message));
    }
  }

  static async updateCrop(req: Request, res: Response) {
    try {
      const validatedData = updateCropSchema.parse(req.body);
      const result = await CropService.updateCrop(req.params.id as string, validatedData, req.user!);
      res.status(200).json(ApiResponse.success('Cập nhật cây trồng thành công', result));
    } catch (error: any) {
      if (error.errors) {
        return res.status(400).json(ApiResponse.error('Lỗi validation', error.errors));
      }
      res.status(400).json(ApiResponse.error(error.message));
    }
  }

  static async deleteCrop(req: Request, res: Response) {
    try {
      await CropService.deleteCrop(req.params.id as string, req.user!);
      res.status(200).json(ApiResponse.success('Xóa cây trồng thành công'));
    } catch (error: any) {
      res.status(400).json(ApiResponse.error(error.message));
    }
  }
}
