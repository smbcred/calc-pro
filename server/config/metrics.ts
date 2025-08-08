import { Registry, Counter, Histogram, Gauge, collectDefaultMetrics } from 'prom-client';
import Logger from '../utils/logger';

// Create a Registry
export const register = new Registry();

// Add default metrics (CPU, memory, etc.)
collectDefaultMetrics({ register });

// Custom metrics for our application
export const metrics = {
  // HTTP metrics
  httpRequestDuration: new Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.1, 0.5, 1, 2, 5],
    registers: [register],
  }),

  httpRequestTotal: new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
    registers: [register],
  }),

  // Business metrics
  calculatorUsage: new Counter({
    name: 'calculator_usage_total',
    help: 'Total number of calculator uses',
    labelNames: ['tier', 'credit_range'],
    registers: [register],
  }),

  loginAttempts: new Counter({
    name: 'login_attempts_total',
    help: 'Total number of login attempts',
    labelNames: ['status'],
    registers: [register],
  }),

  intakeFormCompletions: new Counter({
    name: 'intake_form_completions_total',
    help: 'Total number of intake form completions',
    labelNames: ['company_size', 'entity_type'],
    registers: [register],
  }),

  stripePayments: new Counter({
    name: 'stripe_payments_total',
    help: 'Total number of Stripe payments',
    labelNames: ['status', 'tier', 'amount_range'],
    registers: [register],
  }),

  documentGeneration: new Counter({
    name: 'document_generation_total',
    help: 'Total number of document generation requests',
    labelNames: ['status', 'document_type'],
    registers: [register],
  }),

  // Cache metrics
  cacheHits: new Counter({
    name: 'cache_hits_total',
    help: 'Total number of cache hits',
    labelNames: ['cache_type'],
    registers: [register],
  }),

  cacheMisses: new Counter({
    name: 'cache_misses_total',
    help: 'Total number of cache misses',
    labelNames: ['cache_type'],
    registers: [register],
  }),

  // Performance metrics
  airtableResponseTime: new Histogram({
    name: 'airtable_response_time_seconds',
    help: 'Airtable API response time',
    labelNames: ['operation'],
    buckets: [0.1, 0.3, 0.5, 1, 2],
    registers: [register],
  }),

  // Current state gauges
  activeUsers: new Gauge({
    name: 'active_users',
    help: 'Current number of active users',
    registers: [register],
  }),

  pendingDocuments: new Gauge({
    name: 'pending_documents',
    help: 'Number of documents pending generation',
    registers: [register],
  }),

  // Error tracking
  applicationErrors: new Counter({
    name: 'application_errors_total',
    help: 'Total number of application errors',
    labelNames: ['error_type', 'severity'],
    registers: [register],
  }),
};

// Helper functions to track business metrics
export const trackCalculatorUsage = (federalCredit: number) => {
  let tier = '1';
  let creditRange = 'under_10k';
  
  if (federalCredit >= 100000) {
    tier = '4';
    creditRange = 'over_100k';
  } else if (federalCredit >= 50000) {
    tier = '3';
    creditRange = '50k_100k';
  } else if (federalCredit >= 10000) {
    tier = '2';
    creditRange = '10k_50k';
  }
  
  metrics.calculatorUsage.inc({ tier, credit_range: creditRange });
};

export const trackPayment = (status: 'success' | 'failed', amount: number, tier: string) => {
  let amountRange = 'under_500';
  if (amount >= 1500) amountRange = 'over_1500';
  else if (amount >= 1000) amountRange = '1000_1500';
  else if (amount >= 750) amountRange = '750_1000';
  else if (amount >= 500) amountRange = '500_750';
  
  metrics.stripePayments.inc({ status, tier, amount_range: amountRange });
};

// Metrics endpoint
export const metricsEndpoint = async (req: any, res: any) => {
  res.set('Content-Type', register.contentType);
  const metricsData = await register.metrics();
  res.end(metricsData);
};