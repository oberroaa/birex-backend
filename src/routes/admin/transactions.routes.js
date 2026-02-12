import { Router } from 'express';
import { getTransactions, getTransactionById, updateTransactionStatus } from '../../controllers/admin/transactions.controller.js';

const router = Router();

router.get('/', getTransactions);
router.get('/:id', getTransactionById);
router.patch('/:id/status', updateTransactionStatus);

export default router;
