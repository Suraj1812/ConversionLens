import { z } from 'zod';

export function createAnalyticsQuerySchema(defaultWindowDays = 30) {
  return z.object({
    windowDays: z.coerce.number().int().min(1).max(365).default(defaultWindowDays),
    limit: z.coerce.number().int().min(1).max(20).default(5)
  });
}
