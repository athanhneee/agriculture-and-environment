import { Router } from 'express';
import { SearchController } from './search.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticate, SearchController.globalSearch);

export default router;
