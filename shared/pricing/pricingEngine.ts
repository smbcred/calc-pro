// shared/pricing/pricingEngine.ts

export interface PricingTier {
  min: number;
  max: number;
  basePrice: number;
  name: string;
  description: string;
}

export interface YearPricing {
  year: number;
  isBase: boolean;
  price: number;
  deadline?: string;
  urgency?: string;
}

export interface PricingResult {
  selectedYears: YearPricing[];
  basePrice: number;
  additionalYearsPrice: number;
  totalPrice: number;
  savingsAmount: number;
  tier: PricingTier;
  breakdown: {
    description: string;
    amount: number;
  }[];
}

export class PricingEngine {
  // Configuration
  private static readonly TIERS: PricingTier[] = [
    {
      min: 0,
      max: 10000,
      basePrice: 500,
      name: 'Starter',
      description: 'For credits under $10,000'
    },
    {
      min: 10000,
      max: 50000,
      basePrice: 750,
      name: 'Growth',
      description: 'For credits $10K-$50K'
    },
    {
      min: 50000,
      max: 100000,
      basePrice: 1000,
      name: 'Scale',
      description: 'For credits $50K-$100K'
    },
    {
      min: 100000,
      max: Infinity,
      basePrice: 1500,
      name: 'Enterprise',
      description: 'For credits over $100K'
    }
  ];

  private static readonly ADDITIONAL_YEAR_PRICE = 297;
  private static readonly MAX_ADDITIONAL_YEARS = 3;
  private static readonly CURRENT_YEAR = new Date().getFullYear();
  private static readonly ELIGIBLE_YEARS = [2025, 2024, 2023, 2022];

  // Deadline configuration
  private static readonly DEADLINES = {
    2022: '2026-07-15',
    2023: '2027-07-15',
    2024: '2028-07-15',
    2025: '2029-04-15' // Regular deadline
  };

  /**
   * Calculate pricing based on credit amount and selected years
   */
  static calculatePricing(
    creditAmount: number,
    selectedYears: number[],
    options?: {
      stateCredits?: number;
      includeUrgency?: boolean;
    }
  ): PricingResult {
    // Validate inputs
    const validYears = this.validateYears(selectedYears);
    if (validYears.length === 0) {
      throw new Error('No valid years selected');
    }

    // Get tier based on credit amount
    const tier = this.getTier(creditAmount);

    // Sort years (newest first)
    const sortedYears = [...validYears].sort((a, b) => b - a);
    
    // First year gets base price, others get additional year price
    const baseYear = sortedYears[0];
    const additionalYears = sortedYears.slice(1);

    // Validate additional years limit
    if (additionalYears.length > this.MAX_ADDITIONAL_YEARS) {
      throw new Error(`Maximum ${this.MAX_ADDITIONAL_YEARS} additional years allowed`);
    }

    // Build year pricing details
    const yearPricing: YearPricing[] = [
      {
        year: baseYear,
        isBase: true,
        price: tier.basePrice,
        deadline: this.DEADLINES[baseYear as keyof typeof this.DEADLINES],
        urgency: this.getUrgencyMessage(baseYear)
      },
      ...additionalYears.map(year => ({
        year,
        isBase: false,
        price: this.ADDITIONAL_YEAR_PRICE,
        deadline: this.DEADLINES[year as keyof typeof this.DEADLINES],
        urgency: this.getUrgencyMessage(year)
      }))
    ];

    // Calculate totals
    const basePrice = tier.basePrice;
    const additionalYearsPrice = additionalYears.length * this.ADDITIONAL_YEAR_PRICE;
    const totalPrice = basePrice + additionalYearsPrice;

    // Calculate savings (credit - price)
    const totalCredits = creditAmount + (options?.stateCredits || 0);
    const savingsAmount = Math.max(0, totalCredits - totalPrice);

    // Build breakdown
    const breakdown = [
      {
        description: `${baseYear} Tax Year (${tier.name} Package)`,
        amount: basePrice
      },
      ...additionalYears.map(year => ({
        description: `${year} Tax Year (Additional)`,
        amount: this.ADDITIONAL_YEAR_PRICE
      }))
    ];

    return {
      selectedYears: yearPricing,
      basePrice,
      additionalYearsPrice,
      totalPrice,
      savingsAmount,
      tier,
      breakdown
    };
  }

  /**
   * Get pricing tier based on credit amount
   */
  static getTier(creditAmount: number): PricingTier {
    const tier = this.TIERS.find(
      t => creditAmount >= t.min && creditAmount < t.max
    );
    
    if (!tier) {
      // Return highest tier if credit exceeds all tiers
      return this.TIERS[this.TIERS.length - 1];
    }
    
    return tier;
  }

  /**
   * Validate selected years
   */
  private static validateYears(years: number[]): number[] {
    return years.filter(year => this.ELIGIBLE_YEARS.includes(year));
  }

  /**
   * Get urgency message for a year
   */
  private static getUrgencyMessage(year: number): string | undefined {
    const deadline = this.DEADLINES[year as keyof typeof this.DEADLINES];
    if (!deadline) return undefined;

    const deadlineDate = new Date(deadline);
    const today = new Date();
    const monthsUntilDeadline = Math.floor(
      (deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30)
    );

    if (monthsUntilDeadline < 6) {
      return `⚠️ Deadline in ${monthsUntilDeadline} months!`;
    } else if (monthsUntilDeadline < 12) {
      return `Deadline: ${deadlineDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
    }

    return undefined;
  }

  /**
   * Get multi-year discount information
   */
  static getMultiYearSavings(years: number[]): {
    regularPrice: number;
    bundlePrice: number;
    savings: number;
    savingsPercent: number;
  } | null {
    if (years.length <= 1) return null;

    // If bought separately, each year would cost base tier price
    const tier = this.getTier(50000); // Average assumption
    const regularPrice = years.length * tier.basePrice;
    
    // Bundle price is base + additional years
    const bundlePrice = tier.basePrice + ((years.length - 1) * this.ADDITIONAL_YEAR_PRICE);
    
    const savings = regularPrice - bundlePrice;
    const savingsPercent = Math.round((savings / regularPrice) * 100);

    return {
      regularPrice,
      bundlePrice,
      savings,
      savingsPercent
    };
  }

  /**
   * Format price for display
   */
  static formatPrice(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  /**
   * Get eligible years for selection
   */
  static getEligibleYears(): {
    year: number;
    deadline: string;
    isExpiringSoon: boolean;
    monthsRemaining: number;
  }[] {
    return this.ELIGIBLE_YEARS.map(year => {
      const deadline = this.DEADLINES[year as keyof typeof this.DEADLINES];
      const deadlineDate = new Date(deadline);
      const today = new Date();
      const monthsRemaining = Math.floor(
        (deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30)
      );

      return {
        year,
        deadline,
        isExpiringSoon: monthsRemaining < 12,
        monthsRemaining
      };
    });
  }

  /**
   * Calculate ROI for display
   */
  static calculateROI(creditAmount: number, price: number): {
    ratio: number;
    percentage: number;
    netBenefit: number;
  } {
    const ratio = creditAmount / price;
    const percentage = ((creditAmount - price) / price) * 100;
    const netBenefit = creditAmount - price;

    return {
      ratio: Math.round(ratio * 10) / 10,
      percentage: Math.round(percentage),
      netBenefit
    };
  }
}

// Export convenience functions
export const calculatePricing = PricingEngine.calculatePricing.bind(PricingEngine);
export const getTier = PricingEngine.getTier.bind(PricingEngine);
export const formatPrice = PricingEngine.formatPrice.bind(PricingEngine);
export const getEligibleYears = PricingEngine.getEligibleYears.bind(PricingEngine);
export const calculateROI = PricingEngine.calculateROI.bind(PricingEngine);