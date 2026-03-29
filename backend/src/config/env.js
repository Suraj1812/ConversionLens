import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  TRUST_PROXY: z
    .string()
    .default('false')
    .transform((value) => value === 'true'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(250),
  DEFAULT_WINDOW_DAYS: z.coerce.number().int().min(1).max(365).default(30)
});

export function loadEnv() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => issue.message).join(', ');
    throw new Error(`Invalid environment configuration: ${issues}`);
  }

  return {
    nodeEnv: parsed.data.NODE_ENV,
    port: parsed.data.PORT,
    mongodbUri: parsed.data.MONGODB_URI,
    corsOrigins: parsed.data.CORS_ORIGIN.split(',')
      .map((value) => value.trim())
      .filter(Boolean),
    trustProxy: parsed.data.TRUST_PROXY,
    rateLimitWindowMs: parsed.data.RATE_LIMIT_WINDOW_MS,
    rateLimitMaxRequests: parsed.data.RATE_LIMIT_MAX_REQUESTS,
    defaultWindowDays: parsed.data.DEFAULT_WINDOW_DAYS
  };
}
