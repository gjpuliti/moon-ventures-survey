import { prisma } from '../../utils/prisma';

export class BrandingService {
  async getBranding(surveyId: string = 'default-survey-id') {
    const survey = await prisma.survey.findUnique({
      where: { id: surveyId },
      select: { branding: true },
    });

    if (!survey) {
      throw new Error('Survey not found');
    }

    return survey.branding;
  }

  async updateBranding(
    branding: {
      logoUrl?: string;
      primaryColor?: string;
      secondaryColor?: string;
      backgroundColor?: string;
      textColor?: string;
    },
    surveyId: string = 'default-survey-id'
  ) {
    const survey = await prisma.survey.findUnique({
      where: { id: surveyId },
    });

    if (!survey) {
      throw new Error('Survey not found');
    }

    const currentBranding = survey.branding as Record<string, any>;
    const updatedBranding = {
      ...currentBranding,
      ...branding,
    };

    return prisma.survey.update({
      where: { id: surveyId },
      data: { branding: updatedBranding },
    });
  }
}

