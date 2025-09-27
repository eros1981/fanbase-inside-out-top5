import { App, LogLevel } from '@slack/bolt';
import { config } from 'dotenv';
import { handleInsideOutCommand } from './handlers/insideout-command';
import { verifyHRAccess } from './middleware/auth';
import { logger } from './utils/logger';

// Load environment variables
config();

// Initialize Slack app
const app = new App({
  token: process.env.SLACK_BOT_TOKEN || 'xoxb-placeholder',
  signingSecret: process.env.SLACK_SIGNING_SECRET || 'placeholder-secret',
  socketMode: !!process.env.SLACK_APP_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  logLevel: LogLevel.INFO,
  port: parseInt(process.env.PORT || '3000'),
});

// Register slash command handler
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

// Note: Health endpoint removed due to Slack Bolt limitations
// We'll use the startup logs to debug environment variables

// Start the app
(async () => {
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
  } catch (error) {
    logger.error('Failed to start Slack bot:', error);
    process.exit(1);
  }
})();
