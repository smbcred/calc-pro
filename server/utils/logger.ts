import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import { metrics } from '../config/metrics';

// Custom format for structured logging
const structuredFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp', 'label'] }),
  winston.format.json()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, metadata }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (metadata && Object.keys(metadata).length > 0) {
      msg += ` ${JSON.stringify(metadata)}`;
    }
    return msg;
  })
);

// Create the logger
const Logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: structuredFormat,
  defaultMeta: { 
    service: 'rd-tax-credit-api',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: process.env.NODE_ENV === 'production' ? structuredFormat : consoleFormat,
    }),
    
    // Error log file (rotated daily)
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '14d',
      format: structuredFormat,
    }),
    
    // Combined log file (rotated daily)
    new DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '7d',
      format: structuredFormat,
    }),
    
    // Audit log for important events
    new DailyRotateFile({
      filename: 'logs/audit-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'info',
      maxSize: '20m',
      maxFiles: '30d',
      format: structuredFormat,
      filter: (info) => info.metadata?.audit === true,
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: 'logs/exceptions.log' })
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: 'logs/rejections.log' })
  ],
  exitOnError: false,
});

// Track errors in metrics
Logger.on('error', (error) => {
  metrics.applicationErrors.inc({ 
    error_type: error.name || 'unknown',
    severity: 'high'
  });
});

// Audit logging helper
export const auditLog = (action: string, userId: string, details: any) => {
  Logger.info(`Audit: ${action}`, {
    audit: true,
    action,
    userId,
    timestamp: new Date().toISOString(),
    ...details
  });
};

// Performance logging helper
export const perfLog = (operation: string, duration: number, metadata?: any) => {
  Logger.info(`Performance: ${operation}`, {
    performance: true,
    operation,
    duration,
    ...metadata
  });
};

// Create a stream object for morgan HTTP logger
Logger.stream = {
  write: (message: string) => {
    Logger.info(message.trim());
  },
} as any;

export default Logger;