import Logger from './logger';

interface CacheItem {
  data: any;
  timestamp: number;
  ttl: number;
}

class SimpleCache {
  private cache: Map<string, CacheItem> = new Map();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes default

  set(key: string, data: any, ttl?: number): void {
    const item: CacheItem = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    };
    this.cache.set(key, item);
    Logger.debug(`Cache set: ${key}`);
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key);
      Logger.debug(`Cache expired: ${key}`);
      return null;
    }

    Logger.debug(`Cache hit: ${key}`);
    return item.data;
  }

  clear(): void {
    this.cache.clear();
    Logger.info('Cache cleared');
  }

  // Clean up expired entries periodically
  startCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      const entries = Array.from(this.cache.entries());
      for (const [key, item] of entries) {
        if (now - item.timestamp > item.ttl) {
          this.cache.delete(key);
        }
      }
    }, 60000); // Run every minute
  }
}

export const cache = new SimpleCache();
// Start automatic cleanup
cache.startCleanup();