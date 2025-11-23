import { Router } from 'express';
import { AnalyticsController } from '../../controllers/admin/analytics.controller';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = Router();
const analyticsController = new AnalyticsController();

router.get('/forms/:id/analytics', authenticateToken, (req, res) =>
  analyticsController.getAnalytics(req, res)
);
router.get('/forms/:id/analytics/export', authenticateToken, (req, res) =>
  analyticsController.exportResponses(req, res)
);

export default router;

