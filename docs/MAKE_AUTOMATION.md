# Make.com Automation Workflows

## Overview

Make.com orchestrates the document generation pipeline after intake form submission. This creates a fully automated flow from data collection to document delivery.

## Main Workflow: Document Generation Pipeline

### Trigger
Webhook from Express API when intake form is completed
- Endpoint: `POST /api/intake/complete`
- Payload: `{ customerId, companyId, email }`

### Workflow Steps

#### 1. Data Aggregation Module
**Airtable - Search Records**
- Get customer record
- Get company information  
- Get all wages records
- Get all expenses records
- Calculate totals

Output:
```json
{
  "customer": { /* customer data */ },
  "company": { /* company data */ },
  "totalQRE": 250000,
  "federalCredit": 16250,
  "wages": [ /* wage records */ ],
  "expenses": [ /* expense records */ ]
}
```

#### 2. Claude AI - Technical Narrative
**HTTP - Make a Request**
- URL: `https://api.anthropic.com/v1/messages`
- Method: POST
- Headers: 
  - `x-api-key: {{CLAUDE_API_KEY}}`
  - `anthropic-version: 2023-06-01`

Prompt Template:
```
Generate a comprehensive IRS-compliant technical narrative for R&D tax credit documentation.

Company Information:
- Name: {{company.name}}
- Industry: {{company.industry}}
- Founded: {{company.yearFounded}}

R&D Activities:
{{company.rdActivities}}

The narrative must address all four tests:
1. Permitted Purpose
2. Technological in Nature  
3. Technical Uncertainty
4. Process of Experimentation

Format as a professional technical document with sections for each test.
```

#### 3. Claude AI - Compliance Memo
**HTTP - Make a Request**
Similar setup, different prompt:
```
Generate a compliance memorandum explaining the R&D tax credit calculation.

Qualified Research Expenses: ${{totalQRE}}
Federal Credit Calculated: ${{federalCredit}}
Tax Year: {{taxYear}}

Include:
- Calculation methodology
- IRC Section 41 compliance
- Documentation standards
- Record retention requirements
```

#### 4. Documint - Form Generation
**Documint - Create Document**

Templates needed:
1. **IRS Form 6765**
   - Map QRE amounts to form fields
   - Calculate credit using simplified method
   
2. **Section 174A Summary**
   - List all deductible R&D expenses
   - Provide amortization schedule
   
3. **State Forms** (if applicable)
   - PA REV-545A
   - Other state credits

#### 5. S3 Upload Module
**AWS S3 - Upload Files**

For each document:
- Bucket: `{{S3_BUCKET}}`
- Key: `/customers/{{customerId}}/{{year}}/{{filename}}`
- ACL: private
- Generate pre-signed URL (7 days)

#### 6. Airtable Update
**Airtable - Create Records**

In Documents table:
```json
{
  "customer_id": ["{{customerId}}"],
  "document_type": "{{type}}",
  "document_name": "{{filename}}",
  "s3_url": "{{presignedUrl}}",
  "generated_date": "{{now}}",
  "expires_date": "{{now + 7 days}}",
  "status": "generated"
}
```

Update customer record:
- `documents_ready`: true
- `generation_date`: now

#### 7. SendGrid Email
**SendGrid - Send Email**

Template: "Documents Ready"
- To: {{customer.email}}
- Subject: "Your R&D Tax Credit Documents Are Ready"
- Dynamic data:
  - Customer name
  - Credit amount
  - Document list
  - Dashboard link

### Error Handling

Each module includes:
1. **Retry Logic**: 3 attempts with exponential backoff
2. **Error Routes**: Separate path for failures
3. **Notifications**: Admin alerts for failures
4. **Fallback**: Queue for manual processing

### Monitoring

- Webhook logs in Make.com
- Execution history
- Error notifications to Slack/email
- Daily summary reports

## Additional Workflows

### Workflow 2: Stripe Payment Success
Triggers customer creation and welcome email

### Workflow 3: Document Expiry Warning
Runs daily to notify customers 24 hours before URLs expire

### Workflow 4: Annual Update Reminder
Triggers email campaigns for returning customers

## Testing

1. Use Make.com's test webhook feature
2. Create test records in Airtable
3. Verify each module output
4. Check final document quality
5. Confirm email delivery

## Cost Optimization

- Batch multiple customers when possible
- Cache Claude responses for similar cases
- Use S3 lifecycle rules for old documents
- Monitor API usage for each service