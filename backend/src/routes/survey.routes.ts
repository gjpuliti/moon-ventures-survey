import { Router } from 'express';
import { SurveyController } from '../controllers/survey.controller';
import { validate } from '../middleware/validation.middleware';
import { submitResponseSchema } from '../schemas/survey.schema';

const router = Router();
const surveyController = new SurveyController();

router.get('/', (req, res) => surveyController.getSurvey(req, res));
router.post('/response', validate(submitResponseSchema), (req, res) => surveyController.submitResponse(req, res));
router.get('/resume/:email', (req, res) => surveyController.getResumeData(req, res));

export default router;

