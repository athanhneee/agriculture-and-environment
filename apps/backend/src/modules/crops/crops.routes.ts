import { Router } from 'express';
import { CropController } from './crops.controller';
import { authenticate } from '../../middlewares/auth.middleware';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler(CropController.getCrops));
router.get('/:id', asyncHandler(CropController.getCropById));
router.post('/', asyncHandler(CropController.createCrop));
router.patch('/:id', asyncHandler(CropController.updateCrop));

// Cho phép USER xóa cây thuộc vùng trồng của họ.
// CropService đã kiểm tra quyền sở hữu.
router.delete('/:id', asyncHandler(CropController.deleteCrop));

export default router;