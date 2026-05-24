import { Router } from 'express';
import { CropController } from './crops.controller';
import { authenticate, authorize } from '../../middlewares/auth.middleware';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();

router.use(authenticate);

router.get('/', asyncHandler(CropController.getCrops));
router.get('/:id', asyncHandler(CropController.getCropById));
router.post('/', asyncHandler(CropController.createCrop));
router.patch('/:id', asyncHandler(CropController.updateCrop));
router.delete('/:id', authorize(['ADMIN']), asyncHandler(CropController.deleteCrop));

export default router;
