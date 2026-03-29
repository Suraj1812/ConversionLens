import compression from 'compression';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoose from 'mongoose';
import morgan from 'morgan';
import { analyticsService } from './services/analyticsService.js';
import { eventService } from './services/eventService.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFound.js';
import { requestId } from './middleware/requestId.js';
import createAnalyticsRouter from './routes/analytics.js';
import createEventsRouter from './routes/events.js';

const defaultConfig = {
  corsOrigins: ['http://localhost:5173'],
  rateLimitWindowMs: 60000,
  rateLimitMaxRequests: 250,
  nodeEnv: 'development',
  trustProxy: false,
  defaultWindowDays: 30
};

function buildCorsOrigin(origins) {
  if (!origins?.length) {
    return true;
  }

  return origins;
}

export function createApp({
  config = defaultConfig,
  analytics = analyticsService,
  events = eventService
} = {}) {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', config.trustProxy);

  app.use(requestId);
  app.use(
    helmet({
      crossOriginResourcePolicy: false
    })
  );
  app.use(compression());
  app.use(
    cors({
      origin: buildCorsOrigin(config.corsOrigins)
    })
  );
  app.use(
    rateLimit({
      windowMs: config.rateLimitWindowMs,
      limit: config.rateLimitMaxRequests,
      standardHeaders: true,
      legacyHeaders: false
    })
  );
  app.use(
    morgan(config.nodeEnv === 'production' ? 'combined' : 'dev', {
      skip: () => config.nodeEnv === 'test'
    })
  );
  app.use(express.json({ limit: '100kb' }));

  app.get('/healthz', (req, res) => {
    res.json({
      status: 'ok',
      requestId: req.id
    });
  });

  app.get('/readyz', (req, res) => {
    const isReady = mongoose.connection.readyState === 1;

    res.status(isReady ? 200 : 503).json({
      status: isReady ? 'ready' : 'not_ready',
      mongoState: mongoose.connection.readyState,
      requestId: req.id
    });
  });

  app.use(createEventsRouter(events));
  app.use(
    '/analytics',
    createAnalyticsRouter(analytics, {
      defaultWindowDays: config.defaultWindowDays
    })
  );

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
