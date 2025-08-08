import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Check, Calculator, TrendingUp, ArrowRight, DollarSign, Building2 } from 'lucide-react';

interface FormData {
  activities: string[];
  companyInfo: {
    companyName: string;
    industry: string;
    employeeCount: string;
    revenue: string;
    foundedYear: string;
    primaryState: string;
    email: string;
    rdStartYear: string;
  };
  email?: string;
  estimatedRange?: {
    low: number;
    high: number;
    totalLow: number;
    totalHigh: number;
    years: number;
  };
  expenses: {
    employeeTime: string;
    aiTools: string;
    contractors: string;
    software: string;
    training: string;
  };
  results?: {
    totalQRE: number;
    federalCredit: number;
    stateCredit: number;
    totalBenefit: number;
    price: number;
    savingsAmount: number;
  };
}

const AmazingCalculator: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isCalculating, setIsCalculating] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    activities: [],
    companyInfo: {
      companyName: '',
      industry: '',
      employeeCount: '',
      revenue: '',
      foundedYear: '',
      primaryState: '',
      email: '',
      rdStartYear: '2025'
    },
    expenses: {
      employeeTime: '0',
      aiTools: '0',
      contractors: '0',
      software: '0',
      training: '0'
    }
  });

  const steps = [
    { number: 1, title: 'Qualification', icon: Check },
    { number: 2, title: 'Business Info', icon: Building2 },
    { number: 3, title: 'Email Capture', icon: Calculator },
    { number: 4, title: 'Expenses', icon: TrendingUp },
    { number: 5, title: 'Results', icon: Check }
  ];

  // Enhanced auto-save with progress tracking
  useEffect(() => {
    const saveData = () => {
      const progressData = {
        currentStep,
        formData,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem('rdCalculatorProgress', JSON.stringify(progressData));
    };
    
    const timeoutId = setTimeout(saveData, 1000);
    return () => clearTimeout(timeoutId);
  }, [formData, currentStep]);

  // Load saved data on mount
  useEffect(() => {
    const saved = localStorage.getItem('rdCalculatorData');
    if (saved) {
      try {
        const parsedData = JSON.parse(saved);
        setFormData(prev => ({ ...prev, ...parsedData }));
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(5, prev + 1));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const calculateResults = async () => {
    setIsCalculating(true);
    
    try {
      // Calculate total QRE
      const employeeTime = parseFloat(formData.expenses.employeeTime.replace(/,/g, '')) || 0;
      const aiTools = parseFloat(formData.expenses.aiTools.replace(/,/g, '')) || 0;
      const contractors = parseFloat(formData.expenses.contractors.replace(/,/g, '')) || 0;
      const software = parseFloat(formData.expenses.software.replace(/,/g, '')) || 0;
      const training = parseFloat(formData.expenses.training.replace(/,/g, '')) || 0;
      
      // Apply qualification percentages
      const qualifiedEmployeeTime = employeeTime * 0.8; // 80% of employee time typically qualifies
      const qualifiedAiTools = aiTools * 1.0; // 100% of AI tools qualify
      const qualifiedContractors = contractors * 0.65; // 65% cap for contractors
      const qualifiedSoftware = software * 1.0; // 100% of supporting software qualifies
      const qualifiedTraining = training * 1.0; // 100% of training qualifies
      
      const totalQRE = qualifiedEmployeeTime + qualifiedAiTools + qualifiedContractors + qualifiedSoftware + qualifiedTraining;
      
      // Calculate federal credit using Alternative Simplified Credit (ASC) method: 6% for startups, 14% for established companies
      const isStartup = formData.companyInfo.revenue.includes('Under $1M') || formData.companyInfo.revenue.includes('$1M - $5M');
      const federalRate = isStartup ? 0.06 : 0.14;
      const federalCredit = Math.round(totalQRE * federalRate);
      
      // Calculate estimated state credit (varies by state, using 5% average)
      const stateCredit = Math.round(totalQRE * 0.05);
      
      const totalBenefit = federalCredit + stateCredit;
      
      // Dynamic pricing based on credit amount
      let price = 500; // Default starter price
      if (federalCredit >= 100000) price = 1500;
      else if (federalCredit >= 50000) price = 1000;
      else if (federalCredit >= 10000) price = 750;
      
      const savingsAmount = totalBenefit - price;
      
      const results = {
        totalQRE,
        federalCredit,
        stateCredit,
        totalBenefit,
        price,
        savingsAmount
      };
      
      updateFormData({ results });
      
      // Simulate API delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1500));
      
    } catch (error) {
      console.error('Calculation error:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Progress Bar */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                  transition-all duration-300
                  ${currentStep >= step.number 
                    ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white' 
                    : 'bg-gray-200 text-gray-500'}
                `}>
                  {currentStep > step.number ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    step.number
                  )}
                </div>
                <span className={`ml-2 font-medium hidden sm:block ${
                  currentStep >= step.number ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-12 sm:w-24 h-1 mx-2 sm:mx-4 rounded transition-all duration-300 ${
                    currentStep > step.number ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="stagger-container">
          {currentStep === 1 && (
            <QualificationStep 
              formData={formData} 
              updateFormData={updateFormData} 
              nextStep={nextStep} 
            />
          )}
          {currentStep === 2 && (
            <BusinessInfoStep 
              formData={formData} 
              updateFormData={updateFormData} 
              nextStep={nextStep} 
              prevStep={prevStep}
            />
          )}
          {currentStep === 3 && (
            <EmailCaptureStep 
              formData={formData} 
              updateFormData={updateFormData} 
              nextStep={nextStep} 
              prevStep={prevStep}
            />
          )}
          {currentStep === 4 && (
            <ExpenseStep 
              formData={formData} 
              updateFormData={updateFormData} 
              nextStep={async () => {
                await calculateResults();
                nextStep();
              }}
              prevStep={prevStep}
              isCalculating={isCalculating}
            />
          )}
          {currentStep === 5 && (
            <ResultsStep 
              formData={formData} 
              updateFormData={updateFormData}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Step 1: Qualification Discovery
const QualificationStep: React.FC<{
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  nextStep: () => void;
}> = ({ formData, updateFormData, nextStep }) => {
  const [selectedActivities, setSelectedActivities] = useState<string[]>(formData.activities || []);

  const activities = [
    {
      id: 'ai-content',
      icon: '✍️',
      title: 'AI Content Creation',
      description: 'Using ChatGPT, Claude, or Jasper for marketing',
      examples: 'Blog posts, social media, email campaigns, product descriptions',
      commonRoles: ['Marketing Manager', 'Content Creator', 'Business Owner']
    },
    {
      id: 'ai-customer-service',
      icon: '💬',
      title: 'AI Customer Support',
      description: 'Implementing chatbots or AI-assisted responses',
      examples: 'Chatbots, FAQ automation, ticket routing, response templates',
      commonRoles: ['Customer Success', 'Support Team', 'Operations Manager']
    },
    {
      id: 'ai-data-analysis',
      icon: '📊',
      title: 'AI Data Analysis',
      description: 'Using AI to analyze business data or generate insights',
      examples: 'Sales forecasting, customer segmentation, trend analysis, reporting',
      commonRoles: ['Data Analyst', 'Business Analyst', 'Finance Team']
    },
    {
      id: 'process-automation',
      icon: '⚡',
      title: 'Workflow Automation',
      description: 'Automating repetitive tasks with AI or no-code tools',
      examples: 'Zapier workflows, email automation, data entry, scheduling',
      commonRoles: ['Operations', 'Admin', 'Project Manager']
    },
    {
      id: 'ai-development',
      icon: '🤖',
      title: 'Custom AI Solutions',
      description: 'Building GPTs, training models, or API integrations',
      examples: 'Custom ChatGPT, fine-tuned models, API connections, prompts',
      commonRoles: ['Developer', 'Tech Lead', 'Product Manager']
    },
    {
      id: 'ai-sales',
      icon: '🎯',
      title: 'AI Sales Tools',
      description: 'Using AI for lead generation or sales optimization',
      examples: 'Lead scoring, email personalization, proposal generation',
      commonRoles: ['Sales Team', 'Business Development', 'Account Manager']
    },
    {
      id: 'ai-design',
      icon: '🎨',
      title: 'AI Design & Creative',
      description: 'Using Midjourney, DALL-E, or Canva AI',
      examples: 'Logo design, marketing materials, product images, presentations',
      commonRoles: ['Designer', 'Marketing', 'Product Team']
    },
    {
      id: 'ai-finance',
      icon: '💰',
      title: 'AI Financial Tools',
      description: 'Automating bookkeeping or financial analysis',
      examples: 'Expense categorization, invoice processing, financial forecasting',
      commonRoles: ['Accountant', 'Bookkeeper', 'CFO']
    },
    {
      id: 'ai-hr',
      icon: '👥',
      title: 'AI HR & Recruiting',
      description: 'Using AI for hiring or employee management',
      examples: 'Resume screening, interview scheduling, performance reviews',
      commonRoles: ['HR Manager', 'Recruiter', 'People Ops']
    },
    {
      id: 'ai-legal',
      icon: '⚖️',
      title: 'AI Legal & Compliance',
      description: 'Contract analysis or compliance automation',
      examples: 'Contract review, compliance checking, policy generation',
      commonRoles: ['Legal Team', 'Compliance Officer', 'Operations']
    }
  ];

  const toggleActivity = (id: string) => {
    const newSelected = selectedActivities.includes(id) 
      ? selectedActivities.filter(a => a !== id)
      : [...selectedActivities, id];
    
    setSelectedActivities(newSelected);
  };

  const getQualificationMessage = () => {
    if (selectedActivities.length === 0) return null;
    
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6 success-bounce">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Check className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="font-semibold text-green-900 mb-1">
              {selectedActivities.length === 1 && "Great start! Even one AI implementation can qualify."}
              {selectedActivities.length >= 2 && selectedActivities.length <= 3 && "Excellent! Multiple AI uses strengthen your claim."}
              {selectedActivities.length >= 4 && selectedActivities.length <= 6 && "Impressive! You're leveraging AI across your business."}
              {selectedActivities.length > 6 && "Outstanding! You're a prime candidate for maximum credits."}
            </p>
            <p className="text-sm text-green-700">
              The IRS recognizes AI implementation as "process of experimentation" for R&D purposes.
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="stagger-item">
      <div className="card-high p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full mb-4">
            <span className="text-sm font-semibold">NEW: AI Usage Now Qualifies for R&D Credits</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Using ChatGPT for Your Business?<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">
              You Qualify for R&D Tax Credits
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            The IRS now recognizes AI implementation as R&D. If you've used AI tools to improve 
            any business process by 10% or more, you likely have $10,000+ in credits waiting.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {activities.map((activity) => (
            <div
              key={activity.id}
              onClick={() => toggleActivity(activity.id)}
              className={`
                card-interactive p-6 cursor-pointer transition-all duration-300
                ${selectedActivities.includes(activity.id)
                  ? 'card-glass border-2 border-blue-500 transform scale-105 shadow-lg'
                  : 'card-low hover:card-high'}
              `}
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl">{activity.icon}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {activity.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-500 italic">
                    Examples: {activity.examples}
                  </p>
                </div>
                {selectedActivities.includes(activity.id) && (
                  <Check className="w-6 h-6 text-green-600 success-bounce" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Qualification Message */}
        {getQualificationMessage()}

        <button
          onClick={() => {
            updateFormData({ activities: selectedActivities });
            nextStep();
          }}
          disabled={selectedActivities.length === 0}
          className={`
            w-full btn-gradient flex items-center justify-center gap-2 text-lg py-4
            ${selectedActivities.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          Continue to Business Info
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

// Step 2: Business Information
const BusinessInfoStep: React.FC<{
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  nextStep: () => void;
  prevStep: () => void;
}> = ({ formData, updateFormData, nextStep, prevStep }) => {
  const [companyData, setCompanyData] = useState(formData.companyInfo);

  const industries = [
    { value: 'ecommerce', label: 'E-commerce / Retail', icon: '🛒', aiUse: 'High' },
    { value: 'agency', label: 'Marketing / Creative Agency', icon: '🎯', aiUse: 'Very High' },
    { value: 'saas', label: 'Software / SaaS', icon: '💻', aiUse: 'Very High' },
    { value: 'consulting', label: 'Consulting / Services', icon: '📊', aiUse: 'High' },
    { value: 'realestate', label: 'Real Estate', icon: '🏠', aiUse: 'Medium' },
    { value: 'healthcare', label: 'Healthcare / Wellness', icon: '🏥', aiUse: 'Medium' },
    { value: 'finance', label: 'Finance / Insurance', icon: '💳', aiUse: 'High' },
    { value: 'education', label: 'Education / Training', icon: '🎓', aiUse: 'High' },
    { value: 'hospitality', label: 'Restaurant / Hospitality', icon: '🍽️', aiUse: 'Medium' },
    { value: 'nonprofit', label: 'Non-Profit', icon: '❤️', aiUse: 'Medium' },
    { value: 'manufacturing', label: 'Manufacturing / Supply', icon: '🏭', aiUse: 'Medium' },
    { value: 'other', label: 'Other Industry', icon: '🏢', aiUse: 'Varies' }
  ];

  const isValid = companyData.companyName && companyData.industry && companyData.employeeCount && companyData.revenue && companyData.rdStartYear && companyData.email;

  return (
    <div className="stagger-item">
      <div className="card-high p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Tell Us About {companyData.companyName || 'Your Business'}
        </h2>

        <div className="space-y-6">
          {/* Company Name & Email */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                value={companyData.companyName}
                onChange={(e) => setCompanyData({...companyData, companyName: e.target.value})}
                className="form-field"
                placeholder="Acme Technologies Inc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={companyData.email}
                onChange={(e) => setCompanyData({...companyData, email: e.target.value})}
                className="form-field"
                placeholder="you@company.com"
              />
            </div>
          </div>

          {/* Industry Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Industry *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {industries.map((industry) => (
                <button
                  key={industry.value}
                  type="button"
                  onClick={() => setCompanyData({...companyData, industry: industry.value})}
                  className={`
                    p-4 rounded-lg border-2 transition-all duration-200 text-center
                    ${companyData.industry === industry.value
                      ? 'border-blue-500 bg-blue-50 transform scale-105'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
                  `}
                >
                  <div className="text-2xl mb-1">{industry.icon}</div>
                  <div className="text-sm font-medium">{industry.label}</div>
                  <div className="text-xs text-gray-500 mt-1">AI Use: {industry.aiUse}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Employee Count & Revenue */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Employees *
              </label>
              <select
                value={companyData.employeeCount}
                onChange={(e) => setCompanyData({...companyData, employeeCount: e.target.value})}
                className="form-field"
              >
                <option value="">Select range</option>
                <option value="1-5">1-5 employees</option>
                <option value="6-10">6-10 employees</option>
                <option value="11-25">11-25 employees</option>
                <option value="26-50">26-50 employees</option>
                <option value="51-100">51-100 employees</option>
                <option value="100+">100+ employees</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Annual Revenue *
              </label>
              <select
                value={companyData.revenue}
                onChange={(e) => setCompanyData({...companyData, revenue: e.target.value})}
                className="form-field"
              >
                <option value="">Select revenue range</option>
                <option value="0-100k">Under $100,000</option>
                <option value="100k-250k">$100,000 - $250,000</option>
                <option value="250k-500k">$250,000 - $500,000</option>
                <option value="500k-1m">$500,000 - $1M</option>
                <option value="1m-2.5m">$1M - $2.5M</option>
                <option value="2.5m-5m">$2.5M - $5M</option>
                <option value="5m-10m">$5M - $10M</option>
                <option value="10m-25m">$10M - $25M</option>
                <option value="25m+">Over $25M</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                This helps us estimate your potential credit more accurately
              </p>
            </div>
          </div>

          {/* When did you start R&D? */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              When did you start your R&D activities? *
            </label>
            <select
              value={companyData.rdStartYear}
              onChange={(e) => setCompanyData({...companyData, rdStartYear: e.target.value})}
              className="form-field"
            >
              <option value="2025">2025 (Current Year)</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
              <option value="before-2022">Before 2022</option>
            </select>
            {companyData.rdStartYear && companyData.rdStartYear !== '2025' && (
              <div className="mt-2 p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  ✅ Great! You can claim credits for {
                    companyData.rdStartYear === 'before-2022' 
                      ? '2022, 2023, 2024, and 2025' 
                      : `${companyData.rdStartYear} through 2025`
                  }
                </p>
              </div>
            )}
          </div>

          {/* Primary State */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary State
            </label>
            <select
              value={companyData.primaryState}
              onChange={(e) => setCompanyData({...companyData, primaryState: e.target.value})}
              className="form-field"
            >
              <option value="">Select state</option>
              <option value="California">California</option>
              <option value="New York">New York</option>
              <option value="Texas">Texas</option>
              <option value="Florida">Florida</option>
              <option value="Illinois">Illinois</option>
              <option value="Pennsylvania">Pennsylvania</option>
              <option value="Ohio">Ohio</option>
              <option value="Georgia">Georgia</option>
              <option value="North Carolina">North Carolina</option>
              <option value="Michigan">Michigan</option>
            </select>
          </div>

          {/* Navigation */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={prevStep}
              className="flex-1 btn-secondary flex items-center justify-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>
            <button
              onClick={() => {
                updateFormData({ companyInfo: companyData });
                nextStep();
              }}
              disabled={!isValid}
              className="flex-1 btn-gradient"
            >
              Continue to Expenses
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Step 3: Email Capture with Credit Range
const EmailCaptureStep: React.FC<{
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  nextStep: () => void;
  prevStep: () => void;
}> = ({ formData, updateFormData, nextStep, prevStep }) => {
  const [email, setEmail] = useState(formData.email || '');

  // Enhanced credit range calculation based on revenue
  const calculateCreditRange = () => {
    const { employeeCount, revenue, rdStartYear } = formData.companyInfo;
    const activities = formData.activities.length;
    
    // Revenue-based calculations (more accurate for SMBs)
    const revenueMultipliers = {
      '0-100k': { low: 2000, high: 8000 },
      '100k-250k': { low: 5000, high: 15000 },
      '250k-500k': { low: 8000, high: 25000 },
      '500k-1m': { low: 15000, high: 40000 },
      '1m-2.5m': { low: 25000, high: 75000 },
      '2.5m-5m': { low: 40000, high: 125000 },
      '5m-10m': { low: 60000, high: 200000 },
      '10m-25m': { low: 100000, high: 400000 },
      '25m+': { low: 150000, high: 1000000 }
    };
    
    const base = revenueMultipliers[revenue as keyof typeof revenueMultipliers] || { low: 10000, high: 50000 };
    
    // Adjust for activities (more activities = higher credit)
    const activityMultiplier = 1 + (activities * 0.15);
    
    // Calculate number of eligible years
    let eligibleYears = 1;
    if (rdStartYear === 'before-2022') eligibleYears = 4;
    else if (rdStartYear === '2022') eligibleYears = 4;
    else if (rdStartYear === '2023') eligibleYears = 3;
    else if (rdStartYear === '2024') eligibleYears = 2;
    
    const annualLow = Math.round(base.low * activityMultiplier);
    const annualHigh = Math.round(base.high * activityMultiplier);
    
    return {
      low: annualLow,
      high: annualHigh,
      totalLow: Math.round(annualLow * eligibleYears),
      totalHigh: Math.round(annualHigh * eligibleYears),
      years: eligibleYears
    };
  };

  const creditRange = calculateCreditRange();

  const handleEmailSubmit = () => {
    updateFormData({ 
      email, 
      estimatedRange: creditRange 
    });
    nextStep();
  };

  const handleSkipToCheckout = () => {
    // Skip directly to checkout with estimated range
    const averageCredit = Math.round((creditRange.low + creditRange.high) / 2);
    const quickEstimate = {
      totalQRE: Math.round(averageCredit / 0.14),
      federalCredit: averageCredit,
      stateCredit: 0, // Removed state credits as per specification
      totalBenefit: averageCredit,
      price: averageCredit < 10000 ? 500 : averageCredit <= 50000 ? 750 : averageCredit <= 100000 ? 1000 : 1500,
      savingsAmount: averageCredit - (averageCredit < 10000 ? 500 : averageCredit <= 50000 ? 750 : averageCredit <= 100000 ? 1000 : 1500)
    };
    
    updateFormData({
      email: email || 'checkout@direct.com',
      estimatedRange: creditRange,
      results: quickEstimate
    });
    
    // Save to localStorage for checkout
    localStorage.setItem('rd_credit_email', email || 'checkout@direct.com');
    localStorage.setItem('rd_calculation_results', JSON.stringify(quickEstimate));
    
    // Navigate directly to checkout
    window.location.href = '/checkout';
  };

  return (
    <div className="stagger-item">
      <div className="card-highest p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {formData.companyInfo.companyName}, Your R&D Credits Are Worth...
          </h2>
          
          {/* Annual Credit Range */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 mb-4">
            <p className="text-lg text-gray-700 mb-4">
              Annual Federal R&D Credit Estimate:
            </p>
            <div className="text-5xl font-bold text-transparent bg-clip-text 
                          bg-gradient-to-r from-green-600 to-blue-600">
              ${creditRange.low.toLocaleString()} - ${creditRange.high.toLocaleString()}
            </div>
          </div>

          {/* Multi-Year Total if applicable */}
          {creditRange.years > 1 && (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 mb-6">
              <p className="text-lg font-semibold text-gray-900 mb-2">
                🎉 You Can Claim {creditRange.years} Years of Credits!
              </p>
              <p className="text-3xl font-bold text-orange-600">
                Total: ${creditRange.totalLow.toLocaleString()} - ${creditRange.totalHigh.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Based on R&D activities starting in {formData.companyInfo.rdStartYear}
              </p>
            </div>
          )}

          {/* Trust Elements */}
          <div className="flex justify-center gap-8 mb-8">
            <div className="text-center">
              <div className="text-2xl mb-1">⚡</div>
              <p className="text-sm text-gray-600">2-minute<br/>calculation</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">🔒</div>
              <p className="text-sm text-gray-600">Secure &<br/>confidential</p>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">📊</div>
              <p className="text-sm text-gray-600">IRS-compliant<br/>methodology</p>
            </div>
          </div>

          {/* Email Input with Benefits */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter your email for your personalized calculation
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl 
                       focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              placeholder="you@company.com"
            />
            <p className="text-sm text-blue-600 mt-1">
              We'll send you: ✓ Detailed calculation breakdown ✓ Free AI R&D guide ✓ Deadline reminders ✓ No spam, ever
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleEmailSubmit}
              disabled={!email}
              className={`w-full btn-gradient ${!email ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Get My Exact Calculation
            </button>
            
            <button
              onClick={handleSkipToCheckout}
              className="w-full px-6 py-3 text-gray-600 text-sm hover:text-gray-800"
            >
              Skip this step →
            </button>
          </div>

        </div>

        {/* Navigation */}
        <div className="flex gap-4 pt-6">
          <button
            onClick={prevStep}
            className="flex-1 btn-secondary flex items-center justify-center gap-2"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

// Step 4: R&D Expense Calculator
const ExpenseStep: React.FC<{
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  isCalculating: boolean;
}> = ({ formData, updateFormData, nextStep, prevStep, isCalculating }) => {
  const [expenses, setExpenses] = useState(formData.expenses);

  const formatCurrency = (value: string) => {
    const num = parseFloat(value.replace(/,/g, '')) || 0;
    return num.toLocaleString();
  };

  const calculateEmployeeTime = () => {
    const empCount = parseFloat((document.getElementById('empCount') as HTMLInputElement)?.value || '0');
    const hoursWeek = parseFloat((document.getElementById('hoursWeek') as HTMLInputElement)?.value || '0');
    const hourlyRate = parseFloat((document.getElementById('hourlyRate') as HTMLInputElement)?.value || '0');
    
    if (empCount && hoursWeek && hourlyRate) {
      const annualCost = empCount * hoursWeek * 52 * hourlyRate;
      setExpenses(prev => ({ ...prev, employeeTime: annualCost.toLocaleString() }));
    }
  };

  const handleExpenseChange = (field: string, value: string) => {
    setExpenses(prev => ({ ...prev, [field]: formatCurrency(value) }));
  };

  const calculateTotal = () => {
    const employeeTime = parseFloat((expenses.employeeTime || '').replace(/,/g, '')) || 0;
    const aiTools = parseFloat((expenses.aiTools || '').replace(/,/g, '')) || 0;
    const contractors = parseFloat((expenses.contractors || '').replace(/,/g, '')) || 0;
    const software = parseFloat((expenses.software || '').replace(/,/g, '')) || 0;
    const training = parseFloat((expenses.training || '').replace(/,/g, '')) || 0;
    
    return employeeTime + aiTools + contractors + software + training;
  };

  // Expense categories for SMBs
  const expenseCategories = [
    {
      id: 'employeeTime',
      label: 'Employee Time on AI Projects',
      helper: 'Hours spent implementing, testing, or improving AI solutions',
      example: 'If 2 employees spend 10 hrs/week on AI projects at $50/hr = $52,000/year',
      icon: '👥'
    },
    {
      id: 'aiTools',
      label: 'AI Tool Subscriptions',
      helper: 'ChatGPT Plus, Claude Pro, Jasper, Midjourney, etc.',
      example: 'ChatGPT Team: $300/mo, Claude Pro: $240/mo',
      icon: '🤖'
    },
    {
      id: 'contractors',
      label: 'Consultants & Freelancers',
      helper: 'External help for AI implementation or integration',
      example: 'AI consultant: $5,000, Integration developer: $10,000',
      icon: '💼'
    },
    {
      id: 'software',
      label: 'Supporting Software',
      helper: 'Automation tools, APIs, cloud services for AI',
      example: 'Zapier: $1,200/yr, Make.com: $800/yr, API costs: $2,000/yr',
      icon: '⚡'
    },
    {
      id: 'training',
      label: 'Training & Education',
      helper: 'Courses, workshops, or materials for AI adoption',
      example: 'AI training workshop: $2,000, Online courses: $500',
      icon: '📚'
    }
  ];

  const total = calculateTotal();
  const estimatedCredit = Math.round(total * 0.065);

  return (
    <div className="stagger-item">
      <div className="card-high p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Let's Calculate Your R&D Investment
        </h2>
        <p className="text-gray-600 mb-6">
          Include all costs related to implementing and improving AI in your business
        </p>

        {/* Smart Calculator for Employee Time */}
        <div className="card-glass p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">👥</span>
            Quick Employee Time Calculator
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-gray-600">Employees using AI</label>
              <input type="number" className="w-full mt-1 px-3 py-2 border rounded-lg" 
                     placeholder="2" id="empCount" />
            </div>
            <div>
              <label className="text-sm text-gray-600">Hours/week on AI</label>
              <input type="number" className="w-full mt-1 px-3 py-2 border rounded-lg" 
                     placeholder="10" id="hoursWeek" />
            </div>
            <div>
              <label className="text-sm text-gray-600">Avg hourly rate</label>
              <input type="number" className="w-full mt-1 px-3 py-2 border rounded-lg" 
                     placeholder="50" id="hourlyRate" />
            </div>
          </div>
          <button 
            onClick={calculateEmployeeTime}
            className="mt-4 text-blue-600 text-sm font-medium hover:text-blue-700"
          >
            Calculate annual employee R&D cost →
          </button>
        </div>

        {/* Expense Inputs */}
        <div className="space-y-4">
          {expenseCategories.map((category) => (
            <div key={category.id} className="border border-gray-200 rounded-xl p-4 
                                            hover:border-blue-300 transition-colors">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{category.icon}</span>
                <div className="flex-1">
                  <label className="font-medium text-gray-900">{category.label}</label>
                  <p className="text-sm text-gray-600 mb-2">{category.helper}</p>
                  <p className="text-xs text-gray-500 italic mb-3">Example: {category.example}</p>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="text"
                      value={expenses[category.id as keyof typeof expenses]}
                      onChange={(e) => handleExpenseChange(category.id, e.target.value)}
                      className="w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Real-time Qualification Check */}
        {calculateTotal() > 0 && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-green-800">
              <span className="font-semibold">✅ You qualify!</span> With ${calculateTotal().toLocaleString()} 
              in R&D expenses, you could claim approximately ${Math.round(calculateTotal() * 0.065).toLocaleString()} 
              in federal credits alone.
            </p>
          </div>
        )}

        <div className="space-y-6">

          {/* Live Total */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-medium text-gray-700">
                Total R&D Expenses
              </span>
              <span className="text-3xl font-bold text-gray-900">
                ${total.toLocaleString()}
              </span>
            </div>
            {total > 0 && (
              <div className="text-right">
                <p className="text-sm text-gray-600">
                  Estimated Federal Credit: <span className="font-semibold text-green-600">${estimatedCredit.toLocaleString()}</span>
                </p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex gap-4">
            <button 
              onClick={prevStep} 
              className="flex-1 btn-secondary flex items-center justify-center gap-2"
              disabled={isCalculating}
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>
            <button
              onClick={() => {
                updateFormData({ expenses });
                nextStep();
              }}
              disabled={total === 0 || isCalculating}
              className="flex-1 btn-gradient flex items-center justify-center gap-2"
            >
              {isCalculating ? (
                <>
                  <div className="loading-spinner">
                    <div></div>
                  </div>
                  Calculating...
                </>
              ) : (
                <>
                  Calculate My AI R&D Credits
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Step 4: Amazing Results Display
const ResultsStep: React.FC<{
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
}> = ({ formData }) => {
  const results = formData.results;
  
  if (!results) {
    return (
      <div className="stagger-item">
        <div className="card-high p-8 text-center">
          <p className="text-gray-600">Calculating your results...</p>
        </div>
      </div>
    );
  }

  const { totalQRE, federalCredit, stateCredit, totalBenefit, price, savingsAmount } = results;
  const roiMultiplier = Math.round(federalCredit / price);

  const handleProceedToCheckout = () => {
    // Save data to localStorage for checkout integration
    localStorage.setItem('rd_credit_email', formData.companyInfo.email);
    localStorage.setItem('rd_calculation_results', JSON.stringify({
      totalQRE,
      federalCredit,
      tier: price >= 1500 ? 4 : price >= 1000 ? 3 : price >= 750 ? 2 : 1,
      price,
      savingsAmount: totalBenefit - price
    }));
    
    // Navigate to checkout
    window.location.href = '/checkout';
  };

  return (
    <div className="stagger-item">
      <div className="card-highest p-8">
        {/* Eye-catching Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 
                        px-4 py-2 rounded-full mb-4 font-semibold">
            <Check className="w-5 h-5" />
            You Qualify for R&D Tax Credits!
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Your AI Innovation = 
            <span className="text-green-600"> ${federalCredit.toLocaleString()}</span> Back
          </h2>
        </div>

        {/* Simple Value Proposition */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-8 mb-8">
          <div className="text-center">
            <p className="text-lg text-gray-700 mb-6">
              Here's the deal: You've been using AI to improve your business. 
              The IRS will pay you for that innovation.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">You spent on AI</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${totalQRE.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">IRS pays you back</p>
                <p className="text-3xl font-bold text-green-600">
                  ${federalCredit.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Our fee</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${price.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="mt-6 inline-flex items-center gap-2 text-orange-600 font-semibold">
              <TrendingUp className="w-5 h-5" />
              That's a {roiMultiplier}x return on investment!
            </div>
          </div>
        </div>

        {/* What Happens Next - SMB Friendly */}
        <div className="mb-8">
          <h3 className="font-semibold text-gray-900 mb-4">
            Here's How Simple This Is:
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-semibold">1</span>
              </div>
              <div>
                <p className="font-medium">You complete a simple questionnaire (15 mins)</p>
                <p className="text-sm text-gray-600">We'll ask about your AI usage and innovation</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-semibold">2</span>
              </div>
              <div>
                <p className="font-medium">We create your IRS documentation</p>
                <p className="text-sm text-gray-600">All forms completed and audit-ready</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-semibold">3</span>
              </div>
              <div>
                <p className="font-medium">File with your regular taxes</p>
                <p className="text-sm text-gray-600">Your CPA includes Form 6765 with your return</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Get ${federalCredit.toLocaleString()} from the IRS</p>
                <p className="text-sm text-gray-600">Direct payment or credit against taxes owed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Elements for SMBs */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 text-blue-600 mx-auto mb-2 text-2xl">🛡️</div>
            <p className="text-sm font-medium">IRS Audit Support</p>
            <p className="text-xs text-gray-600">Included free</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 text-blue-600 mx-auto mb-2 text-2xl">⏱️</div>
            <p className="text-sm font-medium">48-Hour Delivery</p>
            <p className="text-xs text-gray-600">Get documents fast</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 text-blue-600 mx-auto mb-2 text-2xl">👥</div>
            <p className="text-sm font-medium">500+ SMBs Served</p>
            <p className="text-xs text-gray-600">Just like yours</p>
          </div>
        </div>

        {/* Clear CTA */}
        <button 
          onClick={handleProceedToCheckout}
          className="w-full btn-gradient text-lg py-4 flex items-center justify-center gap-2"
        >
          Claim My ${federalCredit.toLocaleString()} Credit Now
          <ArrowRight className="w-5 h-5" />
        </button>

        {/* Urgency for SMBs */}
        <div className="mt-6 text-center p-4 bg-orange-50 rounded-lg">
          <p className="text-orange-800 font-medium">
            ⏰ Important: You can claim credits for the past 3 years
          </p>
          <p className="text-sm text-orange-700 mt-1">
            2022 credits expire July 2026 - that could be ${(federalCredit * 3).toLocaleString()} total!
          </p>
        </div>
      </div>
    </div>
  );
};

export default AmazingCalculator;