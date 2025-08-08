import express from 'express';
import { sendWelcomeEmail } from '../utils/airtable';
import { validate } from '../middleware/validate';
import { emailTestSchema, emailSendSchema } from '../validations';
import { asyncHandler, AppError, createInternalServerError } from '../middleware/errorHandler';

const router = express.Router();

// Email testing endpoint - only available in development
if (process.env.NODE_ENV !== 'production') {
  router.post('/test', validate(emailTestSchema), asyncHandler(async (req, res) => {
    const { email, name } = req.body;
    
    const sendgridApiKey = process.env.SENDGRID_API_KEY;
    
    if (!sendgridApiKey) {
      throw createInternalServerError('SENDGRID_API_KEY environment variable is missing');
    }

    console.log('Testing SendGrid configuration...');
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(sendgridApiKey);

    // Test with a simple message first
    const testMsg = {
      to: email,
      from: 'info@smbtaxcredits.com',
      subject: 'Test Email from R&D Tax Credit Dashboard',
      text: 'This is a test email to verify SendGrid configuration for the R&D tax credit dashboard.',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">SendGrid Test Email</h2>
          <p>This is a test email to verify that SendGrid is working correctly.</p>
          <p>If you receive this email, the integration is working!</p>
          <p><strong>Test Details:</strong></p>
          <ul>
            <li>Recipient: ${email}</li>
            <li>Name: ${name || 'Not provided'}</li>
            <li>Timestamp: ${new Date().toISOString()}</li>
            <li>Environment: ${process.env.NODE_ENV || 'development'}</li>
          </ul>
        </div>
      `,
    };

    await sgMail.send(testMsg);
    console.log(`✅ Test email sent successfully to: ${email}`);

    res.json({ 
      success: true, 
      message: `Test email sent successfully to ${email}`,
      details: {
        recipient: email,
        from: 'info@smbtaxcredits.com',
        timestamp: new Date().toISOString()
      }
    });
  }));
}

// Send welcome email endpoint
router.post('/welcome', validate(emailTestSchema), asyncHandler(async (req, res) => {
  const { email, name } = req.body;
  
  await sendWelcomeEmail(email, name);
  
  res.json({ 
    success: true,
    message: `Welcome email sent to ${email}`
  });
}));

// Send custom email endpoint (for internal use)
router.post('/send', validate(emailSendSchema), asyncHandler(async (req, res) => {
  const { to, subject, html, text } = req.body;
  
  const sendgridApiKey = process.env.SENDGRID_API_KEY;
  
  if (!sendgridApiKey) {
    throw createInternalServerError('SendGrid not configured');
  }

  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(sendgridApiKey);

  const msg = {
    to,
    from: 'info@smbtaxcredits.com',
    subject,
    text: text || '',
    html: html || text || '',
  };

  await sgMail.send(msg);
  console.log(`✅ Email sent successfully to: ${to}`);

  res.json({ 
    success: true,
    message: `Email sent successfully to ${to}`
  });
}));

export default router;