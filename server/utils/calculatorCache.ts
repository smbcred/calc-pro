import { CacheManager } from './cacheManager';
import { CacheKeys, CacheTTL } from '../config/redis';

interface CalculatorInput {
  wages: number;
  wageRdPercent: number;
  contractors: number;
  contractorRdPercent: number;
  supplies: number;
  suppliesRdPercent: number;
}

export class CalculatorCache {
  /**
   * Cache calculator results to avoid recalculation
   */
  static async getCachedResult(input: CalculatorInput) {
    const hash = CacheManager.generateHash(input);
    const key = CacheKeys.CALCULATOR_RESULT(hash);
    
    return CacheManager.get(key);
  }

  /**
   * Store calculator result
   */
  static async cacheResult(input: CalculatorInput, result: any) {
    const hash = CacheManager.generateHash(input);
    const key = CacheKeys.CALCULATOR_RESULT(hash);
    
    // Cache for 24 hours - calculations don't change
    await CacheManager.set(key, result, CacheTTL.DAY);
  }

  /**
   * Warm cache with common calculations
   */
  static async warmCache() {
    const commonScenarios = [
      { wages: 500000, wageRdPercent: 80, contractors: 0, contractorRdPercent: 0, supplies: 50000, suppliesRdPercent: 100 },
      { wages: 1000000, wageRdPercent: 60, contractors: 200000, contractorRdPercent: 100, supplies: 100000, suppliesRdPercent: 100 },
      { wages: 250000, wageRdPercent: 100, contractors: 0, contractorRdPercent: 0, supplies: 25000, suppliesRdPercent: 100 },
    ];

    for (const scenario of commonScenarios) {
      // Calculate and cache each scenario
      const result = await this.calculate(scenario);
      await this.cacheResult(scenario, result);
    }
  }

  private static calculate(input: CalculatorInput) {
    const qualifiedWages = input.wages * (input.wageRdPercent / 100);
    const qualifiedContractors = input.contractors * (input.contractorRdPercent / 100) * 0.65;
    const qualifiedSupplies = input.supplies * (input.suppliesRdPercent / 100);
    
    const totalQRE = qualifiedWages + qualifiedContractors + qualifiedSupplies;
    const federalCredit = totalQRE * 0.06; // Startup rate
    
    let tier, price;
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
    
    return { totalQRE, federalCredit, tier, price };
  }
}