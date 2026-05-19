import { Router } from 'express';
import { SensorController } from './sensors.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler(SensorController.getSensors));
router.get('/:id', asyncHandler(SensorController.getSensorById));
router.post('/', asyncHandler(SensorController.createSensor));
router.patch('/:id', asyncHandler(SensorController.updateSensor));
router.delete('/:id', asyncHandler(SensorController.deleteSensor));

export default router;
