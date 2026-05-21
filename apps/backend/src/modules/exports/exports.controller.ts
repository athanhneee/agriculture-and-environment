import { Request, Response } from 'express';
import { ExportsService } from './exports.service';

export class ExportsController {
  static async exportReadings(req: Request, res: Response) {
    const user = req.user!;
    const { farmZoneId, from, to } = req.query as { farmZoneId?: string; from?: string; to?: string };
    
    const workbook = await ExportsService.exportReadings(user, farmZoneId, from, to);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=readings.xlsx');
    
    await workbook.xlsx.write(res);
    res.end();
  }

  static async exportAlerts(req: Request, res: Response) {
    const user = req.user!;
    const { from, to } = req.query as { from?: string; to?: string };
    
    const workbook = await ExportsService.exportAlerts(user, from, to);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=alerts.xlsx');
    
    await workbook.xlsx.write(res);
    res.end();
  }
}
