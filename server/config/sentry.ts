import * as Sentry from '@sentry/node';
import Logger from '../utils/logger';
import { metrics } from './metrics';

export const initSentry = (app: any) => {
  if (!process.env.SENTRY_DSN) {
    Logger.warn('Sentry DSN not provided, error tracking disabled');
    return;
  }

  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    integrations: [
      // Express integration
      Sentry.httpIntegration(),
      Sentry.expressIntegration(),
    ],
    
    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    // profilesSampleRate: 1.0, // Not available in this version
    
    // Release tracking
    release: process.env.RELEASE_VERSION || 'development',
    
    // Before send hook
    beforeSend(event, hint) {
      // Log to Winston as well
      Logger.error('Sentry error captured', {
        error: hint.originalException,
        event_id: event.event_id,
      });
      
      // Track in metrics
      metrics.applicationErrors.inc({
        error_type: event.exception?.values?.[0]?.type || 'unknown',
        severity: event.level || 'error'
      });
      
      // Filter out sensitive data
      if (event.request?.cookies) {
        delete event.request.cookies;
      }
      
      return event;
    },
    
    // Ignore certain errors
    ignoreErrors: [
      'Network Error',
      'Non-Error promise rejection captured',
    ],
  });

  // Sentry request handler (must be first middleware)
  app.use(Sentry.expressErrorHandler());
};

// Error handler (must be after all controllers)
export const sentryErrorHandler = Sentry.expressErrorHandler();

// Custom error capture with context
export const captureError = (error: Error, context?: any) => {
  Sentry.captureException(error, {
    extra: context,
    tags: {
      section: context?.section || 'unknown',
    },
  });
};