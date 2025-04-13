import { queryUtils } from './query.utils.js';
import { logger } from './logger.js';

export const migrationUtils = {
  async runMigration(migrationQueries) {
    return queryUtils.executeTransaction(async (client) => {
      try {
        for (const query of migrationQueries) {
          await queryUtils.executeQuery(query);
        }
        logger.info('Migration completed successfully');
      } catch (error) {
        logger.error('Migration failed:', error);
        throw error;
      }
    });
  },

  async checkMigrationStatus() {
    const query = `
      SELECT version, applied_at
      FROM schema_migrations
      ORDER BY applied_at DESC
      LIMIT 1
    `;
    return queryUtils.executeQuerySingle(query);
  }
}; 