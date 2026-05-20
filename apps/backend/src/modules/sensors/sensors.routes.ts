import { Router } from 'express';
import { SensorController } from './sensors.controller';
import { authenticate, authorize } from '../../middlewares/auth.middleware';
import { asyncHandler } from '../../utils/asyncHandler';

const sensorRoutes = Router();

sensorRoutes.use(authenticate);

sensorRoutes.get('/', asyncHandler(SensorController.getSensors));
sensorRoutes.get('/:id', asyncHandler(SensorController.getSensorById));
sensorRoutes.post('/', authorize(['ADMIN']), asyncHandler(SensorController.createSensor));
sensorRoutes.patch('/:id', authorize(['ADMIN']), asyncHandler(SensorController.updateSensor));
sensorRoutes.delete('/:id', authorize(['ADMIN']), asyncHandler(SensorController.deleteSensor));

export default sensorRoutes;
