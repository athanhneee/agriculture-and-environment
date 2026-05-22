import { Request, Response } from 'express';
import { SensorReadingService } from './sensorReadings.service';
import { ApiResponse } from '../../utils/apiResponse';

export class SensorReadingController {
  static async getReadings(req: Request, res: Response) {
    const { farmZoneId, sensorId, from, to, page = '1', limit = '10' } = req.query as any;
    
    const result = await SensorReadingService.getReadings(
      { farmZoneId, sensorId, from, to },
      { page: parseInt(page, 10), limit: parseInt(limit, 10) }
    );
    
    res.status(200).json(ApiResponse.success('Sensor readings retrieved successfully', result));
  }

  static async getLatestReadings(req: Request, res: Response) {
    const latest = await SensorReadingService.getLatestReadings();
    res.status(200).json(ApiResponse.success('Latest sensor readings retrieved successfully', latest));
  }

  static async createReading(req: Request, res: Response) {
    const reading = await SensorReadingService.createReading(req.body);
    res.status(201).json(ApiResponse.success('Sensor reading created successfully', reading));
  }

  static async deleteReading(req: Request, res: Response) {
    const { id } = req.params;
    await SensorReadingService.deleteReading(id as string);
    res.status(200).json(ApiResponse.success('Sensor reading deleted successfully', null));
  }
}
