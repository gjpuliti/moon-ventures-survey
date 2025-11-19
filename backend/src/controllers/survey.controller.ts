import { Request, Response } from 'express';
import { SurveyService } from '../services/survey.service';
import { HubSpotService } from '../services/integrations/hubspot.service';
import { GoogleSheetsService } from '../services/integrations/googlesheets.service';
import { prisma } from '../utils/prisma';

const surveyService = new SurveyService();
const hubspotService = new HubSpotService();
const googleSheetsService = new GoogleSheetsService();

export class SurveyController {
  async getSurvey(req: Request, res: Response) {
    try {
      const surveyConfig = await surveyService.getActiveSurvey();
      
      if (!surveyConfig) {
        return res.status(404).json({ error: 'No active survey found' });
      }

      res.json(surveyConfig);
    } catch (error) {
      console.error('Error fetching survey:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async submitResponse(req: Request, res: Response) {
    try {
      const { email, stepNumber, responses, surveyId } = req.body;

      if (!email || !stepNumber || !responses || !surveyId) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const result = await surveyService.saveResponse(email, surveyId, stepNumber, responses);

      // Sync to HubSpot (non-blocking)
      try {
        const survey = await prisma.survey.findUnique({
          where: { id: surveyId },
          include: {
            steps: {
              include: {
                questions: true,
              },
            },
          },
        });

        if (survey) {
          const step = survey.steps.find((s) => s.order === stepNumber);
          if (step) {
            const hubspotResponses = responses.map((r: { questionId: string; value: string | string[] }) => {
              const question = step.questions.find((q) => q.id === r.questionId);
              return {
                questionId: r.questionId,
                hubspotProperty: question?.hubspotProperty || '',
                value: r.value,
              };
            }).filter((r: { hubspotProperty: string }) => r.hubspotProperty);

            // Run HubSpot sync asynchronously
            hubspotService.syncSurveyResponse(email, hubspotResponses).catch((err) => {
              console.error('HubSpot sync failed:', err);
            });

            // Sync to Google Sheets if configured
            const spreadsheetId = process.env.GOOGLE_SHEET_ID;
            if (spreadsheetId) {
              googleSheetsService.syncSurveyResponse(spreadsheetId, email, hubspotResponses).catch((err) => {
                console.error('Google Sheets sync failed:', err);
              });
            }
          }
        }
      } catch (error) {
        console.error('Error syncing integrations:', error);
        // Don't fail the request if sync fails
      }

      res.json({
        success: true,
        currentStep: result.currentStep,
        isCompleted: result.isCompleted,
      });
    } catch (error) {
      console.error('Error saving response:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getResumeData(req: Request, res: Response) {
    try {
      const { email } = req.params;
      const surveyId = req.query.surveyId as string || 'default-survey-id';

      const response = await surveyService.getIncompleteSurvey(email, surveyId);

      if (!response) {
        return res.status(404).json({ error: 'No incomplete survey found' });
      }

      res.json(response);
    } catch (error) {
      console.error('Error fetching resume data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

