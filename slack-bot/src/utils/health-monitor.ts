import { logger } from './logger';

/**
 * Health monitoring utilities for the Slack bot
 * Provides comprehensive monitoring and alerting capabilities
 */

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: Date;
  uptime: number;
  memoryUsage: NodeJS.MemoryUsage;
  socketModeConnected: boolean;
  lastError?: string;
  reconnectAttempts: number;
}

export class HealthMonitor {
  private startTime: Date;
  private lastError?: string;
  private reconnectAttempts: number = 0;
  private socketModeConnected: boolean = false;
  private healthCheckInterval?: NodeJS.Timeout;

  constructor() {
    this.startTime = new Date();
  }

  /**
   * Start periodic health checks
   * @param intervalMs - Interval between health checks in milliseconds (default: 30000)
   */
  startHealthChecks(intervalMs: number = 30000): void {
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, intervalMs);

    logger.info(`Health monitoring started with ${intervalMs}ms interval`);
  }

  /**
   * Stop health checks
   */
  stopHealthChecks(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = undefined;
      logger.info('Health monitoring stopped');
    }
  }

  /**
   * Update socket mode connection status
   * @param connected - Whether socket mode is connected
   */
  updateSocketModeStatus(connected: boolean): void {
    this.socketModeConnected = connected;
    if (connected) {
      this.reconnectAttempts = 0;
      logger.info('Socket Mode connection status updated: connected');
    } else {
      logger.warn('Socket Mode connection status updated: disconnected');
    }
  }

  /**
   * Record a reconnection attempt
   */
  recordReconnectAttempt(): void {
    this.reconnectAttempts++;
    logger.warn(`Reconnection attempt #${this.reconnectAttempts}`);
  }

  /**
   * Record an error
   * @param error - Error to record
   */
  recordError(error: Error | string): void {
    this.lastError = error instanceof Error ? error.message : error;
    logger.error('Health monitor recorded error:', this.lastError);
  }

  /**
   * Get current health status
   */
  getHealthStatus(): HealthStatus {
    const uptime = Date.now() - this.startTime.getTime();
    const memoryUsage = process.memoryUsage();

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    // Determine health status based on various factors
    if (!this.socketModeConnected || this.reconnectAttempts > 5) {
      status = 'unhealthy';
    } else if (this.reconnectAttempts > 0 || this.lastError) {
      status = 'degraded';
    }

    // Check memory usage (warn if using more than 500MB)
    if (memoryUsage.heapUsed > 500 * 1024 * 1024) {
      status = status === 'healthy' ? 'degraded' : 'unhealthy';
    }

    return {
      status,
      timestamp: new Date(),
      uptime,
      memoryUsage,
      socketModeConnected: this.socketModeConnected,
      lastError: this.lastError,
      reconnectAttempts: this.reconnectAttempts,
    };
  }

  /**
   * Perform a comprehensive health check
   */
  private performHealthCheck(): void {
    const health = this.getHealthStatus();
    
    // Log health status
    logger.info('Health check', {
      status: health.status,
      uptime: `${Math.round(health.uptime / 1000)}s`,
      memoryUsage: `${Math.round(health.memoryUsage.heapUsed / 1024 / 1024)}MB`,
      socketModeConnected: health.socketModeConnected,
      reconnectAttempts: health.reconnectAttempts,
    });

    // Alert on unhealthy status
    if (health.status === 'unhealthy') {
      logger.error('Health check failed - bot is unhealthy', health);
    } else if (health.status === 'degraded') {
      logger.warn('Health check warning - bot is degraded', health);
    }
  }

  /**
   * Get formatted health report
   */
  getHealthReport(): string {
    const health = this.getHealthStatus();
    const uptimeMinutes = Math.round(health.uptime / 1000 / 60);
    const memoryMB = Math.round(health.memoryUsage.heapUsed / 1024 / 1024);

    return `
🏥 **Slack Bot Health Report**
• Status: ${health.status === 'healthy' ? '✅ Healthy' : health.status === 'degraded' ? '⚠️ Degraded' : '❌ Unhealthy'}
• Uptime: ${uptimeMinutes} minutes
• Memory Usage: ${memoryMB}MB
• Socket Mode: ${health.socketModeConnected ? '✅ Connected' : '❌ Disconnected'}
• Reconnect Attempts: ${health.reconnectAttempts}
${health.lastError ? `• Last Error: ${health.lastError}` : ''}
• Timestamp: ${health.timestamp.toISOString()}
    `.trim();
  }
}

// Export singleton instance
export const healthMonitor = new HealthMonitor();
