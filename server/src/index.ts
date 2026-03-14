import { GatewayApp } from './app.js';
import { Config } from './utils/index.js';
import { Logger } from './utils/index.js';

const logger = new Logger('Main');
const config = Config.getInstance();

async function main(): Promise<void> {
  const app = new GatewayApp();

  app.initialize();

  const port = config.get('port');
  await app.start(port);

  logger.info(`Configuration: ${JSON.stringify(config.getAll())}`);

  // Graceful shutdown handlers
  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}, shutting down gracefully...`);
    await app.stop();
    await Logger.shutdown();
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main().catch((err) => {
  logger.error('Failed to start gateway:', err);
  process.exit(1);
});
