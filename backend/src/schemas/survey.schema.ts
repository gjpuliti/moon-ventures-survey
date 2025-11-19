import { z } from 'zod';

export const submitResponseSchema = z.object({
  email: z.string().email('Invalid email format'),
  surveyId: z.string().uuid('Invalid survey ID'),
  stepNumber: z.number().int().min(1),
  responses: z.array(
    z.object({
      questionId: z.string().uuid('Invalid question ID'),
      value: z.union([z.string(), z.array(z.string())]),
    })
  ),
});

export const createQuestionSchema = z.object({
  stepId: z.string().uuid(),
  order: z.number().int().min(0),
  text: z.string().min(1, 'Question text is required'),
  type: z.enum(['dropdown', 'checkbox', 'text', 'textarea', 'date']),
  options: z.array(z.string()).optional(),
  isRequired: z.boolean(),
  hubspotProperty: z.string().min(1, 'HubSpot property is required'),
  parentQuestionId: z.string().uuid().optional(),
  conditionValue: z.union([z.string(), z.array(z.string())]).optional(),
  nestingLevel: z.number().int().min(0).max(3).optional(),
});

export const createStepSchema = z.object({
  surveyId: z.string().uuid(),
  order: z.number().int().min(0),
  name: z.string().min(1, 'Step name is required'),
  description: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

