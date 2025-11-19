import { Request, Response } from 'express';
import { BrandingService } from '../../services/admin/branding.service';

const brandingService = new BrandingService();

export class BrandingController {
  async get(req: Request, res: Response) {
    try {
      const surveyId = (req.query.surveyId as string) || 'default-survey-id';
      const branding = await brandingService.getBranding(surveyId);
      res.json(branding);
    } catch (error: any) {
      console.error('Error fetching branding:', error);
      res.status(404).json({ error: error.message || 'Branding not found' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const surveyId = (req.body.surveyId as string) || 'default-survey-id';
      const survey = await brandingService.updateBranding(req.body, surveyId);
      res.json(survey);
    } catch (error: any) {
      console.error('Error updating branding:', error);
      res.status(400).json({ error: error.message || 'Failed to update branding' });
    }
  }
}

