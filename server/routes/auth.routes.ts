import express from 'express';
import { getCustomerByEmail, getCompanyByCustomerId, createTestCustomer } from '../utils/airtable';

const router = express.Router();

// Auth verification endpoint - checks Airtable directly
router.post('/verify', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

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
  } catch (error) {
    console.error('Auth verification error:', error);
    res.status(500).json({ error: 'Authentication verification failed' });
  }
});

// Customer info endpoint - checks Airtable directly
router.post('/customer/info', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const airtableToken = process.env.AIRTABLE_API_KEY;
    const baseId = process.env.AIRTABLE_BASE_ID;

    if (!airtableToken || !baseId) {
      return res.status(500).json({ error: 'Airtable not configured' });
    }

    // Check customer exists with new schema
    const customer = await getCustomerByEmail(email);
    
    if (!customer) {
      return res.status(403).json({ error: 'Access denied - customer not found' });
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
  } catch (error) {
    console.error('Customer info error:', error);
    res.status(500).json({ error: 'Failed to load customer info' });
  }
});

// Development-only endpoint to create test customer for login testing
if (process.env.NODE_ENV !== 'production') {
  router.post('/dev/create-test-customer', async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      const result = await createTestCustomer(email);
      console.log(`✅ Created test customer: ${email} with access token: ${result.accessToken}`);
      
      res.json(result);
    } catch (error: any) {
      console.error('Failed to create test customer:', error);
      res.status(500).json({ error: 'Failed to create test customer' });
    }
  });
}

export default router;