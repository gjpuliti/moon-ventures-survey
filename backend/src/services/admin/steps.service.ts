import { prisma } from '../../utils/prisma';

export class StepsService {
  async getAllSteps(formId?: string) {
    const where = formId ? { formId } : {};
    return prisma.step.findMany({
      where,
      orderBy: { order: 'asc' },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async getStepById(id: string) {
    return prisma.step.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async createStep(data: {
    formId: string;
    order: number;
    name: string;
    description?: string;
  }) {
    return prisma.step.create({
      data,
    });
  }

  async updateStep(
    id: string,
    data: {
      order?: number;
      name?: string;
      description?: string;
    }
  ) {
    return prisma.step.update({
      where: { id },
      data,
    });
  }

  async deleteStep(id: string) {
    // Check if step has questions
    const step = await prisma.step.findUnique({
      where: { id },
      include: { questions: true },
    });

    if (!step) {
      throw new Error('Step not found');
    }

    if (step.questions.length > 0) {
      throw new Error('Cannot delete step with questions. Delete questions first.');
    }

    return prisma.step.delete({
      where: { id },
    });
  }
}

