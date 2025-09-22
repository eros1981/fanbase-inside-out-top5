import { WebClient } from '@slack/web-api';
import { logger } from '../utils/logger';

/**
 * Verifies if a user has HR access based on usergroup membership or user ID allowlist
 * @param client - Slack Web API client
 * @param userId - User ID to check
 * @returns Promise<boolean> - True if user has access
 */
export async function verifyHRAccess(client: WebClient, userId: string): Promise<boolean> {
  try {
    // Check if using usergroup-based authorization
    if (process.env.ALLOWED_USERGROUP_ID) {
      const usergroupId = process.env.ALLOWED_USERGROUP_ID;
      
      // Get usergroup members
      const usergroupUsers = await client.usergroups.users.list({
        usergroup: usergroupId
      });

      if (usergroupUsers.ok && usergroupUsers.users) {
        return usergroupUsers.users.includes(userId);
      }
    }

    // Check if using user ID allowlist
    if (process.env.ALLOWED_USER_IDS) {
      const allowedUserIds = process.env.ALLOWED_USER_IDS.split(',').map(id => id.trim());
      return allowedUserIds.includes(userId);
    }

    // If no authorization method is configured, deny access
    logger.warn('No authorization method configured for HR access');
    return false;
  } catch (error) {
    logger.error('Error verifying HR access:', error);
    return false;
  }
}
