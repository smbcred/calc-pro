import express from 'express';
import { getCustomerByEmail, getCompanyByCustomerId, createTestCustomer } from '../utils/airtable';
import { validate } from '../middleware/validate';
import { requireAuth } from '../middleware/auth';
import { emailSchema, createTestCustomerSchema } from '../validations';
import { asyncHandler, AppError, createNotFoundError, createAuthorizationError, createInternalServerError } from '../middleware/errorHandler';

const router = express.Router();

// Auth verification endpoint - checks Airtable directly
router.post('/verify', validate(emailSchema), asyncHandler(async (req, res) => {
  const { email } = req.body;

  // Check customer in new schema
  const customer = await getCustomerByEmail(email);
  
  if (!customer) {
    return res.status(404).json({ error: 'Customer not found. Please complete payment first.', hasAccess: false });
  }

  res.json({ 
    hasAccess: true,
    customer: {
      email: customer.fields.email,
      planType: customer.fields.plan_type,
      createdAt: customer.fields.created_at
    }
  });
}));

// Customer info endpoint - requires authentication
router.post('/info', requireAuth, validate(emailSchema), asyncHandler(async (req, res) => {
  // Customer info is already verified by auth middleware
  const customerId = req.user!.customerId;
  
  // Check for existing company
  const company = await getCompanyByCustomerId(customerId);
  
  res.json({ 
    email: req.user!.email,
    planType: req.user!.planType,
    hasCompany: !!company,
    company: company ? {
      id: company.id,
      companyName: company.fields.company_name,
      ein: company.fields.ein,
      entityType: company.fields.entity_type
    } : null
  });
}));

// Development-only endpoint to create test customer for login testing
if (process.env.NODE_ENV !== 'production') {
  router.post('/dev/create-test-customer', validate(createTestCustomerSchema), asyncHandler(async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
      throw new AppError('Email is required', 400);
    }

    const result = await createTestCustomer(email);
    console.log(`✅ Created test customer: ${email} with access token: ${result.accessToken}`);
    
    res.json(result);
  }));
}

export default router;