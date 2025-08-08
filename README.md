# R&D Tax Credit Platform

A self-serve software product that helps small businesses in the U.S. claim the R&D tax credit using AI and automation. We guide businesses from discovery through document delivery in a fully automated workflow.

## 🎯 Product Overview

Most small business owners don't know the R&D tax credit exists. Our platform provides:

1. **Education** - Learn about eligibility
2. **Estimation** - Calculate potential credits
3. **Payment** - Tiered pricing based on credit size
4. **Documentation** - AI-generated IRS-compliant documents
5. **Delivery** - Secure dashboard with all tax documents

## 🚀 User Journey

### 1️⃣ Discovery & Lead Capture
- Marketing landing page with educational content
- Interactive R&D Tax Credit Calculator
- Real-time credit estimation
- Dynamic pricing based on credit amount
- Email capture for lead nurturing

### 2️⃣ Purchase Flow
- Stripe checkout with tier-based pricing
- Multi-year options (2022, 2023, 2024)
- Immediate access to secure dashboard
- Success confirmation with next steps

### 3️⃣ Data Collection
- Secure customer dashboard
- Multi-step intake form
- Business details and expense collection
- Qualifying R&D activities documentation
- Progress tracking with checklist UI

### 4️⃣ AI Document Generation
- Automated workflow via Make.com
- Claude AI generates:
  - Technical Narrative (IRS requirement)
  - Compliance Memorandum
- Documint creates:
  - IRS Form 6765
  - Section 174A deduction summary
  - State forms (e.g., PA REV-545A)
  - Filing instructions
  - Recordkeeping checklist

### 5️⃣ Secure Delivery
- Documents uploaded to Amazon S3
- Pre-signed URLs for secure access
- Email notification when ready
- Dashboard download center

## 💰 Pricing Tiers

Dynamic pricing based on estimated credit amount:

| Tier | Credit Range | Price | Features |
|------|-------------|-------|----------|
| Tier 1 | < $10,000 | $500 | All documents, 1 year |
| Tier 2 | $10,000 - $50,000 | $750 | All documents, 1 year |
| Tier 3 | > $50,000 | $1,000 | All documents, 1 year |

Multi-year discount: 20% off additional years

## 🛠️ Technical Architecture

### Frontend (React + Tailwind)
- **Landing Page**: Marketing and education
- **Calculator**: Multi-step credit estimation
- **Checkout**: Stripe integration
- **Dashboard**: Customer portal
- **Intake Form**: Data collection wizard

### Backend Services
- **Express.js**: API and webhook handling
- **Airtable**: Customer and form data storage
- **PostgreSQL**: Session management
- **Stripe**: Payment processing
- **SendGrid**: Transactional emails

### Automation Pipeline
- **Make.com**: Orchestrates document generation
- **Claude API**: AI narrative writing
- **Documint**: PDF form generation
- **Amazon S3**: Secure file storage

## 📋 Setup Instructions

### Prerequisites
- Node.js 18+
- Airtable account with base configured
- Stripe account with products/prices
- SendGrid account with verified sender
- Make.com account (for automation)
- AWS account with S3 bucket

### Environment Variables

Create `.env` file:

```bash
# Core Services
DATABASE_URL=postgresql://...
AIRTABLE_API_KEY=key...
AIRTABLE_BASE_ID=app...

# Payment
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
SENDGRID_API_KEY=SG...
SENDGRID_FROM_EMAIL=hello@company.com

# Analytics
VITE_GA_MEASUREMENT_ID=G-BLR8DKLFN1

# Future Integrations (via Make.com)
MAKE_WEBHOOK_URL=https://hook.us1.make.com/...
```

### Quick Start

1. Clone repository
```bash
git clone [repo-url]
cd rd-tax-credit-saas
```

2. Install dependencies
```bash
npm install
```

3. Configure Airtable base (see docs/AIRTABLE_SCHEMA.md)

4. Set up Stripe products:
   - Create 3 products for each tier
   - Add prices for each tax year
   - Configure webhook endpoint

5. Run development server
```bash
npm run dev
```

## 📊 Key Metrics

Track these KPIs in Google Analytics:

- **Conversion Rate**: Calculator → Checkout → Purchase
- **Credit Range Distribution**: Which tiers are most common
- **Multi-year Adoption**: % choosing multiple years
- **Time to Complete**: Intake form completion time
- **Document Generation**: Success rate and timing

## 🔒 Security & Compliance

- PCI compliance via Stripe
- Encrypted data transmission
- Secure S3 storage with expiring URLs
- Email-based authentication
- Session management
- Input validation on all forms
- Rate limiting on API endpoints

## 🚢 Deployment

### Current: Replit
- Development environment
- Quick iteration and testing

### Production: Vercel
- Optimized React hosting
- Serverless API routes
- Custom domain support
- Global CDN

## 📈 Business Model

1. **Lead Generation**: Free calculator drives email capture
2. **Conversion**: Education → Estimation → Purchase
3. **Fulfillment**: Automated document generation
4. **Retention**: Annual filing updates

## 🤝 Support

- In-app help documentation
- Email support: support@[yourdomain].com
- FAQ section in dashboard

## 📝 Legal

- Privacy Policy required for data collection
- Terms of Service for SaaS agreement
- Disclaimer: Not tax advice, preparation service only

---

Built with ❤️ to help small businesses claim their R&D tax credits