import { prisma } from '../utils/prisma';
import { Question, Step, Survey } from '@prisma/client';

export interface SurveyConfig {
  survey: Survey;
  steps: (Step & { questions: Question[] })[];
}

export class SurveyService {
  async getActiveSurvey(): Promise<SurveyConfig | null> {
    const survey = await prisma.survey.findFirst({
      where: { isActive: true },
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
    const survey = await prisma.survey.findUnique({
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

  async saveResponse(
    email: string,
    surveyId: string,
    stepNumber: number,
    responses: { questionId: string; value: string | string[] }[]
  ) {
    // Get or create survey response
    const existingResponse = await prisma.surveyResponse.findUnique({
      where: {
        email_surveyId: {
          email,
          surveyId,
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

    const isCompleted = await this.checkIfCompleted(surveyId, stepNumber);

    return prisma.surveyResponse.upsert({
      where: {
        email_surveyId: {
          email,
          surveyId,
        },
      },
      create: {
        email,
        surveyId,
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

  async getIncompleteSurvey(email: string, surveyId: string) {
    return prisma.surveyResponse.findUnique({
      where: {
        email_surveyId: {
          email,
          surveyId,
        },
      },
    });
  }

  private async checkIfCompleted(surveyId: string, currentStep: number): Promise<boolean> {
    const survey = await prisma.survey.findUnique({
      where: { id: surveyId },
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

    if (!survey) return false;

    // Check if current step is the last step
    const lastStep = survey.steps[survey.steps.length - 1];
    return currentStep >= lastStep.order;
  }
}

