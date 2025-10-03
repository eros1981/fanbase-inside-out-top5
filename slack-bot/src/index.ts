import { App, LogLevel } from '@slack/bolt';
import { config } from 'dotenv';
import { handleInsideOutCommand } from './handlers/insideout-command';
import { verifyHRAccess } from './middleware/auth';
import { healthMonitor } from './utils/health-monitor';
import { logger } from './utils/logger';

// Load environment variables
config();

// Initialize Slack app with enhanced error handling for Socket Mode
const app = new App({
  token: process.env.SLACK_BOT_TOKEN || 'xoxb-placeholder',
  signingSecret: process.env.SLACK_SIGNING_SECRET || 'placeholder-secret',
  socketMode: !!process.env.SLACK_APP_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  logLevel: LogLevel.INFO,
  port: parseInt(process.env.PORT || '3000'),
});

// Register slash command handlers
app.command('/insideout', async ({ command, ack, respond, client }) => {
  try {
    // Acknowledge the command immediately
    await ack();

    // Debug: Log command received
    logger.info('Slash command received', { 
      userId: command.user_id, 
      text: command.text,
      channel: command.channel_id 
    });

    // Verify HR access
    const hasAccess = await verifyHRAccess(client, command.user_id);
    logger.info('HR access check result', { userId: command.user_id, hasAccess });
    
    if (!hasAccess) {
      await respond({
        text: '❌ Access denied. This command is restricted to HR team members.',
        response_type: 'ephemeral'
      });
      return;
    }

    // Handle the insideout command
    await handleInsideOutCommand(command, respond);
  } catch (error) {
    logger.error('Error handling /insideout command:', error);
    await respond({
      text: '❌ An error occurred while processing your request. Please try again later.',
      response_type: 'ephemeral'
    });
  }
});

// Add health check command for monitoring
app.command('/health', async ({ command, ack, respond, client }) => {
  try {
    await ack();

    // Verify HR access for health check
    const hasAccess = await verifyHRAccess(client, command.user_id);
    if (!hasAccess) {
      await respond({
        text: '❌ Access denied. This command is restricted to HR team members.',
        response_type: 'ephemeral'
      });
      return;
    }

    // Get health report
    const healthReport = healthMonitor.getHealthReport();
    await respond({
      text: healthReport,
      response_type: 'ephemeral'
    });
  } catch (error) {
    logger.error('Error handling /health command:', error);
    await respond({
      text: '❌ An error occurred while checking bot health. Please try again later.',
      response_type: 'ephemeral'
    });
  }
});

// Note: Health endpoint removed due to Slack Bolt limitations
// We'll use the startup logs to debug environment variables

// Enhanced error handling and process management
let isShuttingDown = false;
let reconnectAttempts = 0;
const maxReconnectAttempts = 10;

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  if (!isShuttingDown) {
    gracefulShutdown();
  }
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection:', { promise, reason });
  if (!isShuttingDown) {
    gracefulShutdown();
  }
});

// Graceful shutdown handler
async function gracefulShutdown() {
  if (isShuttingDown) return;
  isShuttingDown = true;
  
  logger.info('Initiating graceful shutdown...');
  try {
    // Stop health monitoring
    healthMonitor.stopHealthChecks();
    
    // Log final health status
    logger.info('Final health status:', healthMonitor.getHealthStatus());
    
    await app.stop();
    logger.info('Slack bot stopped gracefully');
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
}

// Handle termination signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Enhanced app startup with retry logic
async function startApp() {
  try {
    await app.start();
    logger.info('🚀 Slack bot is running!');
    logger.info('Environment check', {
      SLACK_SIGNING_SECRET: process.env.SLACK_SIGNING_SECRET ? 'set' : 'missing',
      SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN ? 'set' : 'missing',
      SLACK_APP_TOKEN: process.env.SLACK_APP_TOKEN ? 'set' : 'missing',
      ALLOWED_USER_IDS: process.env.ALLOWED_USER_IDS || 'not set',
      ALLOWED_USERGROUP_ID: process.env.ALLOWED_USERGROUP_ID || 'not set'
    });
    
    // Reset reconnect attempts on successful start
    reconnectAttempts = 0;
    
    // Set up Socket Mode event listeners for better monitoring
    // Note: Socket Mode events are handled internally by the Bolt framework
    // We'll monitor connection status through health checks instead
    logger.info('Socket Mode connection established');
    healthMonitor.updateSocketModeStatus(true);

    // Start health monitoring
    healthMonitor.startHealthChecks(30000); // Check every 30 seconds
    
  } catch (error) {
    logger.error('Failed to start Slack bot:', error);
    
    // Implement retry logic for startup failures
    if (reconnectAttempts < maxReconnectAttempts) {
      reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000); // Exponential backoff, max 30s
      logger.info(`Retrying startup in ${delay}ms (attempt ${reconnectAttempts}/${maxReconnectAttempts})`);
      
      setTimeout(() => {
        if (!isShuttingDown) {
          startApp();
        }
      }, delay);
    } else {
      logger.error('Max startup attempts reached. Exiting...');
      process.exit(1);
    }
  }
}

// Start the app
startApp();
