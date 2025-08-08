import { Router, Request, Response, NextFunction } from 'express';
import { metricsEndpoint } from '../config/metrics';
import { bullBoardRouter } from '../utils/backgroundJobs';
import { asyncHandler } from '../middleware/errorHandler';
import { redis, isRedisHealthy } from '../config/redis';
import Logger from '../utils/logger';

const router = Router();

// Prometheus metrics endpoint
router.get('/metrics', metricsEndpoint);

// Bull board for job monitoring (protected)
router.use('/queues', (req: Request, res: Response, next: NextFunction) => {
  // Add basic auth or other protection here
  const token = req.headers.authorization;
  if (token !== `Bearer ${process.env.ADMIN_TOKEN}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}, bullBoardRouter);

// Custom monitoring dashboard data
router.get('/dashboard', asyncHandler(async (req, res) => {
  const redisHealthy = await isRedisHealthy();
  
  let stats = {
    timestamp: new Date().toISOString(),
    cache: {
      totalKeys: 0,
      status: 'disconnected',
    },
    sessions: {
      active: 0,
    },
    errors: {
      today: 0,
    },
    system: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
    },
  };

  if (redisHealthy) {
    try {
      const [
        cacheKeys,
        sessionCount,
        errorCount,
      ] = await Promise.all([
        redis.keys('*'),
        redis.keys('session:*'),
        redis.get('stats:errors:today'),
      ]);

      stats = {
        ...stats,
        cache: {
          totalKeys: cacheKeys.length,
          status: 'connected',
        },
        sessions: {
          active: sessionCount.length,
        },
        errors: {
          today: parseInt(errorCount || '0'),
        },
      };
    } catch (error) {
      Logger.warn('Failed to collect Redis stats', { error });
    }
  }

  res.json(stats);
}));

// Log viewer endpoint (protected)
router.get('/logs/:type', asyncHandler(async (req: Request, res: Response) => {
  const { type } = req.params;
  const { lines = 100 } = req.query;
  
  // Implement log reading logic
  res.json({ 
    message: 'Log viewer endpoint',
    type,
    lines 
  });
}));

export default router;