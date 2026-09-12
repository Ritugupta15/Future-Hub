import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';

import authRoutes from './routes/auth.routes.js';
import careerRoutes from './routes/career.routes.js';
import profileRoutes from './routes/profile.routes.js';
import assessmentRoutes from './routes/assessment.routes.js';
import savedRoutes from './routes/saved.routes.js';
import roadmapRoutes from './routes/roadmap.routes.js';
import resumeRoutes from './routes/resume.routes.js';
import { CareerService } from './services/career.service.js';

export function createApp(): Express {
  const app = express();

  // 1. Security Headers (Helmet)
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"]
      }
    },
    frameguard: { action: 'deny' },
    noSniff: true
  }));

  // 2. CORS
  const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5000',
    'http://127.0.0.1:5000'
  ];

  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive in local dev
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  }));

  // 3. Body parsers
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // 4. Rate limiting for sensitive operations
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 mins
    max: process.env.NODE_ENV === 'test' ? 1000 : 50,
    message: { success: false, error: 'Too many requests, please try again later.' }
  });

  const resumeLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 mins
    max: process.env.NODE_ENV === 'test' ? 1000 : 20,
    message: { success: false, error: 'Too many resume upload requests, please try again later.' }
  });

  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/register', authLimiter);
  app.use('/api/resume/upload', resumeLimiter);

  // 5. Health check & API Options
  app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', service: 'FutureHub API', timestamp: new Date().toISOString() });
  });

  // Backward-compatible /api/options for existing contract
  app.get('/api/options', (req: Request, res: Response) => {
    try {
      const skills = CareerService.getAllSkills();
      const interests = CareerService.getAllInterests();

      const skillsMap: Record<string, string[]> = {};
      skills.forEach((s: any) => {
        skillsMap[s.category] = s.skills;
      });

      res.status(200).json({
        success: true,
        options: {
          education_levels: [
            'B.Sc Computer Science (TYCS / SYCS / FYCS)',
            'Bachelor of Computer Applications (BCA)',
            'B.Tech / B.E. Computer Science / IT',
            'Master of Computer Applications (MCA)',
            'Diploma / Other Technical Degree'
          ],
          interests,
          skills_by_category: skillsMap,
          experience_levels: ['Beginner', '1–2 Years', '3+ Years']
        }
      });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // Backward-compatible /api/recommend endpoint
  app.post('/api/recommend', (req: Request, res: Response, next: NextFunction) => {
    // Forward to assessment handler
    app._router.handle({ ...req, url: '/api/assessment', method: 'POST' }, res, next);
  });

  // 6. Mount REST API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/careers', careerRoutes);
  app.use('/api/profile', profileRoutes);
  app.use('/api/assessment', assessmentRoutes);
  app.use('/api/recommendations', assessmentRoutes);
  app.use('/api/saved-careers', savedRoutes);
  app.use('/api/roadmap', roadmapRoutes);
  app.use('/api/resume', resumeRoutes);

  // 7. Serve Static Frontend if built
  const clientDist = path.resolve(process.cwd(), '../client/dist');
  const localClientDist = path.resolve(process.cwd(), 'client/dist');
  const publicStatic = path.resolve(process.cwd(), 'public');

  let staticPath: string | null = null;
  if (fs.existsSync(clientDist)) staticPath = clientDist;
  else if (fs.existsSync(localClientDist)) staticPath = localClientDist;
  else if (fs.existsSync(publicStatic)) staticPath = publicStatic;

  if (staticPath) {
    app.use(express.static(staticPath));
    app.get('*', (req: Request, res: Response, next: NextFunction) => {
      if (req.path.startsWith('/api')) return next();
      res.sendFile(path.join(staticPath!, 'index.html'));
    });
  }

  // 8. 404 Handler for undefined API routes
  app.use('/api/*', (req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      error: `API route "${req.method} ${req.originalUrl}" not found.`
    });
  });

  // 9. Global Error Handler
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Unhandled server error:', err);
    res.status(err.status || 500).json({
      success: false,
      error: process.env.NODE_ENV === 'production' ? 'Internal server error.' : (err.message || 'Server error.')
    });
  });

  return app;
}
