import { drizzle } from 'drizzle-orm/neon-http';
import { neon, neonConfig, Pool } from '@neondatabase/serverless';
import * as schema from '../../shared/schema';
import Logger from '../utils/logger';

// Configure Neon for better performance
neonConfig.fetchConnectionCache = true;

// Database connection singleton
let db: ReturnType<typeof drizzle> | null = null;
let connectionPool: Pool | null = null;

export const getDb = () => {
  if (!db) {
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      Logger.error('DATABASE_URL is not set');
      throw new Error('Database configuration error');
    }

    try {
      // Create connection pool for better performance
      connectionPool = new Pool({ connectionString: databaseUrl });
      
      // Set pool configuration
      connectionPool.on('error', (err) => {
        Logger.error('Unexpected database pool error', err);
      });

      // Create drizzle instance
      const sql = neon(databaseUrl);
      db = drizzle(sql, { schema });
      
      Logger.info('Database connection established');
    } catch (error) {
      Logger.error('Failed to connect to database:', error);
      throw error;
    }
  }
  
  return db;
};

// Health check function
export const checkDatabaseHealth = async () => {
  try {
    const db = getDb();
    // Simple query to check connection
    await db.select().from(schema.users).limit(1);
    return { healthy: true };
  } catch (error: any) {
    Logger.error('Database health check failed:', error);
    return { healthy: false, error: error.message };
  }
};

// Cleanup function for graceful shutdown
export const closeDatabaseConnection = async () => {
  if (connectionPool) {
    await connectionPool.end();
    Logger.info('Database connection pool closed');
  }
};