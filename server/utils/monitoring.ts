import { metrics } from '../config/metrics';
import { redis, isRedisHealthy } from '../config/redis';
import Logger from './logger';
import os from 'os';

export class ApplicationMonitor {
  private static intervalId: NodeJS.Timeout;

  static start() {
    // Update metrics every 30 seconds
    this.intervalId = setInterval(() => {
      this.collectMetrics();
    }, 30000);

    Logger.info('Application monitoring started');
  }

  static stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private static async collectMetrics() {
    try {
      // System metrics
      const cpuUsage = process.cpuUsage();
      const memoryUsage = process.memoryUsage();
      
      // Check Redis health
      const redisHealthy = await isRedisHealthy();
      
      if (redisHealthy) {
        // Active sessions (from Redis)
        const sessionKeys = await redis.keys('session:*');
        metrics.activeUsers.set(sessionKeys.length);
        
        // Pending documents
        const pendingDocs = await redis.get('stats:pending_documents');
        metrics.pendingDocuments.set(parseInt(pendingDocs || '0'));
      } else {
        // Set default values if Redis is not available
        metrics.activeUsers.set(0);
        metrics.pendingDocuments.set(0);
      }
      
      // Log system stats
      Logger.debug('System metrics collected', {
        cpu: cpuUsage,
        memory: {
          rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
          heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
        },
        redisHealthy,
      });
    } catch (error) {
      Logger.error('Failed to collect metrics', { error });
    }
  }

  static logPerformance(operation: string, startTime: number, metadata?: any) {
    const duration = Date.now() - startTime;
    
    Logger.info(`Performance: ${operation}`, {
      operation,
      duration,
      ...metadata,
    });

    // Track slow operations
    if (duration > 1000) {
      Logger.warn(`Slow operation detected: ${operation}`, {
        operation,
        duration,
        threshold: 1000,
        ...metadata,
      });
    }
  }
}