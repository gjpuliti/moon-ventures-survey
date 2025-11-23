import { Request, Response } from 'express';
import { QuestionsService } from '../../services/admin/questions.service';

const questionsService = new QuestionsService();

export class QuestionsController {
  async getAll(req: Request, res: Response) {
    try {
      const formId = req.query.formId as string | undefined;
      const questions = await questionsService.getAllQuestions(formId);
      res.json(questions);
    } catch (error) {
      console.error('Error fetching questions:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const question = await questionsService.getQuestionById(id);
      if (!question) {
        return res.status(404).json({ error: 'Question not found' });
      }
      res.json(question);
    } catch (error) {
      console.error('Error fetching question:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const question = await questionsService.createQuestion(req.body);
      res.status(201).json(question);
    } catch (error: any) {
      console.error('Error creating question:', error);
      res.status(400).json({ error: error.message || 'Failed to create question' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const question = await questionsService.updateQuestion(id, req.body);
      res.json(question);
    } catch (error: any) {
      console.error('Error updating question:', error);
      res.status(400).json({ error: error.message || 'Failed to update question' });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await questionsService.deleteQuestion(id);
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error deleting question:', error);
      res.status(400).json({ error: error.message || 'Failed to delete question' });
    }
  }

  async reorder(req: Request, res: Response) {
    try {
      const { updates } = req.body;
      if (!Array.isArray(updates)) {
        return res.status(400).json({ error: 'Updates must be an array' });
      }
      await questionsService.reorderQuestions(updates);
      res.json({ success: true });
    } catch (error) {
      console.error('Error reordering questions:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

