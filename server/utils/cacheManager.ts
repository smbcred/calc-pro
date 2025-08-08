import { redis, CacheTTL } from '../config/redis';
import Logger from './logger';
import crypto from 'crypto';

export class CacheManager {
  /**
   * Get value from cache
   */
  static async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await redis.get(key);
      if (!cached) return null;
      
      Logger.debug(`Cache hit: ${key}`);
      return JSON.parse(cached) as T;
    } catch (error) {
      Logger.error(`Cache get error for ${key}:`, error);
      return null;
    }
  }

  /**
   * Set value in cache with TTL
   */
  static async set(key: string, value: any, ttl: number = CacheTTL.MEDIUM): Promise<void> {
    try {
      await redis.set(key, JSON.stringify(value), 'EX', ttl);
      Logger.debug(`Cache set: ${key} (TTL: ${ttl}s)`);
    } catch (error) {
      Logger.error(`Cache set error for ${key}:`, error);
    }
  }

  /**
   * Delete from cache
   */
  static async delete(key: string | string[]): Promise<void> {
    try {
      if (Array.isArray(key)) {
        if (key.length > 0) {
          await redis.del(...key);
          Logger.debug(`Cache delete: ${key.length} keys`);
        }
      } else {
        await redis.del(key);
        Logger.debug(`Cache delete: ${key}`);
      }
    } catch (error) {
      Logger.error(`Cache delete error:`, error);
    }
  }

  /**
   * Delete all keys matching a pattern
   */
  static async deletePattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
        Logger.debug(`Cache pattern delete: ${pattern} (${keys.length} keys)`);
      }
    } catch (error) {
      Logger.error(`Cache pattern delete error:`, error);
    }
  }

  /**
   * Cache with automatic fetch if miss
   */
  static async getOrFetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number = CacheTTL.MEDIUM
  ): Promise<T> {
    // Try cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch and cache
    const data = await fetchFn();
    await this.set(key, data, ttl);
    return data;
  }

  /**
   * Invalidate related cache entries
   */
  static async invalidateRelated(entity: 'customer' | 'company' | 'expenses', id: string): Promise<void> {
    const patterns: string[] = [];

    switch (entity) {
      case 'customer':
        patterns.push(
          `customer:*:${id}`,
          `company:customer:${id}`,
          `docs:status:${id}`
        );
        break;
      case 'company':
        patterns.push(
          `company:*:${id}`,
          `expenses:company:${id}`,
          `wages:company:${id}`
        );
        break;
      case 'expenses':
        patterns.push(
          `expenses:company:${id}`,
          `wages:company:${id}`
        );
        break;
    }

    for (const pattern of patterns) {
      await this.deletePattern(pattern);
    }
  }

  /**
   * Generate cache key hash for complex objects
   */
  static generateHash(obj: any): string {
    const str = JSON.stringify(obj);
    return crypto.createHash('md5').update(str).digest('hex');
  }
}

// Decorator for caching method results
export function Cacheable(ttl: number = CacheTTL.MEDIUM, keyPrefix?: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const key = keyPrefix 
        ? `${keyPrefix}:${CacheManager.generateHash(args)}`
        : `${target.constructor.name}:${propertyName}:${CacheManager.generateHash(args)}`;

      return CacheManager.getOrFetch(key, () => originalMethod.apply(this, args), ttl);
    };

    return descriptor;
  };
}