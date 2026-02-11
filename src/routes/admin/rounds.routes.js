import { Router } from 'express';
import { getRounds, createRound, updateRound, getRoundById } from '../../controllers/admin/rounds.controller.js';

const router = Router();

router.get('/', getRounds);
router.get('/:id', getRoundById);
router.post('/', createRound);
router.patch('/:id', updateRound);

export default router;
