# Internal Forms Management Platform

A comprehensive internal forms management system for Moon Ventures, evolved from a single post-purchase survey to a full-featured multi-form platform with deep HubSpot integration and robust analytics.

## Features

### Multi-Form System
- Create and manage multiple forms with different types (Post Purchase, Lead Generation, Customer Feedback, etc.)
- Form-specific branding and settings
- Publish/unpublish forms independently
- Form duplication and archiving
- Slug-based public URLs for each form

### Form Builder
- Visual form editor with tab navigation (Settings, Steps, Questions, Branding, Preview)
- Drag-and-drop question reordering
- Extended question types: text, textarea, dropdown, checkbox, date, email, phone, number, rating, NPS
- Conditional logic editor with visual rule builder (up to 3 nesting levels)
- Step management with ordering
- Real-time form preview

### Analytics & Insights
- Comprehensive analytics dashboard per form
- Completion rates and drop-off analysis
- Response trends over time (daily, weekly, monthly)
- Device distribution (mobile, tablet, desktop)
- Question-level insights
- Export responses as CSV or JSON

### Integrations
- HubSpot property auto-discovery
- Visual property mapping UI
- Automatic contact updates on form submission
- Google Sheets integration for data backup

### User Experience
- Responsive design (mobile and desktop optimized)
- Auto-save functionality per step
- Resume incomplete surveys
- Toast notifications for user feedback
- Error boundaries for graceful error handling
- Loading states throughout

### Security
- JWT-based admin authentication
- Protected admin routes
- Rate limiting on API endpoints

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens
- **Integrations**: HubSpot API v3, Google Sheets API v4

## Setup

### Prerequisites

- Node.js 18+
- PostgreSQL database
- HubSpot account (optional)
- Google account with Sheets API access (optional)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/survey_db?schema=public"
PORT=3001
NODE_ENV=development
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
HUBSPOT_API_KEY=your-hubspot-api-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3001/api/admin/integrations/sheets/callback
GOOGLE_SHEET_ID=your-google-sheet-id
```

4. Generate Prisma client:
```bash
npm run prisma:generate
```

5. Run migrations:
```bash
npm run prisma:migrate
```

6. Seed database:
```bash
npm run prisma:seed
```

7. Start development server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

4. Start development server:
```bash
npm run dev
```

## Usage

### Public Form Access

- Access form by slug: `http://localhost:3000/survey/[form-slug]?email=user@example.com`
- Legacy survey route (backward compatible): `http://localhost:3000/survey?email=user@example.com`

### Admin Panel

- Admin login: `http://localhost:3000/admin/login`
- Default credentials:
  - Email: `admin@example.com`
  - Password: `admin123`

#### Admin Features

- **Forms Dashboard** (`/admin/forms`): View all forms, create new forms, search and filter
- **Form Editor** (`/admin/forms/[id]/edit`): Comprehensive form builder with tabs:
  - Settings: Name, description, type, publish status
  - Steps: Create and manage form steps
  - Questions: Add questions with conditional logic and HubSpot mapping
  - Branding: Customize colors, logo, and styling
  - Preview: Real-time form preview
- **Analytics** (`/admin/forms/[id]/analytics`): View form performance metrics and export data
- **Integrations** (`/admin/integrations`): Manage HubSpot property mappings

## API Endpoints

### Public Endpoints

- `GET /api/forms/:slug` - Get form configuration by slug
- `GET /api/survey` - Get active survey configuration (legacy)
- `POST /api/survey/response` - Submit form/survey response (supports both formId and surveyId)
- `GET /api/survey/resume/:email` - Get incomplete form/survey data

### Admin Endpoints (Protected)

#### Authentication
- `POST /api/admin/auth/login` - Admin login
- `GET /api/admin/auth/me` - Get current admin user

#### Forms Management
- `GET /api/admin/forms` - List all forms (supports query params: status, type, search)
- `GET /api/admin/forms/:id` - Get form by ID
- `POST /api/admin/forms` - Create new form
- `PUT /api/admin/forms/:id` - Update form
- `DELETE /api/admin/forms/:id` - Archive form
- `POST /api/admin/forms/:id/duplicate` - Duplicate form
- `POST /api/admin/forms/:id/publish` - Publish form
- `POST /api/admin/forms/:id/unpublish` - Unpublish form

#### Questions Management
- `GET /api/admin/questions` - List all questions (supports formId query param)
- `GET /api/admin/questions/:id` - Get question by ID
- `POST /api/admin/questions` - Create question
- `PUT /api/admin/questions/:id` - Update question
- `DELETE /api/admin/questions/:id` - Delete question
- `PUT /api/admin/questions/reorder` - Reorder questions

#### Steps Management
- `GET /api/admin/steps` - List all steps (supports formId query param)
- `GET /api/admin/steps/:id` - Get step by ID
- `POST /api/admin/steps` - Create step
- `PUT /api/admin/steps/:id` - Update step
- `DELETE /api/admin/steps/:id` - Delete step

#### Branding
- `GET /api/admin/branding` - Get branding settings (supports formId query param)
- `PUT /api/admin/branding` - Update branding settings

#### Analytics
- `GET /api/admin/forms/:formId/analytics` - Get form analytics
- `GET /api/admin/forms/:formId/analytics/export` - Export form responses (supports format query param: csv, json)

#### Integrations
- `GET /api/admin/integrations/hubspot/properties` - Get HubSpot properties

## Development

### Backend Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:seed` - Seed database
- `npm run prisma:studio` - Open Prisma Studio

### Frontend Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Deployment

### Environment Variables

Ensure all environment variables are set in your production environment.

### Database

Run migrations in production:
```bash
npm run prisma:migrate
```

### Build

Build both frontend and backend:
```bash
# Backend
cd backend && npm run build

# Frontend
cd frontend && npm run build
```

## License

ISC

