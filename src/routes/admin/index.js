import { Router } from 'express';
import authMiddleware from '../../middleware/auth.middleware.js';
import adminMiddleware from '../../middleware/admin.middleware.js';

import dashboardRoutes from './dashboard.routes.js';
import usersRoutes from './users.routes.js';
import transactionsRoutes from './transactions.routes.js';
import kycRoutes from './kyc.routes.js';
import roundsRoutes from './rounds.routes.js';
import emailRoutes from './email.routes.js';


const router = Router();

// Apply auth and admin check to all admin routes
router.use(authMiddleware);
router.use(adminMiddleware);

router.use('/dashboard', dashboardRoutes);
router.use('/users', usersRoutes);
router.use('/transactions', transactionsRoutes);
router.use('/kyc', kycRoutes);
router.use('/rounds', roundsRoutes);
router.use('/email', emailRoutes);

export default router;