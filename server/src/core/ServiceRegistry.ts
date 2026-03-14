import { EventEmitter } from 'events';
import fs from 'fs';
import path from 'path';
import {
  ServiceInfo,
  ServiceStatus,
  RegisterServiceInput,
  RegistryEvent,
} from '../types/index.js';
import { Logger, Config } from '../utils/index.js';

const logger = new Logger('ServiceRegistry');

/**
 * Singleton service registry with event-driven updates,
 * idempotent registration, heartbeat refresh, and JSON persistence.
 */
export class ServiceRegistry extends EventEmitter {
  private static instance: ServiceRegistry;
  private services: Map<string, ServiceInfo> = new Map();
  private dataFilePath: string;
  private persistTimer: NodeJS.Timeout | null = null;
  private persistDebounceMs = 300;

  private constructor(dataDir: string) {
    super();
    this.dataFilePath = path.join(dataDir, 'services.json');
    this.ensureDataDir(dataDir);
    this.load();
  }

  static getInstance(dataDir?: string): ServiceRegistry {
    if (!ServiceRegistry.instance) {
      const dir = dataDir || Config.getInstance().get('dataDir');
      ServiceRegistry.instance = new ServiceRegistry(dir);
    }
    return ServiceRegistry.instance;
  }

  /**
   * Register or update a service (idempotent upsert).
   * If the domain already exists, update its info and refresh heartbeat.
   */
  register(input: RegisterServiceInput): ServiceInfo {
    const config = Config.getInstance();
    const existing = this.services.get(input.domain);

    const service: ServiceInfo = {
      domain: input.domain,
      target: input.target,
      name: input.name,
      description: input.description,
      icon: input.icon,
      ttl: input.ttl ?? config.get('defaultTtl'),
      lastHeartbeat: Date.now(),
      status: ServiceStatus.ACTIVE,
      registeredAt: existing?.registeredAt ?? new Date().toISOString(),
    };

    const isUpdate = this.services.has(input.domain);
    this.services.set(input.domain, service);
    this.schedulePersist();

    if (isUpdate) {
      logger.info(`Service updated: ${input.domain} -> ${input.target}`);
    } else {
      logger.info(`Service registered: ${input.domain} -> ${input.target}`);
    }

    this.emit(RegistryEvent.SERVICE_REGISTERED, service);
    return service;
  }

  /**
   * Unregister a service by domain.
   */
  unregister(domain: string): boolean {
    const service = this.services.get(domain);
    if (!service) {
      logger.warn(`Unregister failed: service not found for domain ${domain}`);
      return false;
    }

    this.services.delete(domain);
    this.schedulePersist();
    logger.info(`Service unregistered: ${domain}`);
    this.emit(RegistryEvent.SERVICE_UNREGISTERED, service);
    return true;
  }

  /**
   * Refresh heartbeat for a service. Transitions PENDING -> ACTIVE.
   */
  refreshHeartbeat(domain: string): boolean {
    const service = this.services.get(domain);
    if (!service) {
      logger.warn(`Heartbeat failed: service not found for domain ${domain}`);
      return false;
    }

    service.lastHeartbeat = Date.now();
    if (service.status === ServiceStatus.PENDING) {
      service.status = ServiceStatus.ACTIVE;
      logger.info(`Service confirmed active: ${domain}`);
    }

    this.services.set(domain, service);
    this.emit(RegistryEvent.SERVICE_HEARTBEAT, service);
    return true;
  }

  getService(domain: string): ServiceInfo | undefined {
    return this.services.get(domain);
  }

  getAllServices(): ServiceInfo[] {
    return Array.from(this.services.values());
  }

  getActiveServices(): ServiceInfo[] {
    return this.getAllServices().filter(
      (s) => s.status === ServiceStatus.ACTIVE
    );
  }

  get size(): number {
    return this.services.size;
  }

  /**
   * Debounced async persistence to JSON file.
   */
  private schedulePersist(): void {
    if (this.persistTimer) {
      clearTimeout(this.persistTimer);
    }
    this.persistTimer = setTimeout(() => {
      this.persist();
    }, this.persistDebounceMs);
  }

  private async persist(): Promise<void> {
    const data = JSON.stringify(this.getAllServices(), null, 2);
    fs.writeFile(this.dataFilePath, data, 'utf-8', (err) => {
      if (err) {
        logger.error('Failed to persist services:', err);
      } else {
        logger.debug('Services persisted to disk');
      }
    });
  }

  /**
   * Synchronously load persisted services on startup.
   * All restored services are marked as PENDING until they send a heartbeat.
   */
  private load(): void {
    if (!fs.existsSync(this.dataFilePath)) {
      logger.info('No persisted data file found, starting fresh');
      return;
    }

    const raw = fs.readFileSync(this.dataFilePath, 'utf-8');
    const services: ServiceInfo[] = JSON.parse(raw);

    for (const service of services) {
      service.status = ServiceStatus.PENDING;
      service.lastHeartbeat = Date.now();
      this.services.set(service.domain, service);
    }

    logger.info(`Loaded ${services.length} services from persistence (marked as PENDING)`);
  }

  private ensureDataDir(dataDir: string): void {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      logger.info(`Created data directory: ${dataDir}`);
    }
  }
}
