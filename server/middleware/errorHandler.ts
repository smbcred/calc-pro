import { Request, Response, NextFunction } from 'express';
import Logger from '../utils/logger';

// Custom error class
export class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;
  code?: string;

  constructor(message: string, statusCode: number, code?: string) {
    super(message);
    
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Async error handler wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Handle specific error types
const handleCastErrorDB = (err: any) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err: any) => {
  const value = err.errmsg?.match(/(["'])(\\?.)*?\1/)?.[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err: any) => {
  const errors = Object.values(err.errors).map((el: any) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 401);

const handleRateLimitError = () =>
  new AppError('Too many requests. Please try again later.', 429);

// Send error response in development
const sendErrorDev = (err: any, res: Response) => {
  res.status(err.statusCode || 500).json({
    status: err.status || 'error',
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

// Send error response in production
const sendErrorProd = (err: any, res: Response) => {
  // Operational errors: send message to client
  if (err.isOperational) {
    res.status(err.statusCode || 500).json({
      status: err.status || 'error',
      message: err.message,
    });
  } else {
    // Programming errors: don't leak error details
    Logger.error('ERROR 💥', err);
    
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
    });
  }
};

// Global error handling middleware
export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log error details
  Logger.error(`${err.statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    // Handle specific error types in production
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    if (error.statusCode === 429) error = handleRateLimitError();

    sendErrorProd(error, res);
  }
};

// Handle unhandled promise rejections
export const handleUnhandledRejections = () => {
  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    Logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Application specific logging, throwing an error, or other logic here
  });
};

// Handle uncaught exceptions
export const handleUncaughtExceptions = () => {
  process.on('uncaughtException', (err: Error) => {
    Logger.error('Uncaught Exception thrown:', err.name, err.message);
    process.exit(1);
  });
};

// 404 Not Found middleware
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  const err = new AppError(`Can't find ${req.originalUrl} on this server!`, 404);
  next(err);
};

// Common error factories
export const createValidationError = (message: string) => new AppError(message, 400, 'VALIDATION_ERROR');
export const createAuthenticationError = (message: string) => new AppError(message, 401, 'AUTHENTICATION_ERROR');
export const createAuthorizationError = (message: string) => new AppError(message, 403, 'AUTHORIZATION_ERROR');
export const createNotFoundError = (message: string) => new AppError(message, 404, 'NOT_FOUND');
export const createConflictError = (message: string) => new AppError(message, 409, 'CONFLICT_ERROR');
export const createInternalServerError = (message: string) => new AppError(message, 500, 'INTERNAL_SERVER_ERROR');