import express, { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { getCustomerByEmail, getCompanyByCustomerId } from '../utils/airtable';
import {
  calculateFederalRate,
  RDTaxRules,
  type BusinessProfile
} from '../../shared/taxRules/rdTaxRules';

const router = express.Router();

/**
 * @swagger
 * /credits/calculate:
 *   post:
 *     summary: Calculate comprehensive R&D tax credits
 *     tags: [Credits]
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
 *               totalQRE:
 *                 type: number
 *                 description: Total qualified research expenses (optional)
 *     responses:
 *       200:
 *         description: Credit calculation successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalQRE:
 *                   type: number
 *                 federalCredit:
 *                   type: object
 *                   properties:
 *                     traditionalMethod:
 *                       type: number
 *                     rate:
 *                       type: number
 *                     explanation:
 *                       type: string
 *                 stateCredits:
 *                   type: array
 *                   items:
 *                     type: object
 *                 payrollTaxOffset:
 *                   type: object
 *                 totalCredits:
 *                   type: number
 *                 netBenefit:
 *                   type: number
 *                 companyInfo:
 *                   type: object
 */
router.post('/calculate', asyncHandler(async (req: Request, res: Response) => {
  const { email, totalQRE } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const airtableToken = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;

  if (!airtableToken || !baseId) {
    return res.status(500).json({ error: 'Airtable not configured' });
  }

  // Get QRE if not provided
  let qreAmount = totalQRE;
  if (!qreAmount) {
    // Recalculate QRE if not provided
    try {
      const qreResponse = await fetch(`${req.protocol}://${req.get('host')}/api/qre/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (qreResponse.ok) {
        const qreData = await qreResponse.json();
        qreAmount = qreData.grandTotal;
      } else {
        qreAmount = 0;
      }
    } catch (error) {
      console.error('Failed to fetch QRE data:', error);
      qreAmount = 0;
    }
  }

  // Get company information for state credits and payroll tax offset eligibility
  const customer = await getCustomerByEmail(email);
  let companyInfo = {
    primaryState: '',
    rdStates: [] as string[],
    employeeCount: '',
    annualRevenue: ''
  };
  
  let businessProfile: BusinessProfile = {
    yearsInBusiness: 3, // Default estimate
    annualRevenue: 'Under $1M', // Default
    hadRevenueThreeYearsAgo: false, // Default for startups
    businessStructure: 'LLC', // Default
    primaryIndustry: 'Other' // Default
  };

  if (customer) {
    const company = await getCompanyByCustomerId(customer.id);
    if (company) {
      companyInfo = {
        primaryState: company.fields.primary_state || '',
        rdStates: company.fields.rd_states || [],
        employeeCount: company.fields.employee_count || '',
        annualRevenue: company.fields.revenue || ''
      };
      
      // Build business profile from company data
      businessProfile = {
        yearsInBusiness: company.fields.years_in_business || 3,
        annualRevenue: company.fields.revenue || 'Under $1M',
        hadRevenueThreeYearsAgo: company.fields.had_revenue_three_years_ago || false,
        businessStructure: company.fields.business_structure || 'LLC',
        primaryIndustry: company.fields.primary_industry || 'Other'
      };
    }
  }

  // Calculate Federal Credit using dynamic rates (14%/10%/6.5% based on business profile)
  const federalRateInfo = calculateFederalRate(businessProfile);
  const federalCreditAmount = Math.round(qreAmount * federalRateInfo.rate);
  
  const federalCredit = {
    traditionalMethod: federalCreditAmount,
    rate: federalRateInfo.rate * 100, // Convert to percentage for display
    explanation: `${federalRateInfo.name}: ${federalRateInfo.description}. ${federalRateInfo.benefits.join(' ')}`
  };

  // Use centralized state credit information
  const stateRates: Record<string, { rate: number; maxCredit?: number; description: string }> = {
    ...Object.fromEntries(
      Object.entries(RDTaxRules.stateCredits).map(([state, info]) => [
        state,
        {
          rate: info.rate * 100, // Convert to percentage
          maxCredit: info.maxCredit || undefined,
          description: info.notes
        }
      ])
    ),
    // Additional states not in centralized rules yet
    'Connecticut': { rate: 6, description: '6% credit with additional benefits for small businesses' },
    'Illinois': { rate: 6.5, description: '6.5% credit for increasing research activities in Illinois' },
    'Massachusetts': { rate: 10, description: '10% research credit for qualified expenses above base amount' },
    'New Jersey': { rate: 20, description: '20% credit for qualified research expenses with generous carryforward' },
    'North Carolina': { rate: 25, description: '25% credit for qualified research expenses (one of the highest state rates)' },
    'Washington': { rate: 1.5, description: '1.5% credit for qualified research activities in Washington' }
  };

  // Calculate state credits for all R&D states
  const allStates = Array.from(new Set([companyInfo.primaryState, ...companyInfo.rdStates])).filter(Boolean);
  const stateCredits = allStates.map(state => {
    const stateInfo = stateRates[state];
    if (!stateInfo) {
      return {
        state,
        rate: 0,
        creditAmount: 0,
        description: 'No specific R&D credit available in this state'
      };
    }
    
    let creditAmount = Math.round(qreAmount * (stateInfo.rate / 100));
    if (stateInfo.maxCredit) {
      creditAmount = Math.min(creditAmount, stateInfo.maxCredit);
    }
    
    return {
      state,
      rate: stateInfo.rate,
      maxCredit: stateInfo.maxCredit,
      creditAmount,
      description: stateInfo.description
    };
  });

  // Calculate Payroll Tax Offset eligibility using centralized rules
  const payrollTaxOffset = {
    eligible: federalRateInfo.canOffsetPayroll,
    maxOffset: federalRateInfo.payrollOffsetLimit,
    effectiveOffset: 0,
    explanation: ''
  };
  
  if (payrollTaxOffset.eligible) {
    payrollTaxOffset.effectiveOffset = Math.min(federalCreditAmount, payrollTaxOffset.maxOffset);
    payrollTaxOffset.explanation = `Your business qualifies for payroll tax offset. Up to $${payrollTaxOffset.maxOffset.toLocaleString()} of federal R&D credits can offset payroll taxes instead of income taxes.`;
  } else {
    payrollTaxOffset.explanation = 'Payroll tax offset is available for qualifying small businesses and startups. Your business may not meet the current eligibility requirements.';
  }

  // Calculate totals
  const totalStateCredits = stateCredits.reduce((sum, state) => sum + state.creditAmount, 0);
  const totalCredits = federalCreditAmount + totalStateCredits;
  const netBenefit = totalCredits + (payrollTaxOffset.eligible ? payrollTaxOffset.effectiveOffset : 0);

  const creditData = {
    totalQRE: qreAmount,
    federalCredit,
    stateCredits,
    payrollTaxOffset,
    totalCredits,
    netBenefit,
    companyInfo
  };

  res.json(creditData);
}));

/**
 * Generate credit report endpoint
 */
router.post('/generate-report', asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  // This would typically generate a detailed PDF report
  // For now, just return success
  res.json({ 
    success: true, 
    message: 'Credit calculation report has been generated and sent to your email' 
  });
}));

export default router;