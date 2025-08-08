import { Request, Response, NextFunction } from 'express';
import { metrics } from '../config/metrics';

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  // Intercept response finish
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path;
    const method = req.method;
    const statusCode = res.statusCode.toString();
    
    // Record metrics
    metrics.httpRequestDuration.observe(
      { method, route, status_code: statusCode },
      duration
    );
    
    metrics.httpRequestTotal.inc({
      method,
      route,
      status_code: statusCode,
    });
  });
  
  next();
};

// Cache metrics middleware
export const trackCacheMetrics = (cacheType: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json;
    
    res.json = function(data: any) {
      const cacheHeader = res.get('X-Cache');
      if (cacheHeader === 'HIT') {
        metrics.cacheHits.inc({ cache_type: cacheType });
      } else if (cacheHeader === 'MISS') {
        metrics.cacheMisses.inc({ cache_type: cacheType });
      }
      
      return originalJson.call(this, data);
    };
    
    next();
  };
};

// Request ID middleware for tracing
export const requestIdMiddleware = (req: any, res: any, next: any) => {
  req.id = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  res.setHeader('X-Request-ID', req.id);
  next();
};