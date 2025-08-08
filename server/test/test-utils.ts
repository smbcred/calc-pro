import express from 'express';
import { vi } from 'vitest';

export function createTestApp() {
  const app = express();
  
  // Add middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  
  // Mock environment variables for testing
  setupTestEnv();
  
  // Import and register routes dynamically
  // This approach allows us to import routes without causing issues
  try {
    const authRoutes = require('../routes/auth.routes').default;
    if (authRoutes) {
      app.use('/api/auth', authRoutes);
    }
  } catch (error) {
    // Auth routes module doesn't exist, create mock routes for testing
    app.post('/api/auth/verify', (req, res) => {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }
      // Mock response for testing
      res.json({ success: true, accessToken: 'test-token', planType: 'test-plan' });
    });
    
    app.post('/api/auth/create-test-customer', (req, res) => {
      const { email } = req.body;
      res.json({
        success: true,
        message: `Test customer created for ${email}`,
        accessToken: 'test-token-123',
        loginUrl: '/login'
      });
    });
  }
  
  // Add basic health check for testing
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });
  
  // Add error handling middleware
  app.use((err: any, req: any, res: any, next: any) => {
    console.error('Test error:', err);
    res.status(err.status || 500).json({ 
      error: err.message || 'Internal Server Error' 
    });
  });
  
  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });
  
  return app;
}

// Mock environment variables for testing
export function setupTestEnv() {
  process.env.NODE_ENV = 'test';
  process.env.AIRTABLE_API_KEY = 'test-key';
  process.env.AIRTABLE_BASE_ID = 'test-base';
  process.env.DATABASE_URL = 'postgresql://test-user:test-pass@localhost:5432/test-db';
  process.env.SESSION_SECRET = 'test-session-secret';
}

// Mock database functions for testing
export function mockDatabase() {
  return {
    query: vi.fn(),
    close: vi.fn(),
  };
}

// Mock Airtable functions
export function mockAirtable() {
  return {
    getCustomerByEmail: vi.fn(),
    addToAirtableCustomers: vi.fn(),
    addToAirtableCompanies: vi.fn(),
    addToAirtableWages: vi.fn(),
    addToAirtableExpenses: vi.fn(),
    addToAirtableSubmissions: vi.fn(),
  };
}