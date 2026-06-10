import { Router } from 'express';
import { SensorController } from './sensors.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { asyncHandler } from '../../utils/asyncHandler';

const sensorRoutes = Router();

sensorRoutes.use(authenticate);

sensorRoutes.get('/', asyncHandler(SensorController.getSensors));
sensorRoutes.get('/:id', asyncHandler(SensorController.getSensorById));

// Cho phép USER quản lý cảm biến thuộc vùng trồng của họ.
// SensorService đã kiểm tra ownerId.
sensorRoutes.post('/', asyncHandler(SensorController.createSensor));
sensorRoutes.patch('/:id', asyncHandler(SensorController.updateSensor));
sensorRoutes.delete('/:id', asyncHandler(SensorController.deleteSensor));

export default sensorRoutes;