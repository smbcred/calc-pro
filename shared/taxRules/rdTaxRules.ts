// shared/taxRules/rdTaxRules.ts

export const RDTaxRules = {
  // Update these values as tax law changes
  lastUpdated: "2025-01-01",
  taxYear: 2025,
  
  // Federal Credit Rates
  federalRates: {
    startup: {
      rate: 0.14,
      name: "Startup Method",
      description: "14% credit for qualifying startups",
      requirements: [
        "Less than 5 years in business",
        "No gross receipts 3+ years ago",
        "Qualified trade or business"
      ],
      benefits: [
        "14% credit rate (highest available)",
        "Can offset up to $500K in payroll taxes",
        "No AMT limitations"
      ],
      canOffsetPayroll: true,
      payrollOffsetLimit: 500000
    },
    qualifiedSmallBusiness: {
      rate: 0.10,
      name: "Small Business Enhanced Rate",
      description: "10% effective rate for QSBs",
      requirements: [
        "Less than $5M average gross receipts",
        "Less than 5 years since first gross receipts",
        "Active trade or business"
      ],
      benefits: [
        "10% effective credit rate",
        "Payroll tax offset available",
        "Simplified documentation"
      ],
      canOffsetPayroll: true,
      payrollOffsetLimit: 500000
    },
    standard: {
      rate: 0.065,
      name: "Alternative Simplified Credit",
      description: "Standard 6.5% ASC rate",
      requirements: [
        "Any business with qualifying R&D"
      ],
      benefits: [
        "No base period calculation needed",
        "Straightforward computation"
      ],
      canOffsetPayroll: false,
      payrollOffsetLimit: 0
    }
  },

  // Expense Qualification Rates by Type and Industry
  qualificationRates: {
    byIndustry: {
      "Software/Tech": {
        wages: { rate: 0.90, description: "90% for technical staff" },
        contractors: { rate: 0.65, description: "IRS 65% limit" },
        software: { rate: 1.00, description: "100% for dev tools" },
        cloud: { rate: 0.85, description: "85% for infrastructure" },
        aiTools: { rate: 1.00, description: "100% for AI/ML" },
        supplies: { rate: 0.80, description: "80% for materials" },
        equipment: { rate: 0.60, description: "60% for hardware" },
        training: { rate: 1.00, description: "100% for R&D training" }
      },
      "Professional Services": {
        wages: { rate: 0.75, description: "75% for mixed roles" },
        contractors: { rate: 0.65, description: "IRS limit" },
        software: { rate: 0.80, description: "80% partial use" },
        cloud: { rate: 0.70, description: "70% for tools" },
        aiTools: { rate: 1.00, description: "100% for automation" },
        supplies: { rate: 0.60, description: "60% average" },
        training: { rate: 1.00, description: "100% for skill development" }
      },
      "Manufacturing": {
        wages: { rate: 0.70, description: "70% for engineering" },
        contractors: { rate: 0.65, description: "IRS limit" },
        software: { rate: 0.90, description: "90% for CAD/CAM" },
        materials: { rate: 0.85, description: "85% for prototypes" },
        equipment: { rate: 0.50, description: "50% for testing" },
        aiTools: { rate: 0.90, description: "90% for optimization" },
        training: { rate: 1.00, description: "100% for technical training" }
      },
      "Healthcare": {
        wages: { rate: 0.75, description: "75% for research staff" },
        contractors: { rate: 0.65, description: "IRS limit" },
        software: { rate: 0.85, description: "85% for analysis tools" },
        equipment: { rate: 0.70, description: "70% for lab equipment" },
        aiTools: { rate: 0.95, description: "95% for medical AI" },
        supplies: { rate: 0.80, description: "80% for research materials" },
        training: { rate: 1.00, description: "100% for research training" }
      },
      "Retail/Ecommerce": {
        wages: { rate: 0.70, description: "70% for tech development" },
        contractors: { rate: 0.65, description: "IRS limit" },
        software: { rate: 0.85, description: "85% for platform tools" },
        aiTools: { rate: 1.00, description: "100% for personalization" },
        cloud: { rate: 0.80, description: "80% for infrastructure" },
        training: { rate: 1.00, description: "100% for tech training" }
      },
      "default": {
        wages: { rate: 0.80, description: "80% standard" },
        contractors: { rate: 0.65, description: "IRS limit" },
        software: { rate: 0.90, description: "90% for R&D tools" },
        cloud: { rate: 0.80, description: "80% average" },
        supplies: { rate: 0.70, description: "70% typical" },
        aiTools: { rate: 1.00, description: "100% for innovation" },
        training: { rate: 1.00, description: "100% for R&D training" }
      }
    }
  },

  // State Credit Information
  stateCredits: {
    "California": { 
      rate: 0.24, 
      name: "California R&D Credit",
      carryforward: 15,
      refundable: false,
      maxCredit: null,
      notes: "24% credit, among the highest"
    },
    "New York": { 
      rate: 0.09, 
      name: "NY R&D Tax Credit",
      carryforward: 15,
      refundable: true,
      maxCredit: null,
      notes: "9% credit, refundable for small businesses"
    },
    "Texas": {
      rate: 0.05,
      name: "Texas R&D Credit",
      carryforward: 20,
      refundable: false,
      maxCredit: null,
      notes: "5% credit, long carryforward period"
    }
  },

  // Pricing Tiers
  pricingTiers: [
    { min: 0, max: 10000, price: 500, name: "Starter" },
    { min: 10000, max: 50000, price: 750, name: "Growth" },
    { min: 50000, max: 100000, price: 1000, name: "Scale" },
    { min: 100000, max: Infinity, price: 1500, name: "Enterprise" }
  ],

  // Business Classifications
  businessClassifications: {
    qualifiedSmallBusiness: {
      revenueLimit: 5000000, // $5M
      yearsLimit: 5,
      payrollOffsetLimit: 500000, // Increased for 2025
      simplifiedDocs: true
    },
    startup: {
      yearsLimit: 5,
      noRevenueYearsAgo: 3,
      maxPayrollOffset: 500000
    }
  },

  // Tax Rate Information for Deduction Calculations
  taxRates: {
    "C-Corp": 0.21,
    "S-Corp": 0.29, // Approximate pass-through rate
    "LLC": 0.29,
    "Sole Prop": 0.25, // Conservative estimate
    "Partnership": 0.25
  },

  // Documentation Requirements
  documentationRequirements: {
    minimal: {
      threshold: 50000,
      required: ["Form 6765", "Basic narrative", "Expense summary"],
      description: "Simplified documentation for credits under $50K"
    },
    standard: {
      threshold: 250000,
      required: ["Form 6765", "Technical narrative", "Time tracking", "Project documentation"],
      description: "Standard documentation for most claims"
    },
    comprehensive: {
      threshold: Infinity,
      required: ["Form 6765", "Detailed narrative", "Time studies", "Project documentation", "Nexus study"],
      description: "Comprehensive documentation for large claims"
    }
  },

  // Risk Thresholds for Confidence Scoring
  riskThresholds: {
    rdPercentage: {
      low: { max: 0.60, risk: "low" },
      medium: { max: 0.85, risk: "medium" },
      high: { max: 1.00, risk: "high" }
    },
    creditAmount: {
      low: { max: 50000, risk: "low" },
      medium: { max: 250000, risk: "medium" },
      high: { max: Infinity, risk: "high" }
    }
  },

  // Qualifying Activities (for both calculator and dashboard)
  qualifyingActivities: {
    software: [
      "Developing new algorithms or software architectures",
      "Creating custom integrations or APIs",
      "Building automated workflows or processes",
      "Implementing and customizing AI/ML solutions",
      "Optimizing performance or scalability"
    ],
    general: [
      "Developing new or improved products/processes",
      "Experimenting with new technologies",
      "Creating prototypes or proof of concepts",
      "Testing and iterating on solutions",
      "Resolving technical uncertainties"
    ]
  },

  // IRS Four-Part Test
  fourPartTest: {
    permitted: {
      name: "Permitted Purpose",
      description: "Developing new or improved functionality, performance, reliability, or quality"
    },
    technological: {
      name: "Technological in Nature",
      description: "Relying on principles of physical or biological sciences, computer science, or engineering"
    },
    uncertainty: {
      name: "Elimination of Uncertainty",
      description: "Uncertainty about capability, method, or design"
    },
    experimentation: {
      name: "Process of Experimentation",
      description: "Evaluating alternatives through modeling, simulation, or systematic trial and error"
    }
  },

  // Deadline Information
  deadlines: {
    amendmentDeadline: {
      2022: "2026-07-15",
      2023: "2027-07-15",
      2024: "2028-07-15"
    },
    quarterlyPayroll: {
      Q1: "04-30",
      Q2: "07-31",
      Q3: "10-31",
      Q4: "01-31"
    }
  }
};

// Helper Functions
export interface BusinessProfile {
  yearsInBusiness: number;
  annualRevenue: number | string;
  hadRevenueThreeYearsAgo: boolean;
  businessStructure: string;
  primaryIndustry: string;
}

export interface FederalRateInfo {
  rate: number;
  name: string;
  description: string;
  requirements: string[];
  benefits: string[];
  canOffsetPayroll: boolean;
  payrollOffsetLimit: number;
  qualifies: boolean;
}

export function calculateFederalRate(business: BusinessProfile): FederalRateInfo {
  const rules = RDTaxRules.businessClassifications;
  
  // Convert revenue string to number for comparison
  let revenueNumber = 0;
  if (typeof business.annualRevenue === 'string') {
    const revenueMap: { [key: string]: number } = {
      "Under $1M": 500000,
      "$1M-$5M": 3000000,
      "$5M-$25M": 15000000,
      "Over $25M": 50000000
    };
    revenueNumber = revenueMap[business.annualRevenue] || 0;
  } else {
    revenueNumber = business.annualRevenue;
  }
  
  // Check startup status
  if (business.yearsInBusiness < rules.startup.yearsLimit && 
      !business.hadRevenueThreeYearsAgo) {
    return {
      ...RDTaxRules.federalRates.startup,
      qualifies: true
    };
  }
  
  // Check QSB status
  if (revenueNumber < rules.qualifiedSmallBusiness.revenueLimit &&
      business.yearsInBusiness < rules.qualifiedSmallBusiness.yearsLimit) {
    return {
      ...RDTaxRules.federalRates.qualifiedSmallBusiness,
      qualifies: true
    };
  }
  
  // Default to standard
  return {
    ...RDTaxRules.federalRates.standard,
    qualifies: true
  };
}

export function getQualificationRate(industry: string, expenseType: string): number {
  const industryRates = (RDTaxRules.qualificationRates.byIndustry as any)[industry] || 
                       RDTaxRules.qualificationRates.byIndustry.default;
  
  // Map expense types to rule keys
  const expenseTypeMap: { [key: string]: string } = {
    'employeeTime': 'wages',
    'aiTools': 'aiTools',
    'contractors': 'contractors',
    'software': 'software',
    'training': 'training',
    'cloud': 'cloud',
    'supplies': 'supplies',
    'equipment': 'equipment',
    'materials': 'materials'
  };
  
  const ruleKey = expenseTypeMap[expenseType] || expenseType;
  return industryRates[ruleKey]?.rate || 0.80;
}

export function getQualificationRateInfo(industry: string, expenseType: string) {
  const industryRates = (RDTaxRules.qualificationRates.byIndustry as any)[industry] || 
                       RDTaxRules.qualificationRates.byIndustry.default;
  
  const expenseTypeMap: { [key: string]: string } = {
    'employeeTime': 'wages',
    'aiTools': 'aiTools',
    'contractors': 'contractors',
    'software': 'software',
    'training': 'training'
  };
  
  const ruleKey = expenseTypeMap[expenseType] || expenseType;
  return industryRates[ruleKey] || { rate: 0.80, description: "Standard rate" };
}

export function getPricingTier(creditAmount: number) {
  return RDTaxRules.pricingTiers.find(
    tier => creditAmount >= tier.min && creditAmount < tier.max
  ) || RDTaxRules.pricingTiers[RDTaxRules.pricingTiers.length - 1];
}

export function getDocumentationLevel(creditAmount: number) {
  for (const [level, req] of Object.entries(RDTaxRules.documentationRequirements)) {
    if (creditAmount < req.threshold) {
      return { level, ...req };
    }
  }
  return { level: 'comprehensive', ...RDTaxRules.documentationRequirements.comprehensive };
}

export function calculateDeductionValue(totalQRE: number, businessStructure: string): number {
  const taxRate = RDTaxRules.taxRates[businessStructure as keyof typeof RDTaxRules.taxRates] || 0.25;
  return Math.round(totalQRE * taxRate);
}

export function calculateConfidenceScore(
  totalQRE: number, 
  activities: string[], 
  expenses: any,
  industry: string
): number {
  let score = 60; // Base score
  
  // Activity diversity bonus
  if (activities.length >= 4) score += 15;
  else if (activities.length >= 2) score += 10;
  
  // Reasonable expense allocation
  const totalExpenses = Object.values(expenses).reduce((sum: number, exp: any) => {
    return sum + (parseFloat(String(exp).replace(/,/g, '')) || 0);
  }, 0);
  
  if (totalExpenses > 0) {
    const qreRatio = totalQRE / totalExpenses;
    if (qreRatio > 0.5 && qreRatio < 0.9) score += 10;
  }
  
  // Documentation strength
  if (parseFloat(String(expenses.employeeTime).replace(/,/g, '')) > 0) score += 5;
  if (parseFloat(String(expenses.contractors).replace(/,/g, '')) > 0) score += 5;
  
  // Industry bonus for tech companies
  if (industry === "Software/Tech") score += 5;
  
  return Math.min(100, score);
}

// Type exports for TypeScript
export type PricingTier = typeof RDTaxRules.pricingTiers[0];
export type DocumentationRequirement = typeof RDTaxRules.documentationRequirements.minimal & { level: string };