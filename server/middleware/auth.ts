import express from 'express';
import { getCustomerByEmail } from '../utils/airtable';
import { AppError, createAuthorizationError } from './errorHandler';

/**
 * Authentication middleware for backend endpoints
 * Verifies customer has paid and has access to the system
 */
export const requireAuth = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      throw createAuthorizationError('Email is required for authentication');
    }

    // Check if customer exists and has paid
    const customer = await getCustomerByEmail(email);
    
    if (!customer) {
      throw createAuthorizationError('Access denied - customer not found. Please complete payment first.');
    }

    // Add customer info to request for downstream use
    req.user = {
      email: customer.fields.email,
      customerId: customer.id,
      planType: customer.fields.plan_type,
      hasAccess: true
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional auth middleware - doesn't throw if no customer found
 * Used for endpoints that can work with or without auth
 */
export const optionalAuth = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { email } = req.body;
    
    if (email) {
      const customer = await getCustomerByEmail(email);
      
      if (customer) {
        req.user = {
          email: customer.fields.email,
          customerId: customer.id,
          planType: customer.fields.plan_type,
          hasAccess: true
        };
      }
    }

    next();
  } catch (error) {
    // Don't fail on auth errors for optional auth
    next();
  }
};

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        email: string;
        customerId: string;
        planType: string;
        hasAccess: boolean;
      };
    }
  }
}