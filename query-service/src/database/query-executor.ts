import { readFileSync } from 'fs';
import { join } from 'path';
import { logger } from '../utils/logger';
import { getBigQuery, getDatasetName } from './connection';

/**
 * Executes a query for a specific category and month
 * @param category - The category to query
 * @param month - Month in YYYY-MM format
 * @returns Promise with query results
 */
export async function executeQuery(category: string, month: string): Promise<any[]> {
  const bigquery = getBigQuery();
  const datasetName = getDatasetName();
  
  try {
    // Load the SQL query file
    const sqlFile = join('/sql', `${category}_top5.sql`);
    let query = readFileSync(sqlFile, 'utf8');

    // Replace $1 parameter with the month value for BigQuery
    query = query.replace(/\$1::date/g, `'${month}'`);

    // Execute the query
    const [rows] = await bigquery.query({
      query,
      location: 'US', // Adjust if your data is in a different location
    });

    // Transform results to match expected format
    const transformedResults = rows.map((row: any, index: number) => ({
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
