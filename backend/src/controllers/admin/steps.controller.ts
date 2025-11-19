import { Request, Response } from 'express';
import { StepsService } from '../../services/admin/steps.service';

const stepsService = new StepsService();

export class StepsController {
  async getAll(req: Request, res: Response) {
    try {
      const steps = await stepsService.getAllSteps();
      res.json(steps);
    } catch (error) {
      console.error('Error fetching steps:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const step = await stepsService.getStepById(id);
      if (!step) {
        return res.status(404).json({ error: 'Step not found' });
      }
      res.json(step);
    } catch (error) {
      console.error('Error fetching step:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const step = await stepsService.createStep(req.body);
      res.status(201).json(step);
    } catch (error: any) {
      console.error('Error creating step:', error);
      res.status(400).json({ error: error.message || 'Failed to create step' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const step = await stepsService.updateStep(id, req.body);
      res.json(step);
    } catch (error: any) {
      console.error('Error updating step:', error);
      res.status(400).json({ error: error.message || 'Failed to update step' });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await stepsService.deleteStep(id);
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error deleting step:', error);
      res.status(400).json({ error: error.message || 'Failed to delete step' });
    }
  }
}

