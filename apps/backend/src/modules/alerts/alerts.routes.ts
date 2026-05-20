import { Router } from 'express';
import { AlertController } from './alerts.controller';
import { authenticate, authorize } from '../../middlewares/auth.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { getAlertsSchema } from './alerts.validation';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

router.use(authenticate);

router.get('/', validate(getAlertsSchema), asyncHandler(AlertController.getAlerts));
router.get('/:id', asyncHandler(AlertController.getAlertById));
router.patch('/:id/acknowledge', asyncHandler(AlertController.acknowledgeAlert));
router.patch('/:id/resolve', asyncHandler(AlertController.resolveAlert));
router.delete('/:id', authorize(['ADMIN']), asyncHandler(AlertController.deleteAlert));

export default router;
