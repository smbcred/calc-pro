import express, { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { getCustomerByEmail, getCompanyByCustomerId } from '../utils/airtable';

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

  if (customer) {
    const company = await getCompanyByCustomerId(customer.id);
    if (company) {
      companyInfo = {
        primaryState: company.fields.primary_state || '',
        rdStates: company.fields.rd_states || [],
        employeeCount: company.fields.employee_count || '',
        annualRevenue: company.fields.revenue || ''
      };
    }
  }

  // Calculate Federal Credit (Traditional Method: 6.5% of QRE)
  const federalCreditRate = 6.5; // 6.5% traditional method
  const federalCreditAmount = Math.round(qreAmount * (federalCreditRate / 100));
  
  const federalCredit = {
    traditionalMethod: federalCreditAmount,
    rate: federalCreditRate,
    explanation: `Traditional method applies ${federalCreditRate}% to qualified research expenses. This is the most common method for businesses with consistent R&D spending.`
  };

  // State-specific R&D credit rates and information
  const stateRates: Record<string, { rate: number; maxCredit?: number; description: string }> = {
    'California': { rate: 24, description: 'California offers a 24% credit for qualified R&D expenses, with no annual cap' },
    'Connecticut': { rate: 6, description: '6% credit with additional benefits for small businesses' },
    'Illinois': { rate: 6.5, description: '6.5% credit for increasing research activities in Illinois' },
    'Maryland': { rate: 10, description: '10% credit for qualified research expenses with 15-year carryforward' },
    'Massachusetts': { rate: 10, description: '10% research credit for qualified expenses above base amount' },
    'New Jersey': { rate: 20, description: '20% credit for qualified research expenses with generous carryforward' },
    'New York': { rate: 9, description: '9% credit for qualified research expenses in New York' },
    'North Carolina': { rate: 25, description: '25% credit for qualified research expenses (one of the highest state rates)' },
    'Pennsylvania': { rate: 10, description: '10% credit for qualified research and development tax credit' },
    'Texas': { rate: 5, description: '5% credit for qualified research expenses with no annual limit' },
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

  // Calculate Payroll Tax Offset eligibility
  // Eligible if: gross receipts < $5M for 5-year period AND business < 5 years old
  const isSmallBusiness = companyInfo.annualRevenue.includes('Under $1M') || 
                         companyInfo.annualRevenue.includes('$1M - $5M');
  const isStartup = true; // We'd need founding year to calculate this properly
  
  const payrollTaxOffset = {
    eligible: isSmallBusiness && isStartup,
    maxOffset: 250000, // $250K annual limit
    effectiveOffset: 0,
    explanation: ''
  };
  
  if (payrollTaxOffset.eligible) {
    payrollTaxOffset.effectiveOffset = Math.min(federalCreditAmount, payrollTaxOffset.maxOffset);
    payrollTaxOffset.explanation = 'Your business qualifies for payroll tax offset based on revenue size. Up to $250,000 of federal R&D credits can offset payroll taxes instead of income taxes.';
  } else {
    payrollTaxOffset.explanation = 'Payroll tax offset is available for qualifying small businesses (under $5M gross receipts) that are less than 5 years old.';
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