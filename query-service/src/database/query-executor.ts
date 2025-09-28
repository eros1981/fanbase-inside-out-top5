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
    query = query.replace(/\$1/g, `'${month}'`);

    // Execute the query
    const [rows] = await bigquery.query({
      query,
      location: 'US', // Adjust if your data is in a different location
    });

    // Transform results to match expected format
    const transformedResults = rows.map((row: any, index: number) => {
      // Special handling for Product Whisperer - no rank number and clean formatting
      if (category === 'product_whisperer') {
        return {
          rank: null, // No rank number for Product Whisperer
          user: row.display_name || row.user_name || 'Unknown',
          user_id: row.user_id,
          value: null, // No value for Product Whisperer
          unit: '' // Empty unit for Product Whisperer
        };
      }
      
      // Normal handling for other categories
      return {
        rank: index + 1, // Simple ranking for now
        user: row.display_name || row.user_name || 'Unknown',
        user_id: row.user_id,
        value: parseFloat(row.metric_value) || 0,
        unit: row.unit || 'points'
      };
    });

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

/**
 * Gets the last updated timestamp from BigQuery
 * @returns Promise with last updated timestamp
 */
export async function getLastUpdatedTimestamp(): Promise<string> {
  const bigquery = getBigQuery();
  
  try {
    // Load the SQL query file for last updated timestamp
    const sqlFile = join('/sql', 'get_last_updated.sql');
    const query = readFileSync(sqlFile, 'utf8');

    // Execute the query
    const [rows] = await bigquery.query({
      query,
      location: 'US',
    });

    if (rows.length > 0 && rows[0].last_updated) {
      const timestamp = new Date(rows[0].last_updated);
      return timestamp.toLocaleString('en-US', {
        timeZone: 'UTC',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }) + ' UTC';
    }

    return 'Unknown';
  } catch (error) {
    logger.error('Error getting last updated timestamp:', error);
    return 'Unknown';
  }
}
