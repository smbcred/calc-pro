import express from 'express';
import { validate } from '../middleware/validate';
import { calculatorInputSchema } from '../validations';
import { asyncHandler } from '../middleware/errorHandler';
import { CalculatorCache } from '../utils/calculatorCache';
import {
  calculateFederalRate,
  getQualificationRate,
  type BusinessProfile
} from '../../shared/taxRules/rdTaxRules';
import {
  calculatePricing
} from '../../shared/pricing/pricingEngine';

const router = express.Router();

/**
 * @swagger
 * /calculator/estimate:
 *   post:
 *     summary: Calculate R&D tax credit estimate
 *     tags: [Calculator]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CalculatorInput'
 *           example:
 *             wages: 500000
 *             wageRdPercent: 80
 *             contractors: 100000
 *             contractorRdPercent: 100
 *             supplies: 50000
 *             suppliesRdPercent: 100
 *     responses:
 *       200:
 *         description: Credit calculation successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CalculatorResult'
 *             example:
 *               totalQRE: 515000
 *               federalCredit: 30900
 *               tier: 2
 *               price: 750
 *               savingsAmount: 30150
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *     x-code-samples:
 *       - lang: 'cURL'
 *         source: |
 *           curl -X POST https://api.yourdomain.com/calculator/estimate \
 *             -H "Content-Type: application/json" \
 *             -d '{
 *               "wages": 500000,
 *               "wageRdPercent": 80,
 *               "contractors": 100000,
 *               "contractorRdPercent": 100,
 *               "supplies": 50000,
 *               "suppliesRdPercent": 100
 *             }'
 */
router.post('/estimate', validate(calculatorInputSchema), asyncHandler(async (req: express.Request, res: express.Response) => {
  const input = req.body;
  
  // Check cache first
  const cached = await CalculatorCache.getCachedResult(input);
  if (cached) {
    res.set('X-Calculator-Cache', 'HIT');
    return res.json(cached);
  }
  
  // Calculate if not cached
  const { wages, wageRdPercent, contractors, contractorRdPercent, supplies, suppliesRdPercent } = input;

  // Create default business profile for calculator (optimistic for marketing)
  const businessProfile: BusinessProfile = {
    yearsInBusiness: 2, // Assume startup for best rate
    annualRevenue: 'Under $1M', // Assume startup
    hadRevenueThreeYearsAgo: false, // Assume startup
    businessStructure: 'LLC',
    primaryIndustry: 'Software/Tech' // Best qualification rates
  };
  
  // Calculate QREs using centralized rules
  const wageQualificationRate = getQualificationRate(businessProfile.primaryIndustry, 'employeeTime');
  const contractorQualificationRate = getQualificationRate(businessProfile.primaryIndustry, 'contractors');
  const suppliesQualificationRate = getQualificationRate(businessProfile.primaryIndustry, 'supplies');
  
  const qualifiedWages = wages * (wageRdPercent / 100) * wageQualificationRate;
  const qualifiedContractors = contractors * (contractorRdPercent / 100) * contractorQualificationRate;
  const qualifiedSupplies = supplies * (suppliesRdPercent / 100) * suppliesQualificationRate;
  
  const totalQRE = qualifiedWages + qualifiedContractors + qualifiedSupplies;
  
  // Calculate federal credit using dynamic rates
  const federalRateInfo = calculateFederalRate(businessProfile);
  const federalCredit = totalQRE * federalRateInfo.rate;
  
  // Use centralized pricing engine
  const pricingResult = calculatePricing(federalCredit, [2025]);
  const tier = pricingResult.tier.name === 'Starter' ? 1 : 
              pricingResult.tier.name === 'Growth' ? 2 : 
              pricingResult.tier.name === 'Scale' ? 3 : 4;
  const price = pricingResult.totalPrice;
  
  const savingsAmount = federalCredit - price;
  
  const result = {
    totalQRE,
    federalCredit,
    tier,
    price,
    savingsAmount
  };
  
  // Cache the result
  await CalculatorCache.cacheResult(input, result);
  
  res.set('X-Calculator-Cache', 'MISS');
  res.json(result);
}));

export default router;