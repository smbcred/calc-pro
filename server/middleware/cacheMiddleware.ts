import { Request, Response, NextFunction } from 'express';
import { CacheManager } from '../utils/cacheManager';
import { CacheKeys, CacheTTL } from '../config/redis';

interface CacheOptions {
  ttl?: number;
  keyGenerator?: (req: Request) => string;
  condition?: (req: Request) => boolean;
}

/**
 * Middleware to cache API responses
 */
export function cacheResponse(options: CacheOptions = {}) {
  const { 
    ttl = CacheTTL.SHORT,
    keyGenerator = defaultKeyGenerator,
    condition = () => true
  } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip caching for non-GET requests or if condition fails
    if (req.method !== 'GET' || !condition(req)) {
      return next();
    }

    const key = keyGenerator(req);
    
    // Try to get from cache
    const cached = await CacheManager.get(key);
    if (cached) {
      res.set('X-Cache', 'HIT');
      return res.json(cached);
    }

    // Store original json method
    const originalJson = res.json;
    
    // Override json method to cache response
    res.json = function(data: any) {
      res.set('X-Cache', 'MISS');
      
      // Cache successful responses only
      if (res.statusCode >= 200 && res.statusCode < 300) {
        CacheManager.set(key, data, ttl).catch(err => 
          console.error('Failed to cache response:', err)
        );
      }
      
      return originalJson.call(this, data);
    };

    next();
  };
}

function defaultKeyGenerator(req: Request): string {
  const params = JSON.stringify(req.query);
  const body = JSON.stringify(req.body);
  return CacheKeys.API_RESPONSE(req.path, `${params}:${body}`);
}

/**
 * Middleware to invalidate cache on mutations
 */
export function invalidateCache(entity: 'customer' | 'company' | 'expenses') {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json;
    
    res.json = function(data: any) {
      // Invalidate cache after successful mutation
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const id = req.body.email || req.body.customerId || req.body.companyId || req.params.id;
        if (id) {
          CacheManager.invalidateRelated(entity, id).catch(err =>
            console.error('Failed to invalidate cache:', err)
          );
        }
      }
      
      return originalJson.call(this, data);
    };

    next();
  };
}