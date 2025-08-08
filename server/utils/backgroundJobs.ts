import Bull from 'bull';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';
import Logger from './logger';
import { metrics } from '../config/metrics';

// Create queues
export const documentQueue = new Bull('document-generation', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
  },
});

export const emailQueue = new Bull('email-notifications', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
  },
});

// Job processors
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

// Queue event handlers
documentQueue.on('completed', (job, result) => {
  Logger.info('Document job completed', { jobId: job.id, result });
});

documentQueue.on('failed', (job, err) => {
  Logger.error('Document job failed', { jobId: job.id, error: err.message });
});

// Bull Board setup for monitoring
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
} catch (error) {
  Logger.warn('Bull board could not be initialized, possibly due to Redis connection', { error });
}

export const bullBoardRouter = serverAdapter.getRouter();

// Helper to add jobs with monitoring
export const addDocumentJob = async (data: any) => {
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