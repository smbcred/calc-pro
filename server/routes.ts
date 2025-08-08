import type { Express } from "express";
import { createServer, type Server } from "http";

// MARKETING ENDPOINTS (Phase 1 - No Authentication)
import calculatorRoutes from './routes/calculator.routes';
import webhookRoutes from './routes/webhook.routes';

// BACKEND SOFTWARE ENDPOINTS (Phase 2 - Require Authentication)
import authRoutes from './routes/auth.routes';
import companyRoutes from './routes/company.routes';
import expenseRoutes from './routes/expense.routes';
import reviewRoutes from './routes/review.routes';

// SYSTEM ENDPOINTS
import emailRoutes from './routes/email.routes';
import monitoringRoutes from './routes/monitoring.routes';
import creditsRoutes from './routes/credits.routes';
import webhooksRoutes from './routes/webhooks.routes';

export async function registerRoutes(app: Express): Promise<Server> {
  
  // =============================================
  // PHASE 1: MARKETING ENDPOINTS (No Auth)
  // =============================================
  app.use('/api/calculator', calculatorRoutes);     // POST /estimate
  app.use('/api', webhookRoutes);                   // POST /stripeCheckout, /stripe
  
  // =============================================
  // PHASE 2: BACKEND SOFTWARE ENDPOINTS (Auth Required)
  // =============================================
  app.use('/api/auth', authRoutes);                 // POST /verify
  app.use('/api/customer', authRoutes);             // POST /info
  app.use('/api/company', companyRoutes);           // POST /save-progress
  app.use('/api/expenses', expenseRoutes);          // POST /submit
  app.use('/api', reviewRoutes);                    // POST /generate-report
  app.use('/api/documents', reviewRoutes);          // POST /list
  
  // =============================================
  // SYSTEM ENDPOINTS
  // =============================================
  app.use('/api/email', emailRoutes);
  app.use('/api', monitoringRoutes);
  app.use('/api/credits', creditsRoutes);
  app.use('/api/webhooks', webhooksRoutes);

  const httpServer = createServer(app);

  return httpServer;
}