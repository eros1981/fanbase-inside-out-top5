import { App, LogLevel } from '@slack/bolt';
import { config } from 'dotenv';
import { handleInsideOutCommand } from './handlers/insideout-command';
import { verifyHRAccess } from './middleware/auth';
import { logger } from './utils/logger';

// Load environment variables
config();

// Initialize Slack app
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
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

    // Verify HR access
    const hasAccess = await verifyHRAccess(client, command.user_id);
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

// Start the app
(async () => {
  try {
    await app.start();
    logger.info('🚀 Slack bot is running!');
  } catch (error) {
    logger.error('Failed to start Slack bot:', error);
    process.exit(1);
  }
})();
