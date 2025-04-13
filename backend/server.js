import app from './app.js';
import { testConnection } from './config/pgdb.js';
import { logger } from './utils/logger.js';

// No need for dotenv.config() anymore
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await testConnection();
    
    const server = app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });

    // Graceful shutdown handler
    const shutdown = async () => {
      logger.info('Shutting down gracefully...');
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    logger.error('Startup error:', error);
    process.exit(1);
  }
}

startServer();