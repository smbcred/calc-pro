import express from 'express';
import Stripe from 'stripe';
import { v4 as uuidv4 } from 'uuid';
import { addToAirtableCustomers } from '../utils/airtable';

const router = express.Router();

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
} as any);

// Stripe Webhook handler
router.post('/stripe', async (req, res) => {
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

      // Add to Airtable Customers table with new schema
      await addToAirtableCustomers({
        email,
        name: customerName,
        accessToken,
        planType,
        stripeCustomerId: session.customer as string,
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
router.post('/checkout', async (req, res) => {
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
    res.status(500).json({ error: "Error creating checkout session: " + error.message });
  }
});

export default router;