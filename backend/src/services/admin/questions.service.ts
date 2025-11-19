import { prisma } from '../../utils/prisma';
import { Question, Prisma } from '@prisma/client';

export class QuestionsService {
  async getAllQuestions() {
    return prisma.question.findMany({
      orderBy: [
        { stepId: 'asc' },
        { order: 'asc' },
      ],
      include: {
        step: true,
        parentQuestion: true,
        subQuestions: true,
      },
    });
  }

  async getQuestionById(id: string) {
    return prisma.question.findUnique({
      where: { id },
      include: {
        step: true,
        parentQuestion: true,
        subQuestions: true,
      },
    });
  }

  async createQuestion(data: {
    stepId: string;
    order: number;
    text: string;
    type: string;
    options?: string[];
    isRequired: boolean;
    hubspotProperty: string;
    parentQuestionId?: string;
    conditionValue?: string | string[];
    nestingLevel?: number;
  }) {
    // Validate nesting level
    if (data.parentQuestionId) {
      const parent = await prisma.question.findUnique({
        where: { id: data.parentQuestionId },
      });
      if (!parent) {
        throw new Error('Parent question not found');
      }
      const nestingLevel = (parent.nestingLevel || 0) + 1;
      if (nestingLevel > 3) {
        throw new Error('Maximum nesting level (3) exceeded');
      }
      data.nestingLevel = nestingLevel;
    } else {
      data.nestingLevel = 0;
    }

    return prisma.question.create({
      data: {
        ...data,
        options: data.options ? (data.options as Prisma.InputJsonValue) : undefined,
        conditionValue: data.conditionValue
          ? (data.conditionValue as Prisma.InputJsonValue)
          : undefined,
      },
    });
  }

  async updateQuestion(
    id: string,
    data: {
      stepId?: string;
      order?: number;
      text?: string;
      type?: string;
      options?: string[];
      isRequired?: boolean;
      hubspotProperty?: string;
      parentQuestionId?: string;
      conditionValue?: string | string[];
      nestingLevel?: number;
    }
  ) {
    // Validate nesting level if parentQuestionId is being updated
    if (data.parentQuestionId) {
      const parent = await prisma.question.findUnique({
        where: { id: data.parentQuestionId },
      });
      if (!parent) {
        throw new Error('Parent question not found');
      }
      const nestingLevel = (parent.nestingLevel || 0) + 1;
      if (nestingLevel > 3) {
        throw new Error('Maximum nesting level (3) exceeded');
      }
      data.nestingLevel = nestingLevel;
    }

    const updateData: Prisma.QuestionUpdateInput = {};
    if (data.stepId !== undefined) updateData.step = { connect: { id: data.stepId } };
    if (data.order !== undefined) updateData.order = data.order;
    if (data.text !== undefined) updateData.text = data.text;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.options !== undefined) updateData.options = data.options as Prisma.InputJsonValue;
    if (data.isRequired !== undefined) updateData.isRequired = data.isRequired;
    if (data.hubspotProperty !== undefined) updateData.hubspotProperty = data.hubspotProperty;
    if (data.parentQuestionId !== undefined) {
      updateData.parentQuestion = data.parentQuestionId
        ? { connect: { id: data.parentQuestionId } }
        : { disconnect: true };
    }
    if (data.conditionValue !== undefined) {
      updateData.conditionValue = data.conditionValue as Prisma.InputJsonValue;
    }
    if (data.nestingLevel !== undefined) updateData.nestingLevel = data.nestingLevel;

    return prisma.question.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteQuestion(id: string) {
    // Check if question has sub-questions
    const subQuestions = await prisma.question.findMany({
      where: { parentQuestionId: id },
    });

    if (subQuestions.length > 0) {
      throw new Error('Cannot delete question with sub-questions. Delete sub-questions first.');
    }

    return prisma.question.delete({
      where: { id },
    });
  }

  async reorderQuestions(updates: { id: string; order: number }[]) {
    const transaction = updates.map(({ id, order }) =>
      prisma.question.update({
        where: { id },
        data: { order },
      })
    );

    return prisma.$transaction(transaction);
  }
}

