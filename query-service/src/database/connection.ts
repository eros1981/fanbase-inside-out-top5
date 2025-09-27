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
      logger.warn('BIGQUERY_PROJECT_ID not set - using default project');
    }

    if (!credentialsPath) {
      logger.warn('GOOGLE_APPLICATION_CREDENTIALS not set - using default credentials');
    }

    // Check if credentialsPath is JSON content or file path
    let credentials = undefined;
    if (credentialsPath) {
      if (credentialsPath.startsWith('{')) {
        // It's JSON content, parse it
        try {
          credentials = JSON.parse(credentialsPath);
          logger.info('Using JSON credentials for BigQuery');
        } catch (error) {
          logger.error('Failed to parse JSON credentials:', error);
          throw new Error('Invalid JSON in GOOGLE_APPLICATION_CREDENTIALS');
        }
      } else {
        // It's a file path
        logger.info('Using credentials file for BigQuery', { credentialsPath });
      }
    }

    bigquery = new BigQuery({
      projectId: projectId || '758470639878',
      ...(credentials ? { credentials } : credentialsPath ? { keyFilename: credentialsPath } : {}),
    });

    // Test the connection by listing datasets
    const [datasets] = await bigquery.getDatasets();
    logger.info(`BigQuery connection established successfully. Found ${datasets.length} datasets.`);
  } catch (error) {
    logger.error('Failed to initialize BigQuery connection:', error);
    // Don't throw error in production - allow service to start
    if (process.env.NODE_ENV === 'production') {
      logger.warn('Continuing without BigQuery connection - will fail on query requests');
    } else {
      throw error;
    }
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
