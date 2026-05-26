import { Router } from 'express';
import { FarmZoneController } from './farm-zones.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler(FarmZoneController.getFarmZones));
router.get('/:id', asyncHandler(FarmZoneController.getFarmZoneById));

// Cho phép USER tạo/sửa/xóa vùng trồng của chính họ.
// Service đã kiểm tra quyền ownerId, ADMIN vẫn có toàn quyền.
router.post('/', asyncHandler(FarmZoneController.createFarmZone));
router.patch('/:id', asyncHandler(FarmZoneController.updateFarmZone));
router.delete('/:id', asyncHandler(FarmZoneController.deleteFarmZone));

export default router;