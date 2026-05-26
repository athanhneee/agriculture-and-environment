import { Request, Response, NextFunction } from 'express';
import { AlertService } from './alerts.service';
import { ApiResponse } from '../../utils/apiResponse';

export class AlertsController {
  static async getAlerts(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page ?? 1);
      const limit = Number(req.query.limit ?? 20);

      const result = await AlertService.getAlerts(
        {
          status: req.query.status as string | undefined,
          severity: req.query.severity as string | undefined,
          type: req.query.type as string | undefined,
          farmZoneId: req.query.farmZoneId as string | undefined,
        },
        { page, limit },
        req.user!,
      );

      return res
        .status(200)
        .json(ApiResponse.success('Lấy danh sách cảnh báo thành công', result));
    } catch (error) {
      return next(error);
    }
  }

  static async getAlertById(req: Request, res: Response, next: NextFunction) {
    try {
      const alert = await AlertService.getAlertById(req.params.id as string, req.user!);
      return res
        .status(200)
        .json(ApiResponse.success('Lấy chi tiết cảnh báo thành công', alert));
    } catch (error) {
      return next(error);
    }
  }

  static async acknowledgeAlert(req: Request, res: Response, next: NextFunction) {
    try {
      const alert = await AlertService.acknowledgeAlert(req.params.id as string, req.user!);
      return res
        .status(200)
        .json(ApiResponse.success('Xác nhận cảnh báo thành công', alert));
    } catch (error) {
      return next(error);
    }
  }

  static async resolveAlert(req: Request, res: Response, next: NextFunction) {
    try {
      const alert = await AlertService.resolveAlert(req.params.id as string, req.user!);
      return res
        .status(200)
        .json(ApiResponse.success('Đánh dấu đã xử lý cảnh báo thành công', alert));
    } catch (error) {
      return next(error);
    }
  }

  static async deleteAlert(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AlertService.deleteAlert(req.params.id as string, req.user!);
      return res
        .status(200)
        .json(ApiResponse.success('Xóa cảnh báo thành công', result));
    } catch (error) {
      return next(error);
    }
  }
}

export const AlertController = AlertsController;
