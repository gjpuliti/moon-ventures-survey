// Shared TypeScript types matching PRD data models

export type QuestionType = 'dropdown' | 'checkbox' | 'text' | 'textarea' | 'date';

export interface Branding {
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
}

export interface Survey {
  id: string;
  name: string;
  isActive: boolean;
  branding: Branding;
  createdAt: Date;
  updatedAt: Date;
}

export interface Step {
  id: string;
  surveyId: string;
  order: number;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Question {
  id: string;
  stepId: string;
  order: number;
  text: string;
  type: QuestionType;
  options?: string[];
  isRequired: boolean;
  hubspotProperty: string;
  parentQuestionId?: string;
  conditionValue?: string | string[];
  nestingLevel: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SurveyResponse {
  id: string;
  email: string;
  surveyId: string;
  responses: {
    questionId: string;
    value: string | string[];
  }[];
  currentStep: number;
  isCompleted: boolean;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminUser {
  id: string;
  email: string;
  passwordHash: string;
  role: 'admin';
  createdAt: Date;
  lastLoginAt?: Date;
}

// API Request/Response types
export interface CreateQuestionRequest {
  stepId: string;
  order: number;
  text: string;
  type: QuestionType;
  options?: string[];
  isRequired: boolean;
  hubspotProperty: string;
  parentQuestionId?: string;
  conditionValue?: string | string[];
  nestingLevel?: number;
}

export interface CreateStepRequest {
  surveyId: string;
  order: number;
  name: string;
  description?: string;
}

export interface SubmitResponseRequest {
  email: string;
  stepNumber: number;
  responses: {
    questionId: string;
    value: string | string[];
  }[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

