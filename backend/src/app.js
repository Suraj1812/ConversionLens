import compression from 'compression';
import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';
import { analyticsService } from './services/analyticsService.js';
import { createRequireAuth } from './middleware/requireAuth.js';
import createAuthRouter from './routes/auth.js';
import { eventService } from './services/eventService.js';
import { createAuthService } from './services/authService.js';
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
  defaultWindowDays: 30,
  authCookieName: 'shoplytics_session',
  authSessionDays: 7
};

function createAllowedOriginsSet(origins) {
  return new Set(origins || []);
}

function isAllowedOrigin(origin, allowedOrigins) {
  return !origin || allowedOrigins.size === 0 || allowedOrigins.has(origin);
}

function buildCorsOrigin(allowedOrigins) {
  const origins = allowedOrigins || createAllowedOriginsSet();

  return (origin, callback) => {
    if (isAllowedOrigin(origin, origins)) {
      callback(null, true);
      return;
    }

    callback(null, false);
  };
}

export function createApp({
  config = defaultConfig,
  analytics = analyticsService,
  events = eventService,
  auth = createAuthService(undefined, {
    authSessionDays: config.authSessionDays
  }),
  getReadiness = async () => ({
    ready: false,
    state: 'disconnected'
  })
  } = {}) {
  const app = express();
  const allowedOrigins = createAllowedOriginsSet(config.corsOrigins);
  const requireAuth = createRequireAuth(auth, config);
  const corsOptions = {
    origin: buildCorsOrigin(allowedOrigins),
    credentials: true
  };

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
      ...corsOptions
    })
  );
  app.options('*', cors(corsOptions));
  app.use((req, res, next) => {
    const requestOrigin = req.headers.origin;

    if (isAllowedOrigin(requestOrigin, allowedOrigins) && requestOrigin) {
      res.header('Access-Control-Allow-Origin', requestOrigin);
      res.header('Access-Control-Allow-Credentials', 'true');
      res.append('Vary', 'Origin');
    }

    next();
  });
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

  app.get('/readyz', async (req, res, next) => {
    try {
      const readiness = await getReadiness();

      res.status(readiness.ready ? 200 : 503).json({
        status: readiness.ready ? 'ready' : 'not_ready',
        databaseState: readiness.state,
        detail: readiness.detail,
        requestId: req.id
      });
    } catch (error) {
      next(error);
    }
  });

  app.use(createEventsRouter(events));
  app.use('/auth', createAuthRouter(auth, config));
  app.use(
    '/analytics',
    requireAuth,
    createAnalyticsRouter(analytics, {
      defaultWindowDays: config.defaultWindowDays
    })
  );

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
