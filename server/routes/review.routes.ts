import express from 'express';
import { 
  getCustomerByEmail, 
  getCompanyByCustomerId, 
  trackDocumentDownload
} from '../utils/airtable';
import { validate } from '../middleware/validate';
import { emailSchema, documentTrackingSchema, documentStatusSchema } from '../validations';
import { asyncHandler, AppError, createAuthorizationError, createInternalServerError, createNotFoundError } from '../middleware/errorHandler';

const router = express.Router();

// Review data endpoint - aggregates data from all sources
router.post('/data', validate(emailSchema), asyncHandler(async (req, res) => {
  const { email } = req.body;

  // Get customer and company
  const customer = await getCustomerByEmail(email);
  if (!customer) {
    throw createAuthorizationError('Access denied');
  }

  const company = await getCompanyByCustomerId(customer.id);
  if (!company) {
    return res.json({ 
      companyInfo: null,
      rdActivities: null,
      expenses: null,
      completionStatus: { companyInfo: 0, rdActivities: 0, expenses: 0, canGenerate: false }
    });
  }

  const airtableToken = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;

  if (!airtableToken || !baseId) {
    throw createInternalServerError('Airtable not configured');
  }

    // Get wages and expenses
    const [wagesResponse, expensesResponse] = await Promise.all([
      fetch(`https://api.airtable.com/v0/${baseId}/Wages?filterByFormula={company_id}='${company.id}'`, {
        headers: { 'Authorization': `Bearer ${airtableToken}` }
      }),
      fetch(`https://api.airtable.com/v0/${baseId}/Expenses?filterByFormula={company_id}='${company.id}'`, {
        headers: { 'Authorization': `Bearer ${airtableToken}` }
      })
    ]);

    let wages = [];
    let expenses = [];

    if (wagesResponse.ok) {
      const wagesData = await wagesResponse.json();
      wages = wagesData.records;
    }

    if (expensesResponse.ok) {
      const expensesData = await expensesResponse.json();
      expenses = expensesData.records;
    }

    // Calculate totals
    const wagesTotalRD = wages.reduce((sum: number, w: any) => sum + (w.fields.qualified_amount || 0), 0);
    const contractorTotal = expenses.filter((e: any) => e.fields.expense_type === 'contractor')
      .reduce((sum: number, e: any) => sum + (e.fields.qualified_amount || 0), 0);
    const suppliesTotal = expenses.filter((e: any) => e.fields.expense_type === 'supply')
      .reduce((sum: number, e: any) => sum + (e.fields.qualified_amount || 0), 0);
    const cloudTotal = expenses.filter((e: any) => e.fields.expense_type === 'cloud')
      .reduce((sum: number, e: any) => sum + (e.fields.qualified_amount || 0), 0);

    const reviewData = {
      companyInfo: {
        companyName: company.fields.company_name,
        ein: company.fields.ein,
        entityType: company.fields.entity_type,
        yearFounded: company.fields.year_founded || '',
        annualRevenue: company.fields.revenue,
        employeeCount: company.fields.employee_count,
        rdEmployeeCount: company.fields.rd_employee_count || '',
        primaryState: company.fields.primary_state,
        rdStates: company.fields.rd_states ? company.fields.rd_states.split(',') : [],
        hasMultipleStates: company.fields.has_multiple_states || false,
      },
      rdActivities: {
        businessDescription: company.fields.business_description || '',
        rdActivities: company.fields.rd_activities || '',
      },
      expenses: {
        wages: wages.map((w: any) => ({
          employeeName: w.fields.employee_name,
          role: w.fields.role || '',
          annualSalary: w.fields.salary,
          rdPercentage: w.fields.rd_percentage,
          rdAmount: w.fields.qualified_amount,
        })),
        contractors: expenses.filter((e: any) => e.fields.expense_type === 'contractor').map((e: any) => ({
          contractorName: e.fields.contractor_name || '',
          amount: e.fields.amount,
          qualifiedAmount: e.fields.qualified_amount,
          description: e.fields.description || '',
        })),
        supplies: expenses.filter((e: any) => e.fields.expense_type === 'supply').map((e: any) => ({
          supplyType: e.fields.supply_type || '',
          amount: e.fields.amount,
          rdPercentage: e.fields.rd_percentage,
          rdAmount: e.fields.qualified_amount,
        })),
        cloudSoftware: expenses.filter((e: any) => e.fields.expense_type === 'cloud').map((e: any) => ({
          serviceName: e.fields.service_name || '',
          annualCost: e.fields.amount,
          rdPercentage: e.fields.rd_percentage,
          qualifiedAmount: e.fields.qualified_amount,
        })),
        totals: {
          wages: wagesTotalRD,
          contractors: contractorTotal,
          supplies: suppliesTotal,
          cloudSoftware: cloudTotal,
          grandTotal: wagesTotalRD + contractorTotal + suppliesTotal + cloudTotal,
        }
      },
      completionStatus: {
        companyInfo: company.fields.company_name ? 100 : 0,
        rdActivities: company.fields.rd_activities ? 100 : 0,
        expenses: wages.length > 0 || expenses.length > 0 ? 100 : 0,
        canGenerate: !!(company.fields.company_name && (wages.length > 0 || expenses.length > 0)),
      }
    };

  res.json(reviewData);
}));

// Generate documents endpoint
router.post('/generate-documents', validate(emailSchema), asyncHandler(async (req, res) => {
  const { email } = req.body;

  // Get customer
  const customer = await getCustomerByEmail(email);
  if (!customer) {
    throw createAuthorizationError('Access denied');
  }

  // Generate a tracking ID for this request
  const trackingId = Date.now().toString() + Math.random().toString(36).substr(2, 9);

  // In a real implementation, you would:
  // 1. Queue the document generation job
  // 2. Start the actual document generation process
  // 3. Update progress in a tracking table

  res.json({
    success: true,
    message: 'Document generation started. You will receive an email when complete.',
    trackingId,
    estimatedCompletion: '5-10 minutes'
  });
}));

// Document status endpoint
router.post('/document-status', validate(documentStatusSchema), asyncHandler(async (req, res) => {
  const { email, trackingId } = req.body;

  // In a real implementation, you would check the status in a tracking table
  // For now, we'll simulate progress
  const progress = Math.min(100, Math.floor(Math.random() * 100) + 10);
  const isComplete = progress >= 100;

  res.json({
    status: isComplete ? 'completed' : 'processing',
    progress,
    currentStep: isComplete ? 'Documents ready for download' : 'Generating technical narrative...',
    estimatedTimeRemaining: isComplete ? '0 minutes' : `${Math.max(1, 8 - Math.floor(progress/15))} minutes`,
  });
}));

// QRE calculation endpoint
router.post('/calculate', validate(emailSchema), asyncHandler(async (req, res) => {
  const { email } = req.body;

  // Get customer and company
  const customer = await getCustomerByEmail(email);
  if (!customer) {
    throw createAuthorizationError('Access denied');
  }

  const company = await getCompanyByCustomerId(customer.id);
  if (!company) {
    throw createNotFoundError('Company not found');
  }

  const airtableToken = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;

  if (!airtableToken || !baseId) {
    throw createInternalServerError('Airtable not configured');
  }

    // Get wages and expenses
    const [wagesResponse, expensesResponse] = await Promise.all([
      fetch(`https://api.airtable.com/v0/${baseId}/Wages?filterByFormula={company_id}='${company.id}'`, {
        headers: { 'Authorization': `Bearer ${airtableToken}` }
      }),
      fetch(`https://api.airtable.com/v0/${baseId}/Expenses?filterByFormula={company_id}='${company.id}'`, {
        headers: { 'Authorization': `Bearer ${airtableToken}` }
      })
    ]);

    let wages = [];
    let expenses = [];

    if (wagesResponse.ok) {
      const wagesData = await wagesResponse.json();
      wages = wagesData.records;
    }

    if (expensesResponse.ok) {
      const expensesData = await expensesResponse.json();
      expenses = expensesData.records;
    }

    // Calculate QRE data
    const wagesTotal = wages.reduce((sum: number, w: any) => sum + (w.fields.qualified_amount || 0), 0);
    const contractorTotal = expenses.filter((e: any) => e.fields.expense_type === 'contractor')
      .reduce((sum: number, e: any) => sum + (e.fields.qualified_amount || 0), 0);
    const suppliesTotal = expenses.filter((e: any) => e.fields.expense_type === 'supply')
      .reduce((sum: number, e: any) => sum + (e.fields.qualified_amount || 0), 0);
    const cloudTotal = expenses.filter((e: any) => e.fields.expense_type === 'cloud')
      .reduce((sum: number, e: any) => sum + (e.fields.qualified_amount || 0), 0);

    const grandTotal = wagesTotal + contractorTotal + suppliesTotal + cloudTotal;

    const qreData = {
      wages: {
        entries: wages.map((w: any) => ({
          employeeName: w.fields.employee_name,
          role: w.fields.role || '',
          annualSalary: w.fields.salary,
          rdPercentage: w.fields.rd_percentage,
          qualifiedAmount: w.fields.qualified_amount,
        })),
        total: wagesTotal,
      },
      contractors: {
        entries: expenses.filter((e: any) => e.fields.expense_type === 'contractor').map((e: any) => ({
          contractorName: e.fields.contractor_name || '',
          amount: e.fields.amount,
          qualifiedAmount: e.fields.qualified_amount,
          description: e.fields.description || '',
        })),
        total: contractorTotal,
      },
      supplies: {
        entries: expenses.filter((e: any) => e.fields.expense_type === 'supply').map((e: any) => ({
          supplyType: e.fields.supply_type || '',
          amount: e.fields.amount,
          rdPercentage: e.fields.rd_percentage,
          qualifiedAmount: e.fields.qualified_amount,
        })),
        total: suppliesTotal,
      },
      cloudSoftware: {
        entries: expenses.filter((e: any) => e.fields.expense_type === 'cloud').map((e: any) => ({
          serviceName: e.fields.service_name || '',
          annualCost: e.fields.amount,
          rdPercentage: e.fields.rd_percentage,
          qualifiedAmount: e.fields.qualified_amount,
        })),
        total: cloudTotal,
      },
      grandTotal,
      taxCreditEstimate: Math.round(grandTotal * 0.20), // 20% federal credit
    };

  res.json(qreData);
}));

// Generate QRE report endpoint
router.post('/generate-report', validate(emailSchema), asyncHandler(async (req, res) => {
  const { email } = req.body;

  // Get customer
  const customer = await getCustomerByEmail(email);
  if (!customer) {
    throw createAuthorizationError('Access denied');
  }

  // In a real implementation, you would generate and send the QRE report
  // For now, just return success
  res.json({ success: true, message: 'QRE report generation started' });
}));

// Documents list endpoint  
router.post('/list', validate(emailSchema), asyncHandler(async (req, res) => {
  const { email } = req.body;

  // Get customer
  const customer = await getCustomerByEmail(email);
  if (!customer) {
    throw createAuthorizationError('Access denied');
  }

  const airtableToken = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;

  if (!airtableToken || !baseId) {
    throw createInternalServerError('Airtable not configured');
  }

    // Get documents for this customer
    const response = await fetch(`https://api.airtable.com/v0/${baseId}/Documents?filterByFormula={customer_email}='${email}'`, {
      headers: {
        'Authorization': `Bearer ${airtableToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch documents');
    }

    const data = await response.json();
    const documents = data.records.map((record: any) => ({
      id: record.id,
      fileName: record.fields['File Name'] || '',
      displayName: getDocumentDisplayName(record.fields['File Type']),
      fileType: record.fields['File Type'] || '',
      description: getDocumentDescription(record.fields['File Type']),
      size: record.fields['File Size'] || 0,
      uploadedAt: record.fields['Upload Date'] || new Date().toISOString(),
      downloadUrl: record.fields['Download URL'] || '',
      downloadCount: record.fields['Download Count'] || 0,
      lastDownloaded: record.fields['Last Downloaded'],
    }));

  res.json({ documents });
}));

// Track document download
router.post('/track-download', validate(documentTrackingSchema), asyncHandler(async (req, res) => {
  const { email, documentId, fileName, fileType } = req.body;
  
  await trackDocumentDownload({ email, documentId, fileName, fileType });
  res.json({ success: true });
}));

// Helper functions for document display
function getDocumentDisplayName(fileType: string): string {
  switch (fileType) {
    case 'form_6765':
      return 'IRS Form 6765 - R&D Credit Form';
    case 'technical_narrative':
      return 'Technical Narrative & Documentation';
    case 'qre_workbook':
      return 'QRE Calculation Workbook';
    case 'compliance_memo':
      return 'Compliance & Filing Memo';
    case 'recordkeeping_checklist':
      return 'Record-keeping & Documentation Checklist';
    default:
      return 'R&D Tax Credit Document';
  }
}

function getDocumentDescription(fileType: string): string {
  switch (fileType) {
    case 'form_6765':
      return 'Official IRS form for claiming the federal R&D tax credit';
    case 'technical_narrative':
      return 'Detailed narrative explaining your qualifying R&D activities and technological challenges';
    case 'qre_workbook':
      return 'Excel workbook with detailed QRE calculations and supporting schedules';
    case 'compliance_memo':
      return 'Professional memo outlining compliance requirements and filing instructions';
    case 'recordkeeping_checklist':
      return 'Comprehensive checklist for maintaining proper R&D credit documentation';
    default:
      return 'Supporting documentation for your R&D tax credit claim';
  }
}

export default router;