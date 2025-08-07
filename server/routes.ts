import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { v4 as uuidv4 } from 'uuid';
import { storage } from "./storage";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
} as any);

// Airtable helper functions
async function addToAirtableSubmissions(data: {
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
  const airtableToken = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;

  if (!airtableToken || !baseId) {
    console.error('Missing Airtable credentials');
    throw new Error('Airtable credentials not configured');
  }

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

async function addToAirtableCustomers(data: {
  email: string;
  name?: string;
  purchaseDate: string;
  planType: string;
  stripeCustomerId?: string;
  totalPaid: number;
  selectedYears: string;
  accessToken: string;
}) {
  const airtableToken = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;

  if (!airtableToken || !baseId) {
    console.error('Missing Airtable credentials');
    throw new Error('Airtable credentials not configured');
  }

  const response = await fetch(`https://api.airtable.com/v0/${baseId}/Customers`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${airtableToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fields: {
        "Email": data.email,
        "Name": data.name || '',
        "Purchase Date": data.purchaseDate,
        "Plan Type": data.planType,
        "Stripe Customer ID": data.stripeCustomerId || '',
        "Total Paid": data.totalPaid,
        "Selected Years": data.selectedYears ? data.selectedYears.split(',') : [],
        "Access Token": data.accessToken,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Airtable error:', error);
    throw new Error(`Failed to add to Airtable: ${error}`);
  }

  return response.json();
}

async function sendWelcomeEmail(email: string, name?: string) {
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

export async function registerRoutes(app: Express): Promise<Server> {
  
  // SendGrid is now integrated directly into the Stripe webhook
  // Test it by completing a purchase through the checkout flow

  // Auth verification endpoint - checks Airtable directly
  app.post('/api/auth/verify', async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      // Check Airtable Customers table directly
      const airtableToken = process.env.AIRTABLE_API_KEY;
      const baseId = process.env.AIRTABLE_BASE_ID;

      if (!airtableToken || !baseId) {
        return res.status(500).json({ error: 'Airtable not configured' });
      }

      const response = await fetch(`https://api.airtable.com/v0/${baseId}/Customers?filterByFormula=LOWER({Email})=LOWER('${email}')`, {
        headers: {
          'Authorization': `Bearer ${airtableToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to check Airtable');
      }

      const data = await response.json();
      
      if (data.records.length === 0) {
        return res.status(404).json({ error: 'Customer not found. Please complete payment first.', hasAccess: false });
      }

      const customer = data.records[0].fields;
      
      res.json({ 
        hasAccess: true, // If record exists in Customers table, they have access
        customer: {
          email: customer.Email,
          totalPaid: customer['Total Paid'],
          selectedYears: customer['Selected Years']
        }
      });
    } catch (error) {
      console.error('Auth verification error:', error);
      res.status(500).json({ error: 'Authentication verification failed' });
    }
  });

  // Customer info endpoint - checks Airtable directly
  app.post('/api/customer/info', async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      const airtableToken = process.env.AIRTABLE_API_KEY;
      const baseId = process.env.AIRTABLE_BASE_ID;

      if (!airtableToken || !baseId) {
        return res.status(500).json({ error: 'Airtable not configured' });
      }

      // Check customer exists
      const customerResponse = await fetch(`https://api.airtable.com/v0/${baseId}/Customers?filterByFormula=LOWER({Email})=LOWER('${email}')`, {
        headers: {
          'Authorization': `Bearer ${airtableToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!customerResponse.ok) {
        throw new Error('Failed to check customer in Airtable');
      }

      const customerData = await customerResponse.json();
      
      if (customerData.records.length === 0) {
        return res.status(403).json({ error: 'Access denied - customer not found' });
      }

      const customer = customerData.records[0].fields;

      // Check for existing submissions
      const submissionsResponse = await fetch(`https://api.airtable.com/v0/${baseId}/Submissions?filterByFormula=LOWER({Customer Email})=LOWER('${email}')`, {
        headers: {
          'Authorization': `Bearer ${airtableToken}`,
          'Content-Type': 'application/json',
        },
      });

      let submissions = [];
      if (submissionsResponse.ok) {
        const submissionsData = await submissionsResponse.json();
        submissions = submissionsData.records.map((record: any) => ({
          id: record.id,
          submissionDate: record.fields['Submission Date'],
          entityName: record.fields['Entity Name']
        }));
      }
      
      res.json({ 
        email: customer.Email,
        totalPaid: customer['Total Paid'],
        selectedYears: customer['Selected Years'],
        hasSubmissions: submissions.length > 0,
        submissions: submissions
      });
    } catch (error) {
      console.error('Customer info error:', error);
      res.status(500).json({ error: 'Failed to load customer info' });
    }
  });

  // Intake form submission endpoint - pure Airtable
  app.post('/api/intake/submit', async (req, res) => {
    try {
      const { email, formData } = req.body;
      
      if (!email || !formData) {
        return res.status(400).json({ error: 'Email and form data are required' });
      }

      const airtableToken = process.env.AIRTABLE_API_KEY;
      const baseId = process.env.AIRTABLE_BASE_ID;

      if (!airtableToken || !baseId) {
        return res.status(500).json({ error: 'Airtable not configured' });
      }

      // Verify customer exists in Airtable
      const customerCheck = await fetch(`https://api.airtable.com/v0/${baseId}/Customers?filterByFormula=LOWER({Email})=LOWER('${email}')`, {
        headers: {
          'Authorization': `Bearer ${airtableToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!customerCheck.ok) {
        throw new Error('Failed to verify customer');
      }

      const customerData = await customerCheck.json();
      if (customerData.records.length === 0) {
        return res.status(403).json({ error: 'Access denied - please complete payment first' });
      }

      // Submit directly to Airtable Submissions
      const airtableRecordId = await addToAirtableSubmissions({
        customerEmail: email,
        entityName: formData.entityName,
        entityType: formData.entityType,
        taxId: formData.taxId,
        contactName: formData.contactName,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        businessDescription: formData.businessDescription,
        rdActivities: formData.rdActivities,
        totalWages: parseInt(formData.totalWages) || 0,
        contractorCosts: parseInt(formData.contractorCosts) || 0,
        supplyCosts: parseInt(formData.supplyCosts) || 0,
        otherExpenses: parseInt(formData.otherExpenses) || 0,
      });

      res.json({ success: true, submissionId: airtableRecordId });
    } catch (error) {
      console.error('Intake submission error:', error);
      res.status(500).json({ error: 'Failed to submit intake form' });
    }
  });
  // Stripe Webhook handler
  app.post('/api/stripeWebhook', async (req, res) => {
    try {
      const sig = req.headers['stripe-signature'];
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

      if (!sig || !endpointSecret) {
        console.error('Missing webhook signature or secret');
        return res.status(400).send('Missing webhook signature or secret');
      }

      let event: Stripe.Event;

      try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }

      // Handle the checkout.session.completed event
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        
        console.log('Processing completed checkout session:', session.id);

        // Extract data from session
        const email = session.customer_email || session.metadata?.email;
        const totalPaid = session.amount_total ? session.amount_total / 100 : 0; // Convert from cents
        const selectedYears = session.metadata?.yearsSelected || '';
        const tierBasePrice = parseFloat(session.metadata?.tierBasePrice || '0');
        const accessToken = uuidv4();
        const purchaseDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
        
        // Extract customer name if available
        let customerName = '';
        if (session.customer_details?.name) {
          customerName = session.customer_details.name;
        }
        
        // Determine plan type based on price
        let planType = 'Custom';
        if (tierBasePrice >= 1500) {
          planType = 'Premium ($100K+ Credit)';
        } else if (tierBasePrice >= 1000) {
          planType = 'Pro ($50K-$100K Credit)';
        } else if (tierBasePrice >= 750) {
          planType = 'Growth ($10K-$50K Credit)';
        } else if (tierBasePrice >= 500) {
          planType = 'Starter (Under $10K Credit)';
        }

        if (!email) {
          console.error('No email found in session');
          return res.status(400).send('No email found in session');
        }

        // Add to Airtable Customers table with all required fields
        await addToAirtableCustomers({
          email,
          name: customerName,
          purchaseDate,
          planType,
          stripeCustomerId: session.customer as string,
          totalPaid,
          selectedYears,
          accessToken
        });

        // Test basic SendGrid functionality first
        console.log('Testing SendGrid integration...');
        const sgMail = require('@sendgrid/mail');
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);

        const testMsg = {
          to: email,
          from: 'info@smbtaxcredits.com',
          subject: 'Welcome! Complete Your R&D Credit Filing',
          text: 'Thank you for your payment. Your R&D tax credit filing package has been activated.',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">Welcome${customerName ? `, ${customerName}` : ''}! Your R&D Credit Package is Ready</h2>
              <p>Thank you for your payment. Your R&D tax credit filing package has been activated and you now have access to our secure intake portal.</p>
              <p><strong>Next Step:</strong> Complete your intake form to begin the filing process</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.REPLIT_DEV_DOMAIN ? `https://${process.env.REPLIT_DEV_DOMAIN}/login` : 'http://localhost:5000/login'}" 
                   style="background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                  Access Your Intake Portal
                </a>
              </div>
              <p><strong>How to Access:</strong></p>
              <ol>
                <li>Click the button above or visit the login page</li>
                <li>Enter your email address: <strong>${email}</strong></li>
                <li>Complete the secure intake form</li>
              </ol>
              <p>Questions? Reply to this email or contact info@smbtaxcredits.com</p>
            </div>
          `,
        };

        await sgMail.send(testMsg);
        console.log(`SendGrid email sent successfully to ${email}`);

        console.log(`Successfully processed payment for ${email}, plan: ${planType}, token: ${accessToken}`);
      }

      res.json({ received: true });
    } catch (error: any) {
      console.error('Webhook error:', error);
      res.status(500).json({ error: 'Webhook processing failed', details: error.message });
    }
  });

  // Stripe Checkout API route
  app.post("/api/stripeCheckout", async (req, res) => {
    try {
      const { email, tierBasePrice, yearsSelected } = req.body;

      if (!email || !tierBasePrice || !Array.isArray(yearsSelected)) {
        return res.status(400).json({ 
          error: "Missing required fields: email, tierBasePrice, yearsSelected" 
        });
      }

      // Create line items for Stripe Checkout
      const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

      // Base package item
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: `R&D Credit Filing Package (Tier)`,
            description: `Professional R&D tax credit documentation and filing package`,
          },
          unit_amount: Math.round(tierBasePrice * 100), // Convert to cents
        },
        quantity: 1,
      });

      // Add line items for each selected year
      yearsSelected.forEach((year: number) => {
        lineItems.push({
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Tax Year ${year} Filing`,
              description: `R&D credit filing for tax year ${year}`,
            },
            unit_amount: 29700, // $297 in cents
          },
          quantity: 1,
        });
      });

      // Create proper base URL with scheme for Replit environment
      let fullBaseUrl = 'http://localhost:5000'; // fallback
      
      if (req.headers.origin) {
        fullBaseUrl = req.headers.origin;
      } else if (req.headers.host) {
        const protocol = req.headers['x-forwarded-proto'] || 'http';
        fullBaseUrl = `${protocol}://${req.headers.host}`;
      }
      
      // Ensure URL has proper scheme
      if (!fullBaseUrl.startsWith('http')) {
        fullBaseUrl = `http://${fullBaseUrl}`;
      }

      // Create Stripe Checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        customer_email: email,
        success_url: `${fullBaseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${fullBaseUrl}/checkout`,
        metadata: {
          email,
          tierBasePrice: tierBasePrice.toString(),
          yearsSelected: yearsSelected.join(','),
        },
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error('Stripe checkout error:', error);
      res.status(500).json({ 
        error: "Failed to create checkout session",
        details: error.message 
      });
    }
  });

  // Intake form submission API
  app.post("/api/submitIntake", async (req, res) => {
    try {
      const { token, formData } = req.body;

      if (!token || !formData) {
        return res.status(400).json({ error: "Missing token or form data" });
      }

      // Verify token exists in Customers table
      const airtableToken = process.env.AIRTABLE_API_KEY;
      const baseId = process.env.AIRTABLE_BASE_ID;

      if (!airtableToken || !baseId) {
        return res.status(500).json({ error: "Server configuration error" });
      }

      // Add to Airtable Submissions table
      const response = await fetch(`https://api.airtable.com/v0/${baseId}/Submissions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${airtableToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields: {
            "Entity Name": formData.entityName,
            "Entity Type": formData.entityType
          },
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Airtable submission error:', error);
        return res.status(500).json({ error: "Failed to submit intake form" });
      }

      res.json({ success: true, message: "Intake form submitted successfully" });
    } catch (error: any) {
      console.error('Intake submission error:', error);
      res.status(500).json({ 
        error: "Failed to submit intake form",
        details: error.message 
      });
    }
  });

  // Company Information endpoints
  app.post('/api/company/info', async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      const airtableToken = process.env.AIRTABLE_API_KEY;
      const baseId = process.env.AIRTABLE_BASE_ID;

      if (!airtableToken || !baseId) {
        return res.status(500).json({ error: 'Airtable not configured' });
      }

      // Get company info from Airtable
      const response = await fetch(`https://api.airtable.com/v0/${baseId}/Companies?filterByFormula=LOWER({Email})=LOWER('${email}')`, {
        headers: {
          'Authorization': `Bearer ${airtableToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch company info');
      }

      const data = await response.json();
      const companyInfo = data.records.length > 0 ? {
        companyName: data.records[0].fields['Company Name'],
        ein: data.records[0].fields['EIN'],
        entityType: data.records[0].fields['Entity Type'],
        yearFounded: data.records[0].fields['Year Founded'],
        annualRevenue: data.records[0].fields['Annual Revenue'],
        employeeCount: data.records[0].fields['Employee Count'],
        rdEmployeeCount: data.records[0].fields['R&D Employee Count'],
        primaryState: data.records[0].fields['Primary State'],
        rdStates: data.records[0].fields['R&D States'] || [],
        hasMultipleStates: data.records[0].fields['Has Multiple States'] || false,
      } : null;

      res.json({ companyInfo });
    } catch (error) {
      console.error('Company info error:', error);
      res.status(500).json({ error: 'Failed to load company info' });
    }
  });

  app.post('/api/company/save-progress', async (req, res) => {
    try {
      const { email, formData } = req.body;
      
      if (!email || !formData) {
        return res.status(400).json({ error: 'Email and form data are required' });
      }

      const airtableToken = process.env.AIRTABLE_API_KEY;
      const baseId = process.env.AIRTABLE_BASE_ID;

      if (!airtableToken || !baseId) {
        return res.status(500).json({ error: 'Airtable not configured' });
      }

      // Check if record exists
      const checkResponse = await fetch(`https://api.airtable.com/v0/${baseId}/Companies?filterByFormula=LOWER({Email})=LOWER('${email}')`, {
        headers: {
          'Authorization': `Bearer ${airtableToken}`,
          'Content-Type': 'application/json',
        },
      });

      const checkData = await checkResponse.json();
      const existingRecord = checkData.records.length > 0 ? checkData.records[0] : null;

      const companyData = {
        'Email': email,
        'Company Name': formData.companyName || '',
        'EIN': formData.ein || '',
        'Entity Type': formData.entityType || '',
        'Year Founded': formData.yearFounded ? parseInt(formData.yearFounded) : null,
        'Annual Revenue': formData.annualRevenue || '',
        'Employee Count': formData.employeeCount || '',
        'R&D Employee Count': formData.rdEmployeeCount ? parseInt(formData.rdEmployeeCount) : null,
        'Primary State': formData.primaryState || '',
        'R&D States': formData.rdStates || [],
        'Has Multiple States': formData.hasMultipleStates || false,
        'Last Updated': new Date().toISOString(),
      };

      if (existingRecord) {
        // Update existing record
        const updateResponse = await fetch(`https://api.airtable.com/v0/${baseId}/Companies/${existingRecord.id}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${airtableToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ fields: companyData }),
        });

        if (!updateResponse.ok) {
          throw new Error('Failed to update company info');
        }
      } else {
        // Create new record
        const createResponse = await fetch(`https://api.airtable.com/v0/${baseId}/Companies`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${airtableToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ fields: companyData }),
        });

        if (!createResponse.ok) {
          throw new Error('Failed to create company info');
        }
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Save progress error:', error);
      res.status(500).json({ error: 'Failed to save progress' });
    }
  });

  app.post('/api/company/submit', async (req, res) => {
    try {
      const { email, formData } = req.body;
      
      if (!email || !formData) {
        return res.status(400).json({ error: 'Email and form data are required' });
      }

      // Verify customer exists
      const airtableToken = process.env.AIRTABLE_API_KEY;
      const baseId = process.env.AIRTABLE_BASE_ID;

      if (!airtableToken || !baseId) {
        return res.status(500).json({ error: 'Airtable not configured' });
      }

      const customerCheck = await fetch(`https://api.airtable.com/v0/${baseId}/Customers?filterByFormula=LOWER({Email})=LOWER('${email}')`, {
        headers: {
          'Authorization': `Bearer ${airtableToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!customerCheck.ok) {
        throw new Error('Failed to verify customer');
      }

      const customerData = await customerCheck.json();
      if (customerData.records.length === 0) {
        return res.status(403).json({ error: 'Access denied - customer not found' });
      }

      // Save complete company information
      const companyData = {
        'Email': email,
        'Company Name': formData.companyName,
        'EIN': formData.ein,
        'Entity Type': formData.entityType,
        'Year Founded': parseInt(formData.yearFounded),
        'Annual Revenue': formData.annualRevenue,
        'Employee Count': formData.employeeCount,
        'R&D Employee Count': formData.rdEmployeeCount ? parseInt(formData.rdEmployeeCount) : null,
        'Primary State': formData.primaryState,
        'R&D States': formData.rdStates,
        'Has Multiple States': formData.hasMultipleStates,
        'Status': 'Complete',
        'Completed At': new Date().toISOString(),
      };

      // Check if record exists and update or create
      const checkResponse = await fetch(`https://api.airtable.com/v0/${baseId}/Companies?filterByFormula=LOWER({Email})=LOWER('${email}')`, {
        headers: {
          'Authorization': `Bearer ${airtableToken}`,
          'Content-Type': 'application/json',
        },
      });

      const checkData = await checkResponse.json();
      const existingRecord = checkData.records.length > 0 ? checkData.records[0] : null;

      if (existingRecord) {
        const response = await fetch(`https://api.airtable.com/v0/${baseId}/Companies/${existingRecord.id}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${airtableToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ fields: companyData }),
        });

        if (!response.ok) {
          throw new Error('Failed to update company info');
        }
      } else {
        const response = await fetch(`https://api.airtable.com/v0/${baseId}/Companies`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${airtableToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ fields: companyData }),
        });

        if (!response.ok) {
          throw new Error('Failed to create company info');
        }
      }

      res.json({ success: true, message: 'Company information saved successfully' });
    } catch (error) {
      console.error('Company submission error:', error);
      res.status(500).json({ error: 'Failed to submit company information' });
    }
  });

  // Expense Collection endpoints
  app.post('/api/expenses/load', async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      const airtableToken = process.env.AIRTABLE_API_KEY;
      const baseId = process.env.AIRTABLE_BASE_ID;

      if (!airtableToken || !baseId) {
        return res.status(500).json({ error: 'Airtable not configured' });
      }

      // Load expenses from different tables
      const [wagesRes, contractorsRes, suppliesRes, cloudSoftwareRes] = await Promise.all([
        fetch(`https://api.airtable.com/v0/${baseId}/Wages?filterByFormula=LOWER({Email})=LOWER('${email}')`, {
          headers: { 'Authorization': `Bearer ${airtableToken}`, 'Content-Type': 'application/json' }
        }),
        fetch(`https://api.airtable.com/v0/${baseId}/Contractors?filterByFormula=LOWER({Email})=LOWER('${email}')`, {
          headers: { 'Authorization': `Bearer ${airtableToken}`, 'Content-Type': 'application/json' }
        }),
        fetch(`https://api.airtable.com/v0/${baseId}/Supplies?filterByFormula=LOWER({Email})=LOWER('${email}')`, {
          headers: { 'Authorization': `Bearer ${airtableToken}`, 'Content-Type': 'application/json' }
        }),
        fetch(`https://api.airtable.com/v0/${baseId}/CloudSoftware?filterByFormula=LOWER({Email})=LOWER('${email}')`, {
          headers: { 'Authorization': `Bearer ${airtableToken}`, 'Content-Type': 'application/json' }
        })
      ]);

      const [wagesData, contractorsData, suppliesData, cloudSoftwareData] = await Promise.all([
        wagesRes.json(),
        contractorsRes.json(),
        suppliesRes.json(),
        cloudSoftwareRes.json()
      ]);

      // Transform Airtable data to frontend format
      const wages = wagesData.records?.map(record => ({
        id: record.id,
        employeeName: record.fields['Employee Name'] || '',
        role: record.fields['Role'] || '',
        annualSalary: record.fields['Annual Salary'] || 0,
        rdPercentage: record.fields['R&D Percentage'] || 0,
        rdAmount: record.fields['R&D Amount'] || 0,
      })) || [];

      const contractors = contractorsData.records?.map(record => ({
        id: record.id,
        contractorName: record.fields['Contractor Name'] || '',
        amount: record.fields['Amount'] || 0,
        description: record.fields['Description'] || '',
        qualifiedAmount: record.fields['Qualified Amount'] || 0,
      })) || [];

      const supplies = suppliesData.records?.map(record => ({
        id: record.id,
        supplyType: record.fields['Supply Type'] || '',
        amount: record.fields['Amount'] || 0,
        rdPercentage: record.fields['R&D Percentage'] || 0,
        rdAmount: record.fields['R&D Amount'] || 0,
      })) || [];

      const cloudSoftware = cloudSoftwareData.records?.map(record => ({
        id: record.id,
        serviceName: record.fields['Service Name'] || '',
        monthlyCost: record.fields['Monthly Cost'] || 0,
        rdPercentage: record.fields['R&D Percentage'] || 0,
        annualRdAmount: record.fields['Annual R&D Amount'] || 0,
      })) || [];

      res.json({ wages, contractors, supplies, cloudSoftware });
    } catch (error) {
      console.error('Load expenses error:', error);
      res.status(500).json({ error: 'Failed to load expenses' });
    }
  });

  app.post('/api/expenses/save', async (req, res) => {
    try {
      const { email, expenses } = req.body;
      
      if (!email || !expenses) {
        return res.status(400).json({ error: 'Email and expenses are required' });
      }

      const airtableToken = process.env.AIRTABLE_API_KEY;
      const baseId = process.env.AIRTABLE_BASE_ID;

      if (!airtableToken || !baseId) {
        return res.status(500).json({ error: 'Airtable not configured' });
      }

      // Save each expense type to its respective table
      const savePromises = [];

      // Save wages
      if (expenses.wages?.length > 0) {
        for (const wage of expenses.wages) {
          const wageData = {
            'Email': email,
            'Employee Name': wage.employeeName,
            'Role': wage.role,
            'Annual Salary': wage.annualSalary,
            'R&D Percentage': wage.rdPercentage,
            'R&D Amount': wage.rdAmount,
            'Last Updated': new Date().toISOString(),
          };

          // Check if record exists (by ID if it's an Airtable ID, otherwise create new)
          if (wage.id && wage.id.startsWith('rec')) {
            savePromises.push(
              fetch(`https://api.airtable.com/v0/${baseId}/Wages/${wage.id}`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${airtableToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ fields: wageData }),
              })
            );
          } else {
            savePromises.push(
              fetch(`https://api.airtable.com/v0/${baseId}/Wages`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${airtableToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ fields: wageData }),
              })
            );
          }
        }
      }

      // Save contractors
      if (expenses.contractors?.length > 0) {
        for (const contractor of expenses.contractors) {
          const contractorData = {
            'Email': email,
            'Contractor Name': contractor.contractorName,
            'Amount': contractor.amount,
            'Description': contractor.description,
            'Qualified Amount': contractor.qualifiedAmount,
            'Last Updated': new Date().toISOString(),
          };

          if (contractor.id && contractor.id.startsWith('rec')) {
            savePromises.push(
              fetch(`https://api.airtable.com/v0/${baseId}/Contractors/${contractor.id}`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${airtableToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ fields: contractorData }),
              })
            );
          } else {
            savePromises.push(
              fetch(`https://api.airtable.com/v0/${baseId}/Contractors`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${airtableToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ fields: contractorData }),
              })
            );
          }
        }
      }

      // Save supplies
      if (expenses.supplies?.length > 0) {
        for (const supply of expenses.supplies) {
          const supplyData = {
            'Email': email,
            'Supply Type': supply.supplyType,
            'Amount': supply.amount,
            'R&D Percentage': supply.rdPercentage,
            'R&D Amount': supply.rdAmount,
            'Last Updated': new Date().toISOString(),
          };

          if (supply.id && supply.id.startsWith('rec')) {
            savePromises.push(
              fetch(`https://api.airtable.com/v0/${baseId}/Supplies/${supply.id}`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${airtableToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ fields: supplyData }),
              })
            );
          } else {
            savePromises.push(
              fetch(`https://api.airtable.com/v0/${baseId}/Supplies`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${airtableToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ fields: supplyData }),
              })
            );
          }
        }
      }

      // Save cloud/software
      if (expenses.cloudSoftware?.length > 0) {
        for (const cloud of expenses.cloudSoftware) {
          const cloudData = {
            'Email': email,
            'Service Name': cloud.serviceName,
            'Monthly Cost': cloud.monthlyCost,
            'R&D Percentage': cloud.rdPercentage,
            'Annual R&D Amount': cloud.annualRdAmount,
            'Last Updated': new Date().toISOString(),
          };

          if (cloud.id && cloud.id.startsWith('rec')) {
            savePromises.push(
              fetch(`https://api.airtable.com/v0/${baseId}/CloudSoftware/${cloud.id}`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${airtableToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ fields: cloudData }),
              })
            );
          } else {
            savePromises.push(
              fetch(`https://api.airtable.com/v0/${baseId}/CloudSoftware`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${airtableToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ fields: cloudData }),
              })
            );
          }
        }
      }

      await Promise.all(savePromises);
      res.json({ success: true });
    } catch (error) {
      console.error('Save expenses error:', error);
      res.status(500).json({ error: 'Failed to save expenses' });
    }
  });

  app.post('/api/expenses/submit', async (req, res) => {
    try {
      const { email, expenses } = req.body;
      
      if (!email || !expenses) {
        return res.status(400).json({ error: 'Email and expenses are required' });
      }

      // Verify customer exists
      const airtableToken = process.env.AIRTABLE_API_KEY;
      const baseId = process.env.AIRTABLE_BASE_ID;

      if (!airtableToken || !baseId) {
        return res.status(500).json({ error: 'Airtable not configured' });
      }

      const customerCheck = await fetch(`https://api.airtable.com/v0/${baseId}/Customers?filterByFormula=LOWER({Email})=LOWER('${email}')`, {
        headers: { 'Authorization': `Bearer ${airtableToken}`, 'Content-Type': 'application/json' },
      });

      if (!customerCheck.ok) {
        throw new Error('Failed to verify customer');
      }

      const customerData = await customerCheck.json();
      if (customerData.records.length === 0) {
        return res.status(403).json({ error: 'Access denied - customer not found' });
      }

      // First save all expense data (reuse the save logic)
      await fetch(`${req.protocol}://${req.get('host')}/api/expenses/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, expenses }),
      });

      // Mark expenses as complete by adding status to each table
      const statusUpdates = [];
      
      // Update status for each expense type
      ['Wages', 'Contractors', 'Supplies', 'CloudSoftware'].forEach(tableName => {
        statusUpdates.push(
          fetch(`https://api.airtable.com/v0/${baseId}/${tableName}?filterByFormula=LOWER({Email})=LOWER('${email}')`, {
            headers: { 'Authorization': `Bearer ${airtableToken}`, 'Content-Type': 'application/json' },
          }).then(res => res.json()).then(data => {
            return Promise.all(data.records?.map(record => 
              fetch(`https://api.airtable.com/v0/${baseId}/${tableName}/${record.id}`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${airtableToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  fields: { 
                    'Status': 'Complete',
                    'Completed At': new Date().toISOString()
                  }
                }),
              })
            ) || [])
          })
        );
      });

      await Promise.all(statusUpdates);

      res.json({ success: true, message: 'Expense information saved successfully' });
    } catch (error) {
      console.error('Expense submission error:', error);
      res.status(500).json({ error: 'Failed to submit expense information' });
    }
  });

  // QRE Calculation endpoints
  app.post('/api/qre/calculate', async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      const airtableToken = process.env.AIRTABLE_API_KEY;
      const baseId = process.env.AIRTABLE_BASE_ID;

      if (!airtableToken || !baseId) {
        return res.status(500).json({ error: 'Airtable not configured' });
      }

      // Fetch all expense data from Airtable tables
      const [wagesResponse, contractorsResponse, suppliesResponse, cloudResponse] = await Promise.all([
        fetch(`https://api.airtable.com/v0/${baseId}/Wages?filterByFormula=LOWER({Email})=LOWER('${email}')`, {
          headers: { 'Authorization': `Bearer ${airtableToken}`, 'Content-Type': 'application/json' },
        }),
        fetch(`https://api.airtable.com/v0/${baseId}/Contractors?filterByFormula=LOWER({Email})=LOWER('${email}')`, {
          headers: { 'Authorization': `Bearer ${airtableToken}`, 'Content-Type': 'application/json' },
        }),
        fetch(`https://api.airtable.com/v0/${baseId}/Supplies?filterByFormula=LOWER({Email})=LOWER('${email}')`, {
          headers: { 'Authorization': `Bearer ${airtableToken}`, 'Content-Type': 'application/json' },
        }),
        fetch(`https://api.airtable.com/v0/${baseId}/CloudSoftware?filterByFormula=LOWER({Email})=LOWER('${email}')`, {
          headers: { 'Authorization': `Bearer ${airtableToken}`, 'Content-Type': 'application/json' },
        })
      ]);

      const [wagesData, contractorsData, suppliesData, cloudData] = await Promise.all([
        wagesResponse.ok ? wagesResponse.json() : { records: [] },
        contractorsResponse.ok ? contractorsResponse.json() : { records: [] },
        suppliesResponse.ok ? suppliesResponse.json() : { records: [] },
        cloudResponse.ok ? cloudResponse.json() : { records: [] }
      ]);

      // Calculate qualified wages
      const wageEntries = wagesData.records.map((record: any) => {
        const annualSalary = parseFloat(record.fields['Annual Salary']) || 0;
        const rdPercentage = parseFloat(record.fields['R&D Percentage']) || 0;
        const qualifiedAmount = (annualSalary * rdPercentage) / 100;
        
        return {
          employeeName: record.fields['Employee Name'] || 'Unknown',
          role: record.fields['Role'] || 'Not specified',
          annualSalary,
          rdPercentage,
          qualifiedAmount
        };
      });
      const wagesTotal = wageEntries.reduce((sum: number, entry: any) => sum + entry.qualifiedAmount, 0);

      // Calculate qualified contractor expenses (65% of total)
      const contractorEntries = contractorsData.records.map((record: any) => {
        const amount = parseFloat(record.fields['Amount']) || 0;
        const qualifiedAmount = amount * 0.65;
        
        return {
          contractorName: record.fields['Contractor Name'] || 'Unknown',
          amount,
          qualifiedAmount,
          description: record.fields['Description'] || 'No description'
        };
      });
      const contractorsTotal = contractorEntries.reduce((sum: number, entry: any) => sum + entry.qualifiedAmount, 0);

      // Calculate qualified supply expenses
      const supplyEntries = suppliesData.records.map((record: any) => {
        const amount = parseFloat(record.fields['Amount']) || 0;
        const rdPercentage = parseFloat(record.fields['R&D Percentage']) || 100;
        const qualifiedAmount = (amount * rdPercentage) / 100;
        
        return {
          supplyType: record.fields['Supply Type'] || 'Unknown',
          amount,
          rdPercentage,
          qualifiedAmount
        };
      });
      const suppliesTotal = supplyEntries.reduce((sum: number, entry: any) => sum + entry.qualifiedAmount, 0);

      // Calculate qualified cloud/software expenses
      const cloudEntries = cloudData.records.map((record: any) => {
        const monthlyCost = parseFloat(record.fields['Monthly Cost']) || 0;
        const rdPercentage = parseFloat(record.fields['R&D Percentage']) || 100;
        const annualCost = monthlyCost * 12;
        const qualifiedAmount = (annualCost * rdPercentage) / 100;
        
        return {
          serviceName: record.fields['Service Name'] || 'Unknown',
          annualCost,
          rdPercentage,
          qualifiedAmount
        };
      });
      const cloudTotal = cloudEntries.reduce((sum: number, entry: any) => sum + entry.qualifiedAmount, 0);

      // Calculate totals
      const grandTotal = wagesTotal + contractorsTotal + suppliesTotal + cloudTotal;
      const taxCreditEstimate = Math.round(grandTotal * 0.2); // 20% federal R&D tax credit

      const qreData = {
        wages: {
          entries: wageEntries,
          total: Math.round(wagesTotal)
        },
        contractors: {
          entries: contractorEntries,
          total: Math.round(contractorsTotal)
        },
        supplies: {
          entries: supplyEntries,
          total: Math.round(suppliesTotal)
        },
        cloudSoftware: {
          entries: cloudEntries,
          total: Math.round(cloudTotal)
        },
        grandTotal: Math.round(grandTotal),
        taxCreditEstimate
      };

      res.json(qreData);
    } catch (error) {
      console.error('QRE calculation error:', error);
      res.status(500).json({ error: 'Failed to calculate QRE' });
    }
  });

  app.post('/api/qre/generate-report', async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      // For now, we'll just return success - in production this would generate and email a PDF report
      console.log(`QRE report requested for ${email}`);
      
      res.json({ 
        success: true, 
        message: 'QRE report generation initiated. You will receive an email when ready.' 
      });
    } catch (error) {
      console.error('QRE report generation error:', error);
      res.status(500).json({ error: 'Failed to generate QRE report' });
    }
  });

  // Credit Calculation endpoints
  app.post('/api/credits/calculate', async (req, res) => {
    try {
      const { email, totalQRE } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      const airtableToken = process.env.AIRTABLE_API_KEY;
      const baseId = process.env.AIRTABLE_BASE_ID;

      if (!airtableToken || !baseId) {
        return res.status(500).json({ error: 'Airtable not configured' });
      }

      // Get QRE if not provided
      let qreAmount = totalQRE;
      if (!qreAmount) {
        // Recalculate QRE if not provided
        const qreResponse = await fetch(`${req.protocol}://${req.get('host')}/api/qre/calculate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        if (qreResponse.ok) {
          const qreData = await qreResponse.json();
          qreAmount = qreData.grandTotal;
        } else {
          qreAmount = 0;
        }
      }

      // Get company information for state credits and payroll tax offset eligibility
      const companyResponse = await fetch(`https://api.airtable.com/v0/${baseId}/Companies?filterByFormula=LOWER({Email})=LOWER('${email}')`, {
        headers: { 'Authorization': `Bearer ${airtableToken}`, 'Content-Type': 'application/json' },
      });

      let companyInfo = {
        primaryState: '',
        rdStates: [] as string[],
        employeeCount: '',
        annualRevenue: ''
      };

      if (companyResponse.ok) {
        const companyData = await companyResponse.json();
        if (companyData.records.length > 0) {
          const company = companyData.records[0].fields;
          companyInfo = {
            primaryState: company['Primary State'] || '',
            rdStates: company['R&D States'] || [],
            employeeCount: company['Employee Count'] || '',
            annualRevenue: company['Annual Revenue'] || ''
          };
        }
      }

      // Calculate Federal Credit (Traditional Method: 6.5% of QRE)
      const federalCreditRate = 6.5; // 6.5% traditional method
      const federalCreditAmount = Math.round(qreAmount * (federalCreditRate / 100));
      
      const federalCredit = {
        traditionalMethod: federalCreditAmount,
        rate: federalCreditRate,
        explanation: `Traditional method applies ${federalCreditRate}% to qualified research expenses. This is the most common method for businesses with consistent R&D spending.`
      };

      // State-specific R&D credit rates and information
      const stateRates: Record<string, { rate: number; maxCredit?: number; description: string }> = {
        'California': { rate: 24, description: 'California offers a 24% credit for qualified R&D expenses, with no annual cap' },
        'Connecticut': { rate: 6, description: '6% credit with additional benefits for small businesses' },
        'Illinois': { rate: 6.5, description: '6.5% credit for increasing research activities in Illinois' },
        'Maryland': { rate: 10, description: '10% credit for qualified research expenses with 15-year carryforward' },
        'Massachusetts': { rate: 10, description: '10% research credit for qualified expenses above base amount' },
        'New Jersey': { rate: 20, description: '20% credit for qualified research expenses with generous carryforward' },
        'New York': { rate: 9, description: '9% credit for qualified research expenses in New York' },
        'North Carolina': { rate: 25, description: '25% credit for qualified research expenses (one of the highest state rates)' },
        'Pennsylvania': { rate: 10, description: '10% credit for qualified research and development tax credit' },
        'Texas': { rate: 5, description: '5% credit for qualified research expenses with no annual limit' },
        'Washington': { rate: 1.5, description: '1.5% credit for qualified research activities in Washington' }
      };

      // Calculate state credits for all R&D states
      const allStates = [...new Set([companyInfo.primaryState, ...companyInfo.rdStates])].filter(Boolean);
      const stateCredits = allStates.map(state => {
        const stateInfo = stateRates[state];
        if (!stateInfo) {
          return {
            state,
            rate: 0,
            creditAmount: 0,
            description: 'No specific R&D credit available in this state'
          };
        }
        
        let creditAmount = Math.round(qreAmount * (stateInfo.rate / 100));
        if (stateInfo.maxCredit) {
          creditAmount = Math.min(creditAmount, stateInfo.maxCredit);
        }
        
        return {
          state,
          rate: stateInfo.rate,
          maxCredit: stateInfo.maxCredit,
          creditAmount,
          description: stateInfo.description
        };
      });

      // Calculate Payroll Tax Offset eligibility
      // Eligible if: gross receipts < $5M for 5-year period AND business < 5 years old
      const isSmallBusiness = companyInfo.annualRevenue.includes('Under $1M') || 
                             companyInfo.annualRevenue.includes('$1M - $5M');
      const isStartup = true; // We'd need founding year to calculate this properly
      
      const payrollTaxOffset = {
        eligible: isSmallBusiness && isStartup,
        maxOffset: 250000, // $250K annual limit
        effectiveOffset: 0,
        explanation: ''
      };
      
      if (payrollTaxOffset.eligible) {
        payrollTaxOffset.effectiveOffset = Math.min(federalCreditAmount, payrollTaxOffset.maxOffset);
        payrollTaxOffset.explanation = 'Your business qualifies for payroll tax offset based on revenue size. Up to $250,000 of federal R&D credits can offset payroll taxes instead of income taxes.';
      } else {
        payrollTaxOffset.explanation = 'Payroll tax offset is available for qualifying small businesses (under $5M gross receipts) that are less than 5 years old.';
      }

      // Calculate totals
      const totalStateCredits = stateCredits.reduce((sum, state) => sum + state.creditAmount, 0);
      const totalCredits = federalCreditAmount + totalStateCredits;
      const netBenefit = totalCredits + (payrollTaxOffset.eligible ? payrollTaxOffset.effectiveOffset : 0);

      const creditData = {
        totalQRE: qreAmount,
        federalCredit,
        stateCredits,
        payrollTaxOffset,
        totalCredits,
        netBenefit,
        companyInfo
      };

      res.json(creditData);
    } catch (error) {
      console.error('Credit calculation error:', error);
      res.status(500).json({ error: 'Failed to calculate credits' });
    }
  });

  app.post('/api/credits/generate-report', async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      console.log(`Credit report requested for ${email}`);
      
      res.json({ 
        success: true, 
        message: 'Credit calculation report generation initiated. You will receive an email when ready.' 
      });
    } catch (error) {
      console.error('Credit report generation error:', error);
      res.status(500).json({ error: 'Failed to generate credit report' });
    }
  });

  // Review Screen endpoints
  app.post('/api/review/data', async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      const airtableToken = process.env.AIRTABLE_API_KEY;
      const baseId = process.env.AIRTABLE_BASE_ID;

      if (!airtableToken || !baseId) {
        return res.status(500).json({ error: 'Airtable not configured' });
      }

      // Fetch all data in parallel
      const [companyResponse, submissionsResponse, wagesResponse, contractorsResponse, suppliesResponse, cloudResponse] = await Promise.all([
        fetch(`https://api.airtable.com/v0/${baseId}/Companies?filterByFormula=LOWER({Email})=LOWER('${email}')`, {
          headers: { 'Authorization': `Bearer ${airtableToken}`, 'Content-Type': 'application/json' },
        }),
        fetch(`https://api.airtable.com/v0/${baseId}/Submissions?filterByFormula=LOWER({Customer Email})=LOWER('${email}')`, {
          headers: { 'Authorization': `Bearer ${airtableToken}`, 'Content-Type': 'application/json' },
        }),
        fetch(`https://api.airtable.com/v0/${baseId}/Wages?filterByFormula=LOWER({Email})=LOWER('${email}')`, {
          headers: { 'Authorization': `Bearer ${airtableToken}`, 'Content-Type': 'application/json' },
        }),
        fetch(`https://api.airtable.com/v0/${baseId}/Contractors?filterByFormula=LOWER({Email})=LOWER('${email}')`, {
          headers: { 'Authorization': `Bearer ${airtableToken}`, 'Content-Type': 'application/json' },
        }),
        fetch(`https://api.airtable.com/v0/${baseId}/Supplies?filterByFormula=LOWER({Email})=LOWER('${email}')`, {
          headers: { 'Authorization': `Bearer ${airtableToken}`, 'Content-Type': 'application/json' },
        }),
        fetch(`https://api.airtable.com/v0/${baseId}/CloudSoftware?filterByFormula=LOWER({Email})=LOWER('${email}')`, {
          headers: { 'Authorization': `Bearer ${airtableToken}`, 'Content-Type': 'application/json' },
        })
      ]);

      // Parse all responses
      const [companyData, submissionsData, wagesData, contractorsData, suppliesData, cloudData] = await Promise.all([
        companyResponse.ok ? companyResponse.json() : { records: [] },
        submissionsResponse.ok ? submissionsResponse.json() : { records: [] },
        wagesResponse.ok ? wagesResponse.json() : { records: [] },
        contractorsResponse.ok ? contractorsResponse.json() : { records: [] },
        suppliesResponse.ok ? suppliesResponse.json() : { records: [] },
        cloudResponse.ok ? cloudResponse.json() : { records: [] }
      ]);

      // Process company information
      const companyInfo = companyData.records.length > 0 ? {
        companyName: companyData.records[0].fields['Company Name'] || '',
        ein: companyData.records[0].fields['EIN'] || '',
        entityType: companyData.records[0].fields['Entity Type'] || '',
        yearFounded: companyData.records[0].fields['Year Founded']?.toString() || '',
        annualRevenue: companyData.records[0].fields['Annual Revenue'] || '',
        employeeCount: companyData.records[0].fields['Employee Count'] || '',
        rdEmployeeCount: companyData.records[0].fields['R&D Employee Count']?.toString() || '',
        primaryState: companyData.records[0].fields['Primary State'] || '',
        rdStates: companyData.records[0].fields['R&D States'] || [],
        hasMultipleStates: companyData.records[0].fields['Has Multiple States'] || false,
      } : null;

      // Process R&D activities from submissions
      const rdActivities = submissionsData.records.length > 0 ? {
        businessDescription: submissionsData.records[0].fields['Business Description'] || '',
        rdActivities: submissionsData.records[0].fields['R&D Activities'] || '',
      } : null;

      // Process expenses
      const wages = wagesData.records.map((record: any) => ({
        employeeName: record.fields['Employee Name'] || 'Unknown',
        role: record.fields['Role'] || 'Not specified',
        annualSalary: parseFloat(record.fields['Annual Salary']) || 0,
        rdPercentage: parseFloat(record.fields['R&D Percentage']) || 0,
        rdAmount: (parseFloat(record.fields['Annual Salary']) || 0) * (parseFloat(record.fields['R&D Percentage']) || 0) / 100
      }));

      const contractors = contractorsData.records.map((record: any) => ({
        contractorName: record.fields['Contractor Name'] || 'Unknown',
        amount: parseFloat(record.fields['Amount']) || 0,
        qualifiedAmount: (parseFloat(record.fields['Amount']) || 0) * 0.65,
        description: record.fields['Description'] || 'No description'
      }));

      const supplies = suppliesData.records.map((record: any) => ({
        supplyType: record.fields['Supply Type'] || 'Unknown',
        amount: parseFloat(record.fields['Amount']) || 0,
        rdPercentage: parseFloat(record.fields['R&D Percentage']) || 100,
        rdAmount: (parseFloat(record.fields['Amount']) || 0) * (parseFloat(record.fields['R&D Percentage']) || 100) / 100
      }));

      const cloudSoftware = cloudData.records.map((record: any) => {
        const monthlyCost = parseFloat(record.fields['Monthly Cost']) || 0;
        const rdPercentage = parseFloat(record.fields['R&D Percentage']) || 100;
        return {
          serviceName: record.fields['Service Name'] || 'Unknown',
          annualCost: monthlyCost * 12,
          rdPercentage,
          qualifiedAmount: (monthlyCost * 12 * rdPercentage) / 100
        };
      });

      // Calculate totals
      const wagesTotals = wages.reduce((sum, wage) => sum + wage.rdAmount, 0);
      const contractorsTotals = contractors.reduce((sum, contractor) => sum + contractor.qualifiedAmount, 0);
      const suppliesTotals = supplies.reduce((sum, supply) => sum + supply.rdAmount, 0);
      const cloudSoftwareTotals = cloudSoftware.reduce((sum, cloud) => sum + cloud.qualifiedAmount, 0);
      const grandTotal = wagesTotals + contractorsTotals + suppliesTotals + cloudSoftwareTotals;

      const expenses = {
        wages,
        contractors,
        supplies,
        cloudSoftware,
        totals: {
          wages: Math.round(wagesTotals),
          contractors: Math.round(contractorsTotals),
          supplies: Math.round(suppliesTotals),
          cloudSoftware: Math.round(cloudSoftwareTotals),
          grandTotal: Math.round(grandTotal)
        }
      };

      // Calculate completion status
      let companyScore = 0;
      let rdScore = 0;
      let expenseScore = 0;

      if (companyInfo) {
        if (companyInfo.companyName) companyScore += 25;
        if (companyInfo.entityType) companyScore += 25;
        if (companyInfo.ein) companyScore += 25;
        if (companyInfo.primaryState) companyScore += 25;
      }

      if (rdActivities) {
        if (rdActivities.businessDescription) rdScore += 50;
        if (rdActivities.rdActivities) rdScore += 50;
      }

      if (expenses.totals.grandTotal > 0) {
        expenseScore = Math.min(100, (wages.length + contractors.length + supplies.length + cloudSoftware.length) * 10);
      }

      const completionStatus = {
        companyInfo: companyScore,
        rdActivities: rdScore,
        expenses: expenseScore,
        canGenerate: companyScore === 100 && rdScore === 100
      };

      const reviewData = {
        companyInfo,
        rdActivities,
        expenses,
        completionStatus
      };

      res.json(reviewData);
    } catch (error) {
      console.error('Review data error:', error);
      res.status(500).json({ error: 'Failed to load review data' });
    }
  });

  app.post('/api/review/generate-documents', async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      const airtableToken = process.env.AIRTABLE_API_KEY;
      const baseId = process.env.AIRTABLE_BASE_ID;
      const makeWebhookUrl = process.env.MAKE_WEBHOOK_URL;

      if (!airtableToken || !baseId) {
        return res.status(500).json({ error: 'Airtable not configured' });
      }

      if (!makeWebhookUrl) {
        return res.status(500).json({ error: 'Make.com webhook not configured' });
      }

      console.log(`Document generation requested for ${email}`);

      // Fetch all user data from Airtable to send to Make.com
      const [customerResponse, companyResponse, submissionsResponse, wagesResponse, contractorsResponse, suppliesResponse, cloudResponse] = await Promise.all([
        fetch(`https://api.airtable.com/v0/${baseId}/Customers?filterByFormula=LOWER({Email})=LOWER('${email}')`, {
          headers: { 'Authorization': `Bearer ${airtableToken}`, 'Content-Type': 'application/json' },
        }),
        fetch(`https://api.airtable.com/v0/${baseId}/Companies?filterByFormula=LOWER({Email})=LOWER('${email}')`, {
          headers: { 'Authorization': `Bearer ${airtableToken}`, 'Content-Type': 'application/json' },
        }),
        fetch(`https://api.airtable.com/v0/${baseId}/Submissions?filterByFormula=LOWER({Customer Email})=LOWER('${email}')`, {
          headers: { 'Authorization': `Bearer ${airtableToken}`, 'Content-Type': 'application/json' },
        }),
        fetch(`https://api.airtable.com/v0/${baseId}/Wages?filterByFormula=LOWER({Email})=LOWER('${email}')`, {
          headers: { 'Authorization': `Bearer ${airtableToken}`, 'Content-Type': 'application/json' },
        }),
        fetch(`https://api.airtable.com/v0/${baseId}/Contractors?filterByFormula=LOWER({Email})=LOWER('${email}')`, {
          headers: { 'Authorization': `Bearer ${airtableToken}`, 'Content-Type': 'application/json' },
        }),
        fetch(`https://api.airtable.com/v0/${baseId}/Supplies?filterByFormula=LOWER({Email})=LOWER('${email}')`, {
          headers: { 'Authorization': `Bearer ${airtableToken}`, 'Content-Type': 'application/json' },
        }),
        fetch(`https://api.airtable.com/v0/${baseId}/CloudSoftware?filterByFormula=LOWER({Email})=LOWER('${email}')`, {
          headers: { 'Authorization': `Bearer ${airtableToken}`, 'Content-Type': 'application/json' },
        })
      ]);

      const [customerData, companyData, submissionsData, wagesData, contractorsData, suppliesData, cloudData] = await Promise.all([
        customerResponse.ok ? customerResponse.json() : { records: [] },
        companyResponse.ok ? companyResponse.json() : { records: [] },
        submissionsResponse.ok ? submissionsResponse.json() : { records: [] },
        wagesResponse.ok ? wagesResponse.json() : { records: [] },
        contractorsResponse.ok ? contractorsResponse.json() : { records: [] },
        suppliesResponse.ok ? suppliesResponse.json() : { records: [] },
        cloudResponse.ok ? cloudResponse.json() : { records: [] }
      ]);

      // Prepare comprehensive data package for Make.com
      const customerInfo = customerData.records.length > 0 ? customerData.records[0].fields : {};
      const companyInfo = companyData.records.length > 0 ? companyData.records[0].fields : {};
      const submissionInfo = submissionsData.records.length > 0 ? submissionsData.records[0].fields : {};

      // Calculate QRE totals for Make.com
      const wages = wagesData.records.map((record: any) => {
        const annualSalary = parseFloat(record.fields['Annual Salary']) || 0;
        const rdPercentage = parseFloat(record.fields['R&D Percentage']) || 0;
        return {
          ...record.fields,
          qualifiedAmount: (annualSalary * rdPercentage) / 100
        };
      });

      const contractors = contractorsData.records.map((record: any) => {
        const amount = parseFloat(record.fields['Amount']) || 0;
        return {
          ...record.fields,
          qualifiedAmount: amount * 0.65
        };
      });

      const supplies = suppliesData.records.map((record: any) => {
        const amount = parseFloat(record.fields['Amount']) || 0;
        const rdPercentage = parseFloat(record.fields['R&D Percentage']) || 100;
        return {
          ...record.fields,
          qualifiedAmount: (amount * rdPercentage) / 100
        };
      });

      const cloudSoftware = cloudData.records.map((record: any) => {
        const monthlyCost = parseFloat(record.fields['Monthly Cost']) || 0;
        const rdPercentage = parseFloat(record.fields['R&D Percentage']) || 100;
        return {
          ...record.fields,
          qualifiedAmount: (monthlyCost * 12 * rdPercentage) / 100
        };
      });

      // Calculate totals
      const totalQRE = wages.reduce((sum, w) => sum + w.qualifiedAmount, 0) +
                      contractors.reduce((sum, c) => sum + c.qualifiedAmount, 0) +
                      supplies.reduce((sum, s) => sum + s.qualifiedAmount, 0) +
                      cloudSoftware.reduce((sum, cs) => sum + cs.qualifiedAmount, 0);

      const federalCredit = Math.round(totalQRE * 0.065); // 6.5% federal credit

      // Prepare payload for Make.com webhook
      const makePayload = {
        timestamp: new Date().toISOString(),
        customerEmail: email,
        customerInfo: {
          name: customerInfo['Name'] || '',
          email: customerInfo['Email'] || email,
          planType: customerInfo['Plan Type'] || '',
          totalPaid: customerInfo['Total Paid'] || 0,
          selectedYears: customerInfo['Selected Years'] || []
        },
        companyInfo: {
          companyName: companyInfo['Company Name'] || '',
          ein: companyInfo['EIN'] || '',
          entityType: companyInfo['Entity Type'] || '',
          yearFounded: companyInfo['Year Founded'] || '',
          annualRevenue: companyInfo['Annual Revenue'] || '',
          employeeCount: companyInfo['Employee Count'] || '',
          rdEmployeeCount: companyInfo['R&D Employee Count'] || '',
          primaryState: companyInfo['Primary State'] || '',
          rdStates: companyInfo['R&D States'] || []
        },
        rdActivities: {
          businessDescription: submissionInfo['Business Description'] || '',
          rdActivities: submissionInfo['R&D Activities'] || ''
        },
        expenses: {
          wages: wages,
          contractors: contractors,
          supplies: supplies,
          cloudSoftware: cloudSoftware,
          totals: {
            wagesTotal: wages.reduce((sum, w) => sum + w.qualifiedAmount, 0),
            contractorsTotal: contractors.reduce((sum, c) => sum + c.qualifiedAmount, 0),
            suppliesTotal: supplies.reduce((sum, s) => sum + s.qualifiedAmount, 0),
            cloudSoftwareTotal: cloudSoftware.reduce((sum, cs) => sum + cs.qualifiedAmount, 0),
            totalQRE: totalQRE
          }
        },
        credits: {
          federalCredit: federalCredit,
          federalCreditRate: 6.5,
          estimatedTotalBenefit: federalCredit
        },
        documentRequest: {
          requestedAt: new Date().toISOString(),
          documentTypes: [
            'qre_calculation_report',
            'federal_credit_analysis',
            'state_credit_breakdown', 
            'form_6765_worksheets',
            'supporting_documentation',
            'compliance_checklist'
          ],
          deliveryEmail: email
        }
      };

      // Send to Make.com webhook
      const makeResponse = await fetch(makeWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(makePayload),
      });

      if (!makeResponse.ok) {
        const errorText = await makeResponse.text();
        console.error('Make.com webhook error:', errorText);
        throw new Error(`Make.com webhook failed: ${makeResponse.status}`);
      }

      console.log(`✅ Document generation initiated for ${email} via Make.com`);
      
      res.json({ 
        success: true, 
        message: 'Document generation started. Claude AI is creating your narrative and Documint is preparing your forms.',
        estimatedCompletion: '5-10 minutes',
        trackingId: `doc_${Date.now()}_${email.split('@')[0]}`
      });
    } catch (error: any) {
      console.error('Document generation error:', error);
      res.status(500).json({ 
        error: 'Failed to generate documents',
        details: error.message 
      });
    }
  });

  // Document generation status endpoint
  app.post('/api/review/document-status', async (req, res) => {
    try {
      const { email, trackingId } = req.body;
      
      if (!email || !trackingId) {
        return res.status(400).json({ error: 'Email and tracking ID are required' });
      }

      // In a real implementation, this would check status from Make.com or a database
      // For now, we'll simulate progress updates
      const elapsed = Date.now() - parseInt(trackingId.split('_')[1]);
      const minutes = Math.floor(elapsed / 60000);
      
      let status = 'processing';
      let progress = Math.min(95, Math.floor((elapsed / 1000) / 6)); // Simulate progress over 10 minutes
      let currentStep = 'Initializing...';
      
      if (elapsed < 30000) { // First 30 seconds
        currentStep = 'Collecting your data...';
        progress = 10;
      } else if (elapsed < 120000) { // First 2 minutes
        currentStep = 'Claude AI is analyzing your R&D activities...';
        progress = 25;
      } else if (elapsed < 240000) { // First 4 minutes
        currentStep = 'Generating narrative documentation...';
        progress = 50;
      } else if (elapsed < 420000) { // First 7 minutes
        currentStep = 'Documint is creating your tax forms...';
        progress = 75;
      } else if (elapsed < 600000) { // First 10 minutes
        currentStep = 'Finalizing documents and preparing delivery...';
        progress = 90;
      } else {
        status = 'completed';
        progress = 100;
        currentStep = 'Documents delivered to your email!';
      }
      
      res.json({
        status,
        progress,
        currentStep,
        estimatedTimeRemaining: Math.max(0, 10 - minutes) + ' minutes'
      });
    } catch (error) {
      console.error('Document status error:', error);
      res.status(500).json({ error: 'Failed to get document status' });
    }
  });

  // Document management endpoints
  app.post('/api/documents/list', async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      const airtableToken = process.env.AIRTABLE_API_KEY;
      const baseId = process.env.AIRTABLE_BASE_ID;

      if (!airtableToken || !baseId) {
        return res.status(500).json({ error: 'Airtable not configured' });
      }

      // Check for Documents table in Airtable
      const response = await fetch(`https://api.airtable.com/v0/${baseId}/Documents?filterByFormula=LOWER({Customer Email})=LOWER('${email}')&sort%5B0%5D%5Bfield%5D=Uploaded%20At&sort%5B0%5D%5Bdirection%5D=desc`, {
        headers: {
          'Authorization': `Bearer ${airtableToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch documents from Airtable');
      }

      const data = await response.json();
      
      // Transform Airtable data to frontend format
      const documents = data.records?.map((record: any) => {
        const fields = record.fields;
        return {
          id: record.id,
          fileName: fields['File Name'] || '',
          displayName: getDocumentDisplayName(fields['File Type'] || ''),
          fileType: fields['File Type'] || '',
          description: getDocumentDescription(fields['File Type'] || ''),
          size: fields['File Size'] || 0,
          uploadedAt: fields['Uploaded At'] || new Date().toISOString(),
          downloadUrl: fields['Download URL'] || '',
          downloadCount: fields['Download Count'] || 0,
          lastDownloaded: fields['Last Downloaded'] || null,
        };
      }) || [];
      
      res.json({ documents });
    } catch (error: any) {
      console.error('Document list error:', error);
      res.status(500).json({ 
        error: 'Failed to load documents',
        details: error.message 
      });
    }
  });

  // Helper functions for document display
  function getDocumentDisplayName(fileType: string): string {
    switch (fileType) {
      case 'form_6765':
        return 'Form 6765 - Credit for Increasing Research Activities';
      case 'technical_narrative':
        return 'Technical Narrative & R&D Documentation';
      case 'qre_workbook':
        return 'QRE Calculation Workbook';
      case 'compliance_memo':
        return 'Tax Compliance Memo';
      case 'recordkeeping_checklist':
        return 'Record-keeping & Documentation Checklist';
      default:
        return 'R&D Tax Credit Document';
    }
  }

  function getDocumentDescription(fileType: string): string {
    switch (fileType) {
      case 'form_6765':
        return 'Official IRS form for claiming the federal R&D tax credit';
      case 'technical_narrative':
        return 'Detailed narrative explaining your qualifying R&D activities and technological challenges';
      case 'qre_workbook':
        return 'Excel workbook with detailed QRE calculations and supporting schedules';
      case 'compliance_memo':
        return 'Professional memo outlining compliance requirements and filing instructions';
      case 'recordkeeping_checklist':
        return 'Comprehensive checklist for maintaining proper R&D credit documentation';
      default:
        return 'Supporting documentation for your R&D tax credit claim';
    }
  }

  // Track document downloads in Airtable
  app.post('/api/documents/track-download', async (req, res) => {
    try {
      const { email, documentId, fileName, fileType } = req.body;
      
      if (!email || !documentId) {
        return res.status(400).json({ error: 'Email and document ID are required' });
      }

      const airtableToken = process.env.AIRTABLE_API_KEY;
      const baseId = process.env.AIRTABLE_BASE_ID;

      if (!airtableToken || !baseId) {
        return res.status(500).json({ error: 'Airtable not configured' });
      }

      // First, get the current download count
      const getResponse = await fetch(`https://api.airtable.com/v0/${baseId}/Documents/${documentId}`, {
        headers: {
          'Authorization': `Bearer ${airtableToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!getResponse.ok) {
        console.warn('Could not get current download count');
        return res.status(200).json({ success: true }); // Don't fail the download
      }

      const currentDoc = await getResponse.json();
      const currentCount = currentDoc.fields['Download Count'] || 0;

      // Update the document with incremented download count and last downloaded timestamp
      const updateResponse = await fetch(`https://api.airtable.com/v0/${baseId}/Documents/${documentId}`, {
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
              'Customer Email': email,
              'Document ID': documentId,
              'File Name': fileName || '',
              'File Type': fileType || '',
              'Downloaded At': new Date().toISOString(),
              'Download Date': new Date().toISOString().split('T')[0],
            },
          }),
        });
      } catch (error) {
        console.warn('Downloads table may not exist, skipping download event logging');
      }
      
      res.json({ success: true });
    } catch (error: any) {
      console.error('Download tracking error:', error);
      res.status(500).json({ 
        error: 'Failed to track download',
        details: error.message 
      });
    }
  });

  // Development-only endpoint to create test customer for login testing
  if (process.env.NODE_ENV !== 'production') {
    app.post('/api/dev/create-test-customer', async (req, res) => {
      try {
        const { email } = req.body;
        
        if (!email) {
          return res.status(400).json({ error: 'Email is required' });
        }

        const accessToken = uuidv4();
        const testCustomerData = {
          email,
          name: 'Test Customer',
          purchaseDate: new Date().toISOString().split('T')[0],
          planType: 'Growth ($10K-$50K Credit)',
          stripeCustomerId: 'test_customer_dev',
          totalPaid: 750,
          selectedYears: '2025',
          accessToken
        };

        // Add to Airtable (this will work even in dev)
        await addToAirtableCustomers(testCustomerData);
        
        console.log(`✅ Created test customer: ${email} with access token: ${accessToken}`);
        
        res.json({ 
          success: true, 
          message: `Test customer created for ${email}`,
          accessToken,
          loginUrl: `/login`
        });
      } catch (error: any) {
        console.error('Failed to create test customer:', error);
        res.status(500).json({ error: 'Failed to create test customer' });
      }
    });
  }

  const httpServer = createServer(app);

  return httpServer;
}
