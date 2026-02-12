import { Router } from 'express';
import { getPendingKyc, getKycDetails } from '../../controllers/admin/kyc.controller.js';

const router = Router();

router.get('/pending', getPendingKyc);
router.get('/:userId', getKycDetails);

export default router;
