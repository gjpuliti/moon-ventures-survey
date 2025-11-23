// Shared TypeScript types matching PRD data models

export type QuestionType = 'dropdown' | 'checkbox' | 'text' | 'textarea' | 'date' | 'email' | 'phone' | 'rating' | 'nps' | 'number';

export type FormType = 'post_purchase' | 'lead_generation' | 'customer_feedback' | 'product_research' | 'event_registration' | 'satisfaction_nps' | 'internal_feedback';

export interface Branding {
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
}

export interface Form {
  id: string;
  name: string;
  slug: string;
  type: FormType;
  description?: string;
  isActive: boolean;
  isPublished: boolean;
  hubspotAccount?: 'minimal' | 'hoomy';
  hubspotTargetType?: 'contact' | 'deal' | null;
  hubspotTargetIdParam?: string | null;
  branding: Branding;
  settings?: Record<string, any>;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

// Legacy type for backward compatibility during migration
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
  formId: string;
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
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FormResponse {
  id: string;
  email: string;
  formId: string;
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

// Legacy type for backward compatibility during migration
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
  formId: string;
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

