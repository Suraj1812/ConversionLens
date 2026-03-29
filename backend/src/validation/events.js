import { z } from 'zod';

const eventTypes = ['view', 'add_to_cart', 'purchase'];

export const trackEventSchema = z.object({
  eventId: z.string().trim().min(8).max(128).optional(),
  eventType: z.enum(eventTypes),
  productId: z.string().trim().min(1).max(128),
  productTitle: z.string().trim().min(1).max(200).optional(),
  sessionId: z.string().trim().min(1).max(128),
  timestamp: z.coerce.date().optional(),
  pageUrl: z.string().url().max(2048).optional(),
  source: z
    .enum(['shopify_theme', 'shopify_pixel', 'dashboard', 'api'])
    .default('shopify_theme'),
  currency: z.string().trim().length(3).optional(),
  value: z.coerce.number().nonnegative().optional(),
  quantity: z.coerce.number().int().positive().optional(),
  orderId: z.string().trim().min(1).max(128).optional(),
  meta: z.record(z.union([z.string(), z.number(), z.boolean(), z.null()])).optional()
});
