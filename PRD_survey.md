# Product Requirements Document (PRD)
## Post-Purchase Survey System

### 1. Overview

#### 1.1 Purpose
This document outlines the requirements for building a new post-purchase survey system to replace the current Bubble.io implementation. The new system will provide improved UX, better customization capabilities, and easier administration while maintaining integration with HubSpot and adding Google Sheets integration.

#### 1.2 Current State
- **Current Platform**: Bubble.io
- **Current URL**: https://clubeminimal.com.br/pesquisa_pos_compra
- **Current Structure**: 4-step survey with HubSpot integration
- **Current Limitations**: 
  - Limited customization options
  - Not optimized for mobile
  - Difficult to edit and customize
  - No admin interface for question management

#### 1.3 Goals
- Create a modern, responsive survey system (mobile and desktop)
- Implement an admin panel for easy question management
- Maintain HubSpot integration with property mapping
- Add Google Sheets integration for data backup
- Implement auto-save functionality per step
- Support email pre-fill via URL parameter
- Ensure security for admin access

---

### 2. User Stories

#### 2.1 Survey Respondent (End User)
- **As a** customer who just made a purchase
- **I want to** complete a survey about my experience and preferences
- **So that** I can help the company improve and potentially receive rewards

**Acceptance Criteria:**
- Survey is accessible via public URL
- Email can be pre-filled via `/?email=user@example.com` URL parameter
- Survey is responsive and works well on mobile and desktop
- Survey has a clean, modern UI with company branding
- Progress is saved automatically after each step completion
- Survey can be completed in multiple sessions (resume capability)

#### 2.2 Admin User
- **As an** admin team member
- **I want to** configure survey questions, conditional logic, and branding
- **So that** I can customize the survey without developer intervention

**Acceptance Criteria:**
- Admin panel accessible at `/admin` route
- Secure authentication required for admin access
- Can create, edit, and delete questions
- Can configure conditional sub-questions (up to 3 levels deep)
- Can map each question to a HubSpot property
- Can customize branding (logo, colors)
- Can preview survey before publishing

---

### 3. Functional Requirements

#### 3.1 Survey Frontend

##### 3.1.1 Survey Structure
- **Multi-step flow**: Survey divided into configurable steps (currently 4 steps, but should be flexible)
- **Step progression**: Users can navigate forward and backward between steps
- **Progress indicator**: Visual indication of current step and total steps
- **Step completion**: Each step must be completed before proceeding (validation)

##### 3.1.2 Question Types
The system must support the following question types:
- **Single Select (Dropdown)**: One option selection from a list
- **Multiple Select (Checkboxes)**: Multiple option selections
- **Text Input**: Short text responses
- **Text Area**: Long-form text responses
- **Date Picker**: Date selection (with day, month, year dropdowns as seen in current survey)

##### 3.1.3 Conditional Logic
- **Sub-questions**: Questions can have conditional sub-questions based on parent question answers
- **Nesting depth**: Support up to 3 levels of nested conditional questions
- **Condition types**: 
  - Show sub-question if parent answer equals specific value(s)
  - Show sub-question if parent answer contains specific value(s) (for multi-select)
- **Dynamic rendering**: Sub-questions appear/disappear dynamically based on selections

##### 3.1.4 Email Pre-fill
- **URL parameter**: Email field should be auto-filled from `?email=user@example.com` URL parameter
- **Validation**: Email format validation required
- **Required field**: Email is mandatory before starting survey

##### 3.1.5 Auto-save Functionality
- **Per-step saving**: After completing each step and clicking "Continue/Proceed", data is automatically saved
- **HubSpot sync**: Each step completion triggers HubSpot property update
- **Resume capability**: Users can return to incomplete surveys and resume from last completed step
- **Data persistence**: Responses are stored locally (browser storage) and server-side

##### 3.1.6 UI/UX Requirements
- **Design**: Clean, modern, professional design
- **Branding**: 
  - Customizable logo upload
  - Customizable color scheme (primary color, secondary color, etc.)
  - Company name/branding display
- **Responsive design**: 
  - Mobile-first approach
  - Optimized for screens from 320px to 1920px+
  - Touch-friendly interface elements
- **Accessibility**: 
  - WCAG 2.1 AA compliance
  - Keyboard navigation support
  - Screen reader compatibility
- **Loading states**: Visual feedback during save operations
- **Error handling**: Clear error messages for validation failures

#### 3.2 Admin Panel (`/admin`)

##### 3.2.1 Authentication & Security
- **Access control**: Secure authentication required (email/password or SSO)
- **Role-based access**: Admin-only access (no public access)
- **Session management**: Secure session handling with timeout
- **CSRF protection**: Protection against cross-site request forgery
- **Rate limiting**: Protection against brute force attacks

##### 3.2.2 Question Management
- **Create questions**: 
  - Question text input
  - Question type selection (dropdown, checkbox, text, textarea, date)
  - Options/choices configuration (for select types)
  - Required/optional toggle
  - Step assignment (which step the question belongs to)
  - HubSpot property mapping (dropdown/autocomplete to select HubSpot property)
- **Edit questions**: Modify existing questions with same fields as create
- **Delete questions**: Remove questions with confirmation
- **Reorder questions**: Drag-and-drop or up/down arrows to reorder within steps
- **Question preview**: See how question will appear to users

##### 3.2.3 Conditional Logic Configuration
- **Parent question selection**: Select which question triggers the conditional logic
- **Condition configuration**: 
  - Select parent question answer(s) that trigger sub-question
  - Configure for single-select (equals) or multi-select (contains)
- **Sub-question assignment**: Assign sub-question to appear when condition is met
- **Nesting visualization**: Visual tree/hierarchy showing question relationships
- **Depth limit**: System enforces maximum 3 levels of nesting
- **User-friendly interface**: Intuitive UI for configuring conditions (no code required)

##### 3.2.4 Step Management
- **Create steps**: Add new survey steps
- **Edit steps**: Modify step order, name, description
- **Delete steps**: Remove steps (with validation to ensure no orphaned questions)
- **Step configuration**: Configure step-specific settings

##### 3.2.5 Branding Configuration
- **Logo upload**: Upload company logo (with size/format validation)
- **Color customization**: 
  - Primary color picker
  - Secondary color picker
  - Background color
  - Text color
- **Preview**: Live preview of survey with branding applied
- **Reset**: Option to reset to default branding

##### 3.2.6 HubSpot Integration Configuration
- **Property mapping**: 
  - For each question, admin selects corresponding HubSpot property
  - Autocomplete/search for HubSpot properties
  - Display property type and validation
- **Connection settings**: Configure HubSpot API credentials (secure storage)
- **Test connection**: Test HubSpot API connectivity
- **Sync status**: View sync status and errors

##### 3.2.7 Google Sheets Integration Configuration
- **Sheet selection**: Select or create Google Sheet for data storage
- **Authentication**: OAuth flow for Google Sheets API access
- **Column mapping**: Map survey fields to sheet columns
- **Sync settings**: Configure sync frequency and format
- **Test sync**: Test Google Sheets write operation

#### 3.3 Backend & Integrations

##### 3.3.1 HubSpot Integration
- **API integration**: Use HubSpot API to update contact properties
- **Property updates**: Update properties after each step completion
- **Error handling**: Handle API errors gracefully (retry logic, error logging)
- **Data mapping**: Map survey responses to HubSpot property values
- **Contact identification**: Use email to identify/update HubSpot contact

##### 3.3.2 Google Sheets Integration
- **API integration**: Use Google Sheets API to write survey responses
- **Row creation**: Create new row for each survey completion
- **Column mapping**: Map survey fields to sheet columns dynamically
- **Error handling**: Handle API errors and retry logic
- **Authentication**: Secure OAuth token storage and refresh

##### 3.3.3 Data Storage
- **Response storage**: Store survey responses in database
- **Step tracking**: Track which steps are completed per user/email
- **Resume data**: Store partial responses for resume capability
- **Audit trail**: Log all survey submissions and admin actions

##### 3.3.4 API Endpoints
- **Public endpoints**:
  - `GET /survey` - Get survey configuration (questions, steps, branding)
  - `POST /survey/response` - Submit survey response (per step)
  - `GET /survey/resume/:email` - Get incomplete survey data for resume
- **Admin endpoints** (protected):
  - `GET /admin/questions` - List all questions
  - `POST /admin/questions` - Create question
  - `PUT /admin/questions/:id` - Update question
  - `DELETE /admin/questions/:id` - Delete question
  - `PUT /admin/questions/reorder` - Reorder questions
  - `GET /admin/steps` - List all steps
  - `POST /admin/steps` - Create step
  - `PUT /admin/steps/:id` - Update step
  - `DELETE /admin/steps/:id` - Delete step
  - `PUT /admin/branding` - Update branding settings
  - `GET /admin/integrations/hubspot` - Get HubSpot config
  - `PUT /admin/integrations/hubspot` - Update HubSpot config
  - `GET /admin/integrations/sheets` - Get Google Sheets config
  - `PUT /admin/integrations/sheets` - Update Google Sheets config

---

### 4. Technical Requirements

#### 4.1 Technology Stack Recommendations
- **Frontend Framework**: React.js or Next.js (for SSR/SSG if needed)
- **Backend Framework**: Node.js (Express/NestJS) or Python (Django/FastAPI)
- **Database**: PostgreSQL or MongoDB
- **Authentication**: JWT tokens or OAuth 2.0
- **API Integration**: 
  - HubSpot API (REST)
  - Google Sheets API (v4)

#### 4.2 Performance Requirements
- **Page load time**: < 2 seconds on 3G connection
- **API response time**: < 500ms for survey data retrieval
- **Save operation**: < 1 second for step completion save
- **Concurrent users**: Support at least 100 concurrent survey completions

#### 4.3 Security Requirements
- **HTTPS**: All communications over HTTPS
- **Input validation**: Server-side validation for all inputs
- **SQL injection prevention**: Use parameterized queries
- **XSS prevention**: Sanitize all user inputs
- **CSRF protection**: Implement CSRF tokens
- **Rate limiting**: Implement rate limiting on API endpoints
- **Secrets management**: Secure storage of API keys and credentials
- **Admin access**: Strong password requirements, optional 2FA

#### 4.4 Browser Support
- **Desktop**: Chrome (latest 2 versions), Firefox (latest 2 versions), Safari (latest 2 versions), Edge (latest 2 versions)
- **Mobile**: iOS Safari (latest 2 versions), Chrome Mobile (latest 2 versions)

---

### 5. Data Model

#### 5.1 Survey
```typescript
{
  id: string;
  name: string;
  isActive: boolean;
  branding: {
    logoUrl: string;
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    textColor: string;
  };
  createdAt: datetime;
  updatedAt: datetime;
}
```

#### 5.2 Step
```typescript
{
  id: string;
  surveyId: string;
  order: number;
  name: string;
  description?: string;
  createdAt: datetime;
  updatedAt: datetime;
}
```

#### 5.3 Question
```typescript
{
  id: string;
  stepId: string;
  order: number;
  text: string;
  type: 'dropdown' | 'checkbox' | 'text' | 'textarea' | 'date';
  options?: string[]; // For dropdown/checkbox
  isRequired: boolean;
  hubspotProperty: string; // HubSpot property name
  parentQuestionId?: string; // For conditional questions
  conditionValue?: string | string[]; // Answer value(s) that trigger this question
  nestingLevel: number; // 0, 1, 2, or 3
  createdAt: datetime;
  updatedAt: datetime;
}
```

#### 5.4 Survey Response
```typescript
{
  id: string;
  email: string;
  surveyId: string;
  responses: {
    questionId: string;
    value: string | string[]; // Single or multiple values
  }[];
  currentStep: number;
  isCompleted: boolean;
  completedAt?: datetime;
  createdAt: datetime;
  updatedAt: datetime;
}
```

#### 5.5 Admin User
```typescript
{
  id: string;
  email: string;
  passwordHash: string;
  role: 'admin';
  createdAt: datetime;
  lastLoginAt?: datetime;
}
```

---

### 6. Integration Specifications

#### 6.1 HubSpot Integration
- **API Version**: HubSpot API v3
- **Authentication**: Private App Access Token or OAuth
- **Endpoint**: `PUT /crm/v3/objects/contacts/{contactId}`
- **Property Update**: Update contact properties after each step
- **Contact Lookup**: Use email to find contact ID via `GET /crm/v3/objects/contacts/{email}`
- **Error Handling**: 
  - Retry on 429 (rate limit)
  - Log errors for failed updates
  - Queue failed updates for retry

#### 6.2 Google Sheets Integration
- **API Version**: Google Sheets API v4
- **Authentication**: OAuth 2.0
- **Endpoint**: `POST /v4/spreadsheets/{spreadsheetId}/values/{range}:append`
- **Data Format**: Append row with all survey responses
- **Column Headers**: First row contains question texts or HubSpot property names
- **Error Handling**: 
  - Retry on transient errors
  - Log errors for failed writes
  - Queue failed writes for retry

---

### 7. User Flow

#### 7.1 Survey Completion Flow
1. User receives survey link with email parameter: `https://domain.com/survey?email=user@example.com`
2. Email field is auto-filled
3. User clicks "Start Survey" button
4. **Step 1**: User answers questions, clicks "Continue"
   - Data saved to database
   - HubSpot properties updated
   - Google Sheets row created/updated
5. **Step 2-4**: Repeat step 4 for each subsequent step
6. Final step: User clicks "Finish"
   - Final data saved
   - Completion status updated
   - Thank you message displayed

#### 7.2 Admin Configuration Flow
1. Admin navigates to `/admin`
2. Admin logs in with credentials
3. Admin dashboard shows:
   - List of questions by step
   - Survey settings
   - Integration status
4. Admin can:
   - Add/edit/delete questions
   - Configure conditional logic
   - Update branding
   - Configure integrations
   - Preview survey

---

### 8. Success Metrics

#### 8.1 User Experience Metrics
- **Completion rate**: % of users who complete all steps
- **Drop-off rate**: % of users who abandon survey per step
- **Time to complete**: Average time to complete survey
- **Mobile vs Desktop**: Completion rates by device type

#### 8.2 Technical Metrics
- **API uptime**: 99.9% availability
- **Save success rate**: > 99% successful step saves
- **Integration sync rate**: > 99% successful HubSpot/Sheets syncs
- **Page load performance**: < 2s average load time

---

### 9. Future Enhancements (Out of Scope)
- Multi-language support
- A/B testing for questions
- Advanced analytics dashboard
- Email reminders for incomplete surveys
- Survey templates
- Export functionality (CSV, Excel)
- Webhook support for custom integrations

---

### 10. Dependencies & Assumptions

#### 10.1 Dependencies
- HubSpot account with API access
- Google account with Sheets API access
- Domain and hosting infrastructure
- SSL certificate for HTTPS

#### 10.2 Assumptions
- Survey will be accessed primarily via mobile devices
- Admin users have basic technical knowledge
- HubSpot properties are pre-configured
- Google Sheet structure can be auto-generated

---

### 11. Acceptance Criteria Summary

✅ **Survey Frontend**
- [ ] Responsive design (mobile and desktop)
- [ ] Email pre-fill via URL parameter
- [ ] Multi-step flow with progress indicator
- [ ] Support all question types (dropdown, checkbox, text, textarea, date)
- [ ] Conditional sub-questions (up to 3 levels)
- [ ] Auto-save after each step
- [ ] Customizable branding (logo, colors)
- [ ] Resume incomplete surveys

✅ **Admin Panel**
- [ ] Secure authentication at `/admin`
- [ ] Create/edit/delete questions
- [ ] Configure conditional logic (user-friendly interface)
- [ ] Map questions to HubSpot properties
- [ ] Customize branding
- [ ] Manage steps
- [ ] Preview survey

✅ **Integrations**
- [ ] HubSpot property updates after each step
- [ ] Google Sheets row creation/updates
- [ ] Error handling and retry logic
- [ ] Configuration UI for integrations

✅ **Security**
- [ ] Admin authentication and authorization
- [ ] Input validation and sanitization
- [ ] HTTPS enforcement
- [ ] Secure credential storage

---

### 12. Implementation Notes

#### 12.1 Development Phases
1. **Phase 1**: Core survey functionality (questions, steps, frontend)
2. **Phase 2**: Admin panel (question management, branding)
3. **Phase 3**: Conditional logic implementation
4. **Phase 4**: HubSpot integration
5. **Phase 5**: Google Sheets integration
6. **Phase 6**: Auto-save and resume functionality
7. **Phase 7**: Security hardening and testing
8. **Phase 8**: Performance optimization and deployment

#### 12.2 Testing Requirements
- Unit tests for core logic
- Integration tests for API endpoints
- E2E tests for survey completion flow
- E2E tests for admin panel workflows
- Integration tests for HubSpot and Google Sheets
- Load testing for concurrent users
- Security testing (penetration testing)

---

**Document Version**: 1.0  
**Last Updated**: [Current Date]  
**Author**: Product Team  
**Status**: Ready for Development

