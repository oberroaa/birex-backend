import { Router } from 'express';
import { getAllKyc, getPendingKyc, getKycDetails, updateKycStatus } from '../../controllers/admin/kyc.controller.js';

const router = Router();

// Get all KYC applications with filters
router.get('/', getAllKyc);

// Get pending KYC (legacy)
router.get('/pending', getPendingKyc);

// Get KYC details by user ID
router.get('/:userId', getKycDetails);

// Update KYC status (Approve/Reject)
router.patch('/:userId/status', updateKycStatus);

export default router;
