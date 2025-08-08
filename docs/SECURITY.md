# Security & Compliance Guide

## Overview

This document outlines security measures for handling sensitive tax and financial data.

## Data Classification

### Highly Sensitive
- Social Security Numbers (if collected)
- Bank account information
- Full tax returns

### Sensitive  
- EIN numbers
- Revenue figures
- Employee salaries
- Email addresses

### Internal Use
- Calculation results
- Document metadata
- System logs

## Security Measures

### Application Security

#### Authentication
- Email-based authentication
- Session management with secure cookies
- Automatic session expiry (24 hours)
- No password storage (magic links planned)

#### Authorization
- Users can only access their own data
- API endpoints verify ownership
- Admin panel separated (future)

#### Input Validation
- Zod schemas on all inputs
- Sanitization of user content
- SQL injection prevention (parameterized queries)
- XSS prevention (React escaping)

### API Security

#### Rate Limiting
- General API: 100 req/15 min
- Login: 5 req/15 min  
- Report generation: 10 req/hour

#### Webhook Security
- Stripe signature verification
- Make.com webhook authentication
- Request origin validation

### Data Protection

#### In Transit
- HTTPS everywhere (enforced by Vercel/Replit)
- TLS 1.2+ only
- Certificate pinning for mobile (future)

#### At Rest
- S3 server-side encryption
- Database encryption (Neon/Airtable)
- No local file storage

#### Access Control
- S3 pre-signed URLs (7 day expiry)
- IAM roles for service access
- Principle of least privilege

### Third-Party Security

#### Stripe
- PCI DSS Level 1 certified
- No card data stored locally
- Tokenization for payments

#### Airtable
- SOC 2 Type II certified
- Encrypted at rest
- Access via API key only

#### SendGrid
- Email authentication (SPF/DKIM)
- Unsubscribe compliance
- No email content logging

## Compliance

### Tax Data Handling
- Follow IRS Publication 4557
- Retain records for 7 years
- Provide audit trail

### Privacy Regulations
- Privacy Policy required
- Data deletion on request
- California privacy rights

### Industry Standards
- OWASP Top 10 compliance
- Regular security updates
- Dependency scanning

## Incident Response

### Detection
- Error monitoring (Winston)
- Anomaly detection in GA
- Customer reports

### Response Plan
1. Identify scope
2. Contain issue
3. Notify affected users
4. Fix vulnerability
5. Post-mortem analysis

### Contact
- Security issues: security@[domain]
- Response time: < 24 hours

## Development Security

### Code Practices
- No secrets in code
- Environment variables only
- Code review for security
- Regular dependency updates

### Testing
- Security headers test
- Input validation testing  
- API authentication testing
- Rate limit testing

## Audit Checklist

Monthly:
- [ ] Review access logs
- [ ] Check failed logins
- [ ] Update dependencies
- [ ] Test backups

Quarterly:
- [ ] Security scan
- [ ] Review permissions
- [ ] Update documentation
- [ ] Staff training