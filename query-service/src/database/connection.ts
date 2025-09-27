import { BigQuery } from '@google-cloud/bigquery';
import { logger } from '../utils/logger';

let bigquery: BigQuery | null = null;

/**
 * Initializes BigQuery connection
 */
export async function initializeDatabase(): Promise<void> {
  try {
    const projectId = process.env.BIGQUERY_PROJECT_ID;
    const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    
    if (!projectId) {
      throw new Error('BIGQUERY_PROJECT_ID environment variable is required');
    }

    if (!credentialsPath) {
      throw new Error('GOOGLE_APPLICATION_CREDENTIALS environment variable is required');
    }

    bigquery = new BigQuery({
      projectId,
      keyFilename: credentialsPath,
    });

    // Test the connection by listing datasets
    const [datasets] = await bigquery.getDatasets();
    logger.info(`BigQuery connection established successfully. Found ${datasets.length} datasets.`);
  } catch (error) {
    logger.error('Failed to initialize BigQuery connection:', error);
    throw error;
  }
}

/**
 * Gets the BigQuery client
 * @returns BigQuery instance
 */
export function getBigQuery(): BigQuery {
  if (!bigquery) {
    throw new Error('BigQuery not initialized. Call initializeDatabase() first.');
  }
  return bigquery;
}

/**
 * Gets the dataset name from environment
 * @returns Dataset name
 */
export function getDatasetName(): string {
  const dataset = process.env.BIGQUERY_DATASET;
  if (!dataset) {
    throw new Error('BIGQUERY_DATASET environment variable is required');
  }
  return dataset;
}

/**
 * Closes the BigQuery connection (no-op for BigQuery)
 */
export async function closeDatabase(): Promise<void> {
  // BigQuery doesn't require explicit connection closing
  bigquery = null;
  logger.info('BigQuery connection closed');
}
