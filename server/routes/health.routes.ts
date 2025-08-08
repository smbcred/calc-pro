import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { checkDatabaseHealth } from '../config/database';
import { isRedisHealthy } from '../config/redis';
import Logger from '../utils/logger';

const router = Router();

router.get('/health', asyncHandler(async (req: Request, res: Response) => {
  const [dbHealth, redisHealth] = await Promise.all([
    checkDatabaseHealth(),
    isRedisHealthy()
  ]);
  
  const health = {
    status: dbHealth.healthy && redisHealth ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    services: {
      database: dbHealth,
      redis: { healthy: redisHealth },
    },
    cache: {
      enabled: redisHealth,
    },
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  };

  Logger.info('Health check performed', health);
  
  res.status(health.status === 'healthy' ? 200 : 503).json(health);
}));

export default router;