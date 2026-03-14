/**
 * Service status enum
 */
export enum ServiceStatus {
  /** Service is active and receiving heartbeats */
  ACTIVE = 'active',
  /** Service restored from persistence, awaiting heartbeat confirmation */
  PENDING = 'pending',
}

/**
 * Complete service information stored in the registry
 */
export interface ServiceInfo {
  /** Domain name, serves as unique identifier */
  domain: string;
  /** Proxy target address, e.g. http://localhost:8080 */
  target: string;
  /** Display name of the service */
  name: string;
  /** Service description */
  description?: string;
  /** Service icon URL */
  icon?: string;
  /** Time-to-live in seconds, default 30 */
  ttl: number;
  /** Last heartbeat timestamp (Date.now()) */
  lastHeartbeat: number;
  /** Current service status */
  status: ServiceStatus;
  /** ISO timestamp of initial registration */
  registeredAt: string;
}

/**
 * Input payload for registering a service
 */
export interface RegisterServiceInput {
  domain: string;
  target: string;
  name: string;
  description?: string;
  icon?: string;
  /** TTL in seconds, defaults to config.defaultTtl */
  ttl?: number;
}

/**
 * Unified API response envelope
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Registry event types
 */
export enum RegistryEvent {
  SERVICE_REGISTERED = 'service:registered',
  SERVICE_UNREGISTERED = 'service:unregistered',
  SERVICE_HEARTBEAT = 'service:heartbeat',
}

/**
 * Application configuration interface
 */
export interface AppConfig {
  port: number;
  dataDir: string;
  logLevel: string;
  reaperIntervalMs: number;
  defaultTtl: number;
  pendingConfirmTimeout: number;
}
