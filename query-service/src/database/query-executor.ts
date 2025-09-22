import { readFileSync } from 'fs';
import { join } from 'path';
import { logger } from '../utils/logger';
import { getPool } from './connection';

/**
 * Executes a query for a specific category and month
 * @param category - The category to query
 * @param month - Month in YYYY-MM format
 * @returns Promise with query results
 */
export async function executeQuery(category: string, month: string): Promise<any[]> {
  const pool = getPool();
  
  try {
    // Load the SQL query file
    const sqlFile = join(process.cwd(), '..', 'sql', `${category}_top5.sql`);
    const query = readFileSync(sqlFile, 'utf8');

    // Execute the query with month parameter
    const result = await pool.query(query, [month]);

    // Transform results to match expected format
    const transformedResults = result.rows.map((row, index) => ({
      rank: index + 1, // Simple ranking for now
      user: row.display_name || row.user_name || 'Unknown',
      user_id: row.user_id,
      value: parseFloat(row.metric_value) || 0,
      unit: row.unit || 'points'
    }));

    logger.debug(`Query executed successfully for ${category}`, {
      month,
      resultCount: transformedResults.length
    });

    return transformedResults;
  } catch (error) {
    logger.error(`Error executing query for ${category}:`, error);
    throw error;
  }
}
