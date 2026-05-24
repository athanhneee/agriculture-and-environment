import { Router } from 'express';
import { StatisticsController } from './statistics.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { getAlertStatsSchema, getReadingStatsSchema } from './statistics.validation';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

router.use(authenticate);

router.get('/overview', asyncHandler(StatisticsController.getOverview));
router.get('/alerts', validate(getAlertStatsSchema), asyncHandler(StatisticsController.getAlerts));
router.get('/readings', validate(getReadingStatsSchema), asyncHandler(StatisticsController.getReadings));

export default router;
