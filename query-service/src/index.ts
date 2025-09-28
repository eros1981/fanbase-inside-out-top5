import { config } from 'dotenv';
import Fastify from 'fastify';
import { initializeDatabase } from './database/connection';
import { verifyHMAC } from './middleware/auth';
import { top5Handler } from './routes/top5';
import { logger } from './utils/logger';

// Load environment variables
config();

// Initialize Fastify app
const app = Fastify({
  logger: {
    level: 'info',
    ...(process.env.NODE_ENV === 'development' && {
      transport: {
        target: 'pino-pretty'
      }
    })
  }
});

// Register HMAC verification middleware
app.addHook('preHandler', verifyHMAC);

// Register routes
app.register(top5Handler, { prefix: '/api' });

// Health check endpoint
app.get('/health', async (request, reply) => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Start the server
const start = async () => {
  try {
    // Initialize database connection
    await initializeDatabase();
    
    const port = parseInt(process.env.PORT || '80');
    const host = process.env.HOST || '0.0.0.0';
    
    await app.listen({ port, host });
    logger.info(`🚀 Query service is running on ${host}:${port}`);
  } catch (err) {
    logger.error('Failed to start query service:', err);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down gracefully...');
  await app.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down gracefully...');
  await app.close();
  process.exit(0);
});

start();
