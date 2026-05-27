import { Router } from 'express';
import { UsersController } from './users.controller';
import { authenticate, authorize } from '../../middlewares/auth.middleware';

const router = Router();

// Yêu cầu ADMIN cho tất cả các routes quản lý người dùng
router.use(authenticate);
router.use(authorize(['ADMIN']));

router.get('/', UsersController.listUsers);
router.post('/', UsersController.createUser);
router.patch('/:id', UsersController.updateUser);
router.delete('/:id', UsersController.deleteUser);

export default router;
