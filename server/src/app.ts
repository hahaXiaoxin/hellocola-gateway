import express, { Express } from 'express';
import cors from 'cors';
import http from 'http';
import { ServiceRegistry, ProxyEngine, ServiceReaper } from './core/index.js';
import { createApiRouter } from './api/index.js';
import { requestLogger, errorHandler, createStaticServe } from './middleware/index.js';
import { Logger, Config } from './utils/index.js';

const logger = new Logger('GatewayApp');

/**
 * Main gateway application class.
 * Assembles Express app with middleware chain, manages lifecycle
 * of ProxyEngine, ServiceReaper, and HTTP server.
 */
export class GatewayApp {
  private app: Express;
  private server: http.Server | null = null;
  private registry: ServiceRegistry;
  private proxyEngine: ProxyEngine;
  private reaper: ServiceReaper;

  constructor() {
    this.app = express();
    this.registry = ServiceRegistry.getInstance();
    this.proxyEngine = new ProxyEngine(this.registry);
    this.reaper = new ServiceReaper(this.registry);
  }

  /**
   * Initialize middleware chain and components.
   * Order matters: logging -> CORS -> JSON body -> API routes -> proxy -> static
   */
  initialize(): void {
    // Trust proxy for correct client IP behind Docker/nginx
    this.app.set('trust proxy', true);

    // 1. Request logging
    this.app.use(requestLogger);

    // 2. CORS for API access
    this.app.use(cors());

    // 3. JSON body parsing (only for API routes)
    this.app.use('/api', express.json());

    // 4. API routes
    const apiRouter = createApiRouter(this.registry);
    this.app.use('/api', apiRouter);

    // 5. Reverse proxy (matches by Host header)
    this.proxyEngine.initialize();
    this.app.use(this.proxyEngine.handleRequest);

    // 6. Static file serving (fallback for unmatched domains)
    const staticMiddlewares = createStaticServe();
    for (const mw of staticMiddlewares) {
      this.app.use(mw);
    }

    // 7. Global error handler (must be last)
    this.app.use(errorHandler);

    logger.info('GatewayApp initialized');
  }

  /**
   * Start the HTTP server and ServiceReaper.
   */
  start(port: number): Promise<void> {
    return new Promise((resolve) => {
      this.server = this.app.listen(port, () => {
        logger.info(`Gateway server listening on port ${port}`);
        this.reaper.start();
        resolve();
      });

      // Handle WebSocket upgrade for proxy
      this.server.on('upgrade', (req, socket, head) => {
        // WebSocket upgrade is handled by http-proxy-middleware internally
        logger.debug(`WebSocket upgrade request: ${req.headers.host}`);
      });
    });
  }

  /**
   * Gracefully stop the server and reaper.
   */
  async stop(): Promise<void> {
    logger.info('Shutting down GatewayApp...');
    this.reaper.stop();

    if (this.server) {
      return new Promise((resolve) => {
        this.server!.close(() => {
          logger.info('HTTP server closed');
          resolve();
        });
      });
    }
  }
}
