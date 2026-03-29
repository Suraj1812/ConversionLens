import { ZodError } from 'zod';
import { logger } from '../lib/logger.js';

export function errorHandler(error, req, res, next) {
  const statusCode = error.statusCode || (error instanceof ZodError ? 400 : 500);
  const responseBody = {
    message:
      statusCode >= 500 ? 'Something went wrong on the server' : error.message || 'Request failed',
    requestId: req.id
  };

  if (error.details) {
    responseBody.details = error.details;
  }

  if (error instanceof ZodError) {
    responseBody.details = error.flatten();
  }

  logger.error('request_failed', {
    requestId: req.id,
    statusCode,
    path: req.originalUrl,
    method: req.method,
    error: error.message
  });

  res.status(statusCode).json(responseBody);
}
