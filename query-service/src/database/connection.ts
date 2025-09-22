import { Pool } from 'pg';
import { logger } from '../utils/logger';

let pool: Pool | null = null;

/**
 * Initializes database connection pool
 */
export async function initializeDatabase(): Promise<void> {
  try {
    const dbUrl = process.env.DB_URL;
    
    if (!dbUrl) {
      throw new Error('DB_URL environment variable is required');
    }

    pool = new Pool({
      connectionString: dbUrl,
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
    });

    // Test the connection
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();

    logger.info('Database connection established successfully');
  } catch (error) {
    logger.error('Failed to initialize database connection:', error);
    throw error;
  }
}

/**
 * Gets the database connection pool
 * @returns Pool instance
 */
export function getPool(): Pool {
  if (!pool) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return pool;
}

/**
 * Closes the database connection pool
 */
export async function closeDatabase(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    logger.info('Database connection pool closed');
  }
}
