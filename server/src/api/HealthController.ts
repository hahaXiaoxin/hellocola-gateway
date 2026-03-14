import { Router, Request, Response } from 'express';
import { ServiceRegistry } from '../core/index.js';
import type { ApiResponse } from '../types/index.js';

interface HealthData {
  status: string;
  uptime: number;
  totalServices: number;
  activeServices: number;
  timestamp: string;
}

/**
 * Health check controller for monitoring gateway status.
 */
export class HealthController {
  private registry: ServiceRegistry;
  private router: Router;
  private startTime: number;

  constructor(registry: ServiceRegistry) {
    this.registry = registry;
    this.router = Router();
    this.startTime = Date.now();
    this.setupRoutes();
  }

  getRouter(): Router {
    return this.router;
  }

  private setupRoutes(): void {
    this.router.get('/health', this.health.bind(this));
  }

  /**
   * GET /api/health — Return gateway health status
   */
  private health(_req: Request, res: Response): void {
    const data: HealthData = {
      status: 'healthy',
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      totalServices: this.registry.size,
      activeServices: this.registry.getActiveServices().length,
      timestamp: new Date().toISOString(),
    };

    const response: ApiResponse<HealthData> = {
      success: true,
      data,
    };
    res.status(200).json(response);
  }
}
