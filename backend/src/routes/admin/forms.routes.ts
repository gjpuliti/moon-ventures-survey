import { Router } from 'express';
import { FormsController } from '../../controllers/admin/forms.controller';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = Router();
const formsController = new FormsController();

router.get('/', authenticateToken, (req, res) => formsController.getAll(req, res));
router.get('/:id', authenticateToken, (req, res) => formsController.getById(req, res));
router.post('/', authenticateToken, (req, res) => formsController.create(req, res));
router.put('/:id', authenticateToken, (req, res) => formsController.update(req, res));
router.delete('/:id', authenticateToken, (req, res) => formsController.delete(req, res));
router.post('/:id/duplicate', authenticateToken, (req, res) => formsController.duplicate(req, res));
router.post('/:id/publish', authenticateToken, (req, res) => formsController.publish(req, res));
router.post('/:id/unpublish', authenticateToken, (req, res) => formsController.unpublish(req, res));

export default router;

