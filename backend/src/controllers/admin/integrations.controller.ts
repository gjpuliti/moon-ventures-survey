import { Request, Response } from 'express';
import { HubSpotService } from '../../services/integrations/hubspot.service';
import { HubSpotAccount } from '../../config/hubspotAccounts';
import { prisma } from '../../utils/prisma';

const hubspotService = new HubSpotService();

export class IntegrationsController {
  async getHubSpotProperties(req: Request, res: Response) {
    try {
      // Get account from query parameter or formId
      let account: HubSpotAccount = (req.query.account as HubSpotAccount) || 'minimal';
      
      // If formId is provided, get account from form
      if (req.query.formId) {
        const form = await prisma.form.findUnique({
          where: { id: req.query.formId as string },
          select: { hubspotAccount: true },
        });
        if (form?.hubspotAccount) {
          account = form.hubspotAccount as HubSpotAccount;
        }
      }

      // Validate account
      if (account !== 'minimal' && account !== 'hoomy') {
        account = 'minimal';
      }

      const properties = await hubspotService.fetchHubSpotProperties(account);
      // Always return 200 with properties array (empty if not configured)
      res.json(properties);
    } catch (error: any) {
      console.error('Error fetching HubSpot properties:', error);
      // Return empty array instead of 500 error
      res.json([]);
    }
  }

  async testHubSpotConnection(req: Request, res: Response) {
    try {
      // Get account from query parameter
      let account: HubSpotAccount = (req.query.account as HubSpotAccount) || 'minimal';
      
      // Validate account
      if (account !== 'minimal' && account !== 'hoomy') {
        account = 'minimal';
      }

      // Try to fetch properties as a connection test
      const properties = await hubspotService.fetchHubSpotProperties(account);
      // Check if HubSpot is configured (properties array will be empty if not configured)
      if (properties.length === 0) {
        res.json({ 
          success: false, 
          error: `HubSpot is not configured for ${account} account. Please configure the tokens.` 
        });
      } else {
        res.json({ success: true, message: `HubSpot connection successful for ${account} account` });
      }
    } catch (error: any) {
      console.error('HubSpot connection test failed:', error);
      res.json({ 
        success: false, 
        error: error.message || 'Failed to connect to HubSpot' 
      });
    }
  }

  async clearHubSpotCache(req: Request, res: Response) {
    try {
      const account = req.query.account as HubSpotAccount | undefined;
      hubspotService.clearCache(account);
      res.json({ success: true, message: `Cache cleared${account ? ` for ${account}` : ' for all accounts'}` });
    } catch (error: any) {
      console.error('Error clearing cache:', error);
      res.status(500).json({ error: 'Failed to clear cache' });
    }
  }
}

