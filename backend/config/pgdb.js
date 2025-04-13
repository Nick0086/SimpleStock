import pkg from 'pg';
import { logger } from '../utils/logger.js';

const { Pool } = pkg;

// No need for dotenv.config() anymore
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_DATABASE,
  max: parseInt(process.env.DB_CONNECTION_LIMIT || '20'),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Validate required environment variables
const requiredEnvVars = ['DB_USER', 'DB_PASSWORD', 'DB_HOST', 'DB_DATABASE'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    logger.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

const pool = new Pool(dbConfig);

// Add event listeners for connection management
pool.on('connect', (client) => {
  logger.info('New client connected to PostgreSQL');
});

pool.on('error', (err, client) => {
  logger.error('Unexpected error on idle client', err);
});

// Export a wrapper object with all the methods we need
const pgdb = {
  /**
   * Execute a query using a pooled connection
   */
  query: (...args) => pool.query(...args),

  /**
   * Get a dedicated client from the pool
   */
  getClient: () => pool.connect(),

  /**
   * End the pool (useful for cleanup)
   */
  end: () => pool.end(),
};

// Test the connection function
export const testConnection = async () => {
  let client;
  try {
    client = await pool.connect();
    await client.query('SELECT 1');
    logger.info('Database connection test successful');
    return true;
  } catch (error) {
    logger.error('Database connection test failed:', error.message);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
  }
};

export default pgdb;
