import { prisma } from '../../utils/prisma';

/**
 * Generates a URL-friendly slug from a form name
 * @param name - The form name to convert to a slug
 * @returns A URL-friendly slug string
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Ensures a slug is unique by appending a counter if needed
 * @param baseSlug - The base slug to check
 * @param excludeId - Optional form ID to exclude from uniqueness check (for updates)
 * @returns A unique slug
 */
async function ensureUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.form.findUnique({
      where: { slug },
    });

    if (!existing || existing.id === excludeId) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

/**
 * Service for managing forms (CRUD operations, publishing, duplication)
 */
export class FormsService {
  /**
   * Get all forms with optional filtering
   * @param filters - Optional filters for status, type, and search query
   * @returns Array of forms with response counts
   */
  async getAllForms(filters?: {
    status?: 'draft' | 'published' | 'archived';
    type?: string;
    search?: string;
  }) {
    const where: any = {};

    if (filters?.status === 'draft') {
      where.isPublished = false;
      where.isActive = true;
    } else if (filters?.status === 'published') {
      where.isPublished = true;
      where.isActive = true;
    } else if (filters?.status === 'archived') {
      where.isActive = false;
    }

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const forms = await prisma.form.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      take: 100, // Limit results for performance
      select: {
        id: true,
        name: true,
        slug: true,
        type: true,
        description: true,
        isActive: true,
        isPublished: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            responses: true,
          },
        },
      },
    });

    return forms.map((form) => ({
      ...form,
      responseCount: form._count.responses,
    }));
  }

  /**
   * Get a form by ID with all related steps and questions
   * @param id - Form ID
   * @returns Form object with steps, questions, and response count
   */
  async getFormById(id: string) {
    return prisma.form.findUnique({
      where: { id },
      include: {
        steps: {
          orderBy: { order: 'asc' },
          include: {
            questions: {
              orderBy: { order: 'asc' },
            },
          },
        },
        _count: {
          select: {
            responses: true,
          },
        },
      },
    });
  }

  /**
   * Get a published form by slug for public access
   * @param slug - Form slug
   * @returns Form object with steps and questions (only published forms)
   */
  async getFormBySlug(slug: string) {
    // First check if form exists at all
    const form = await prisma.form.findUnique({
      where: { slug },
      select: {
        id: true,
        isPublished: true,
        isActive: true,
      },
    });

    if (!form) {
      return null; // Form doesn't exist
    }

    // Check if form exists but is not published
    if (!form.isPublished) {
      throw new Error('FORM_NOT_PUBLISHED');
    }

    // Check if form is archived
    if (!form.isActive) {
      throw new Error('FORM_ARCHIVED');
    }

    // Form is published and active, return full data
    return prisma.form.findUnique({
      where: { slug, isPublished: true, isActive: true },
      include: {
        steps: {
          orderBy: { order: 'asc' },
          include: {
            questions: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });
  }

  async createForm(data: {
    name: string;
    type?: string;
    description?: string;
    hubspotAccount?: string;
    branding?: any;
    settings?: any;
  }) {
    const baseSlug = generateSlug(data.name);
    const slug = await ensureUniqueSlug(baseSlug);

    const defaultBranding = {
      logoUrl: null,
      primaryColor: '#171717',
      secondaryColor: '#2563eb',
      backgroundColor: '#ffffff',
      textColor: '#000000',
    };

    return prisma.form.create({
      data: {
        name: data.name,
        slug,
        type: data.type || 'post_purchase',
        description: data.description,
        hubspotAccount: data.hubspotAccount || 'minimal',
        branding: data.branding || defaultBranding,
        settings: data.settings || {},
        isActive: true,
        isPublished: false,
      },
    });
  }

  async updateForm(
    id: string,
    data: {
      name?: string;
      slug?: string;
      type?: string;
      description?: string;
      hubspotAccount?: string;
      hubspotTargetType?: string | null;
      hubspotTargetIdParam?: string | null;
      isActive?: boolean;
      isPublished?: boolean;
      branding?: any;
      settings?: any;
      metadata?: any;
    }
  ) {
    const form = await prisma.form.findUnique({ where: { id } });
    if (!form) {
      throw new Error('Form not found');
    }

    const updateData: any = { ...data };

    // If name changed, update slug if not explicitly provided
    if (data.name && data.name !== form.name && !data.slug) {
      const baseSlug = generateSlug(data.name);
      updateData.slug = await ensureUniqueSlug(baseSlug, id);
    }

    // If slug is explicitly provided, ensure uniqueness
    if (data.slug && data.slug !== form.slug) {
      updateData.slug = await ensureUniqueSlug(data.slug, id);
    }

    // Handle publish/unpublish
    if (data.isPublished !== undefined) {
      if (data.isPublished && !form.isPublished) {
        updateData.publishedAt = new Date();
      }
    }

    return prisma.form.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteForm(id: string) {
    // Soft delete by setting isActive to false
    return prisma.form.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async duplicateForm(id: string, newName?: string) {
    const form = await prisma.form.findUnique({
      where: { id },
      include: {
        steps: {
          include: {
            questions: true,
          },
        },
      },
    });

    if (!form) {
      throw new Error('Form not found');
    }

    const baseSlug = generateSlug(newName || `${form.name} (Copy)`);
    const slug = await ensureUniqueSlug(baseSlug);

    // Create new form
    const newForm = await prisma.form.create({
      data: {
        name: newName || `${form.name} (Copy)`,
        slug,
        type: form.type,
        description: form.description,
        hubspotAccount: form.hubspotAccount || 'minimal',
        branding: form.branding as any,
        settings: form.settings as any,
        metadata: form.metadata as any,
        isActive: true,
        isPublished: false,
      },
    });

    // Duplicate steps and questions
    for (const step of form.steps) {
      const newStep = await prisma.step.create({
        data: {
          formId: newForm.id,
          order: step.order,
          name: step.name,
          description: step.description,
        },
      });

      for (const question of step.questions) {
        await prisma.question.create({
          data: {
            stepId: newStep.id,
            order: question.order,
            text: question.text,
            type: question.type,
            options: question.options as any,
            isRequired: question.isRequired,
            hubspotProperty: question.hubspotProperty,
            parentQuestionId: null, // Will need to map parent questions
            conditionValue: question.conditionValue as any,
            nestingLevel: question.nestingLevel,
            category: question.category,
          },
        });
      }
    }

    // Re-map parent question relationships
    const newFormWithSteps = await prisma.form.findUnique({
      where: { id: newForm.id },
      include: {
        steps: {
          include: {
            questions: true,
          },
        },
      },
    });

    if (newFormWithSteps) {
      const questionMap = new Map<string, string>();
      let oldQuestionIndex = 0;

      for (let i = 0; i < form.steps.length; i++) {
        const oldStep = form.steps[i];
        const newStep = newFormWithSteps.steps[i];

        for (let j = 0; j < oldStep.questions.length; j++) {
          const oldQuestion = oldStep.questions[j];
          const newQuestion = newStep.questions[j];
          questionMap.set(oldQuestion.id, newQuestion.id);
        }
      }

      // Update parent question IDs
      for (let i = 0; i < form.steps.length; i++) {
        const oldStep = form.steps[i];
        const newStep = newFormWithSteps.steps[i];

        for (let j = 0; j < oldStep.questions.length; j++) {
          const oldQuestion = oldStep.questions[j];
          const newQuestion = newStep.questions[j];

          if (oldQuestion.parentQuestionId) {
            const newParentId = questionMap.get(oldQuestion.parentQuestionId);
            if (newParentId) {
              await prisma.question.update({
                where: { id: newQuestion.id },
                data: { parentQuestionId: newParentId },
              });
            }
          }
        }
      }
    }

    return this.getFormById(newForm.id);
  }

  async publishForm(id: string) {
    return this.updateForm(id, {
      isPublished: true,
    });
  }

  async unpublishForm(id: string) {
    return this.updateForm(id, {
      isPublished: false,
    });
  }
}

