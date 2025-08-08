import { v4 as uuidv4 } from 'uuid';
import { CacheManager, Cacheable } from './cacheManager';
import { CacheKeys, CacheTTL } from '../config/redis';
import Logger from './logger';

// Helper function to get Airtable credentials
function getAirtableCredentials() {
  const airtableToken = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;

  if (!airtableToken || !baseId) {
    throw new Error('Airtable credentials not configured');
  }

  return { airtableToken, baseId };
}

export class AirtableService {
  private static airtableToken = process.env.AIRTABLE_API_KEY;
  private static baseId = process.env.AIRTABLE_BASE_ID;

  static async getCustomerByEmail(email: string) {
    const cacheKey = CacheKeys.CUSTOMER_BY_EMAIL(email);
    
    return CacheManager.getOrFetch(cacheKey, async () => {
      if (!this.airtableToken || !this.baseId) {
        throw new Error('Airtable credentials not configured');
      }

      const response = await fetch(
        `https://api.airtable.com/v0/${this.baseId}/Customers?filterByFormula=LOWER({email})=LOWER('${email}')`,
        {
          headers: {
            'Authorization': `Bearer ${this.airtableToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch customer');
      }

      const data = await response.json();
      const customer = data.records.length > 0 ? data.records[0] : null;
      
      // Also cache by ID if found
      if (customer) {
        await CacheManager.set(
          CacheKeys.CUSTOMER_BY_ID(customer.id),
          customer,
          CacheTTL.HOUR
        );
      }
      
      return customer;
    }, CacheTTL.HOUR);
  }

  static async getCompanyByCustomerId(customerId: string) {
    const cacheKey = CacheKeys.COMPANY_BY_CUSTOMER(customerId);
    
    return CacheManager.getOrFetch(cacheKey, async () => {
      if (!this.airtableToken || !this.baseId) {
        throw new Error('Airtable credentials not configured');
      }

      const response = await fetch(
        `https://api.airtable.com/v0/${this.baseId}/Companies?filterByFormula={customer_id}='${customerId}'`,
        {
          headers: {
            'Authorization': `Bearer ${this.airtableToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch company');
      }

      const data = await response.json();
      return data.records.length > 0 ? data.records[0] : null;
    }, CacheTTL.LONG);
  }

  // Batch fetch with caching
  static async getExpensesByCompany(companyId: string) {
    const wagesKey = CacheKeys.WAGES_BY_COMPANY(companyId);
    const expensesKey = CacheKeys.EXPENSES_BY_COMPANY(companyId);
    
    // Try to get both from cache
    const [cachedWages, cachedExpenses] = await Promise.all([
      CacheManager.get(wagesKey),
      CacheManager.get(expensesKey)
    ]);
    
    if (cachedWages && cachedExpenses) {
      return { wages: cachedWages, expenses: cachedExpenses };
    }
    
    // Fetch missing data
    const [wages, expenses] = await Promise.all([
      cachedWages || this.fetchWages(companyId),
      cachedExpenses || this.fetchExpenses(companyId)
    ]);
    
    // Cache results
    await Promise.all([
      !cachedWages && CacheManager.set(wagesKey, wages, CacheTTL.MEDIUM),
      !cachedExpenses && CacheManager.set(expensesKey, expenses, CacheTTL.MEDIUM)
    ]);
    
    return { wages, expenses };
  }

  private static async fetchWages(companyId: string) {
    if (!this.airtableToken || !this.baseId) {
      throw new Error('Airtable credentials not configured');
    }

    const response = await fetch(
      `https://api.airtable.com/v0/${this.baseId}/Wages?filterByFormula={company_id}='${companyId}'`,
      {
        headers: {
          'Authorization': `Bearer ${this.airtableToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch wages');
    }

    const data = await response.json();
    return data.records || [];
  }

  private static async fetchExpenses(companyId: string) {
    if (!this.airtableToken || !this.baseId) {
      throw new Error('Airtable credentials not configured');
    }

    const response = await fetch(
      `https://api.airtable.com/v0/${this.baseId}/Expenses?filterByFormula={company_id}='${companyId}'`,
      {
        headers: {
          'Authorization': `Bearer ${this.airtableToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch expenses');
    }

    const data = await response.json();
    return data.records || [];
  }

  static async updateCompany(companyId: string, data: any) {
    // Perform update
    const response = await this.performUpdate(companyId, data);
    
    // Invalidate cache
    await CacheManager.invalidateRelated('company', companyId);
    
    return response;
  }

  private static async performUpdate(companyId: string, data: any) {
    const { airtableToken, baseId } = getAirtableCredentials();

    const response = await fetch(`https://api.airtable.com/v0/${baseId}/Companies/${companyId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${airtableToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: data
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to update company: ${error}`);
    }

    return response.json();
  }
}

// Legacy function wrappers for backward compatibility
export async function getCustomerByEmail(email: string) {
  return AirtableService.getCustomerByEmail(email);
}

export async function addToAirtableCustomers(data: {
  email: string;
  name?: string;
  accessToken: string;
  planType: string;
  stripeCustomerId?: string;
}) {
  const { airtableToken, baseId } = getAirtableCredentials();

  const response = await fetch(`https://api.airtable.com/v0/${baseId}/Customers`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${airtableToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fields: {
        "email": data.email,
        "name": data.name || '',
        "access_token": data.accessToken,
        "plan_type": data.planType,
        "stripe_customer_id": data.stripeCustomerId || '',
        "created_at": new Date().toISOString(),
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Airtable error:', error);
    throw new Error(`Failed to add to Airtable: ${error}`);
  }

  const result = await response.json();
  return result.id; // Return customer record ID
}

export async function getCompanyByCustomerId(customerId: string) {
  return AirtableService.getCompanyByCustomerId(customerId);
}

export async function addToAirtableCompanies(data: {
  customerId: string;
  companyName: string;
  ein: string;
  entityType: string;
  revenue: string;
  employeeCount: string;
}) {
  const { airtableToken, baseId } = getAirtableCredentials();

  const response = await fetch(`https://api.airtable.com/v0/${baseId}/Companies`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${airtableToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fields: {
        "customer_id": [data.customerId],
        "company_name": data.companyName,
        "ein": data.ein,
        "entity_type": data.entityType,
        "revenue": data.revenue,
        "employee_count": data.employeeCount,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to add company: ${error}`);
  }

  const result = await response.json();
  return result.id;
}

// Wage operations
export async function addToAirtableWages(data: {
  companyId: string;
  employeeName: string;
  salary: number;
  rdPercentage: number;
  qualifiedAmount: number;
}) {
  const { airtableToken, baseId } = getAirtableCredentials();

  const response = await fetch(`https://api.airtable.com/v0/${baseId}/Wages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${airtableToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fields: {
        "company_id": [data.companyId],
        "employee_name": data.employeeName,
        "salary": data.salary,
        "rd_percentage": data.rdPercentage,
        "qualified_amount": data.qualifiedAmount,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to add wage: ${error}`);
  }

  return response.json();
}

// Expense operations
export async function addToAirtableExpenses(data: {
  companyId: string;
  expenseType: string;
  amount: number;
  rdPercentage: number;
  qualifiedAmount: number;
}) {
  const { airtableToken, baseId } = getAirtableCredentials();

  const response = await fetch(`https://api.airtable.com/v0/${baseId}/Expenses`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${airtableToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fields: {
        "company_id": [data.companyId],
        "expense_type": data.expenseType,
        "amount": data.amount,
        "rd_percentage": data.rdPercentage,
        "qualified_amount": data.qualifiedAmount,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to add expense: ${error}`);
  }

  return response.json();
}

// Submissions operations
export async function addToAirtableSubmissions(data: {
  customerEmail: string;
  entityName: string;
  entityType: string;
  taxId: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  businessDescription: string;
  rdActivities: string;
  totalWages: number;
  contractorCosts: number;
  supplyCosts: number;
  otherExpenses: number;
}) {
  const { airtableToken, baseId } = getAirtableCredentials();

  const response = await fetch(`https://api.airtable.com/v0/${baseId}/Submissions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${airtableToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fields: {
        "Customer Email": data.customerEmail,
        "Entity Name": data.entityName,
        "Entity Type": data.entityType,
        "Tax ID": data.taxId,
        "Contact Name": data.contactName,
        "Contact Email": data.contactEmail,
        "Contact Phone": data.contactPhone,
        "Business Description": data.businessDescription,
        "R&D Activities": data.rdActivities,
        "Total Wages": data.totalWages,
        "Contractor Costs": data.contractorCosts,
        "Supply Costs": data.supplyCosts,
        "Other Expenses": data.otherExpenses,
        "Submission Date": new Date().toISOString().split('T')[0],
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Airtable submission error:', error);
    throw new Error('Failed to submit to Airtable');
  }

  const result = await response.json();
  return result.id;
}

// Email operations
export async function sendWelcomeEmail(email: string, name?: string) {
  const sendgridApiKey = process.env.SENDGRID_API_KEY;

  if (!sendgridApiKey) {
    console.error('Missing SendGrid API key');
    throw new Error('SendGrid not configured');
  }

  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(sendgridApiKey);

  const baseUrl = process.env.REPLIT_DEV_DOMAIN 
    ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
    : process.env.REPLIT_DOMAINS?.split(',')[0]
    ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}`
    : 'http://localhost:5000';

  const loginUrl = `${baseUrl}/login`;

  const htmlContent = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #2563eb;">Welcome${name ? `, ${name}` : ''}! Your R&D Credit Package is Ready</h2>
    <p>Thank you for your payment. Your R&D tax credit filing package has been activated and you now have access to our secure intake portal.</p>
    <p><strong>Next Step:</strong> Complete your intake form to begin the filing process</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${loginUrl}" style="background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Access Your Intake Portal</a>
    </div>
    <p><strong>How to Access:</strong></p>
    <ol>
      <li>Click the button above or visit: <a href="${loginUrl}">${loginUrl}</a></li>
      <li>Enter your email address: <strong>${email}</strong></li>
      <li>Complete the secure intake form</li>
    </ol>
    <p><strong>What to expect:</strong></p>
    <ul>
      <li>Entity information and contact details</li>
      <li>Business description and R&D activities</li>
      <li>Expense categorization and documentation</li>
      <li>Timeline: 10-15 minutes to complete</li>
    </ul>
    <p><strong>Security:</strong> Access is tied to your email address and purchase confirmation.</p>
    <p>Questions? Reply to this email or contact info@smbtaxcredits.com</p>
    <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
    <p style="color: #6b7280; font-size: 14px;">This email was sent because you completed a payment for R&D tax credit services. If you did not make this purchase, please contact us immediately.</p>
  </div>`;

  const msg = {
    to: email,
    from: 'info@smbtaxcredits.com',
    subject: 'Welcome! Complete Your R&D Credit Filing',
    html: htmlContent,
  };

  try {
    console.log('Attempting to send email to:', email);
    await sgMail.send(msg);
    console.log('Email sent successfully to:', email);
    return { success: true };
  } catch (error: any) {
    console.error('SendGrid error details:', error);
    if (error.response) {
      console.error('SendGrid response body:', error.response.body);
    }
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

// Document operations
export async function trackDocumentDownload(data: {
  email: string;
  documentId: string;
  fileName?: string;
  fileType?: string;
}) {
  const { airtableToken, baseId } = getAirtableCredentials();

  // First, get the current download count
  const getResponse = await fetch(`https://api.airtable.com/v0/${baseId}/Documents/${data.documentId}`, {
    headers: {
      'Authorization': `Bearer ${airtableToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!getResponse.ok) {
    console.warn('Could not get current download count');
    return { success: true }; // Don't fail the download
  }

  const currentDoc = await getResponse.json();
  const currentCount = currentDoc.fields['Download Count'] || 0;

  // Update the document with incremented download count and last downloaded timestamp
  const updateResponse = await fetch(`https://api.airtable.com/v0/${baseId}/Documents/${data.documentId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${airtableToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fields: {
        'Download Count': currentCount + 1,
        'Last Downloaded': new Date().toISOString(),
      },
    }),
  });

  if (!updateResponse.ok) {
    console.warn('Failed to update download count in Airtable');
  }

  // Also log the download event in a separate Downloads table if it exists
  try {
    await fetch(`https://api.airtable.com/v0/${baseId}/Downloads`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${airtableToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          'Customer Email': data.email,
          'Document ID': data.documentId,
          'File Name': data.fileName || '',
          'File Type': data.fileType || '',
          'Downloaded At': new Date().toISOString(),
          'Download Date': new Date().toISOString().split('T')[0],
        },
      }),
    });
  } catch (error) {
    console.warn('Downloads table may not exist, skipping download event logging');
  }

  return { success: true };
}

// Development helpers
export async function createTestCustomer(email: string) {
  const accessToken = uuidv4();
  const testCustomerData = {
    email,
    name: 'Test Customer',
    accessToken,
    planType: 'Growth ($10K-$50K Credit)',
    stripeCustomerId: 'test_customer_dev',
  };

  await addToAirtableCustomers(testCustomerData);
  
  return {
    success: true,
    message: `Test customer created for ${email}`,
    accessToken,
    loginUrl: `/login`
  };
}