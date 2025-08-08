# Intake Form Data Collection Guide

## Purpose

The intake form collects all necessary information to generate IRS-compliant R&D tax credit documentation. It must balance thoroughness with user experience.

## Form Sections

### 1. Company Information
- Legal business name
- EIN (with format validation: XX-XXXXXXX)
- Entity type (C-Corp, S-Corp, LLC, etc.)
- Year founded
- Primary state of operations
- States with R&D activities

### 2. Business Overview
- Industry selection
- Business description (500 chars)
- Products/services offered
- Total revenue (ranges)
- Total employee count

### 3. R&D Activities
- Detailed description of R&D work
- Technical challenges faced
- Experimentation process
- Failed attempts (important for IRS)
- Improvements achieved

### 4. R&D Expenses

#### Employee Costs
For each R&D employee:
- Name/Role
- Annual salary
- % time on R&D
- Start date

#### Contractor Costs
- Company/Individual name
- Total paid
- Services provided
- % R&D work

#### Supply Costs
- Cloud services (AWS, Azure, etc.)
- Software licenses
- Development tools
- Testing equipment

### 5. Documentation
- Existing documentation checkbox
- Types of records kept
- Willingness to maintain records

## Validation Requirements

### Required Fields
- All company information
- At least one R&D activity
- At least one expense category
- Certification checkbox

### Format Validation
- EIN: XX-XXXXXXX format
- Email: Valid format
- Percentages: 0-100
- Currency: Positive numbers only

### Business Rules
- Total R&D % cannot exceed 100%
- Founded year must be reasonable
- Expenses must be within tax year

## Progressive Save

Form data is saved to Airtable after each section:
1. Reduces abandonment
2. Allows return to form
3. Provides partial data for follow-up

## Data Structure in Airtable

```json
{
  "companyInfo": {
    "name": "Acme Corp",
    "ein": "12-3456789",
    "entityType": "c-corp",
    "yearFounded": 2020,
    "revenue": "1M-5M",
    "employeeCount": 25,
    "primaryState": "PA",
    "rdStates": ["PA", "NY"]
  },
  "rdActivities": {
    "description": "Developing AI-powered...",
    "challenges": "Technical uncertainty in...",
    "process": "We experimented with...",
    "failures": "Initial approach failed...",
    "improvements": "Achieved 50% efficiency..."
  },
  "expenses": {
    "wages": [...],
    "contractors": [...],
    "supplies": [...]
  }
}
```

## UX Best Practices

1. **Section Headers**: Clear indication of progress
2. **Help Text**: Inline explanations for complex fields
3. **Examples**: Show sample entries
4. **Save Indicator**: Auto-save with visual confirmation
5. **Error Messages**: Specific, actionable feedback
6. **Mobile Responsive**: Works on all devices

## Post-Submission

After successful submission:
1. Show confirmation screen
2. Update dashboard checklist
3. Trigger Make.com webhook
4. Send confirmation email
5. Begin document generation