import log4js from 'log4js';
import path from 'node:path';

/**
 * Log4js configuration initializer.
 * Configures console and file appenders with daily rolling.
 */
function initLog4js(): void {
  const logDir = process.env.LOG_DIR || path.resolve(process.cwd(), 'logs');
  const logLevel = (process.env.LOG_LEVEL || 'info').toLowerCase();

  log4js.configure({
    appenders: {
      console: {
        type: 'console',
        layout: {
          type: 'pattern',
          pattern: '%[[%d{ISO8601}] [%p] [%c]%] %m',
        },
      },
      file: {
        type: 'dateFile',
        filename: path.join(logDir, 'gateway.log'),
        pattern: 'yyyy-MM-dd',
        keepFileExt: true,
        numBackups: 30,
        compress: true,
        layout: {
          type: 'pattern',
          pattern: '[%d{ISO8601}] [%p] [%c] %m',
        },
      },
      errorFile: {
        type: 'dateFile',
        filename: path.join(logDir, 'error.log'),
        pattern: 'yyyy-MM-dd',
        keepFileExt: true,
        numBackups: 30,
        compress: true,
        layout: {
          type: 'pattern',
          pattern: '[%d{ISO8601}] [%p] [%c] %m',
        },
      },
      errorFilter: {
        type: 'logLevelFilter',
        appender: 'errorFile',
        level: 'error',
      },
    },
    categories: {
      default: {
        appenders: ['console', 'file', 'errorFilter'],
        level: logLevel,
        enableCallStack: false,
      },
    },
  });
}

// Initialize log4js on first import
initLog4js();

/**
 * Logger wrapper around log4js.
 * Maintains the same public interface so all existing code works without changes.
 * Each Logger instance maps to a named log4js category (module name).
 */
export class Logger {
  private log: log4js.Logger;

  constructor(moduleName: string) {
    this.log = log4js.getLogger(moduleName);
  }

  debug(message: string, ...args: unknown[]): void {
    this.log.debug(message, ...args);
  }

  info(message: string, ...args: unknown[]): void {
    this.log.info(message, ...args);
  }

  warn(message: string, ...args: unknown[]): void {
    this.log.warn(message, ...args);
  }

  error(message: string, ...args: unknown[]): void {
    this.log.error(message, ...args);
  }

  /**
   * Update global log level at runtime for all categories
   */
  static setLevel(level: string): void {
    // Update the default category level which affects all loggers
    const defaultLogger = log4js.getLogger();
    defaultLogger.level = level;
  }

  /**
   * Gracefully shutdown log4js (flush pending writes).
   * Call this before process exit.
   */
  static async shutdown(): Promise<void> {
    return new Promise((resolve, reject) => {
      log4js.shutdown((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}
