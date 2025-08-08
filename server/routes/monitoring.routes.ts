import { Router } from 'express';

const router = Router();

// Error handler wrapper for async routes
const asyncHandler = (fn: Function) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Collect client errors
router.post('/errors', asyncHandler(async (req: any, res: any) => {
  const { errors } = req.body;
  
  // Log errors for monitoring
  errors.forEach((error: any) => {
    console.error('Client error:', {
      ...error,
      source: 'frontend',
    });
  });

  res.json({ success: true });
}));

// Collect performance metrics
router.post('/metrics', asyncHandler(async (req: any, res: any) => {
  const { metrics, url, userAgent } = req.body;
  
  // Log metrics for monitoring
  metrics.forEach((metric: any) => {
    console.log('Performance metric:', {
      ...metric,
      url,
      userAgent,
      source: 'frontend',
    });
  });

  res.json({ success: true });
}));

// Dashboard endpoint for viewing metrics
router.get('/metrics/dashboard', asyncHandler(async (req: any, res: any) => {
  // In a real app, you'd aggregate metrics from your database
  res.json({
    message: 'Metrics dashboard endpoint - implement aggregation logic here',
    recentErrors: [],
    performanceMetrics: [],
    uptime: process.uptime(),
  });
}));

export default router;