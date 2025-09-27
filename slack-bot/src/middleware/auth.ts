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
    // Debug: Log all environment variables related to authorization
    logger.info('Authorization check', { 
      userId, 
      ALLOWED_USER_IDS: process.env.ALLOWED_USER_IDS,
      ALLOWED_USERGROUP_ID: process.env.ALLOWED_USERGROUP_ID
    });

    // Check if using user ID allowlist first (higher priority)
    if (process.env.ALLOWED_USER_IDS) {
      const allowedUserIds = process.env.ALLOWED_USER_IDS.split(',').map(id => id.trim());
      const hasAccess = allowedUserIds.includes(userId);
      logger.info('User ID allowlist check', { userId, hasAccess, allowedUserIds });
      return hasAccess;
    }

    // Check if using usergroup-based authorization
    if (process.env.ALLOWED_USERGROUP_ID) {
      const usergroupId = process.env.ALLOWED_USERGROUP_ID;
      
      // Get usergroup members
      const usergroupUsers = await client.usergroups.users.list({
        usergroup: usergroupId
      });

      if (usergroupUsers.ok && usergroupUsers.users) {
        const hasAccess = usergroupUsers.users.includes(userId);
        logger.info('Usergroup check', { userId, hasAccess, usergroupId });
        return hasAccess;
      }
    }

    // If no authorization method is configured, deny access
    logger.warn('No authorization method configured for HR access');
    return false;
  } catch (error) {
    logger.error('Error verifying HR access:', error);
    return false;
  }
}
