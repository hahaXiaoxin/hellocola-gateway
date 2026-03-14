import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/index.js';
import type { ApiResponse } from '../types/index.js';

const logger = new Logger('ErrorHandler');

/**
 * Global error handling middleware.
 * Catches unhandled errors and returns a unified JSON error response.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  logger.error('Unhandled error:', err.message, err.stack);

  const statusCode = (err as any).statusCode || 500;
  const response: ApiResponse = {
    success: false,
    error: err.name || 'Internal Server Error',
    message: err.message || 'An unexpected error occurred',
  };

  res.status(statusCode).json(response);
}
