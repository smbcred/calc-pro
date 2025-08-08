import Redis from 'ioredis';
import Logger from '../utils/logger';

// Redis connection configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  // More conservative retry strategy for development
  retryStrategy: (times: number) => {
    // In development, give up after 5 attempts to avoid log spam
    if (process.env.NODE_ENV === 'development' && times > 5) {
      Logger.warn('Redis unavailable - disabling after 5 attempts');
      return null; // Stop retrying
    }
    // In production, be more persistent
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  reconnectOnError: (err: Error) => {
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      return true;
    }
    return false;
  },
  // Reduce connection timeout to fail faster
  connectTimeout: 5000,
  lazyConnect: true, // Don't connect immediately
};

// Create Redis client
export const redis = new Redis(redisConfig);

// Track Redis availability
let isRedisAvailable = false;
let lastConnectionAttempt = 0;
const CONNECTION_RETRY_INTERVAL = 30000; // 30 seconds

// Handle connection events
redis.on('connect', () => {
  isRedisAvailable = true;
  Logger.info('Redis client connected');
});

redis.on('error', (err) => {
  isRedisAvailable = false;
  // Reduce log frequency for connection errors in development
  const now = Date.now();
  if (process.env.NODE_ENV === 'development') {
    if (now - lastConnectionAttempt > CONNECTION_RETRY_INTERVAL) {
      Logger.warn('Redis unavailable - running without cache', { error: err.message });
      lastConnectionAttempt = now;
    }
  } else {
    Logger.error('Redis client error:', err);
  }
});

redis.on('close', () => {
  isRedisAvailable = false;
  if (process.env.NODE_ENV !== 'development') {
    Logger.warn('Redis connection closed');
  }
});

redis.on('ready', () => {
  isRedisAvailable = true;
  Logger.info('Redis client ready');
});

// Cache key prefixes to organize data
export const CacheKeys = {
  // Customer data - 1 hour TTL
  CUSTOMER_BY_EMAIL: (email: string) => `customer:email:${email.toLowerCase()}`,
  CUSTOMER_BY_ID: (id: string) => `customer:id:${id}`,
  
  // Company data - 30 minutes TTL
  COMPANY_BY_CUSTOMER: (customerId: string) => `company:customer:${customerId}`,
  COMPANY_BY_ID: (id: string) => `company:id:${id}`,
  
  // Expenses - 15 minutes TTL
  EXPENSES_BY_COMPANY: (companyId: string) => `expenses:company:${companyId}`,
  WAGES_BY_COMPANY: (companyId: string) => `wages:company:${companyId}`,
  
  // Calculator results - 24 hours TTL
  CALCULATOR_RESULT: (hash: string) => `calc:result:${hash}`,
  
  // Session data - matches session TTL
  SESSION_DATA: (sessionId: string) => `session:${sessionId}`,
  
  // Rate limiting - 15 minutes TTL
  RATE_LIMIT: (key: string) => `ratelimit:${key}`,
  
  // API responses - 5 minutes TTL
  API_RESPONSE: (endpoint: string, params: string) => `api:${endpoint}:${params}`,
  
  // Document status - 1 hour TTL
  DOCUMENT_STATUS: (customerId: string) => `docs:status:${customerId}`,
} as const;

// TTL values in seconds
export const CacheTTL = {
  SHORT: 300,      // 5 minutes
  MEDIUM: 900,     // 15 minutes
  LONG: 1800,      // 30 minutes
  HOUR: 3600,      // 1 hour
  DAY: 86400,      // 24 hours
  WEEK: 604800,    // 7 days
} as const;

// Helper to check if Redis is healthy
export const isRedisHealthy = async (): Promise<boolean> => {
  try {
    // Use the tracked availability first to avoid unnecessary ping attempts
    if (!isRedisAvailable) {
      return false;
    }
    
    const result = await redis.ping();
    return result === 'PONG';
  } catch {
    isRedisAvailable = false;
    return false;
  }
};

// Safe Redis operations that won't throw
export const safeRedisGet = async (key: string): Promise<string | null> => {
  try {
    if (!isRedisAvailable) return null;
    return await redis.get(key);
  } catch {
    return null;
  }
};

export const safeRedisSet = async (key: string, value: string, ttl?: number): Promise<boolean> => {
  try {
    if (!isRedisAvailable) return false;
    if (ttl) {
      await redis.setex(key, ttl, value);
    } else {
      await redis.set(key, value);
    }
    return true;
  } catch {
    return false;
  }
};