import { prisma } from '../../utils/prisma';

export interface FormAnalytics {
  overview: {
    views: number;
    starts: number;
    completions: number;
    completionRate: number;
    averageTime: number;
    dropOffRate: Array<{ step: number; rate: number }>;
  };
  responses: {
    daily: Array<{ date: string; count: number }>;
    weekly: Array<{ week: string; count: number }>;
    monthly: Array<{ month: string; count: number }>;
  };
  questions: Array<{
    questionId: string;
    questionText: string;
    responseDistribution: Record<string, number>;
    averageTimeSpent: number;
    skipRate: number;
  }>;
  devices: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
}

export class AnalyticsService {
  async getFormAnalytics(formId: string, dateRange?: { start: Date; end: Date }): Promise<FormAnalytics> {
    const form = await prisma.form.findUnique({
      where: { id: formId },
      include: {
        steps: {
          orderBy: { order: 'asc' },
          include: {
            questions: true,
          },
        },
        responses: true,
      },
    });

    if (!form) {
      throw new Error('Form not found');
    }

    // Filter responses by date range if provided
    let responses = form.responses;
    if (dateRange) {
      responses = responses.filter(
        (r) => r.createdAt >= dateRange.start && r.createdAt <= dateRange.end
      );
    }

    const totalResponses = responses.length;
    const completedResponses = responses.filter((r) => r.isCompleted);
    const completions = completedResponses.length;
    const starts = totalResponses; // Every response is a start
    const views = totalResponses; // Simplified - in production, track actual views

    // Calculate completion rate
    const completionRate = starts > 0 ? (completions / starts) * 100 : 0;

    // Calculate average completion time (simplified - would need start time tracking)
    const averageTime = 0; // Placeholder - would need to track time spent

    // Calculate drop-off rate by step
    const dropOffRate = form.steps.map((step, index) => {
      const responsesAtStep = responses.filter((r) => r.currentStep >= step.order);
      const responsesAtNextStep =
        index < form.steps.length - 1
          ? responses.filter((r) => r.currentStep >= form.steps[index + 1].order)
          : completedResponses;
      const dropOff = responsesAtStep.length - responsesAtNextStep.length;
      const rate = responsesAtStep.length > 0 ? (dropOff / responsesAtStep.length) * 100 : 0;
      return { step: step.order, rate };
    });

    // Time series data
    const daily = this.groupByDate(responses, 'day') as Array<{ date: string; count: number }>;
    const weekly = this.groupByDate(responses, 'week') as Array<{ week: string; count: number }>;
    const monthly = this.groupByDate(responses, 'month') as Array<{ month: string; count: number }>;

    // Question analytics
    const questions = form.steps.flatMap((step) =>
      step.questions.map((question) => {
        const questionResponses = completedResponses
          .map((r) => {
            const responses = r.responses as Array<{ questionId: string; value: string | string[] }>;
            return responses.find((qr) => qr.questionId === question.id);
          })
          .filter((r) => r !== undefined);

        const responseDistribution: Record<string, number> = {};
        questionResponses.forEach((r) => {
          const value = Array.isArray(r.value) ? r.value.join(', ') : String(r.value);
          responseDistribution[value] = (responseDistribution[value] || 0) + 1;
        });

        const skipRate =
          completedResponses.length > 0
            ? ((completedResponses.length - questionResponses.length) / completedResponses.length) * 100
            : 0;

        return {
          questionId: question.id,
          questionText: question.text,
          responseDistribution,
          averageTimeSpent: 0, // Placeholder
          skipRate,
        };
      })
    );

    // Device breakdown (simplified - would need user agent parsing)
    const devices = {
      mobile: Math.floor(totalResponses * 0.6), // Placeholder
      tablet: Math.floor(totalResponses * 0.1),
      desktop: Math.floor(totalResponses * 0.3),
    };

    return {
      overview: {
        views,
        starts,
        completions,
        completionRate,
        averageTime,
        dropOffRate,
      },
      responses: {
        daily,
        weekly,
        monthly,
      },
      questions,
      devices,
    };
  }

  private groupByDate(
    responses: any[],
    period: 'day' | 'week' | 'month'
  ): Array<{ date: string; count: number }> | Array<{ week: string; count: number }> | Array<{ month: string; count: number }> {
    const grouped: Record<string, number> = {};

    responses.forEach((response) => {
      const date = new Date(response.createdAt);
      let key: string;

      if (period === 'day') {
        key = date.toISOString().split('T')[0];
      } else if (period === 'week') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = `Week of ${weekStart.toISOString().split('T')[0]}`;
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      grouped[key] = (grouped[key] || 0) + 1;
    });

    if (period === 'day') {
      return Object.entries(grouped).map(([date, count]) => ({ date, count }));
    } else if (period === 'week') {
      return Object.entries(grouped).map(([week, count]) => ({ week, count }));
    } else {
      return Object.entries(grouped).map(([month, count]) => ({ month, count }));
    }
  }

  async exportResponses(formId: string, format: 'csv' | 'json' = 'csv'): Promise<string> {
    const form = await prisma.form.findUnique({
      where: { id: formId },
      include: {
        steps: {
          orderBy: { order: 'asc' },
          include: {
            questions: {
              orderBy: { order: 'asc' },
            },
          },
        },
        responses: {
          where: { isCompleted: true },
          orderBy: { completedAt: 'desc' },
        },
      },
    });

    if (!form) {
      throw new Error('Form not found');
    }

    const questions = form.steps.flatMap((step) => step.questions);

    if (format === 'csv') {
      // CSV header
      const headers = ['Email', 'Completed At', ...questions.map((q) => q.text)];
      const rows = form.responses.map((response) => {
        const responses = response.responses as Array<{ questionId: string; value: string | string[] }>;
        const values = [
          response.email,
          response.completedAt?.toISOString() || '',
          ...questions.map((q) => {
            const qr = responses.find((r) => r.questionId === q.id);
            if (!qr) return '';
            return Array.isArray(qr.value) ? qr.value.join('; ') : String(qr.value);
          }),
        ];
        return values.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',');
      });

      return [headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(','), ...rows].join('\n');
    } else {
      // JSON format
      return JSON.stringify(
        form.responses.map((response) => {
          const responses = response.responses as Array<{ questionId: string; value: string | string[] }>;
          const data: any = {
            email: response.email,
            completedAt: response.completedAt?.toISOString() || null,
          };
          questions.forEach((q) => {
            const qr = responses.find((r) => r.questionId === q.id);
            data[q.text] = qr ? qr.value : null;
          });
          return data;
        }),
        null,
        2
      );
    }
  }
}

