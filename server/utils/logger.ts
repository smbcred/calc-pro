import winston from 'winston';
import path from 'path';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Tell winston that you want to link the colors
winston.addColors(colors);

// Define log format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
);

// Define transports
const transports = [
  // Console transport for all environments
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
    )
  }),
  
  // File transports for production
  new winston.transports.File({
    filename: path.join('logs', 'error.log'),
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    tailable: true
  }),
  
  new winston.transports.File({
    filename: path.join('logs', 'combined.log'),
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    tailable: true
  }),
];

// Create the logger
const Logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
  levels,
  format,
  transports,
  // Don't exit on handled exceptions
  exitOnError: false,
});

// Create a stream object for morgan HTTP logger
Logger.stream = {
  write: (message: string) => {
    Logger.http(message.trim());
  },
} as any;

export default Logger;