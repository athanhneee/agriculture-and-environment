import { Router } from 'express';
import { FarmZoneController } from './farm-zones.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

// Tất cả endpoints đều yêu cầu authentication
router.use(authenticate);

router.get('/', asyncHandler(FarmZoneController.getFarmZones));
router.get('/:id', asyncHandler(FarmZoneController.getFarmZoneById));
router.post('/', asyncHandler(FarmZoneController.createFarmZone));
router.patch('/:id', asyncHandler(FarmZoneController.updateFarmZone));
router.delete('/:id', asyncHandler(FarmZoneController.deleteFarmZone));

export default router;
