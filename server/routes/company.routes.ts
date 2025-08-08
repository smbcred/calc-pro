import express from 'express';
import { 
  getCustomerByEmail, 
  getCompanyByCustomerId, 
  addToAirtableCompanies 
} from '../utils/airtable';
import { validate } from '../middleware/validate';
import { emailSchema, companyInfoSchema } from '../validations';

const router = express.Router();

// Company info load endpoint
router.post('/info', validate(emailSchema), async (req, res) => {
  try {
    const { email } = req.body;
    

    // Get customer first
    const customer = await getCustomerByEmail(email);
    
    if (!customer) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get existing company info if it exists
    const company = await getCompanyByCustomerId(customer.id);
    
    res.json({
      companyInfo: company ? {
        companyName: company.fields.company_name,
        ein: company.fields.ein,
        entityType: company.fields.entity_type,
        revenue: company.fields.revenue,
        employeeCount: company.fields.employee_count,
        yearFounded: company.fields.year_founded,
        primaryState: company.fields.primary_state,
        rdStates: company.fields.rd_states ? company.fields.rd_states.split(',') : [],
        hasMultipleStates: company.fields.has_multiple_states || false,
        rdEmployeeCount: company.fields.rd_employee_count,
      } : null
    });
  } catch (error) {
    console.error('Company info error:', error);
    res.status(500).json({ error: 'Failed to load company info' });
  }
});

// Company info save progress endpoint
router.post('/save-progress', validate(companyInfoSchema), async (req, res) => {
  try {
    const { email, formData } = req.body;
    


    // Get customer first
    const customer = await getCustomerByEmail(email);
    
    if (!customer) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // For now, we'll just return success. In a full implementation,
    // you might want to save progress to a separate table or update existing company
    res.json({ success: true });
  } catch (error) {
    console.error('Save progress error:', error);
    res.status(500).json({ error: 'Failed to save progress' });
  }
});

// Company info submission endpoint
router.post('/submit', validate(companyInfoSchema), async (req, res) => {
  try {
    const { email, formData } = req.body;
    


    // Get customer first
    const customer = await getCustomerByEmail(email);
    
    if (!customer) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if company already exists and update, or create new
    const existingCompany = await getCompanyByCustomerId(customer.id);
    
    if (existingCompany) {
      // Update existing company
      const airtableToken = process.env.AIRTABLE_API_KEY;
      const baseId = process.env.AIRTABLE_BASE_ID;

      if (!airtableToken || !baseId) {
        return res.status(500).json({ error: 'Airtable not configured' });
      }

      const response = await fetch(`https://api.airtable.com/v0/${baseId}/Companies/${existingCompany.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${airtableToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields: {
            "company_name": formData.companyName,
            "ein": formData.ein,
            "entity_type": formData.entityType,
            "revenue": formData.annualRevenue,
            "employee_count": formData.employeeCount,
            "year_founded": formData.yearFounded,
            "primary_state": formData.primaryState,
            "rd_states": formData.rdStates?.join(',') || '',
            "has_multiple_states": formData.hasMultipleStates || false,
            "rd_employee_count": formData.rdEmployeeCount,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update company');
      }
    } else {
      // Create new company
      await addToAirtableCompanies({
        customerId: customer.id,
        companyName: formData.companyName,
        ein: formData.ein,
        entityType: formData.entityType,
        revenue: formData.annualRevenue,
        employeeCount: formData.employeeCount,
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Company submission error:', error);
    res.status(500).json({ error: 'Failed to submit company information' });
  }
});

export default router;