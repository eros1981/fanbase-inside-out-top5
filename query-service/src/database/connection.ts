import { BigQuery } from '@google-cloud/bigquery';
import { logger } from '../utils/logger';

let bigquery: BigQuery | null = null;

/**
 * Initializes BigQuery connection
 */
export async function initializeDatabase(): Promise<void> {
  try {
    const projectId = process.env.BIGQUERY_PROJECT_ID;
    
    if (!projectId) {
      throw new Error('BIGQUERY_PROJECT_ID environment variable is required');
    }

    // Initialize BigQuery client
    bigquery = new BigQuery({
      projectId,
      // Credentials will be automatically loaded from:
      // 1. GOOGLE_APPLICATION_CREDENTIALS environment variable
      // 2. GOOGLE_SERVICE_ACCOUNT_KEY environment variable (JSON string)
      // 3. Default service account (if running on GCP)
    });

    // Test the connection by running a simple query
    const [datasets] = await bigquery.getDatasets();
    logger.info(`BigQuery connection established successfully. Found ${datasets.length} datasets.`);

    // Verify the specified dataset exists
    const datasetId = process.env.BIGQUERY_DATASET;
    if (datasetId) {
      const dataset = bigquery.dataset(datasetId);
      const [exists] = await dataset.exists();
      if (!exists) {
        logger.warn(`Dataset ${datasetId} does not exist. Please create it or update BIGQUERY_DATASET.`);
      } else {
        logger.info(`Using dataset: ${datasetId}`);
      }
    }
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
 * Gets the dataset reference
 * @returns Dataset reference
 */
export function getDataset() {
  const bigquery = getBigQuery();
  const datasetId = process.env.BIGQUERY_DATASET;
  
  if (!datasetId) {
    throw new Error('BIGQUERY_DATASET environment variable is required');
  }
  
  return bigquery.dataset(datasetId);
}

/**
 * Closes the BigQuery connection (no-op for BigQuery)
 */
export async function closeDatabase(): Promise<void> {
  // BigQuery client doesn't need explicit closing
  bigquery = null;
  logger.info('BigQuery connection closed');
}
