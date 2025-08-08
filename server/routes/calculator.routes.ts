import express from 'express';
import { validate } from '../middleware/validate';
import { calculatorInputSchema } from '../validations';
import { asyncHandler } from '../middleware/errorHandler';
import { CalculatorCache } from '../utils/calculatorCache';

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

  // Calculate QREs
  const qualifiedWages = wages * (wageRdPercent / 100);
  const qualifiedContractors = contractors * (contractorRdPercent / 100) * 0.65; // 65% cap per IRS rules
  const qualifiedSupplies = supplies * (suppliesRdPercent / 100);
  
  const totalQRE = qualifiedWages + qualifiedContractors + qualifiedSupplies;
  
  // Calculate federal credit (ASC method - 6% for startups)
  const federalCredit = totalQRE * 0.06;
  
  // Determine pricing tier
  let tier: number;
  let price: number;
  
  if (federalCredit < 10000) {
    tier = 1;
    price = 500;
  } else if (federalCredit < 50000) {
    tier = 2;
    price = 750;
  } else if (federalCredit < 100000) {
    tier = 3;
    price = 1000;
  } else {
    tier = 4;
    price = 1500;
  }
  
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