import express from 'express';
import { getCustomerByEmail, addToAirtableSubmissions } from '../utils/airtable';
import { validate } from '../middleware/validate';
import { intakeFormSchema } from '../validations';

const router = express.Router();

// Intake form submission endpoint - pure Airtable
router.post('/submit', validate(intakeFormSchema), async (req, res) => {
  try {
    // Set security headers
    res.set({
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block'
    });
    const { email, formData } = req.body;
    

    const airtableToken = process.env.AIRTABLE_API_KEY;
    const baseId = process.env.AIRTABLE_BASE_ID;

    if (!airtableToken || !baseId) {
      return res.status(500).json({ error: 'Airtable not configured' });
    }

    // Verify customer exists in Airtable
    const customerCheck = await fetch(`https://api.airtable.com/v0/${baseId}/Customers?filterByFormula=LOWER({Email})=LOWER('${email}')`, {
      headers: {
        'Authorization': `Bearer ${airtableToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!customerCheck.ok) {
      throw new Error('Failed to verify customer');
    }

    const customerData = await customerCheck.json();
    if (customerData.records.length === 0) {
      return res.status(403).json({ error: 'Access denied - please complete payment first' });
    }

    // Submit directly to Airtable Submissions
    const airtableRecordId = await addToAirtableSubmissions({
      customerEmail: email,
      entityName: formData.entityName,
      entityType: formData.entityType,
      taxId: formData.taxId,
      contactName: formData.contactName,
      contactEmail: formData.contactEmail,
      contactPhone: formData.contactPhone,
      businessDescription: formData.businessDescription,
      rdActivities: formData.rdActivities,
      totalWages: parseInt(formData.totalWages) || 0,
      contractorCosts: parseInt(formData.contractorCosts) || 0,
      supplyCosts: parseInt(formData.supplyCosts) || 0,
      otherExpenses: parseInt(formData.otherExpenses) || 0,
    });

    res.json({ success: true, submissionId: airtableRecordId });
  } catch (error) {
    console.error('Intake submission error:', error);
    res.status(500).json({ error: 'Failed to submit intake form' });
  }
});

export default router;