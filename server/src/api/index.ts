import { Router } from 'express';
import { ServiceController } from './ServiceController.js';
import { HealthController } from './HealthController.js';
import { ServiceRegistry } from '../core/index.js';

/**
 * Create and return the unified API router with all controllers mounted.
 */
export function createApiRouter(registry: ServiceRegistry): Router {
  const router = Router();

  const serviceController = new ServiceController(registry);
  const healthController = new HealthController(registry);

  router.use(serviceController.getRouter());
  router.use(healthController.getRouter());

  return router;
}
