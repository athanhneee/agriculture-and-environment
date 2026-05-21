import { Router } from 'express';
import { ExportsController } from './exports.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { exportAlertsSchema, exportReadingsSchema } from './exports.validation';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

router.use(authenticate);

router.get('/readings.xlsx', validate(exportReadingsSchema), asyncHandler(ExportsController.exportReadings));
router.get('/alerts.xlsx', validate(exportAlertsSchema), asyncHandler(ExportsController.exportAlerts));

export default router;
