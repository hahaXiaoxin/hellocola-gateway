import { ServiceRegistry } from './ServiceRegistry.js';
import { ServiceStatus } from '../types/index.js';
import { Logger, Config } from '../utils/index.js';

const logger = new Logger('ServiceReaper');

/**
 * Periodically scans the service registry and removes services
 * that have exceeded their TTL without a heartbeat.
 * Also cleans up PENDING services that were not confirmed after restore.
 */
export class ServiceReaper {
  private registry: ServiceRegistry;
  private intervalId: NodeJS.Timeout | null = null;
  private scanIntervalMs: number;
  private pendingConfirmTimeout: number;

  constructor(registry: ServiceRegistry, scanIntervalMs?: number) {
    const config = Config.getInstance();
    this.registry = registry;
    this.scanIntervalMs = scanIntervalMs ?? config.get('reaperIntervalMs');
    this.pendingConfirmTimeout = config.get('pendingConfirmTimeout');
  }

  /**
   * Start the periodic reap scan.
   */
  start(): void {
    if (this.intervalId) {
      logger.warn('Reaper is already running');
      return;
    }

    this.intervalId = setInterval(() => {
      this.reap();
    }, this.scanIntervalMs);

    logger.info(
      `ServiceReaper started (scan interval: ${this.scanIntervalMs}ms, ` +
      `pending timeout: ${this.pendingConfirmTimeout}s)`
    );
  }

  /**
   * Stop the periodic reap scan.
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      logger.info('ServiceReaper stopped');
    }
  }

  /**
   * Scan all services and unregister those that have timed out.
   */
  private reap(): void {
    const now = Date.now();
    const services = this.registry.getAllServices();
    let reaped = 0;

    for (const service of services) {
      const elapsed = (now - service.lastHeartbeat) / 1000;

      if (service.status === ServiceStatus.ACTIVE && elapsed > service.ttl) {
        logger.info(
          `Reaping expired ACTIVE service: ${service.domain} ` +
          `(last heartbeat ${elapsed.toFixed(1)}s ago, ttl: ${service.ttl}s)`
        );
        this.registry.unregister(service.domain);
        reaped++;
      } else if (
        service.status === ServiceStatus.PENDING &&
        elapsed > this.pendingConfirmTimeout
      ) {
        logger.info(
          `Reaping unconfirmed PENDING service: ${service.domain} ` +
          `(pending for ${elapsed.toFixed(1)}s, timeout: ${this.pendingConfirmTimeout}s)`
        );
        this.registry.unregister(service.domain);
        reaped++;
      }
    }

    if (reaped > 0) {
      logger.info(`Reaped ${reaped} expired service(s)`);
    }
  }
}
