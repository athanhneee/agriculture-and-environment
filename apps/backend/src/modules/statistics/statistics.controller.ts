import { Request, Response } from 'express';
import { StatisticsService } from './statistics.service';
import { ApiResponse } from '../../utils/apiResponse';

export class StatisticsController {
  static async getOverview(req: Request, res: Response) {
    const user = req.user!;
    const overview = await StatisticsService.getOverview(user);
    res.status(200).json(ApiResponse.success('Lấy thống kê tổng quan thành công', overview));
  }

  static async getAlerts(req: Request, res: Response) {
    const user = req.user!;
    const { from, to } = req.query as { from?: string; to?: string };
    
    const stats = await StatisticsService.getAlertStats(user, from, to);
    res.status(200).json(ApiResponse.success('Lấy thống kê cảnh báo thành công', stats));
  }

  static async getReadings(req: Request, res: Response) {
    const user = req.user!;
    const stats = await StatisticsService.getReadingStats(req.query, user);
    res.status(200).json(ApiResponse.success('Lấy thống kê cảm biến thành công', stats));
  }
}
