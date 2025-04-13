import pgdb from '../config/pgdb.js';
import { logger } from './logger.js';
import { createError } from './errorUtils.js';

/**
 * Utility class for database operations
 */
export const queryUtils = {
    /**
     * Execute a single query
     * @param {string} text - SQL query text
     * @param {Array} params - Query parameters
     * @returns {Promise<Object>} Query result
     */
    async executeQuery(text, params = []) {
        try {
            logger.info('Executing query', { query: text, params });
            const result = await pgdb.query(text, params);
            return result.rows;
        } catch (error) {
            logger.error('Database query error', { error, query: text, params });
            throw this.handleDBError(error);
        }
    },

    /**
     * Execute a single query and return first row
     * @param {string} text - SQL query text
     * @param {Array} params - Query parameters
     * @returns {Promise<Object>} First row of query result
     */
    async executeQuerySingle(text, params = []) {
        const rows = await this.executeQuery(text, params);
        return rows[0] || null;
    },

    /**
     * Execute multiple queries in a transaction
     * @param {Function} callback - Transaction callback
     * @returns {Promise<any>} Transaction result
     */
    async executeTransaction(callback) {
        const client = await pgdb.getClient();
        try {
            await client.query('BEGIN');
            
            // Create a wrapper to ensure all queries in the callback use this client
            const clientWrapper = {
                query: (...args) => client.query(...args)
            };
            
            const result = await callback(clientWrapper);
            await client.query('COMMIT');
            return result;
        } catch (error) {
            await client.query('ROLLBACK');
            logger.error('Transaction error', { 
                error: error.message,
                stack: error.stack 
            });
            throw this.handleDBError(error);
        } finally {
            client.release();
        }
    },

    /**
     * Build WHERE clause from conditions
     * @param {Object} conditions - Query conditions
     * @returns {Object} WHERE clause and parameters
     */
    buildWhereClause(conditions = {}) {
        const params = [];
        const clauses = [];

        Object.entries(conditions).forEach(([key, value], index) => {
            if (value !== undefined && value !== null) {
                params.push(value);
                clauses.push(`${key} = $${params.length}`);
            }
        });

        const whereClause = clauses.length
            ? `WHERE ${clauses.join(' AND ')}`
            : '';

        return { whereClause, params };
    },

    /**
     * Handle database errors
     * @private
     * @param {Error} error - Database error
     * @returns {Error} Formatted error
     */
    handleDBError(error) {
        switch (error.code) {
            case '23505': // unique_violation
                return createError('Duplicate entry', 409);
            case '23503': // foreign_key_violation
                return createError('Referenced record not found', 404);
            case '23502': // not_null_violation
                return createError('Missing required field', 400);
            default:
                return createError('Database error', 500);
        }
    },

    /**
     * Insert multiple rows
     * @param {string} table - Table name
     * @param {Array} columns - Column names
     * @param {Array} values - Array of value arrays
     */
    async bulkInsert(table, columns, values) {
        const placeholders = values.map((_, rowIndex) =>
            `(${columns.map((_, colIndex) => 
                `$${rowIndex * columns.length + colIndex + 1}`).join(', ')})`
        ).join(', ');
        
        const query = `
            INSERT INTO ${table} (${columns.join(', ')})
            VALUES ${placeholders}
            RETURNING *
        `;
        
        const flatValues = values.flat();
        return this.executeQuery(query, flatValues);
    },

    /**
     * Update with returning
     * @param {string} table - Table name
     * @param {Object} updates - Update values
     * @param {Object} conditions - Where conditions
     */
    async updateReturning(table, updates, conditions) {
        const setClauses = [];
        const values = [];
        let paramCount = 1;

        // Build SET clause
        Object.entries(updates).forEach(([key, value]) => {
            setClauses.push(`${key} = $${paramCount}`);
            values.push(value);
            paramCount++;
        });

        // Build WHERE clause
        const whereClauses = [];
        Object.entries(conditions).forEach(([key, value]) => {
            whereClauses.push(`${key} = $${paramCount}`);
            values.push(value);
            paramCount++;
        });

        const query = `
            UPDATE ${table}
            SET ${setClauses.join(', ')}
            WHERE ${whereClauses.join(' AND ')}
            RETURNING *
        `;

        return this.executeQuerySingle(query, values);
    }
};
