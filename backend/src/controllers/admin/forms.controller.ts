import { Request, Response } from 'express';
import { FormsService } from '../../services/admin/forms.service';

const formsService = new FormsService();

export class FormsController {
  async getAll(req: Request, res: Response) {
    try {
      const { status, type, search } = req.query;
      const filters = {
        status: status as 'draft' | 'published' | 'archived' | undefined,
        type: type as string | undefined,
        search: search as string | undefined,
      };
      const forms = await formsService.getAllForms(filters);
      res.json(forms);
    } catch (error) {
      console.error('Error fetching forms:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const form = await formsService.getFormById(id);
      if (!form) {
        return res.status(404).json({ error: 'Form not found' });
      }
      res.json(form);
    } catch (error) {
      console.error('Error fetching form:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getBySlug(req: Request, res: Response) {
    try {
      const { slug } = req.params;
      const form = await formsService.getFormBySlug(slug);
      if (!form) {
        return res.status(404).json({ error: 'Form not found', code: 'NOT_FOUND' });
      }
      res.json(form);
    } catch (error: any) {
      console.error('Error fetching form by slug:', error);
      // Handle specific error codes
      if (error.message === 'FORM_NOT_PUBLISHED') {
        return res.status(403).json({ 
          error: 'This form is not yet published. Please contact the administrator.', 
          code: 'NOT_PUBLISHED' 
        });
      }
      if (error.message === 'FORM_ARCHIVED') {
        return res.status(410).json({ 
          error: 'This form has been archived and is no longer available.', 
          code: 'ARCHIVED' 
        });
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const { name, type, description, branding, settings } = req.body;
      if (!name) {
        return res.status(400).json({ error: 'Name is required' });
      }
      const form = await formsService.createForm({
        name,
        type,
        description,
        branding,
        settings,
      });
      res.status(201).json(form);
    } catch (error: any) {
      console.error('Error creating form:', error);
      res.status(400).json({ error: error.message || 'Failed to create form' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const form = await formsService.updateForm(id, req.body);
      res.json(form);
    } catch (error: any) {
      console.error('Error updating form:', error);
      res.status(400).json({ error: error.message || 'Failed to update form' });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await formsService.deleteForm(id);
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error deleting form:', error);
      res.status(400).json({ error: error.message || 'Failed to delete form' });
    }
  }

  async duplicate(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name } = req.body;
      const form = await formsService.duplicateForm(id, name);
      res.status(201).json(form);
    } catch (error: any) {
      console.error('Error duplicating form:', error);
      res.status(400).json({ error: error.message || 'Failed to duplicate form' });
    }
  }

  async publish(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const form = await formsService.publishForm(id);
      res.json(form);
    } catch (error: any) {
      console.error('Error publishing form:', error);
      res.status(400).json({ error: error.message || 'Failed to publish form' });
    }
  }

  async unpublish(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const form = await formsService.unpublishForm(id);
      res.json(form);
    } catch (error: any) {
      console.error('Error unpublishing form:', error);
      res.status(400).json({ error: error.message || 'Failed to unpublish form' });
    }
  }
}

