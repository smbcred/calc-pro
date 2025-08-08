import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Create basic validation schemas for testing
const emailSchema = z.object({
  email: z.string().email('Invalid email format'),
});

const companyInfoSchema = z.object({
  email: z.string().email('Invalid email format'),
  formData: z.object({
    companyName: z.string().min(1, 'Company name is required'),
    ein: z.string().regex(/^\d{2}-\d{7}$/, 'EIN must be in format XX-XXXXXXX'),
    entityType: z.enum(['c-corp', 's-corp', 'llc', 'partnership', 'sole-proprietorship']),
    yearFounded: z.string().regex(/^\d{4}$/, 'Year must be 4 digits'),
    annualRevenue: z.string().min(1, 'Annual revenue is required'),
    employeeCount: z.string().min(1, 'Employee count is required'),
    rdEmployeeCount: z.string().min(1, 'R&D employee count is required'),
    primaryState: z.string().length(2, 'State must be 2 characters'),
  })
});

const expenseSchema = z.object({
  wages: z.array(z.object({
    employeeName: z.string().min(1, 'Employee name is required'),
    role: z.string().min(1, 'Role is required'),
    annualSalary: z.number().min(0, 'Salary must be positive'),
    rdPercentage: z.number().min(0).max(100, 'Percentage must be between 0 and 100'),
    rdAmount: z.number().min(0, 'R&D amount must be positive'),
  })),
  contractors: z.array(z.object({
    contractorName: z.string().min(1, 'Contractor name is required'),
    totalCost: z.number().min(0, 'Cost must be positive'),
    rdPercentage: z.number().min(0).max(100, 'Percentage must be between 0 and 100'),
    rdAmount: z.number().min(0, 'R&D amount must be positive'),
  })),
  supplies: z.array(z.object({
    description: z.string().min(1, 'Description is required'),
    totalCost: z.number().min(0, 'Cost must be positive'),
    rdPercentage: z.number().min(0).max(100, 'Percentage must be between 0 and 100'),
    rdAmount: z.number().min(0, 'R&D amount must be positive'),
  })),
});

describe('Validation Schemas', () => {
  describe('emailSchema', () => {
    it('should validate correct email', () => {
      const result = emailSchema.safeParse({ email: 'test@example.com' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe('test@example.com');
      }
    });

    it('should reject invalid email', () => {
      const result = emailSchema.safeParse({ email: 'not-an-email' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Invalid email format');
      }
    });

    it('should reject empty email', () => {
      const result = emailSchema.safeParse({ email: '' });
      expect(result.success).toBe(false);
    });

    it('should reject missing email field', () => {
      const result = emailSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe('companyInfoSchema', () => {
    const validCompanyData = {
      email: 'test@example.com',
      formData: {
        companyName: 'Test Company Inc.',
        ein: '12-3456789',
        entityType: 'c-corp' as const,
        yearFounded: '2020',
        annualRevenue: '1000000',
        employeeCount: '50',
        rdEmployeeCount: '10',
        primaryState: 'CA',
      }
    };

    it('should validate complete company info', () => {
      const result = companyInfoSchema.safeParse(validCompanyData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.formData.companyName).toBe('Test Company Inc.');
        expect(result.data.formData.ein).toBe('12-3456789');
        expect(result.data.formData.entityType).toBe('c-corp');
      }
    });

    it('should reject invalid EIN format', () => {
      const invalidData = {
        ...validCompanyData,
        formData: {
          ...validCompanyData.formData,
          ein: '123456789', // Missing hyphen
        }
      };

      const result = companyInfoSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const einError = result.error.issues.find(issue => 
          issue.path.includes('ein')
        );
        expect(einError?.message).toBe('EIN must be in format XX-XXXXXXX');
      }
    });

    it('should reject invalid entity type', () => {
      const invalidData = {
        ...validCompanyData,
        formData: {
          ...validCompanyData.formData,
          entityType: 'invalid-type' as any,
        }
      };

      const result = companyInfoSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid year format', () => {
      const invalidData = {
        ...validCompanyData,
        formData: {
          ...validCompanyData.formData,
          yearFounded: '20', // Too short
        }
      };

      const result = companyInfoSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid state format', () => {
      const invalidData = {
        ...validCompanyData,
        formData: {
          ...validCompanyData.formData,
          primaryState: 'California', // Too long
        }
      };

      const result = companyInfoSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject missing required fields', () => {
      const incompleteData = {
        email: 'test@example.com',
        formData: {
          companyName: 'Test Company',
          // Missing other required fields
        }
      };

      const result = companyInfoSchema.safeParse(incompleteData);
      expect(result.success).toBe(false);
    });
  });

  describe('expenseSchema', () => {
    const validExpenseData = {
      wages: [{
        employeeName: 'John Doe',
        role: 'Software Engineer',
        annualSalary: 100000,
        rdPercentage: 80,
        rdAmount: 80000,
      }],
      contractors: [{
        contractorName: 'ABC Consulting',
        totalCost: 50000,
        rdPercentage: 100,
        rdAmount: 50000,
      }],
      supplies: [{
        description: 'Development Software',
        totalCost: 10000,
        rdPercentage: 100,
        rdAmount: 10000,
      }],
    };

    it('should validate complete expense data', () => {
      const result = expenseSchema.safeParse(validExpenseData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid wage percentage', () => {
      const invalidData = {
        ...validExpenseData,
        wages: [{
          ...validExpenseData.wages[0],
          rdPercentage: 150, // Over 100%
        }]
      };

      const result = expenseSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject negative amounts', () => {
      const invalidData = {
        ...validExpenseData,
        contractors: [{
          ...validExpenseData.contractors[0],
          totalCost: -1000, // Negative cost
        }]
      };

      const result = expenseSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject empty required fields', () => {
      const invalidData = {
        ...validExpenseData,
        supplies: [{
          ...validExpenseData.supplies[0],
          description: '', // Empty description
        }]
      };

      const result = expenseSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should validate empty arrays', () => {
      const emptyArrayData = {
        wages: [],
        contractors: [],
        supplies: [],
      };

      const result = expenseSchema.safeParse(emptyArrayData);
      expect(result.success).toBe(true);
    });
  });
});