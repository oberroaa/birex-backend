import { Router } from 'express';
import { getUsers, getUserById, updateKycStatus } from '../../controllers/admin/users.controller.js';

const router = Router();

router.get('/', getUsers);
router.get('/:id', getUserById);
router.patch('/:id/kyc-status', updateKycStatus);

export default router;
