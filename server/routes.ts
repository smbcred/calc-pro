import type { Express } from "express";
import { createServer, type Server } from "http";

// Import route modules
import authRoutes from './routes/auth.routes';
import webhookRoutes from './routes/webhook.routes';
import intakeRoutes from './routes/intake.routes';
import companyRoutes from './routes/company.routes';
import expenseRoutes from './routes/expense.routes';
import reviewRoutes from './routes/review.routes';
import emailRoutes from './routes/email.routes';
import monitoringRoutes from './routes/monitoring.routes';

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Register route modules
  app.use('/api/auth', authRoutes);
  app.use('/api', webhookRoutes);
  app.use('/api/intake', intakeRoutes);
  app.use('/api/company', companyRoutes);
  app.use('/api/expense', expenseRoutes);
  app.use('/api', reviewRoutes);
  app.use('/api/email', emailRoutes);
  app.use('/api', monitoringRoutes);

  const httpServer = createServer(app);

  return httpServer;
}