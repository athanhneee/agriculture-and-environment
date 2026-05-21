import { Request, Response } from 'express';
import { AlertService } from './alerts.service';
import { ApiResponse } from '../../utils/apiResponse';

export class AlertController {
  static async getAlerts(req: Request, res: Response) {
    const { farmZoneId, status, severity, type, from, to, page = '1', limit = '10' } = req.query as any;
    
    const result = await AlertService.getAlerts(
      { farmZoneId, status, severity, type, from, to },
      { page: parseInt(page, 10), limit: parseInt(limit, 10) }
    );
    
    res.status(200).json(ApiResponse.success('Lấy danh sách cảnh báo thành công', result));
  }

  static async getAlertById(req: Request, res: Response) {
    const alert = await AlertService.getAlertById(req.params.id as string);
    res.status(200).json(ApiResponse.success('Lấy chi tiết cảnh báo thành công', alert));
  }

  static async acknowledgeAlert(req: Request, res: Response) {
    const alert = await AlertService.acknowledgeAlert(req.params.id as string);
    res.status(200).json(ApiResponse.success('Đã xác nhận cảnh báo', alert));
  }

  static async resolveAlert(req: Request, res: Response) {
    const alert = await AlertService.resolveAlert(req.params.id as string);
    res.status(200).json(ApiResponse.success('Đã xử lý cảnh báo', alert));
  }

  static async deleteAlert(req: Request, res: Response) {
    await AlertService.deleteAlert(req.params.id as string);
    res.status(200).json(ApiResponse.success('Đã xóa cảnh báo', null));
  }
}
