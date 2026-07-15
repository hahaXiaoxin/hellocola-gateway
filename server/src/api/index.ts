import { Router, json } from 'express';
import { ServiceController } from './ServiceController.js';
import { HealthController } from './HealthController.js';
import { ServiceRegistry } from '../core/index.js';

/**
 * Create and return the unified API router with all controllers mounted.
 * express.json() is applied here so it only parses body for gateway's own
 * API routes, not for proxied requests (e.g. alist's /api/auth/login).
 */
export function createApiRouter(registry: ServiceRegistry): Router {
  const router = Router();

  // Parse JSON body ONLY for gateway's own API routes
  router.use(json());

  const serviceController = new ServiceController(registry);
  const healthController = new HealthController(registry);

  router.use(serviceController.getRouter());
  router.use(healthController.getRouter());

  return router;
}
