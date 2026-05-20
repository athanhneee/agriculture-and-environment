import { Router } from 'express';
import { FarmZoneController } from './farm-zones.controller';
import { authenticate, authorize } from '../../middlewares/auth.middleware';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

// Tất cả endpoints đều yêu cầu authentication
router.use(authenticate);

router.get('/', asyncHandler(FarmZoneController.getFarmZones));
router.get('/:id', asyncHandler(FarmZoneController.getFarmZoneById));
router.post('/', authorize(['ADMIN']), asyncHandler(FarmZoneController.createFarmZone));
router.patch('/:id', authorize(['ADMIN']), asyncHandler(FarmZoneController.updateFarmZone));
router.delete('/:id', authorize(['ADMIN']), asyncHandler(FarmZoneController.deleteFarmZone));

export default router;
