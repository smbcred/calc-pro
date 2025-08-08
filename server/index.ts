import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
// Import logging and error handling
import Logger from './utils/logger';
import { 
  globalErrorHandler, 
  notFoundHandler, 
  handleUnhandledRejections,
  handleUncaughtExceptions 
} from './middleware/errorHandler';
import expressWinston from 'express-winston';
// Import database and health check
import { closeDatabaseConnection } from './config/database';
import healthRoutes from './routes/health.routes';
// Import security middleware
import helmet from 'helmet';
import cors from 'cors';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import { corsOptions, apiLimiter, loginLimiter, strictLimiter } from './middleware/security';

const app = express();

// Trust proxy for proper client IP detection (required for rate limiting)
app.set('trust proxy', 1);

// Set up process handlers for unhandled rejections and uncaught exceptions
handleUncaughtExceptions();
handleUnhandledRejections();

// Apply security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors(corsOptions));
app.use(mongoSanitize()); // Prevent NoSQL injection attacks
app.use(hpp()); // Prevent HTTP Parameter Pollution

// Apply general rate limiting to all API routes
app.use('/api/', apiLimiter);

// Apply strict rate limiting to sensitive endpoints
app.use('/api/auth/verify', loginLimiter);
app.use('/api/generate-report', strictLimiter);
app.use('/api/stripeWebhook', strictLimiter);

// Raw body parsing for Stripe webhook (production)
app.use('/api/stripeWebhook', express.raw({ type: 'application/json' }));

// JSON parsing for all other endpoints with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// HTTP request logging middleware using Winston
app.use(expressWinston.logger({
  winstonInstance: Logger,
  meta: false, // Don't log metadata
  msg: "{{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms",
  expressFormat: true,
  colorize: false,
  ignoreRoute: function (req, res) {
    // Don't log static file requests in production
    return process.env.NODE_ENV === 'production' && !req.url.startsWith('/api');
  }
}));

(async () => {
  const server = await registerRoutes(app);

  // Add health check route
  app.use('/', healthRoutes);

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // 404 handler for unmatched routes (MUST be after Vite/static setup)
  app.use(notFoundHandler);
  
  // Global error handling middleware (MUST be last)
  app.use(globalErrorHandler);

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    Logger.info(`🚀 Server is running on port ${port}`);
    Logger.info(`🏃 Environment: ${process.env.NODE_ENV || 'development'}`);
    log(`serving on port ${port}`);
  });

  // Handle graceful shutdown
  process.on('SIGTERM', async () => {
    Logger.info('SIGTERM received, shutting down gracefully');
    server.close(() => {
      closeDatabaseConnection().then(() => {
        Logger.info('Database connections closed');
        process.exit(0);
      });
    });
  });

  process.on('SIGINT', async () => {
    Logger.info('SIGINT received, shutting down gracefully');
    server.close(() => {
      closeDatabaseConnection().then(() => {
        Logger.info('Database connections closed');
        process.exit(0);
      });
    });
  });
})();
