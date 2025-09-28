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
    console.log('Category validation:', { category, validCategories, includes: validCategories.includes(category) });
    
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
