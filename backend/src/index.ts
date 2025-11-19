import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { surveyRateLimiter, adminRateLimiter } from './middleware/rateLimiter.middleware';
import { healthCheck } from './health';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use('/api/survey', surveyRateLimiter);
app.use('/api/admin', adminRateLimiter);

// Health check endpoint
app.get('/health', healthCheck);

// Routes
import surveyRoutes from './routes/survey.routes';
import adminAuthRoutes from './routes/admin/auth.routes';
import adminQuestionsRoutes from './routes/admin/questions.routes';
import adminStepsRoutes from './routes/admin/steps.routes';
import adminBrandingRoutes from './routes/admin/branding.routes';

app.use('/api/survey', surveyRoutes);
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin/questions', adminQuestionsRoutes);
app.use('/api/admin/steps', adminStepsRoutes);
app.use('/api/admin/branding', adminBrandingRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

