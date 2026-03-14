import { Router, Request, Response } from 'express';
import { ServiceRegistry } from '../core/index.js';
import type { RegisterServiceInput, ApiResponse, ServiceInfo } from '../types/index.js';
import { Logger } from '../utils/index.js';

const logger = new Logger('ServiceController');

/**
 * REST controller for service registration, unregistration,
 * querying, and heartbeat operations.
 */
export class ServiceController {
  private registry: ServiceRegistry;
  private router: Router;

  constructor(registry: ServiceRegistry) {
    this.registry = registry;
    this.router = Router();
    this.setupRoutes();
  }

  getRouter(): Router {
    return this.router;
  }

  private setupRoutes(): void {
    this.router.post('/services', this.register.bind(this));
    this.router.delete('/services/:domain', this.unregister.bind(this));
    this.router.get('/services', this.list.bind(this));
    this.router.get('/services/:domain', this.detail.bind(this));
    this.router.put('/services/:domain/heartbeat', this.heartbeat.bind(this));
  }

  /**
   * POST /api/services — Register a service (idempotent upsert)
   */
  private register(req: Request, res: Response): void {
    const input = req.body as RegisterServiceInput;

    if (!input.domain || !input.target || !input.name) {
      const response: ApiResponse = {
        success: false,
        error: 'Validation Error',
        message: 'Fields "domain", "target", and "name" are required',
      };
      res.status(400).json(response);
      return;
    }

    const service = this.registry.register(input);
    const response: ApiResponse<ServiceInfo> = {
      success: true,
      data: service,
      message: 'Service registered successfully',
    };
    res.status(200).json(response);
  }

  /**
   * DELETE /api/services/:domain — Unregister a service
   */
  private unregister(req: Request<{ domain: string }>, res: Response): void {
    const domain = req.params.domain;
    const success = this.registry.unregister(domain);

    if (!success) {
      const response: ApiResponse = {
        success: false,
        error: 'Not Found',
        message: `Service with domain "${domain}" not found`,
      };
      res.status(404).json(response);
      return;
    }

    const response: ApiResponse = {
      success: true,
      message: `Service "${domain}" unregistered successfully`,
    };
    res.status(200).json(response);
  }

  /**
   * GET /api/services — List all registered services
   */
  private list(_req: Request, res: Response): void {
    const services = this.registry.getAllServices();
    const response: ApiResponse<ServiceInfo[]> = {
      success: true,
      data: services,
    };
    res.status(200).json(response);
  }

  /**
   * GET /api/services/:domain — Get details for a single service
   */
  private detail(req: Request<{ domain: string }>, res: Response): void {
    const domain = req.params.domain;
    const service = this.registry.getService(domain);

    if (!service) {
      const response: ApiResponse = {
        success: false,
        error: 'Not Found',
        message: `Service with domain "${domain}" not found`,
      };
      res.status(404).json(response);
      return;
    }

    const response: ApiResponse<ServiceInfo> = {
      success: true,
      data: service,
    };
    res.status(200).json(response);
  }

  /**
   * PUT /api/services/:domain/heartbeat — Refresh heartbeat
   */
  private heartbeat(req: Request<{ domain: string }>, res: Response): void {
    const domain = req.params.domain;
    const success = this.registry.refreshHeartbeat(domain);

    if (!success) {
      const response: ApiResponse = {
        success: false,
        error: 'Not Found',
        message: `Service with domain "${domain}" not found. Please register first.`,
      };
      res.status(404).json(response);
      return;
    }

    const response: ApiResponse = {
      success: true,
      message: `Heartbeat received for "${domain}"`,
    };
    res.status(200).json(response);
  }
}
