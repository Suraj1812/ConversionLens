import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createApp } from './app.js';
import { loadEnv } from './config/env.js';
import { logger } from './lib/logger.js';

dotenv.config();

const env = loadEnv();
const app = createApp({
  config: env
});

async function startServer() {
  await mongoose.connect(env.mongodbUri);

  const server = app.listen(env.port, () => {
    logger.info('backend_started', {
      port: env.port,
      nodeEnv: env.nodeEnv
    });
  });

  server.keepAliveTimeout = 65000;
  server.headersTimeout = 66000;

  const shutdown = async (signal) => {
    logger.warn('shutdown_requested', { signal });
    await mongoose.connection.close();
    server.close(() => {
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

startServer().catch((error) => {
  logger.error('backend_start_failed', {
    error: error.message
  });
  process.exit(1);
});
