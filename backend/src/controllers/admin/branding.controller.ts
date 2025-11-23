import { Request, Response } from 'express';
import { BrandingService } from '../../services/admin/branding.service';

const brandingService = new BrandingService();

export class BrandingController {
  async get(req: Request, res: Response) {
    try {
      const formId = (req.query.formId as string) || req.query.surveyId as string;
      if (!formId) {
        // Backward compatibility - get default form
        const branding = await brandingService.getBrandingForDefault();
        return res.json(branding);
      }
      const branding = await brandingService.getBranding(formId);
      res.json(branding);
    } catch (error: any) {
      console.error('Error fetching branding:', error);
      res.status(404).json({ error: error.message || 'Branding not found' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const formId = (req.body.formId as string) || req.body.surveyId as string;
      if (!formId) {
        return res.status(400).json({ error: 'formId is required' });
      }
      const { formId: _, surveyId: __, ...brandingData } = req.body;
      const form = await brandingService.updateBranding(formId, brandingData);
      res.json(form);
    } catch (error: any) {
      console.error('Error updating branding:', error);
      res.status(400).json({ error: error.message || 'Failed to update branding' });
    }
  }
}

