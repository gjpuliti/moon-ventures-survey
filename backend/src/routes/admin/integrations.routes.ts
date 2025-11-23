import { Router } from 'express';
import { IntegrationsController } from '../../controllers/admin/integrations.controller';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = Router();
const integrationsController = new IntegrationsController();

router.get('/hubspot/properties', authenticateToken, (req, res) => 
  integrationsController.getHubSpotProperties(req, res)
);
router.get('/hubspot/test', authenticateToken, (req, res) => 
  integrationsController.testHubSpotConnection(req, res)
);
router.post('/hubspot/cache/clear', authenticateToken, (req, res) => 
  integrationsController.clearHubSpotCache(req, res)
);

export default router;

