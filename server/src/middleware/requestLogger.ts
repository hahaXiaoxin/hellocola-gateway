import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/index.js';

const logger = new Logger('HTTP');

/**
 * Request logging middleware.
 * Logs method, URL, Host header, status code, and response time.
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const { method, originalUrl } = req;
  const host = req.headers.host || '-';

  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    logger.info(`${method} ${originalUrl} [Host: ${host}] ${statusCode} ${duration}ms`);
  });

  next();
}
