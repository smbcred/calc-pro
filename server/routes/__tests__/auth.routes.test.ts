import { describe, it, expect, beforeAll, afterAll, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { createTestApp, setupTestEnv } from '../../test/test-utils';

// Mock the Airtable functions before importing
vi.mock('../../utils/airtable', () => ({
  getCustomerByEmail: vi.fn(),
  createTestCustomer: vi.fn(),
}));

import { getCustomerByEmail, createTestCustomer } from '../../utils/airtable';

describe('Auth Routes', () => {
  let app: express.Application;

  beforeAll(() => {
    setupTestEnv();
    app = createTestApp();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
  });

  describe('POST /api/auth/verify', () => {
    it('should return 400 if email is missing', async () => {
      const response = await request(app)
        .post('/api/auth/verify')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Email is required');
    });

    it('should return 401 if customer not found', async () => {
      vi.mocked(getCustomerByEmail).mockResolvedValueOnce(null);

      const response = await request(app)
        .post('/api/auth/verify')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Access not found. Please check your email or contact support.');
      expect(getCustomerByEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('should return success if customer exists', async () => {
      const mockCustomer = {
        id: 'rec123',
        fields: {
          email: 'test@example.com',
          access_token: 'token123',
          plan_type: 'Growth ($10K-$50K Credit)'
        }
      };
      
      vi.mocked(getCustomerByEmail).mockResolvedValueOnce(mockCustomer);

      const response = await request(app)
        .post('/api/auth/verify')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.accessToken).toBe('token123');
      expect(response.body.planType).toBe('Growth ($10K-$50K Credit)');
    });

    it('should handle server errors gracefully', async () => {
      vi.mocked(getCustomerByEmail).mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app)
        .post('/api/auth/verify')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Internal server error');
    });
  });

  describe('POST /api/auth/create-test-customer', () => {
    it('should create test customer successfully', async () => {
      const mockResult = {
        success: true,
        message: 'Test customer created for test@example.com',
        accessToken: 'test-token-123',
        loginUrl: '/login'
      };

      vi.mocked(createTestCustomer).mockResolvedValueOnce(mockResult);

      const response = await request(app)
        .post('/api/auth/create-test-customer')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockResult);
      expect(createTestCustomer).toHaveBeenCalledWith('test@example.com');
    });

    it('should handle creation errors', async () => {
      vi.mocked(createTestCustomer).mockRejectedValueOnce(new Error('Creation failed'));

      const response = await request(app)
        .post('/api/auth/create-test-customer')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to create test customer');
    });
  });
});