import { Router } from 'express';
import { StepsController } from '../../controllers/admin/steps.controller';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = Router();
const stepsController = new StepsController();

router.get('/', authenticateToken, (req, res) => stepsController.getAll(req, res));
router.get('/:id', authenticateToken, (req, res) => stepsController.getById(req, res));
router.post('/', authenticateToken, (req, res) => stepsController.create(req, res));
router.put('/:id', authenticateToken, (req, res) => stepsController.update(req, res));
router.delete('/:id', authenticateToken, (req, res) => stepsController.delete(req, res));

export default router;

