import { testConnection } from '../config/pgdb.js';
import { logger } from '../utils/logger.js';

async function initializeDatabase() {
  try {
    await testConnection();
    logger.info('Database initialization complete');
    process.exit(0);
  } catch (error) {
    logger.error('Database initialization failed:', error);
    process.exit(1);
  }
}

initializeDatabase(); 