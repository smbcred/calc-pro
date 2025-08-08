import express from 'express';
import { getCustomerByEmail, getCompanyByCustomerId, createTestCustomer } from '../utils/airtable';
import { validate } from '../middleware/validate';
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

// Customer info endpoint - checks Airtable directly
router.post('/customer/info', validate(emailSchema), asyncHandler(async (req, res) => {
  const { email } = req.body;

  const airtableToken = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;

  if (!airtableToken || !baseId) {
    throw createInternalServerError('Airtable not configured');
  }

  // Check customer exists with new schema
  const customer = await getCustomerByEmail(email);
  
  if (!customer) {
    throw createAuthorizationError('Access denied - customer not found');
  }

  // Check for existing company
  const company = await getCompanyByCustomerId(customer.id);
  
  res.json({ 
    email: customer.fields.email,
    planType: customer.fields.plan_type,
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