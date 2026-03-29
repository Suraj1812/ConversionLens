import { Router } from 'express';
import { createHttpError } from '../lib/http.js';
import { createAnalyticsQuerySchema } from '../validation/analytics.js';

function parseQuery(query, schema) {
  const parsed = schema.safeParse(query);

  if (!parsed.success) {
    throw createHttpError(400, 'Invalid analytics query', parsed.error.flatten());
  }

  return parsed.data;
}

export function createAnalyticsRouter(analyticsService, options = {}) {
  const router = Router();
  const analyticsQuerySchema = createAnalyticsQuerySchema(options.defaultWindowDays);

  router.get('/overview', async (req, res, next) => {
    try {
      const query = parseQuery(req.query, analyticsQuerySchema);
      const overview = await analyticsService.getOverviewStats(query);
      res.json(overview);
    } catch (error) {
      next(error);
    }
  });

  router.get('/funnel', async (req, res, next) => {
    try {
      const query = parseQuery(req.query, analyticsQuerySchema);
      const funnel = await analyticsService.getFunnelStats(query);
      res.json(funnel);
    } catch (error) {
      next(error);
    }
  });

  router.get('/products', async (req, res, next) => {
    try {
      const query = parseQuery(req.query, analyticsQuerySchema);
      const productStats = await analyticsService.getProductStats(query);
      res.json(productStats);
    } catch (error) {
      next(error);
    }
  });

  return router;
}

export default createAnalyticsRouter;
