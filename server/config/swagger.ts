import swaggerJsdoc from 'swagger-jsdoc';
import { version } from '../../package.json';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'R&D Tax Credit Platform API',
      version,
      description: 'API documentation for the R&D Tax Credit SaaS platform. This API handles customer authentication, company data collection, expense tracking, and document generation for R&D tax credit claims.',
      contact: {
        name: 'API Support',
        email: 'api@yourdomain.com',
      },
      license: {
        name: 'Proprietary',
        url: 'https://yourdomain.com/terms',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Development server',
      },
      {
        url: 'https://api.yourdomain.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        sessionAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'connect.sid',
          description: 'Session-based authentication using cookies',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message',
            },
            details: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        CompanyInfo: {
          type: 'object',
          required: ['companyName', 'ein', 'entityType', 'annualRevenue', 'employeeCount'],
          properties: {
            companyName: {
              type: 'string',
              example: 'Acme AI Corp',
              description: 'Legal company name',
            },
            ein: {
              type: 'string',
              pattern: '^\\d{2}-\\d{7}$',
              example: '12-3456789',
              description: 'Employer Identification Number',
            },
            entityType: {
              type: 'string',
              enum: ['c-corp', 's-corp', 'llc', 'partnership', 'other'],
              example: 'c-corp',
            },
            yearFounded: {
              type: 'string',
              pattern: '^\\d{4}$',
              example: '2020',
            },
            annualRevenue: {
              type: 'string',
              example: '1000000',
              description: 'Annual revenue in USD',
            },
            employeeCount: {
              type: 'string',
              example: '25',
            },
            rdEmployeeCount: {
              type: 'string',
              example: '10',
              description: 'Number of employees doing R&D',
            },
            primaryState: {
              type: 'string',
              pattern: '^[A-Z]{2}$',
              example: 'CA',
            },
            rdStates: {
              type: 'array',
              items: {
                type: 'string',
                pattern: '^[A-Z]{2}$',
              },
              example: ['CA', 'NY'],
            },
          },
        },
        Expense: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            employeeName: { type: 'string' },
            annualSalary: { type: 'number' },
            rdPercentage: { type: 'number', minimum: 0, maximum: 100 },
            rdAmount: { type: 'number' },
          },
        },
        CalculatorInput: {
          type: 'object',
          properties: {
            wages: { type: 'number', minimum: 0 },
            wageRdPercent: { type: 'number', minimum: 0, maximum: 100 },
            contractors: { type: 'number', minimum: 0 },
            contractorRdPercent: { type: 'number', minimum: 0, maximum: 100 },
            supplies: { type: 'number', minimum: 0 },
            suppliesRdPercent: { type: 'number', minimum: 0, maximum: 100 },
          },
        },
        CalculatorResult: {
          type: 'object',
          properties: {
            totalQRE: { type: 'number' },
            federalCredit: { type: 'number' },
            tier: { type: 'number' },
            price: { type: 'number' },
            savingsAmount: { type: 'number' },
          },
        },
      },
    },
    tags: [
      {
        name: 'Authentication',
        description: 'Login and session management',
      },
      {
        name: 'Calculator',
        description: 'R&D tax credit estimation',
      },
      {
        name: 'Company',
        description: 'Company information management',
      },
      {
        name: 'Expenses',
        description: 'R&D expense tracking',
      },
      {
        name: 'Reports',
        description: 'Document generation and retrieval',
      },
      {
        name: 'Webhooks',
        description: 'External service integrations',
      },
    ],
  },
  apis: ['./server/routes/*.ts', './server/routes/*.js'],
};

export default swaggerJsdoc(options);