# Post-Purchase Survey System

A modern, responsive survey system with admin panel, HubSpot and Google Sheets integrations.

## Features

- Multi-step survey with conditional questions (up to 3 levels)
- Responsive design (mobile and desktop)
- Auto-save functionality per step
- Resume incomplete surveys
- Admin panel for question/step/branding management
- HubSpot integration for contact property updates
- Google Sheets integration for data backup
- Secure admin authentication

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

### Survey

- Access survey at: `http://localhost:3000`
- Pre-fill email via URL: `http://localhost:3000?email=user@example.com`
- Survey page: `http://localhost:3000/survey?email=user@example.com`

### Admin Panel

- Admin login: `http://localhost:3000/admin/login`
- Default credentials:
  - Email: `admin@example.com`
  - Password: `admin123`

## API Endpoints

### Public Endpoints

- `GET /api/survey` - Get active survey configuration
- `POST /api/survey/response` - Submit survey response
- `GET /api/survey/resume/:email` - Get incomplete survey data

### Admin Endpoints (Protected)

- `POST /api/admin/auth/login` - Admin login
- `GET /api/admin/auth/me` - Get current admin user
- `GET /api/admin/questions` - List all questions
- `POST /api/admin/questions` - Create question
- `PUT /api/admin/questions/:id` - Update question
- `DELETE /api/admin/questions/:id` - Delete question
- `GET /api/admin/steps` - List all steps
- `POST /api/admin/steps` - Create step
- `PUT /api/admin/steps/:id` - Update step
- `DELETE /api/admin/steps/:id` - Delete step
- `GET /api/admin/branding` - Get branding settings
- `PUT /api/admin/branding` - Update branding settings

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

