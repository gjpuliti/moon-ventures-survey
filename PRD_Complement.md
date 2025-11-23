# PRD Complement: Internal Forms Management System
## Practical Evolution from Single Survey to Complete Forms Platform

---

## 1. Executive Summary

### 1.1 Objective
Evolve the current post-purchase survey into a complete internal forms management system that allows the team to create, manage, and analyze multiple forms with seamless HubSpot integration.

### 1.2 Core Focus
- **Internal Use**: System for Moon Ventures team (not external SaaS)
- **Multiple Forms**: Manage various forms beyond post-purchase surveys
- **User-Friendly**: Simple configuration without technical knowledge
- **HubSpot Native**: Deep integration as primary data destination

---

## 2. System Evolution

### 2.1 From Single Survey to Forms Platform

**Current State**: One post-purchase survey
**Target State**: Multiple form types for different purposes

```typescript
// Supported form types
enum FormType {
  POST_PURCHASE = 'post_purchase',
  LEAD_GENERATION = 'lead_generation', 
  CUSTOMER_FEEDBACK = 'customer_feedback',
  PRODUCT_RESEARCH = 'product_research',
  EVENT_REGISTRATION = 'event_registration',
  SATISFACTION_NPS = 'satisfaction_nps',
  INTERNAL_FEEDBACK = 'internal_feedback'
}
```

### 2.2 Database Schema Updates

```prisma
// Update existing schema
model Form {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique // URL-friendly identifier
  type        String   // FormType enum
  description String?
  isActive    Boolean  @default(false)
  isPublished Boolean  @default(false)
  
  // Branding
  logoUrl     String?
  primaryColor String  @default("#171717")
  secondaryColor String @default("#2563eb")
  
  // Settings
  settings    Json     // Form-specific settings
  metadata    Json?    // Additional data
  
  steps       Step[]
  responses   Response[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  publishedAt DateTime?
  
  @@index([slug])
  @@index([isActive])
}

model Question {
  // Add new field for better organization
  category    String?  // To group questions in the admin
}
```

---

## 3. Admin Panel Enhancements

### 3.1 Forms Dashboard (New Main Screen)

```typescript
interface FormsDashboard {
  activeFormsCount: number;
  totalResponses: number;
  recentResponses: ResponsePreview[];
  formsList: FormCard[];
}

interface FormCard {
  id: string;
  name: string;
  type: FormType;
  responseCount: number;
  lastResponse: Date;
  status: 'draft' | 'published' | 'archived';
  completionRate: number;
  publicUrl: string;
}
```

**UI Implementation** (Based on Wireframes):
- Grid layout with form cards
- Quick actions: View, Edit, Duplicate, Archive
- Status indicators with color coding
- Response count badges
- One-click URL copy button

### 3.2 Form Builder Interface

**Enhanced Features**:
1. **Form Templates**
   - Pre-built templates for common use cases
   - Save custom templates from existing forms
   - Quick start wizard

2. **Question Bank**
   - Reusable questions library
   - Categories: Demographics, Satisfaction, Product, Custom
   - One-click insertion

3. **Visual Flow Editor**
   ```typescript
   interface ConditionalFlow {
     parentQuestion: string;
     condition: 'equals' | 'contains' | 'greater_than' | 'less_than';
     value: string | string[];
     showQuestions: string[];
     hideQuestions: string[];
   }
   ```

### 3.3 Settings Per Form

```typescript
interface FormSettings {
  // Access
  requireEmail: boolean;
  allowAnonymous: boolean;
  oneResponsePerEmail: boolean;
  
  // Behavior
  showProgressBar: boolean;
  allowBackNavigation: boolean;
  autoSaveInterval: number; // seconds
  
  // Completion
  redirectUrl?: string;
  showThankYouPage: boolean;
  thankYouMessage?: string;
  
  // Scheduling
  startDate?: Date;
  endDate?: Date;
  timezone: string;
  
  // Notifications
  notifyOnResponse: boolean;
  notificationEmails: string[];
}
```

---

## 4. HubSpot Integration Deep Dive

### 4.1 Enhanced Property Mapping

```typescript
interface HubSpotMapping {
  questionId: string;
  propertyName: string;
  propertyType: 'contact' | 'deal' | 'company' | 'ticket';
  transformation?: 'lowercase' | 'uppercase' | 'date_format' | 'number';
  defaultValue?: any;
}

// Auto-discovery of HubSpot properties
interface HubSpotPropertySync {
  lastSync: Date;
  availableProperties: HubSpotProperty[];
  customProperties: HubSpotProperty[];
  syncStatus: 'synced' | 'syncing' | 'error';
}
```

### 4.2 Advanced HubSpot Features

1. **Contact Enrichment**
   - Auto-fill known contact data
   - Progressive profiling (hide answered questions)
   - Contact history in responses

2. **Workflow Triggers**
   ```typescript
   interface WorkflowTrigger {
     formId: string;
     event: 'form_submitted' | 'step_completed' | 'specific_answer';
     condition?: any;
     hubspotWorkflowId: string;
   }
   ```

3. **Deal/Ticket Creation**
   - Create deals from lead gen forms
   - Create support tickets from feedback forms
   - Auto-assign to teams based on responses

---

## 5. User Experience Improvements

### 5.1 Form Renderer Enhancements

Based on wireframes:
- **Mobile-First Design**: Touch-optimized with large tap targets
- **Smart Keyboard**: Numeric for numbers, email for emails
- **Progress Persistence**: LocalStorage + backend sync
- **Offline Support**: Queue responses when offline
- **Accessibility**: ARIA labels, keyboard navigation

### 5.2 Question Types Extension

```typescript
enum QuestionType {
  // Existing
  TEXT = 'text',
  TEXTAREA = 'textarea',
  SELECT = 'select',
  MULTISELECT = 'multiselect',
  DATE = 'date',
  
  // New additions
  EMAIL = 'email',
  PHONE = 'phone',
  NUMBER = 'number',
  RATING = 'rating',        // 1-5 stars
  SCALE = 'scale',          // 1-10 scale
  NPS = 'nps',              // 0-10 NPS specific
  FILE = 'file',            // Document upload
  IMAGE = 'image',          // Image upload
  SIGNATURE = 'signature',  // Digital signature
  LOCATION = 'location',    // Address/coordinates
  MATRIX = 'matrix',        // Grid questions
}
```

### 5.3 Response Validation

```typescript
interface ValidationRule {
  type: 'required' | 'email' | 'phone' | 'regex' | 'min' | 'max' | 'custom';
  value?: any;
  errorMessage: string;
}

// Real-time validation
const validateField = (value: any, rules: ValidationRule[]): ValidationResult => {
  // Validate as user types
  // Show inline errors
  // Prevent submission if invalid
};
```

---

## 6. Analytics & Reporting

### 6.1 Form Analytics Dashboard

```typescript
interface FormAnalytics {
  overview: {
    views: number;
    starts: number;
    completions: number;
    completionRate: number;
    averageTime: number;
    dropOffRate: DropOffByStep[];
  };
  
  responses: {
    daily: TimeSeriesData[];
    weekly: TimeSeriesData[];
    monthly: TimeSeriesData[];
  };
  
  questions: {
    questionId: string;
    responseDistribution: any;
    averageTimeSpent: number;
    skipRate: number;
  }[];
  
  devices: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
}
```

### 6.2 Export Capabilities

```typescript
interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  dateRange: DateRange;
  includePartial: boolean;
  groupBy?: 'response' | 'question' | 'date';
  filters?: ResponseFilter[];
}
```

---

## 7. Technical Implementation

### 7.1 API Structure Update

```typescript
// Forms Management
GET    /api/forms                // List all forms
GET    /api/forms/:slug          // Get form by slug (public)
POST   /api/forms                // Create new form
PUT    /api/forms/:id            // Update form
DELETE /api/forms/:id            // Delete form
POST   /api/forms/:id/duplicate  // Duplicate form
POST   /api/forms/:id/publish    // Publish form
POST   /api/forms/:id/archive    // Archive form

// Templates
GET    /api/templates            // List templates
POST   /api/templates            // Save as template

// Question Bank
GET    /api/questions/bank       // Get question library
POST   /api/questions/bank       // Add to library

// Analytics
GET    /api/forms/:id/analytics  // Get form analytics
GET    /api/forms/:id/export     // Export responses
```

### 7.2 Frontend Routes Structure

```
/                           // Forms dashboard
/forms/new                  // Create new form
/forms/:id/edit            // Form builder
/forms/:id/responses       // View responses
/forms/:id/analytics       // Analytics dashboard
/forms/:id/settings        // Form settings

/survey/:slug              // Public form view
/admin/settings            // Global settings
/admin/integrations        // Manage integrations
```

### 7.3 Performance Optimizations

```typescript
// Caching Strategy
const cacheConfig = {
  formConfig: '5 minutes',      // Form structure
  responses: '30 seconds',      // Response data
  analytics: '1 minute',        // Analytics data
  hubspotProps: '1 hour',       // HubSpot properties
};

// Database Optimizations
- Indexed searches on slug, email
- Paginated responses (50 per page)
- Lazy loading for conditional questions
- Debounced auto-save (500ms)
```

---

## 8. Implementation Phases

### Phase 1: Core Multi-Form System (Week 1-2)
- [ ] Update database schema
- [ ] Forms dashboard UI
- [ ] Basic form CRUD operations
- [ ] Form templates system

### Phase 2: Enhanced Builder (Week 3)
- [ ] Drag-drop question reordering
- [ ] Question bank implementation
- [ ] Visual conditional logic editor
- [ ] Form preview mode

### Phase 3: HubSpot Deep Integration (Week 4)
- [ ] Property auto-discovery
- [ ] Workflow triggers
- [ ] Deal/ticket creation
- [ ] Progressive profiling

### Phase 4: Analytics & Polish (Week 5)
- [ ] Analytics dashboard
- [ ] Export functionality
- [ ] Performance optimization
- [ ] UI polish based on wireframes

---

## 9. Testing Checklist

### Functional Tests
- [ ] Create and publish multiple forms
- [ ] All question types working
- [ ] Conditional logic (3 levels)
- [ ] Auto-save and resume
- [ ] HubSpot sync verification
- [ ] Google Sheets backup
- [ ] Export in all formats

### User Experience Tests
- [ ] Mobile responsiveness
- [ ] Offline functionality
- [ ] Keyboard navigation
- [ ] Screen reader compatibility
- [ ] Loading performance (<2s)
- [ ] Error handling

### Integration Tests
- [ ] HubSpot property mapping
- [ ] Google Sheets real-time sync
- [ ] Email notifications
- [ ] URL parameter handling

---

## 10. Success Metrics

### Technical Metrics
- Page load time: <2 seconds
- API response: <200ms
- Auto-save success rate: >99%
- Zero data loss incidents

### Business Metrics
- Form completion rate: >70%
- Time to create form: <10 minutes
- Support tickets: <5 per month
- Team adoption: 100% in 30 days

---

## 11. Maintenance & Documentation

### Documentation Needed
1. User guide for form creation
2. HubSpot mapping guide
3. API documentation
4. Troubleshooting guide
5. Video tutorials (3-5 min each)

### Monitoring
- Error tracking (Sentry)
- Performance monitoring
- HubSpot sync status
- Form completion tracking

---

## 12. Security Considerations

- Admin authentication (existing JWT)
- Form access control
- Rate limiting (100 req/min)
- Input sanitization
- File upload restrictions (10MB, images/PDFs only)
- GDPR/LGPD compliance tools

---

**Version**: 1.1  
**Status**: Ready for Development  
**Priority**: High  
**Timeline**: 5 weeks