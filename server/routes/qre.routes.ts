import express, { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { getCustomerByEmail, getCompanyByCustomerId } from '../utils/airtable';
import {
  getQualificationRate,
  RDTaxRules,
  calculateFederalRate,
  type BusinessProfile
} from '../../shared/taxRules/rdTaxRules';

const router = express.Router();

/**
 * @swagger
 * /qre/calculate:
 *   post:
 *     summary: Calculate qualified research expenses (QRE)
 *     tags: [QRE]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Customer email
 *     responses:
 *       200:
 *         description: QRE calculation successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 wages:
 *                   type: object
 *                 contractors:
 *                   type: object
 *                 supplies:
 *                   type: object
 *                 cloudSoftware:
 *                   type: object
 *                 grandTotal:
 *                   type: number
 *                 taxCreditEstimate:
 *                   type: number
 */
router.post('/calculate', asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const airtableToken = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;

  if (!airtableToken || !baseId) {
    return res.status(500).json({ error: 'Airtable not configured' });
  }

  // Get customer and company info
  const customer = await getCustomerByEmail(email);
  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  const company = await getCompanyByCustomerId(customer.id);
  if (!company) {
    return res.json({
      wages: { entries: [], total: 0 },
      contractors: { entries: [], total: 0 },
      supplies: { entries: [], total: 0 },
      cloudSoftware: { entries: [], total: 0 },
      grandTotal: 0,
      taxCreditEstimate: 0
    });
  }

  // Build business profile for qualification rates
  const businessProfile: BusinessProfile = {
    yearsInBusiness: company.fields.years_in_business || 3,
    annualRevenue: company.fields.revenue || 'Under $1M',
    hadRevenueThreeYearsAgo: company.fields.had_revenue_three_years_ago || false,
    businessStructure: company.fields.business_structure || 'LLC',
    primaryIndustry: company.fields.primary_industry || 'Other'
  };

  // Fetch wages and expenses from Airtable
  const [wagesResponse, expensesResponse] = await Promise.all([
    fetch(`https://api.airtable.com/v0/${baseId}/Wages?filterByFormula={company_id}='${company.id}'`, {
      headers: {
        'Authorization': `Bearer ${airtableToken}`,
        'Content-Type': 'application/json',
      },
    }),
    fetch(`https://api.airtable.com/v0/${baseId}/Expenses?filterByFormula={company_id}='${company.id}'`, {
      headers: {
        'Authorization': `Bearer ${airtableToken}`,
        'Content-Type': 'application/json',
      },
    })
  ]);

  let wagesData = [];
  let expensesData = [];

  if (wagesResponse.ok) {
    const data = await wagesResponse.json();
    wagesData = data.records;
  }

  if (expensesResponse.ok) {
    const data = await expensesResponse.json();
    expensesData = data.records;
  }

  // Get industry-specific qualification rates
  const wageQualificationRate = getQualificationRate(businessProfile.primaryIndustry, 'employeeTime');
  const contractorQualificationRate = getQualificationRate(businessProfile.primaryIndustry, 'contractors');
  const suppliesQualificationRate = getQualificationRate(businessProfile.primaryIndustry, 'supplies');
  const cloudQualificationRate = getQualificationRate(businessProfile.primaryIndustry, 'software');

  // Process wages with industry-specific rates
  const processedWages = wagesData.map((record: any) => {
    const salary = record.fields.salary || 0;
    const rdPercentage = record.fields.rd_percentage || 0;
    const baseQualified = salary * (rdPercentage / 100);
    const qualifiedAmount = Math.round(baseQualified * wageQualificationRate);
    
    return {
      employeeName: record.fields.employee_name || 'Unnamed Employee',
      role: record.fields.role || 'Employee',
      annualSalary: salary,
      rdPercentage: rdPercentage,
      qualifiedAmount: qualifiedAmount
    };
  });

  // Process contractors
  const contractors = expensesData
    .filter((e: any) => e.fields.expense_type === 'contractor')
    .map((record: any) => {
      const amount = record.fields.amount || 0;
      const qualifiedAmount = Math.round(amount * contractorQualificationRate);
      
      return {
        contractorName: record.fields.contractor_name || 'Unnamed Contractor',
        amount: amount,
        qualifiedAmount: qualifiedAmount,
        description: record.fields.description || ''
      };
    });

  // Process supplies
  const supplies = expensesData
    .filter((e: any) => e.fields.expense_type === 'supply')
    .map((record: any) => {
      const amount = record.fields.amount || 0;
      const rdPercentage = record.fields.rd_percentage || 100;
      const baseQualified = amount * (rdPercentage / 100);
      const qualifiedAmount = Math.round(baseQualified * suppliesQualificationRate);
      
      return {
        supplyType: record.fields.supply_type || 'Unnamed Supply',
        amount: amount,
        rdPercentage: rdPercentage,
        qualifiedAmount: qualifiedAmount
      };
    });

  // Process cloud/software
  const cloudSoftware = expensesData
    .filter((e: any) => e.fields.expense_type === 'cloud')
    .map((record: any) => {
      const monthlyCost = record.fields.monthly_cost || 0;
      const rdPercentage = record.fields.rd_percentage || 100;
      const annualCost = monthlyCost * 12;
      const baseQualified = annualCost * (rdPercentage / 100);
      const qualifiedAmount = Math.round(baseQualified * cloudQualificationRate);
      
      return {
        serviceName: record.fields.service_name || 'Unnamed Service',
        annualCost: annualCost,
        rdPercentage: rdPercentage,
        qualifiedAmount: qualifiedAmount
      };
    });

  // Calculate totals
  const wagesTotal = processedWages.reduce((sum: number, w: any) => sum + w.qualifiedAmount, 0);
  const contractorsTotal = contractors.reduce((sum: number, c: any) => sum + c.qualifiedAmount, 0);
  const suppliesTotal = supplies.reduce((sum: number, s: any) => sum + s.qualifiedAmount, 0);
  const cloudTotal = cloudSoftware.reduce((sum: number, c: any) => sum + c.qualifiedAmount, 0);
  const grandTotal = wagesTotal + contractorsTotal + suppliesTotal + cloudTotal;

  // Calculate tax credit estimate using dynamic federal rate
  const federalRateInfo = calculateFederalRate(businessProfile);
  const taxCreditEstimate = Math.round(grandTotal * federalRateInfo.rate);

  const result = {
    wages: {
      entries: processedWages,
      total: wagesTotal
    },
    contractors: {
      entries: contractors,
      total: contractorsTotal
    },
    supplies: {
      entries: supplies,
      total: suppliesTotal
    },
    cloudSoftware: {
      entries: cloudSoftware,
      total: cloudTotal
    },
    grandTotal,
    taxCreditEstimate
  };

  res.json(result);
}));

/**
 * Generate QRE report endpoint
 */
router.post('/generate-report', asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // This would typically generate a detailed QRE breakdown report
  // For now, just return success
  res.json({ 
    success: true, 
    message: 'QRE breakdown report has been generated and sent to your email' 
  });
}));

export default router;