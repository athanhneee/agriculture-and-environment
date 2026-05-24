import { Router } from 'express';
import { SensorReadingController } from './sensorReadings.controller';
import { authenticate, authorize } from '../../middlewares/auth.middleware';
// import { validate } from '../../middlewares/validate.middleware';
import { validate } from '../auth/auth.validation';
import { getSensorReadingsSchema, createSensorReadingSchema } from './sensorReadings.validation';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

router.use(authenticate);

router.get('/', validate(getSensorReadingsSchema), asyncHandler(SensorReadingController.getReadings));
router.get('/latest', asyncHandler(SensorReadingController.getLatestReadings));
router.post('/', authorize(['ADMIN']), validate(createSensorReadingSchema), asyncHandler(SensorReadingController.createReading));
router.delete('/:id', authorize(['ADMIN']), asyncHandler(SensorReadingController.deleteReading));

export default router;
