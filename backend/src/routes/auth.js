import rateLimit from 'express-rate-limit';
import { Router } from 'express';
import {
  clearSessionCookie,
  getSessionTokenFromRequest,
  setSessionCookie
} from '../lib/auth.js';
import { createHttpError } from '../lib/http.js';
import { createRequireAuth } from '../middleware/requireAuth.js';
import { loginSchema } from '../validation/auth.js';

function parsePayload(payload, schema, message) {
  const parsed = schema.safeParse(payload);

  if (!parsed.success) {
    throw createHttpError(400, message, parsed.error.flatten());
  }

  return parsed.data;
}

function buildRequestContext(req) {
  return {
    ipAddress: req.ip,
    userAgent: req.get('user-agent') || null
  };
}

export function createAuthRouter(authService, config) {
  const router = Router();
  const requireAuth = createRequireAuth(authService, config);
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      message: 'Too many authentication attempts. Try again in a few minutes.'
    }
  });

  router.post('/login', authLimiter, async (req, res, next) => {
    try {
      const payload = parsePayload(req.body, loginSchema, 'Invalid login payload');
      const result = await authService.login(payload, buildRequestContext(req));
      setSessionCookie(res, config, result.sessionToken);

      res.json({
        user: result.user,
        sessionExpiresAt: result.sessionExpiresAt
      });
    } catch (error) {
      next(error);
    }
  });

  router.post('/logout', async (req, res, next) => {
    try {
      const sessionToken = getSessionTokenFromRequest(req, config.authCookieName);
      await authService.logout(sessionToken);
      clearSessionCookie(res, config);

      res.json({
        message: 'Logged out successfully'
      });
    } catch (error) {
      next(error);
    }
  });

  router.get('/me', requireAuth, async (req, res) => {
    res.json({
      user: req.user
    });
  });

  return router;
}

export default createAuthRouter;
