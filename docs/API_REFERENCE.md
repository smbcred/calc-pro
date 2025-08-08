# API Reference Guide

## Overview

The R&D Tax Credit Platform API provides programmatic access to:
- User authentication
- R&D credit calculations
- Company data management
- Expense tracking
- Document generation

Base URL: `https://api.yourdomain.com`

## Interactive Documentation

Visit `/api-docs` on any deployment to access interactive Swagger documentation where you can:
- View all available endpoints
- See request/response schemas
- Try out API calls directly
- Download OpenAPI specification

## Authentication

The API uses session-based authentication:

1. Call `/api/auth/verify` with user email
2. Session cookie is set automatically
3. Include cookie in subsequent requests
4. Call `/api/auth/logout` to end session

## Rate Limits

- General API: 100 requests per 15 minutes per IP
- Login endpoint: 5 requests per 15 minutes per IP
- Calculator: 50 requests per hour per IP
- Report generation: 10 requests per hour per user

## Error Handling

All errors follow this format:

```json
{
  "error": "Human-readable error message",
  "details": [
    {
      "field": "fieldName",
      "message": "Specific validation error"
    }
  ]
}
```

### Common Response Codes

- **200** - Success
- **400** - Bad request (validation error)
- **401** - Unauthorized (not logged in)
- **403** - Forbidden (no access to resource)
- **404** - Resource not found
- **429** - Too many requests
- **500** - Internal server error

## Webhooks

### Stripe Webhook
Configure in Stripe Dashboard:
- **Endpoint**: `https://api.yourdomain.com/webhooks/stripe`
- **Events**: `payment_intent.succeeded`, `checkout.session.completed`

### Make.com Webhook
Configure in Make.com:
- **Endpoint**: `https://api.yourdomain.com/webhooks/make`
- **Method**: POST
- **Headers**: `X-Webhook-Secret: [your-secret]`

## SDKs and Code Examples

### JavaScript/TypeScript

```typescript
class RdTaxCreditAPI {
  private baseURL: string;
  
  constructor(baseURL = 'https://api.yourdomain.com') {
    this.baseURL = baseURL;
  }
  
  async login(email: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/api/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email })
    });
    
    if (!response.ok) {
      throw new Error('Login failed');
    }
  }
  
  async calculateCredit(inputs: CalculatorInput): Promise<CalculatorResult> {
    const response = await fetch(`${this.baseURL}/api/calculator/estimate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(inputs)
    });
    
    return response.json();
  }
}
```

### Python

```python
import requests

class RdTaxCreditAPI:
    def __init__(self, base_url='https://api.yourdomain.com'):
        self.base_url = base_url
        self.session = requests.Session()
    
    def login(self, email):
        response = self.session.post(
            f'{self.base_url}/api/auth/verify',
            json={'email': email}
        )
        response.raise_for_status()
    
    def calculate_credit(self, wages, wage_rd_percent, contractors=0, 
                        contractor_rd_percent=0, supplies=0, supplies_rd_percent=0):
        response = self.session.post(
            f'{self.base_url}/api/calculator/estimate',
            json={
                'wages': wages,
                'wageRdPercent': wage_rd_percent,
                'contractors': contractors,
                'contractorRdPercent': contractor_rd_percent,
                'supplies': supplies,
                'suppliesRdPercent': supplies_rd_percent
            }
        )
        return response.json()
```

## Testing

Use these test credit card numbers in development:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Requires auth**: `4000 0025 0000 3155`

## Support

- **API Status**: https://status.yourdomain.com
- **Developer Forum**: https://forum.yourdomain.com
- **Email**: api-support@yourdomain.com

## Quick Start Example

```javascript
// Initialize API client
const api = new RdTaxCreditAPI();

// Authenticate user
await api.login('user@example.com');

// Calculate R&D credit
const result = await api.calculateCredit({
  wages: 500000,
  wageRdPercent: 80,
  contractors: 100000,
  contractorRdPercent: 100,
  supplies: 50000,
  suppliesRdPercent: 100
});

console.log(`Federal Credit: $${result.federalCredit}`);
console.log(`Service Price: $${result.price}`);
console.log(`Your Savings: $${result.savingsAmount}`);
```