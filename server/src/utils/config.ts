import path from 'path';
import { fileURLToPath } from 'url';
import type { AppConfig } from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Centralized configuration management.
 * Reads from environment variables with type-safe defaults.
 */
export class Config {
  private static instance: Config;
  private config: AppConfig;

  private constructor() {
    this.config = {
      port: this.getEnvInt('PORT', 3000),
      dataDir: process.env.DATA_DIR || path.resolve(__dirname, '../../data'),
      logLevel: process.env.LOG_LEVEL || 'info',
      reaperIntervalMs: this.getEnvInt('REAPER_INTERVAL_MS', 10000),
      defaultTtl: this.getEnvInt('DEFAULT_TTL', 30),
      pendingConfirmTimeout: this.getEnvInt('PENDING_CONFIRM_TIMEOUT', 60),
    };
  }

  static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config();
    }
    return Config.instance;
  }

  get<K extends keyof AppConfig>(key: K): AppConfig[K] {
    return this.config[key];
  }

  getAll(): Readonly<AppConfig> {
    return { ...this.config };
  }

  /**
   * Resolve the path to the web dist directory for static serving
   */
  getWebDistPath(): string {
    return path.resolve(__dirname, '../../../web/dist');
  }

  private getEnvInt(key: string, defaultValue: number): number {
    const value = process.env[key];
    if (value === undefined) return defaultValue;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  }
}
