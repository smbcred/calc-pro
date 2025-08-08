import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { checkDatabaseHealth } from '../config/database';
import Logger from '../utils/logger';

const router = Router();

router.get('/health', asyncHandler(async (req: Request, res: Response) => {
  const dbHealth = await checkDatabaseHealth();
  
  const health = {
    status: dbHealth.healthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    database: dbHealth,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  };

  Logger.info('Health check performed', health);
  
  res.status(dbHealth.healthy ? 200 : 503).json(health);
}));

export default router;