import { Router } from 'express';
import { QuestionsController } from '../../controllers/admin/questions.controller';
import { authenticateToken } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';
import { createQuestionSchema } from '../../schemas/survey.schema';

const router = Router();
const questionsController = new QuestionsController();

router.get('/', authenticateToken, (req, res) => questionsController.getAll(req, res));
router.get('/:id', authenticateToken, (req, res) => questionsController.getById(req, res));
router.post('/', authenticateToken, validate(createQuestionSchema), (req, res) => questionsController.create(req, res));
router.put('/:id', authenticateToken, (req, res) => questionsController.update(req, res));
router.delete('/:id', authenticateToken, (req, res) => questionsController.delete(req, res));
router.put('/reorder', authenticateToken, (req, res) => questionsController.reorder(req, res));

export default router;

