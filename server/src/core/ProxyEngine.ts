import { Request, Response, NextFunction, RequestHandler } from 'express';
import { createProxyMiddleware, Options } from 'http-proxy-middleware';
import { ServiceRegistry } from './ServiceRegistry.js';
import { ServiceInfo, RegistryEvent } from '../types/index.js';
import { Logger } from '../utils/index.js';

const logger = new Logger('ProxyEngine');

/**
 * Dynamic reverse proxy engine.
 * Listens to ServiceRegistry events to create/destroy proxy instances.
 * Routes requests based on the Host header.
 */
export class ProxyEngine {
  private proxies: Map<string, RequestHandler> = new Map();
  private registry: ServiceRegistry;

  constructor(registry: ServiceRegistry) {
    this.registry = registry;
  }

  /**
   * Initialize the engine: create proxies for existing services
   * and listen for registry events.
   */
  initialize(): void {
    // Create proxies for all currently registered services
    for (const service of this.registry.getAllServices()) {
      this.createProxy(service);
    }

    // Listen for registry changes
    this.registry.on(RegistryEvent.SERVICE_REGISTERED, (service: ServiceInfo) => {
      this.createProxy(service);
    });

    this.registry.on(RegistryEvent.SERVICE_UNREGISTERED, (service: ServiceInfo) => {
      this.removeProxy(service.domain);
    });

    logger.info(`ProxyEngine initialized with ${this.proxies.size} proxies`);
  }

  /**
   * Express middleware: match Host header and forward request.
   */
  handleRequest = (req: Request, res: Response, next: NextFunction): void => {
    const hostname = this.extractHostname(req);
    const proxy = this.proxies.get(hostname);

    if (!proxy) {
      // No matching proxy — fall through to static serve
      next();
      return;
    }

    logger.debug(`Proxying ${hostname} -> registered target`);
    proxy(req, res, next);
  };

  private createProxy(service: ServiceInfo): void {
    const { domain, target } = service;

    // If proxy already exists for this domain, remove it first (handles updates)
    if (this.proxies.has(domain)) {
      this.proxies.delete(domain);
    }

    const options: Options = {
      target,
      changeOrigin: true,
      ws: true,
      on: {
        error: (err, req, res) => {
          logger.error(`Proxy error for ${domain}:`, err.message);
          if (res && 'writeHead' in res && !res.headersSent) {
            (res as Response).status(502).json({
              success: false,
              error: 'Bad Gateway',
              message: `Failed to proxy request to ${domain}`,
            });
          }
        },
        proxyReq: (_proxyReq, req) => {
          logger.debug(`[${domain}] ${req.method} ${req.url}`);
        },
      },
    };

    const proxyMiddleware = createProxyMiddleware(options);
    this.proxies.set(domain, proxyMiddleware as RequestHandler);
    logger.info(`Proxy created: ${domain} -> ${target}`);
  }

  private removeProxy(domain: string): void {
    if (this.proxies.has(domain)) {
      this.proxies.delete(domain);
      logger.info(`Proxy removed: ${domain}`);
    }
  }

  /**
   * Extract hostname from the request Host header, stripping the port.
   */
  private extractHostname(req: Request): string {
    const host = req.hostname || req.headers.host || '';
    return host.split(':')[0].toLowerCase();
  }
}
