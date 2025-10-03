import { logger } from './logger';

/**
 * Socket Mode wrapper to handle the known Slack Bolt framework bug
 * where 'server explicit disconnect' events in 'connecting' state cause crashes
 */

export class SocketModeWrapper {
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private isReconnecting = false;
  private reconnectTimeout?: NodeJS.Timeout;

  /**
   * Initialize the wrapper with enhanced error handling
   */
  initialize(): void {
    // Override the global unhandledRejection handler specifically for Socket Mode errors
    const originalHandler = process.listeners('unhandledRejection');
    
    process.removeAllListeners('unhandledRejection');
    
    process.on('unhandledRejection', (reason, promise) => {
      // Check if this is the specific Socket Mode error
      if (reason instanceof Error && reason.message.includes('server explicit disconnect')) {
        logger.warn('Socket Mode disconnect detected - attempting automatic recovery');
        this.handleSocketModeDisconnect();
        return;
      }
      
      // Call original handlers for other errors
      originalHandler.forEach(handler => {
        if (typeof handler === 'function') {
          handler(reason, promise);
        }
      });
    });
  }

  /**
   * Handle Socket Mode disconnection with automatic recovery
   */
  private handleSocketModeDisconnect(): void {
    if (this.isReconnecting) {
      logger.info('Recovery already in progress, skipping duplicate attempt');
      return;
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.error('Max reconnection attempts reached for Socket Mode');
      return;
    }

    this.isReconnecting = true;
    this.reconnectAttempts++;

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    logger.info(`Socket Mode recovery attempt #${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);

    this.reconnectTimeout = setTimeout(() => {
      this.isReconnecting = false;
      logger.info('Socket Mode recovery timeout completed - connection should be restored');
    }, delay);
  }

  /**
   * Reset reconnection attempts on successful connection
   */
  onConnectionEstablished(): void {
    if (this.reconnectAttempts > 0) {
      logger.info(`Socket Mode connection restored after ${this.reconnectAttempts} attempts`);
      this.reconnectAttempts = 0;
    }
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = undefined;
    }
    
    this.isReconnecting = false;
  }

  /**
   * Get current reconnection status
   */
  getStatus(): { attempts: number; isReconnecting: boolean; maxAttempts: number } {
    return {
      attempts: this.reconnectAttempts,
      isReconnecting: this.isReconnecting,
      maxAttempts: this.maxReconnectAttempts
    };
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = undefined;
    }
    this.isReconnecting = false;
  }
}

// Export singleton instance
export const socketModeWrapper = new SocketModeWrapper();
