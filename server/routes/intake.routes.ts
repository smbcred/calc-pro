import express from 'express';
import { getCustomerByEmail, addToAirtableSubmissions } from '../utils/airtable';
import { validate } from '../middleware/validate';
import { intakeFormSchema } from '../validations';
import { asyncHandler, AppError, createAuthorizationError, createInternalServerError } from '../middleware/errorHandler';

const router = express.Router();

// Intake form submission endpoint - pure Airtable
router.post('/submit', validate(intakeFormSchema), asyncHandler(async (req, res) => {
  const { email, formData } = req.body;

  const airtableToken = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;

  if (!airtableToken || !baseId) {
    throw createInternalServerError('Airtable not configured');
  }

  // Verify customer exists in Airtable
  const customerCheck = await fetch(`https://api.airtable.com/v0/${baseId}/Customers?filterByFormula=LOWER({Email})=LOWER('${email}')`, {
    headers: {
      'Authorization': `Bearer ${airtableToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!customerCheck.ok) {
    throw createInternalServerError('Failed to verify customer');
  }

  const customerData = await customerCheck.json();
  if (customerData.records.length === 0) {
    throw createAuthorizationError('Access denied - please complete payment first');
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
}));

export default router;