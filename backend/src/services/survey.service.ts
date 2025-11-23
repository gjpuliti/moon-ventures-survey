import { prisma } from '../utils/prisma';
import { Question, Step, Form } from '@prisma/client';

export interface SurveyConfig {
  survey: Form;
  steps: (Step & { questions: Question[] })[];
}

export class SurveyService {
  async getActiveSurvey(): Promise<SurveyConfig | null> {
    const survey = await prisma.form.findFirst({
      where: { isActive: true, isPublished: true },
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

    if (!survey) {
      return null;
    }

    return {
      survey,
      steps: survey.steps,
    };
  }

  async getSurveyById(surveyId: string): Promise<SurveyConfig | null> {
    const survey = await prisma.form.findUnique({
      where: { id: surveyId },
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

    if (!survey) {
      return null;
    }

    return {
      survey,
      steps: survey.steps,
    };
  }

  async getSurveyBySlug(slug: string): Promise<SurveyConfig | null> {
    const survey = await prisma.form.findUnique({
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

    if (!survey) {
      return null;
    }

    return {
      survey,
      steps: survey.steps,
    };
  }

  async saveResponse(
    email: string,
    formId: string,
    stepNumber: number,
    responses: { questionId: string; value: string | string[] }[]
  ) {
    // Get or create form response
    const existingResponse = await prisma.formResponse.findUnique({
      where: {
        email_formId: {
          email,
          formId,
        },
      },
    });

    const currentResponses = existingResponse
      ? (existingResponse.responses as { questionId: string; value: string | string[] }[])
      : [];

    // Merge new responses with existing ones
    const updatedResponses = [...currentResponses];
    responses.forEach((newResponse) => {
      const index = updatedResponses.findIndex((r) => r.questionId === newResponse.questionId);
      if (index >= 0) {
        updatedResponses[index] = newResponse;
      } else {
        updatedResponses.push(newResponse);
      }
    });

    const isCompleted = await this.checkIfCompleted(formId, stepNumber);

    return prisma.formResponse.upsert({
      where: {
        email_formId: {
          email,
          formId,
        },
      },
      create: {
        email,
        formId,
        responses: updatedResponses,
        currentStep: stepNumber,
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
      update: {
        responses: updatedResponses,
        currentStep: stepNumber,
        isCompleted,
        completedAt: isCompleted ? new Date() : undefined,
      },
    });
  }

  async getIncompleteSurvey(email: string, formId: string) {
    return prisma.formResponse.findUnique({
      where: {
        email_formId: {
          email,
          formId,
        },
      },
    });
  }

  private async checkIfCompleted(formId: string, currentStep: number): Promise<boolean> {
    const form = await prisma.form.findUnique({
      where: { id: formId },
      include: {
        steps: {
          orderBy: { order: 'asc' },
          include: {
            questions: {
              where: { isRequired: true },
            },
          },
        },
      },
    });

    if (!form) return false;

    // Check if current step is the last step
    const lastStep = form.steps[form.steps.length - 1];
    return currentStep >= lastStep.order;
  }
}

