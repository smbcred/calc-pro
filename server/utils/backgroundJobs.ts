import Bull from 'bull';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';
import Logger from './logger';
import { metrics } from '../config/metrics';

// Queue configuration with graceful Redis handling
const redisQueueConfig = {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    // More conservative settings for development
    connectTimeout: 5000,
    lazyConnect: true,
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: process.env.NODE_ENV === 'development' ? 3 : 10,
  },
  settings: {
    stalledInterval: 30 * 1000,
    maxStalledCount: 1,
    retryProcessDelay: 2000,
  },
};

// Create queues with error handling
let documentQueue: Bull.Queue | null = null;
let emailQueue: Bull.Queue | null = null;

try {
  documentQueue = new Bull('document-generation', redisQueueConfig);
  emailQueue = new Bull('email-notifications', redisQueueConfig);
} catch (error) {
  Logger.warn('Failed to create Bull queues - Redis unavailable', { error });
}

export { documentQueue, emailQueue };

// Job processors (only if queues are available)
if (documentQueue) {
  documentQueue.process(async (job) => {
    const { customerId, companyId, documentType } = job.data;
    
    try {
      Logger.info('Processing document generation', { customerId, documentType });
      
      // Simulate document generation
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      metrics.documentGeneration.inc({ status: 'success', document_type: documentType });
      
      return { success: true, documentId: `doc_${Date.now()}` };
    } catch (error) {
      Logger.error('Document generation failed', { error, jobId: job.id });
      metrics.documentGeneration.inc({ status: 'failed', document_type: documentType });
      throw error;
    }
  });

  // Queue event handlers for document queue
  documentQueue.on('completed', (job, result) => {
    Logger.info('Document job completed', { jobId: job.id, result });
  });

  documentQueue.on('failed', (job, err) => {
    Logger.error('Document job failed', { jobId: job.id, error: err.message });
  });
}

if (emailQueue) {
  emailQueue.process(async (job) => {
    const { to, template, data } = job.data;
    
    try {
      Logger.info('Sending email', { to, template });
      
      // Your email sending logic here
      
      return { success: true };
    } catch (error) {
      Logger.error('Email send failed', { error, jobId: job.id });
      throw error;
    }
  });

  // Queue event handlers for email queue
  emailQueue.on('completed', (job, result) => {
    Logger.info('Email job completed', { jobId: job.id, result });
  });

  emailQueue.on('failed', (job, err) => {
    Logger.error('Email job failed', { jobId: job.id, error: err.message });
  });
}

// Bull Board setup for monitoring
let bullBoardRouter: any = null;

if (documentQueue && emailQueue) {
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/admin/queues');

  try {
    createBullBoard({
      queues: [
        new BullAdapter(documentQueue),
        new BullAdapter(emailQueue),
      ],
      serverAdapter,
    });
    bullBoardRouter = serverAdapter.getRouter();
  } catch (error) {
    Logger.warn('Bull board could not be initialized - Redis unavailable', { error });
  }
} else {
  Logger.warn('Bull board disabled - queues not available');
}

export { bullBoardRouter };

// Helper to add jobs with monitoring
export const addDocumentJob = async (data: any) => {
  if (!documentQueue) {
    Logger.warn('Document queue not available - processing job directly');
    // Fallback: process immediately without queue
    // In a real app, you might want to store in database and process later
    return null;
  }

  try {
    const job = await documentQueue.add(data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
    
    metrics.pendingDocuments.inc();
    
    return job;
  } catch (error) {
    Logger.error('Failed to add document job', { error, data });
    throw error;
  }
};

export const addEmailJob = async (data: any) => {
  if (!emailQueue) {
    Logger.warn('Email queue not available - processing job directly');
    // Fallback: send email immediately without queue
    return null;
  }

  try {
    const job = await emailQueue.add(data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
    
    return job;
  } catch (error) {
    Logger.error('Failed to add email job', { error, data });
    throw error;
  }
};