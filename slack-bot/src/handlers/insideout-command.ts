import { SlashCommand } from '@slack/bolt';
import axios from 'axios';
import { createHmac } from 'crypto';
import { formatTop5Response } from '../utils/block-kit';
import { parseCommandArgs } from '../utils/command-parser';
import { logger } from '../utils/logger';

/**
 * Handles the /insideout slash command
 * @param command - Slack slash command object
 * @param respond - Function to respond to the command
 */
export async function handleInsideOutCommand(
  command: SlashCommand,
  respond: (response: any) => Promise<void>
): Promise<void> {
  try {
    // Send immediate loading message
    const loadingResponse = await respond({
      text: '🔄 Fetching top 5 data... This may take a moment.',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '🔄 *Fetching top 5 data...*\nThis may take a moment while we query the database.'
          }
        }
      ],
      response_type: 'in_channel'
    });

    // Parse command arguments
    const { month, year, category } = parseCommandArgs(command.text);
    
    // Debug: Log parsed arguments
    logger.info('Parsed command arguments', { 
      originalText: command.text,
      month, 
      year, 
      category 
    });

    // Validate category if specified
    const validCategories = ['monetizer', 'content_machine', 'eyeball_emperor', 'host_with_the_most', 'product_whisperer', 'all'];
    console.log('Category validation:', { category, validCategories, includes: category ? validCategories.includes(category) : 'null category' });
    
    if (category && !validCategories.includes(category)) {
      logger.warn('Invalid category provided', { category, validCategories });
      await respond({
        text: `❌ Invalid category "${category}". Valid options: ${validCategories.join(', ')}`,
        response_type: 'ephemeral'
      });
      return;
    }

    // Make request to query service
    const queryServiceUrl = process.env.QUERY_SERVICE_URL;
    if (!queryServiceUrl) {
      throw new Error('QUERY_SERVICE_URL not configured');
    }

    const requestBody = {
      month: `${year}-${month.padStart(2, '0')}`,
      category: category || 'all'
    };

    // Create HMAC signature for authentication
    const hmacSecret = process.env.HMAC_SECRET_SHARED;
    if (!hmacSecret) {
      throw new Error('HMAC_SECRET_SHARED not configured');
    }

    const signature = createHmac('sha256', hmacSecret)
      .update(JSON.stringify(requestBody))
      .digest('hex');

    // Send request to query service
    const response = await axios.post(queryServiceUrl, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'X-Signature': signature
      },
      timeout: 10000 // 10 second timeout
    });

    if (response.status !== 200) {
      throw new Error(`Query service returned status ${response.status}`);
    }

    const data = response.data;

    // Format and send response using Block Kit
    const blocks = formatTop5Response(data, category || 'all');
    
    await respond({
      blocks,
      response_type: 'in_channel'
    });

    logger.info(`Successfully processed /insideout command for ${data.period}`, {
      userId: command.user_id,
      category: category || 'all',
      period: data.period
    });

  } catch (error) {
    logger.error('Error in handleInsideOutCommand:', error);
    
    // Send user-friendly error message
    await respond({
      text: '❌ Unable to fetch top 5 data. Please check your parameters and try again.\n\nUsage: `/insideout top5 [month] [year] [category|all]`\nExample: `/insideout top5 aug 2025 all`',
      response_type: 'ephemeral'
    });
  }
}

/**
 * Handles the /insideout-examples slash command
 * @param command - Slack slash command object
 * @param respond - Function to respond to the command
 */
export async function handleInsideOutExamplesCommand(
  command: SlashCommand,
  respond: (response: any) => Promise<void>
): Promise<void> {
  const examples = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*📚 Inside-Out Top 5 Command Examples*\n\n*Basic Usage:*\n`/insideout top5 [month] [year] [category]`\n\n*Examples:*\n• `/insideout top5 aug 2025 all` - All categories for August 2025\n• `/insideout top5 sept 2025 monetizer` - Monetizer only for September 2025\n• `/insideout top5 jan 2025 content_machine` - Content Machine only for January 2025\n• `/insideout top5 dec 2024 eyeball_emperor` - Eyeball Emperor only for December 2024\n• `/insideout top5 nov 2024 host_with_the_most` - Host With The Most only for November 2024\n• `/insideout top5 oct 2024 product_whisperer` - Product Whisperer only for October 2024'
      }
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*📋 Available Categories:*\n• `monetizer` - Top revenue generators\n• `content_machine` - Most content creators\n• `eyeball_emperor` - Most views received\n• `host_with_the_most` - Most audio rooms created\n• `product_whisperer` - Tech Support data (static message)\n• `all` - All categories (default)'
      }
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*📅 Month Formats:*\n• Full names: `january`, `february`, `march`, etc.\n• Abbreviations: `jan`, `feb`, `mar`, `apr`, `may`, `jun`, `jul`, `aug`, `sep`, `oct`, `nov`, `dec`\n• Numbers: `01`, `02`, `03`, etc.'
      }
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*💡 Tips:*\n• Use `all` to see all categories at once\n• Data is updated daily from production database\n• Results show top 5 performers for the specified month\n• Ties share the same rank; next rank is offset accordingly'
      }
    }
  ];

  await respond({
    blocks: examples,
    response_type: 'ephemeral'
  });
}
