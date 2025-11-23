import { prisma } from '../../utils/prisma';

export class BrandingService {
  async getBranding(formId: string) {
    const form = await prisma.form.findUnique({
      where: { id: formId },
      select: { branding: true },
    });

    if (!form) {
      throw new Error('Form not found');
    }

    return form.branding;
  }

  async updateBranding(
    formId: string,
    branding: {
      logoUrl?: string;
      primaryColor?: string;
      secondaryColor?: string;
      backgroundColor?: string;
      textColor?: string;
    }
  ) {
    const form = await prisma.form.findUnique({
      where: { id: formId },
    });

    if (!form) {
      throw new Error('Form not found');
    }

    const currentBranding = form.branding as Record<string, any>;
    const updatedBranding = {
      ...currentBranding,
      ...branding,
    };

    return prisma.form.update({
      where: { id: formId },
      data: { branding: updatedBranding },
    });
  }

  // Backward compatibility - get first active form
  async getBrandingForDefault() {
    const form = await prisma.form.findFirst({
      where: { isActive: true, isPublished: true },
      select: { branding: true },
    });

    if (!form) {
      throw new Error('No active form found');
    }

    return form.branding;
  }
}

