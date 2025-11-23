import { Request, Response } from 'express';
import { AnalyticsService } from '../../services/admin/analytics.service';

const analyticsService = new AnalyticsService();

export class AnalyticsController {
  async getAnalytics(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { startDate, endDate } = req.query;

      let dateRange;
      if (startDate && endDate) {
        dateRange = {
          start: new Date(startDate as string),
          end: new Date(endDate as string),
        };
      }

      const analytics = await analyticsService.getFormAnalytics(id, dateRange);
      res.json(analytics);
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch analytics' });
    }
  }

  async exportResponses(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const format = (req.query.format as 'csv' | 'json') || 'csv';

      const data = await analyticsService.exportResponses(id, format);

      res.setHeader('Content-Type', format === 'csv' ? 'text/csv' : 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="form-${id}-responses.${format}"`);
      res.send(data);
    } catch (error: any) {
      console.error('Error exporting responses:', error);
      res.status(500).json({ error: error.message || 'Failed to export responses' });
    }
  }
}

