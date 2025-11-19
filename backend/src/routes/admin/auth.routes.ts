import { Router } from 'express';
import { AuthController } from '../../controllers/admin/auth.controller';
import { authenticateToken } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validation.middleware';
import { loginSchema } from '../../schemas/survey.schema';
import { loginRateLimiter } from '../../middleware/rateLimiter.middleware';

const router = Router();
const authController = new AuthController();

router.post('/login', loginRateLimiter, validate(loginSchema), (req, res) => authController.login(req, res));
router.get('/me', authenticateToken, (req, res) => authController.getMe(req, res));

export default router;

