import { Router } from 'express';
import { getDashboardStats } from '../../controllers/admin/dashboard.controller.js';

const router = Router();

router.get('/stats', getDashboardStats);

export default router;
