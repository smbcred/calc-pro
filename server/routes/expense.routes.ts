import express from 'express';
import { 
  getCustomerByEmail, 
  getCompanyByCustomerId, 
  addToAirtableWages,
  addToAirtableExpenses
} from '../utils/airtable';
import { validate } from '../middleware/validate';
import { expenseLoadSchema, expenseSaveSchema } from '../validations';

const router = express.Router();

// Load existing expense data
router.post('/load', validate(expenseLoadSchema), async (req, res) => {
  try {
    const { email } = req.body;
    

    // Get customer and company
    const customer = await getCustomerByEmail(email);
    if (!customer) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const company = await getCompanyByCustomerId(customer.id);
    if (!company) {
      return res.json({ wages: [], contractors: [], supplies: [], cloudSoftware: [] });
    }

    const airtableToken = process.env.AIRTABLE_API_KEY;
    const baseId = process.env.AIRTABLE_BASE_ID;

    if (!airtableToken || !baseId) {
      return res.status(500).json({ error: 'Airtable not configured' });
    }

    // Fetch wages
    const wagesResponse = await fetch(`https://api.airtable.com/v0/${baseId}/Wages?filterByFormula={company_id}='${company.id}'`, {
      headers: {
        'Authorization': `Bearer ${airtableToken}`,
        'Content-Type': 'application/json',
      },
    });

    // Fetch expenses
    const expensesResponse = await fetch(`https://api.airtable.com/v0/${baseId}/Expenses?filterByFormula={company_id}='${company.id}'`, {
      headers: {
        'Authorization': `Bearer ${airtableToken}`,
        'Content-Type': 'application/json',
      },
    });

    let wages = [];
    let expenses = [];

    if (wagesResponse.ok) {
      const wagesData = await wagesResponse.json();
      wages = wagesData.records.map((record: any) => ({
        id: record.id,
        employeeName: record.fields.employee_name,
        role: record.fields.role || '',
        annualSalary: record.fields.salary,
        rdPercentage: record.fields.rd_percentage,
        rdAmount: record.fields.qualified_amount,
      }));
    }

    if (expensesResponse.ok) {
      const expensesData = await expensesResponse.json();
      expenses = expensesData.records;
    }

    // Categorize expenses
    const contractors = expenses.filter((e: any) => e.fields.expense_type === 'contractor').map((record: any) => ({
      id: record.id,
      contractorName: record.fields.contractor_name || 'Unnamed Contractor',
      amount: record.fields.amount,
      description: record.fields.description || '',
      qualifiedAmount: record.fields.qualified_amount,
    }));

    const supplies = expenses.filter((e: any) => e.fields.expense_type === 'supply').map((record: any) => ({
      id: record.id,
      supplyType: record.fields.supply_type || 'Unnamed Supply',
      amount: record.fields.amount,
      rdPercentage: record.fields.rd_percentage,
      rdAmount: record.fields.qualified_amount,
    }));

    const cloudSoftware = expenses.filter((e: any) => e.fields.expense_type === 'cloud').map((record: any) => ({
      id: record.id,
      serviceName: record.fields.service_name || 'Unnamed Service',
      monthlyCost: record.fields.monthly_cost || 0,
      rdPercentage: record.fields.rd_percentage,
      annualRdAmount: record.fields.qualified_amount,
    }));

    res.json({ wages, contractors, supplies, cloudSoftware });
  } catch (error) {
    console.error('Expense load error:', error);
    res.status(500).json({ error: 'Failed to load expense data' });
  }
});

// Save expense data (auto-save)
router.post('/save', validate(expenseSaveSchema), async (req, res) => {
  try {
    const { email, expenses } = req.body;
    


    // Get customer and company
    const customer = await getCustomerByEmail(email);
    if (!customer) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const company = await getCompanyByCustomerId(customer.id);
    if (!company) {
      return res.status(400).json({ error: 'Company not found' });
    }

    // For now, just return success for auto-save
    // In a full implementation, you'd save to a temporary/draft table
    res.json({ success: true });
  } catch (error) {
    console.error('Expense save error:', error);
    res.status(500).json({ error: 'Failed to save expense data' });
  }
});

// Submit final expense data
router.post('/submit', validate(expenseSaveSchema), async (req, res) => {
  try {
    const { email, expenses } = req.body;
    


    // Get customer and company
    const customer = await getCustomerByEmail(email);
    if (!customer) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const company = await getCompanyByCustomerId(customer.id);
    if (!company) {
      return res.status(400).json({ error: 'Company not found' });
    }

    // Submit wages
    if (expenses.wages?.length > 0) {
      for (const wage of expenses.wages) {
        await addToAirtableWages({
          companyId: company.id,
          employeeName: wage.employeeName,
          salary: wage.annualSalary,
          rdPercentage: wage.rdPercentage,
          qualifiedAmount: wage.rdAmount,
        });
      }
    }

    // Submit contractors
    if (expenses.contractors?.length > 0) {
      for (const contractor of expenses.contractors) {
        await addToAirtableExpenses({
          companyId: company.id,
          expenseType: 'contractor',
          amount: contractor.amount,
          rdPercentage: 65, // Contractors are always 65%
          qualifiedAmount: contractor.qualifiedAmount,
        });
      }
    }

    // Submit supplies
    if (expenses.supplies?.length > 0) {
      for (const supply of expenses.supplies) {
        await addToAirtableExpenses({
          companyId: company.id,
          expenseType: 'supply',
          amount: supply.amount,
          rdPercentage: supply.rdPercentage,
          qualifiedAmount: supply.rdAmount,
        });
      }
    }

    // Submit cloud software
    if (expenses.cloudSoftware?.length > 0) {
      for (const cloud of expenses.cloudSoftware) {
        await addToAirtableExpenses({
          companyId: company.id,
          expenseType: 'cloud',
          amount: cloud.monthlyCost * 12, // Convert to annual
          rdPercentage: cloud.rdPercentage,
          qualifiedAmount: cloud.annualRdAmount,
        });
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Expense submission error:', error);
    res.status(500).json({ error: 'Failed to submit expense information' });
  }
});

export default router;