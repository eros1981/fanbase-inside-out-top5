import { executeQuery } from '../database/query-executor';
import { logger } from '../utils/logger';

/**
 * Queries top 5 data for the specified month and category
 * @param month - Month in YYYY-MM format
 * @param category - Category to query (or 'all' for all categories)
 * @returns Promise with results object
 */
export async function queryTop5Data(month: string, category: string): Promise<any> {
  const results: any = {};

  try {
    if (category === 'all') {
      // Query all categories
      const categories = ['monetizer', 'content_machine', 'eyeball_emperor', 'host_with_the_most', 'product_whisperer'];
      
      for (const cat of categories) {
        try {
          results[cat] = await executeQuery(cat, month);
          logger.debug(`Successfully queried ${cat} for ${month}`, { count: results[cat].length });
        } catch (error) {
          logger.error(`Error querying ${cat} for ${month}:`, error);
          results[cat] = []; // Return empty array for failed categories
        }
      }
    } else {
      // Query specific category
      results[category] = await executeQuery(category, month);
      logger.debug(`Successfully queried ${category} for ${month}`, { count: results[category].length });
    }

    return results;
  } catch (error) {
    logger.error('Error in queryTop5Data:', error);
    throw error;
  }
}
