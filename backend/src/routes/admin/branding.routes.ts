import { Router } from 'express';
import { BrandingController } from '../../controllers/admin/branding.controller';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = Router();
const brandingController = new BrandingController();

router.get('/', authenticateToken, (req, res) => brandingController.get(req, res));
router.put('/', authenticateToken, (req, res) => brandingController.update(req, res));

export default router;

