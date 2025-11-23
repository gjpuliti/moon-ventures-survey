# Development Guide

Technical documentation for developers working on the Internal Forms Management Platform.

## Architecture

### Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express 5, TypeScript
- **Database**: SQLite (development) / PostgreSQL (production) with Prisma ORM
- **Authentication**: JWT tokens
- **Integrations**: HubSpot API v3, Google Sheets API v4

### Project Structure

```
form_pós_compra/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── services/        # Business logic
│   │   ├── routes/          # Route definitions
│   │   ├── middleware/      # Auth, validation, rate limiting
│   │   ├── schemas/         # Zod validation schemas
│   │   └── utils/           # Utilities
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── migrations/      # Database migrations
│   └── package.json
├── frontend/
│   ├── app/                 # Next.js App Router pages
│   │   ├── admin/           # Admin panel pages
│   │   └── survey/          # Public form pages
│   ├── components/          # React components
│   │   ├── admin/           # Admin components
│   │   ├── survey/          # Public form components
│   │   └── ui/              # Reusable UI components
│   ├── services/            # API service functions
│   ├── hooks/               # Custom React hooks
│   └── utils/               # Utility functions
├── shared/
│   └── types/               # Shared TypeScript types
└── docs/                    # Documentation
```

## Database Schema

### Core Models

**Form**
- Represents a form/survey
- Fields: id, name, slug, type, description, isActive, isPublished, branding (JSON), settings (JSON)
- Relations: steps, responses

**Step**
- Represents a step within a form
- Fields: id, formId, order, name, description
- Relations: form, questions

**Question**
- Represents a question within a step
- Fields: id, stepId, order, text, type, options (JSON), isRequired, hubspotProperty, parentQuestionId, conditionValue (JSON), nestingLevel
- Relations: step, parentQuestion, subQuestions

**FormResponse**
- Represents a user's response to a form
- Fields: id, formId, email, currentStep, isCompleted, responses (JSON)
- Relations: form

## Key Components

### Frontend

**Form Editor** (`/admin/forms/[id]/edit`)
- Tab-based interface for editing forms
- Components: FormSettings, FormStepsManager, FormQuestionsManager, FormBranding, FormPreview

**Conditional Logic Editor**
- Visual rule builder for question dependencies
- Validates nesting levels and prevents circular dependencies

**Analytics Dashboard**
- Displays metrics and charts using recharts
- Lazy-loaded for performance

### Backend

**Forms Service**
- Handles CRUD operations for forms
- Generates unique slugs
- Manages publish/unpublish logic

**Analytics Service**
- Calculates completion rates, drop-off rates
- Generates time series data
- Aggregates device distribution

**HubSpot Service**
- Auto-discovers HubSpot properties
- Caches property list
- Syncs form responses to HubSpot

## Development Workflow

### Adding a New Question Type

1. Add type to `shared/types/index.ts`:
   ```typescript
   export type QuestionType = 'text' | ... | 'newtype';
   ```

2. Create component in `frontend/components/survey/QuestionTypes/NewTypeQuestion.tsx`

3. Add to `QuestionRenderer.tsx`:
   ```typescript
   case 'newtype':
     return <NewTypeQuestion ... />;
   ```

4. Update backend schema validation in `backend/src/schemas/survey.schema.ts`

5. Add to FormPreview component

### Adding a New Form Type

1. Add to `shared/types/index.ts`:
   ```typescript
   export type FormType = 'post_purchase' | ... | 'newtype';
   ```

2. Update FormSettings component dropdown

3. No backend changes needed (stored as string)

## Testing

### Manual Testing Checklist

- [ ] Create a new form
- [ ] Add steps and questions
- [ ] Configure conditional logic
- [ ] Set up branding
- [ ] Publish form
- [ ] Access public form by slug
- [ ] Submit responses
- [ ] View analytics
- [ ] Export data
- [ ] Test mobile responsiveness

### API Testing

Use tools like Postman or curl:

```bash
# Login
curl -X POST http://localhost:3001/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# Get forms (use token from login)
curl http://localhost:3001/api/admin/forms \
  -H "Authorization: Bearer <token>"
```

## Performance Considerations

### Frontend
- Lazy load analytics charts
- Use React.memo for expensive components
- Paginate long lists
- Debounce search inputs
- Code split admin routes

### Backend
- Limit query results (take: 100)
- Select only needed fields
- Use database indexes
- Enable response compression
- Cache HubSpot properties

## Deployment

### Environment Variables

**Backend (.env):**
```
DATABASE_URL=postgresql://...
PORT=3001
JWT_SECRET=...
HUBSPOT_API_KEY=...
```

**Frontend (.env.local):**
```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### Build Process

1. **Backend:**
   ```bash
   cd backend
   npm run build
   npm run prisma:generate
   npm run prisma:migrate deploy
   ```

2. **Frontend:**
   ```bash
   cd frontend
   npm run build
   ```

### Database Migrations

Always run migrations in production:
```bash
npm run prisma:migrate deploy
```

Never use `prisma migrate dev` in production.

## Code Style

- Use TypeScript strict mode
- Follow React best practices (hooks, memoization)
- Use async/await for async operations
- Handle errors gracefully with try/catch
- Use toast notifications instead of alerts
- Add JSDoc comments to complex functions

## Common Issues

**Prisma Client Out of Sync:**
```bash
npm run prisma:generate
```

**Type Errors:**
- Ensure shared types are up to date
- Run `npm run build` to check for errors

**CORS Issues:**
- Check backend CORS configuration
- Verify NEXT_PUBLIC_API_URL matches backend URL

