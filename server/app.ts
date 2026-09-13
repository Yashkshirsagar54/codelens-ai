import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import * as Sentry from '@sentry/node';
import { webhookRouter } from './routes/webhooks';
import { analyzeRouter } from './routes/analyze';
import { historyRouter } from './routes/history';
import { authRouter } from './routes/auth';
import { chatRouter } from './routes/chat';
import { toolsRouter } from './routes/tools';

dotenv.config();

// Initialize Sentry Node SDK if DSN is configured
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: 1.0,
  });
}

const app: Express = express();

// Configure CORS
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// Mount raw body parser for webhook endpoints
app.use('/api/webhooks', express.raw({ type: 'application/json' }), webhookRouter);

// Global JSON body parser for standard API routes
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Protected & public API routes
app.use('/api/auth', authRouter);
app.use('/api/analyze-code', analyzeRouter);
app.use('/api/history', historyRouter);
app.use('/api/chat', chatRouter);
app.use('/api/tools', toolsRouter);

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Centralized error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('🔥 Centralized Server Error:', err);
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(err);
  }
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

export default app;
