import { z } from 'zod';

// Basic email validation schema
export const emailSchema = z.object({
  email: z.string().email('Invalid email address')
});

// Company info validation schema
export const companyInfoSchema = z.object({
  email: z.string().email('Invalid email address'),
  formData: z.object({
    companyName: z.string().min(1, 'Company name is required'),
    ein: z.string().regex(/^\d{2}-\d{7}$/, 'EIN must be in format XX-XXXXXXX'),
    entityType: z.enum(['c-corp', 's-corp', 'llc', 'partnership', 'other'], {
      errorMap: () => ({ message: 'Entity type must be one of: c-corp, s-corp, llc, partnership, other' })
    }),
    yearFounded: z.string().regex(/^\d{4}$/, 'Year must be 4 digits'),
    annualRevenue: z.string().min(1, 'Annual revenue is required'),
    employeeCount: z.string().min(1, 'Employee count is required'),
    rdEmployeeCount: z.string().optional(),
    primaryState: z.string().length(2, 'State must be 2 characters'),
    rdStates: z.array(z.string()).optional(),
    hasMultipleStates: z.boolean().optional()
  })
});

// Expense validation schemas
export const expenseLoadSchema = z.object({
  email: z.string().email('Invalid email address')
});

export const expenseSaveSchema = z.object({
  email: z.string().email('Invalid email address'),
  expenses: z.object({
    wages: z.array(z.object({
      employeeName: z.string().min(1, 'Employee name is required'),
      role: z.string().optional(),
      annualSalary: z.number().min(0, 'Salary must be positive'),
      rdPercentage: z.number().min(0).max(100, 'R&D percentage must be between 0-100'),
      rdAmount: z.number().min(0, 'R&D amount must be positive')
    })).optional(),
    contractors: z.array(z.object({
      contractorName: z.string().min(1, 'Contractor name is required'),
      amount: z.number().min(0, 'Amount must be positive'),
      description: z.string().optional(),
      qualifiedAmount: z.number().min(0, 'Qualified amount must be positive')
    })).optional(),
    supplies: z.array(z.object({
      supplyType: z.string().min(1, 'Supply type is required'),
      amount: z.number().min(0, 'Amount must be positive'),
      rdPercentage: z.number().min(0).max(100, 'R&D percentage must be between 0-100'),
      rdAmount: z.number().min(0, 'R&D amount must be positive')
    })).optional(),
    cloudSoftware: z.array(z.object({
      serviceName: z.string().min(1, 'Service name is required'),
      monthlyCost: z.number().min(0, 'Monthly cost must be positive'),
      rdPercentage: z.number().min(0).max(100, 'R&D percentage must be between 0-100'),
      annualRdAmount: z.number().min(0, 'Annual R&D amount must be positive')
    })).optional()
  })
});

// Intake form validation schema
export const intakeFormSchema = z.object({
  email: z.string().email('Invalid email address'),
  formData: z.object({
    entityName: z.string().min(1, 'Entity name is required'),
    entityType: z.enum(['c-corp', 's-corp', 'llc', 'partnership', 'other'], {
      errorMap: () => ({ message: 'Entity type must be one of: c-corp, s-corp, llc, partnership, other' })
    }),
    taxId: z.string().regex(/^\d{2}-\d{7}$/, 'Tax ID must be in format XX-XXXXXXX'),
    contactName: z.string().min(1, 'Contact name is required'),
    contactEmail: z.string().email('Invalid contact email address'),
    contactPhone: z.string().regex(/^\d{3}-\d{3}-\d{4}$/, 'Phone must be in format XXX-XXX-XXXX'),
    businessDescription: z.string().min(10, 'Business description must be at least 10 characters'),
    rdActivities: z.string().min(10, 'R&D activities description must be at least 10 characters'),
    totalWages: z.string().regex(/^\d+$/, 'Total wages must be a number'),
    contractorCosts: z.string().regex(/^\d+$/, 'Contractor costs must be a number'),
    supplyCosts: z.string().regex(/^\d+$/, 'Supply costs must be a number'),
    otherExpenses: z.string().regex(/^\d+$/, 'Other expenses must be a number')
  })
});

// Email validation schemas
export const emailTestSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().optional()
});

export const emailSendSchema = z.object({
  to: z.string().email('Invalid recipient email address'),
  subject: z.string().min(1, 'Subject is required'),
  html: z.string().optional(),
  text: z.string().optional()
}).refine((data) => data.html || data.text, {
  message: 'Either HTML or text content is required'
});

// Webhook validation schemas
export const checkoutSchema = z.object({
  email: z.string().email('Invalid email address'),
  tierBasePrice: z.number().min(0, 'Tier base price must be positive'),
  yearsSelected: z.array(z.number().int().min(2020).max(2030)).min(1, 'At least one year must be selected')
});

// Review/document validation schemas
export const documentTrackingSchema = z.object({
  email: z.string().email('Invalid email address'),
  documentId: z.string().min(1, 'Document ID is required'),
  fileName: z.string().optional(),
  fileType: z.string().optional()
});

export const documentStatusSchema = z.object({
  email: z.string().email('Invalid email address'),
  trackingId: z.string().min(1, 'Tracking ID is required')
});

// Development endpoint validation
export const createTestCustomerSchema = z.object({
  email: z.string().email('Invalid email address')
});