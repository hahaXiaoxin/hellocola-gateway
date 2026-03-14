import { Request, Response, NextFunction } from 'express';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { Logger, Config } from '../utils/index.js';

const logger = new Logger('StaticServe');

/**
 * Create static file serving middleware for the web SPA.
 * Serves files from web/dist and falls back to index.html for SPA routing.
 */
export function createStaticServe(): express.RequestHandler[] {
  const config = Config.getInstance();
  const webDistPath = config.getWebDistPath();

  logger.info(`Static serve path: ${webDistPath}`);

  const staticMiddleware = express.static(webDistPath);

  const spaFallback = (req: Request, res: Response, next: NextFunction): void => {
    // Only handle GET requests that accept HTML
    if (req.method !== 'GET') {
      next();
      return;
    }

    const indexPath = path.join(webDistPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      logger.warn('index.html not found in web dist directory');
      res.status(503).json({
        success: false,
        error: 'Service Unavailable',
        message: 'Navigation page is not available. Please build the web project first.',
      });
    }
  };

  return [staticMiddleware, spaFallback];
}
