# R&D Tax Credit Calculator Logic

## Overview

The calculator guides users through determining eligibility and estimating their potential R&D tax credit. It uses simplified calculations suitable for small businesses.

## Calculation Steps

### Step 1: Eligibility Check
- Business type (C-Corp, S-Corp, LLC, etc.)
- Use of AI/automation tools
- Technical experimentation activities
- U.S.-based operations

### Step 2: Qualifying Activities
User selects from common R&D activities:
- Software development
- Process automation
- AI/ML implementation
- Product development
- Manufacturing improvements
- Technical problem-solving

### Step 3: Expense Collection

#### Wages
- Number of employees doing R&D
- Average salary
- Percentage of time on R&D
- Formula: `Qualified Wages = Employees × Avg Salary × R&D %`

#### Contractors
- Total contractor costs
- R&D percentage
- Formula: `Qualified Contractors = Contractor Costs × R&D %`

#### Supplies & Software
- Cloud computing costs
- Software licenses
- Development tools
- Formula: `Qualified Supplies = Supply Costs × R&D %`

### Step 4: Credit Calculation

**Total Qualified Research Expenses (QRE)**
```
QRE = Qualified Wages + Qualified Contractors + Qualified Supplies
```

**Federal Credit (Simplified Method)**
```
Federal Credit = QRE × 6.5%
```

**State Credits** (if applicable)
```
PA Credit = QRE × 10% (capped)
Other states vary
```

### Step 5: Pricing Tier

Based on federal credit amount:
- < $10,000 → Tier 1 ($500)
- $10,000 - $50,000 → Tier 2 ($750)
- > $50,000 → Tier 3 ($1,000)

Multi-year pricing:
- Base year: Full price
- Additional years: 20% discount each

## Implementation

### Frontend Component
```typescript
// Simplified calculation
const calculateCredit = (expenses: Expenses) => {
  const qre = 
    expenses.wages * expenses.wageRdPercent +
    expenses.contractors * expenses.contractorRdPercent +
    expenses.supplies * expenses.suppliesRdPercent;
    
  const federalCredit = qre * 0.065;
  
  const tier = 
    federalCredit < 10000 ? 1 :
    federalCredit < 50000 ? 2 : 3;
    
  const price = 
    tier === 1 ? 500 :
    tier === 2 ? 750 : 1000;
    
  return { qre, federalCredit, tier, price };
};
```

### Validation Rules
- Minimum QRE: $10,000 (worth filing)
- Maximum credit shown: $500,000 (enterprise referral)
- R&D percentage: 0-100%
- Required fields before calculation

## User Experience

1. **Progressive Disclosure**: Only show relevant fields
2. **Real-time Updates**: Calculate as user types
3. **Visual Feedback**: Show tier changes with animation
4. **Clear CTAs**: "Get Your Documents" with price
5. **Trust Signals**: "IRS-compliant", "Secure", testimonials