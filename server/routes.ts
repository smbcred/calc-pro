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
  total_paid: number;
  selected_years: string;
  uuid_token: string;
  timestamp: string;
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
        "Total Paid": data.total_paid,
        "Selected Years": data.selected_years.split(','),
        "UUID Token": data.uuid_token,
        "Timestamp": data.timestamp,
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

async function sendIntakeFormEmail(email: string, token: string) {
  const sendgridApiKey = process.env.SENDGRID_API_KEY;

  if (!sendgridApiKey) {
    console.error('Missing SendGrid API key');
    throw new Error('SendGrid not configured');
  }

  const baseUrl = process.env.REPLIT_DEV_DOMAIN 
    ? `https://${process.env.REPLIT_DEV_DOMAIN}` 
    : 'http://localhost:5000';

  const intakeUrl = `${baseUrl}/intake?token=${token}`;

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${sendgridApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: {
        email: 'noreply@rdcreditcalc.com',
        name: 'R&D Credit Calculator'
      },
      to: [{ email }],
      subject: 'Complete Your R&D Credit Filing - Secure Access Link',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Your R&D Credit Filing Package is Ready!</h2>
          
          <p>Thank you for your payment. To complete your R&D tax credit filing, we need some additional information about your business.</p>
          
          <p><strong>Next Step:</strong> Complete your secure intake form</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${intakeUrl}" 
               style="background: linear-gradient(to right, #2563eb, #16a34a); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 8px; 
                      font-weight: bold;
                      display: inline-block;">
              Complete Intake Form
            </a>
          </div>
          
          <p><strong>What to expect:</strong></p>
          <ul>
            <li>Entity information and business details</li>
            <li>R&D expense categorization</li>
            <li>Documentation requirements</li>
            <li>Timeline: 10-15 minutes to complete</li>
          </ul>
          
          <p><strong>Security:</strong> This link is unique to your order and expires in 30 days.</p>
          
          <p>Questions? Reply to this email or contact support@rdcreditcalc.com</p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">
            This email was sent because you completed a payment for R&D tax credit services. 
            If you did not make this purchase, please contact us immediately.
          </p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('SendGrid error:', error);
    throw new Error(`Failed to send email: ${error}`);
  }

  return response.json();
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Auth verification endpoint
  app.post('/api/auth/verify', async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      const customer = await storage.getCustomerByEmail(email);
      
      if (!customer) {
        return res.status(404).json({ error: 'Customer not found', hasAccess: false });
      }

      res.json({ 
        hasAccess: customer.hasAccess === 1,
        customer: {
          email: customer.email,
          totalPaid: customer.totalPaid,
          selectedYears: customer.selectedYears
        }
      });
    } catch (error) {
      console.error('Auth verification error:', error);
      res.status(500).json({ error: 'Authentication verification failed' });
    }
  });

  // Customer info endpoint
  app.post('/api/customer/info', async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      const customer = await storage.getCustomerByEmail(email);
      
      if (!customer || customer.hasAccess !== 1) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Get existing submissions
      const submissions = await storage.getIntakeSubmissionsByCustomer(customer.id);
      
      res.json({ 
        email: customer.email,
        totalPaid: customer.totalPaid,
        selectedYears: customer.selectedYears,
        hasSubmissions: submissions.length > 0,
        submissions: submissions.map(sub => ({
          id: sub.id,
          submissionStatus: sub.submissionStatus,
          submittedAt: sub.submittedAt
        }))
      });
    } catch (error) {
      console.error('Customer info error:', error);
      res.status(500).json({ error: 'Failed to load customer info' });
    }
  });

  // Intake form submission endpoint
  app.post('/api/intake/submit', async (req, res) => {
    try {
      const { email, formData } = req.body;
      
      if (!email || !formData) {
        return res.status(400).json({ error: 'Email and form data are required' });
      }

      const customer = await storage.getCustomerByEmail(email);
      
      if (!customer || customer.hasAccess !== 1) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Submit to Airtable
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

      // Store in database
      const submission = await storage.createIntakeSubmission({
        customerId: customer.id,
        formData: formData,
        airtableRecordId: airtableRecordId,
      });

      res.json({ success: true, submissionId: submission.id });
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
        const uuid_token = uuidv4();
        const timestamp = new Date().toISOString();

        if (!email) {
          console.error('No email found in session');
          return res.status(400).send('No email found in session');
        }

        // Create or update customer in database
        let customer = await storage.getCustomerByEmail(email);
        
        if (customer) {
          // Update existing customer
          customer = await storage.updateCustomerAccess(
            email, 
            true, // hasAccess = true
            session.id,
            totalPaid,
            selectedYears.split(',').filter(y => y.trim())
          );
        } else {
          // Create new customer
          customer = await storage.createCustomer({
            email: email,
            hasAccess: 1,
            stripeSessionId: session.id,
            totalPaid: totalPaid,
            selectedYears: selectedYears.split(',').filter(y => y.trim()),
          });
        }

        // Add to Airtable Customers table (for backward compatibility)
        await addToAirtableCustomers({
          email,
          total_paid: totalPaid,
          selected_years: selectedYears,
          uuid_token,
          timestamp
        });

        // Send intake form email
        await sendIntakeFormEmail(email, uuid_token);

        console.log(`Successfully processed payment for ${email}, customer ID: ${customer.id}, token: ${uuid_token}`);
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

  const httpServer = createServer(app);

  return httpServer;
}
