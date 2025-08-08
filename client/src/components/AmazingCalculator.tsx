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
  };
  expenses: {
    wages: string;
    contractors: string;
    supplies: string;
    cloudSoftware: string;
    other: string;
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
      email: ''
    },
    expenses: {
      wages: '',
      contractors: '',
      supplies: '',
      cloudSoftware: '',
      other: ''
    }
  });

  const steps = [
    { number: 1, title: 'Qualification', icon: Check },
    { number: 2, title: 'Business Info', icon: Calculator },
    { number: 3, title: 'Expenses', icon: TrendingUp },
    { number: 4, title: 'Results', icon: Check }
  ];

  // Auto-save to localStorage
  useEffect(() => {
    const saveData = () => {
      localStorage.setItem('rdCalculatorData', JSON.stringify(formData));
    };
    
    const timeoutId = setTimeout(saveData, 1000);
    return () => clearTimeout(timeoutId);
  }, [formData]);

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
    setCurrentStep(prev => Math.min(4, prev + 1));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const calculateResults = async () => {
    setIsCalculating(true);
    
    try {
      // Calculate total QRE
      const wages = parseFloat(formData.expenses.wages.replace(/,/g, '')) || 0;
      const contractors = parseFloat(formData.expenses.contractors.replace(/,/g, '')) || 0;
      const supplies = parseFloat(formData.expenses.supplies.replace(/,/g, '')) || 0;
      const cloudSoftware = parseFloat(formData.expenses.cloudSoftware.replace(/,/g, '')) || 0;
      const other = parseFloat(formData.expenses.other.replace(/,/g, '')) || 0;
      
      // Apply qualification percentages
      const qualifiedWages = wages * 0.8; // 80% of wages typically qualify
      const qualifiedContractors = contractors * 0.65; // 65% cap for contractors
      const qualifiedSupplies = supplies * 1.0; // 100% of supplies qualify
      const qualifiedCloudSoftware = cloudSoftware * 1.0; // 100% of cloud/software qualify
      const qualifiedOther = other * 0.5; // 50% of other expenses
      
      const totalQRE = qualifiedWages + qualifiedContractors + qualifiedSupplies + qualifiedCloudSoftware + qualifiedOther;
      
      // Calculate federal credit (6.5% for established companies, 6% for startups)
      const isStartup = formData.companyInfo.revenue.includes('Under $1M') || formData.companyInfo.revenue.includes('$1M - $5M');
      const federalRate = isStartup ? 0.06 : 0.065;
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
          {currentStep === 4 && (
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
      id: 'ai-tools',
      icon: '🤖',
      title: 'AI & Automation Tools',
      description: 'Using ChatGPT, Claude, or other AI for business processes',
      examples: 'Content creation, data analysis, customer service'
    },
    {
      id: 'custom-development',
      icon: '💻',
      title: 'Custom Development',
      description: 'Building software, apps, or digital solutions',
      examples: 'Web apps, mobile apps, internal tools'
    },
    {
      id: 'process-improvement',
      icon: '📈',
      title: 'Process Innovation',
      description: 'Improving efficiency by 10% or more',
      examples: 'Automation, optimization, new workflows'
    },
    {
      id: 'data-analytics',
      icon: '📊',
      title: 'Data Analytics & AI',
      description: 'Advanced data analysis and machine learning',
      examples: 'Predictive models, business intelligence, analytics'
    },
    {
      id: 'product-development',
      icon: '🚀',
      title: 'Product Development',
      description: 'Creating new products or improving existing ones',
      examples: 'Feature development, UX improvements, testing'
    },
    {
      id: 'cybersecurity',
      icon: '🔒',
      title: 'Cybersecurity Enhancement',
      description: 'Improving security systems and protocols',
      examples: 'Security audits, encryption, threat detection'
    }
  ];

  const toggleActivity = (id: string) => {
    const newSelected = selectedActivities.includes(id) 
      ? selectedActivities.filter(a => a !== id)
      : [...selectedActivities, id];
    
    setSelectedActivities(newSelected);
  };

  const getQualificationMessage = () => {
    if (selectedActivities.length === 0) return '';
    if (selectedActivities.length <= 2) return "Good start! You likely qualify for credits. 🎯";
    if (selectedActivities.length <= 4) return "Excellent! You're doing significant R&D work. 🚀";
    return "Wow! You might be leaving serious money on the table. 💰";
  };

  return (
    <div className="stagger-item">
      <div className="card-high p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Let's Discover Your R&D Activities ✨
          </h2>
          <p className="text-xl text-gray-600">
            Select all the innovative work your business does
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
        {selectedActivities.length > 0 && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 mb-8 success-bounce">
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-900">
                {getQualificationMessage()}
              </p>
            </div>
          </div>
        )}

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
    { value: 'saas', label: 'SaaS / Software', icon: '💻' },
    { value: 'ecommerce', label: 'E-commerce', icon: '🛒' },
    { value: 'fintech', label: 'Financial Services', icon: '💳' },
    { value: 'healthcare', label: 'Healthcare Tech', icon: '🏥' },
    { value: 'manufacturing', label: 'Manufacturing', icon: '🏭' },
    { value: 'consulting', label: 'Consulting', icon: '📊' }
  ];

  const isValid = companyData.companyName && companyData.industry && companyData.employeeCount && companyData.revenue && companyData.email;

  return (
    <div className="stagger-item">
      <div className="card-high p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Tell Us About Your Business
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
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="500+">500+ employees</option>
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
                <option value="">Select range</option>
                <option value="Under $1M">Under $1M</option>
                <option value="$1M - $5M">$1M - $5M</option>
                <option value="$5M - $25M">$5M - $25M</option>
                <option value="$25M - $100M">$25M - $100M</option>
                <option value="$100M+">$100M+</option>
              </select>
            </div>
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

// Step 3: R&D Expense Calculator
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

  const calculateTotal = () => {
    const wages = parseFloat(expenses.wages.replace(/,/g, '')) || 0;
    const contractors = parseFloat(expenses.contractors.replace(/,/g, '')) || 0;
    const supplies = parseFloat(expenses.supplies.replace(/,/g, '')) || 0;
    const cloudSoftware = parseFloat(expenses.cloudSoftware.replace(/,/g, '')) || 0;
    const other = parseFloat(expenses.other.replace(/,/g, '')) || 0;
    
    return wages + contractors + supplies + cloudSoftware + other;
  };

  const total = calculateTotal();
  const estimatedCredit = Math.round(total * 0.065);

  return (
    <div className="stagger-item">
      <div className="card-high p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Calculate Your R&D Expenses
        </h2>
        <p className="text-gray-600 mb-6">
          Include all expenses related to your innovative activities
        </p>

        <div className="space-y-6">
          {/* Expense Inputs */}
          <div className="card-glass p-6 space-y-4">
            <div>
              <label className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-700">Employee R&D Wages</span>
                <span className="text-sm text-gray-500">Most common qualifier</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="text"
                  value={expenses.wages}
                  onChange={(e) => setExpenses({...expenses, wages: formatCurrency(e.target.value)})}
                  className="form-field pl-8"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-700">Contractor Costs</span>
                <span className="text-sm text-gray-500">65% qualifies</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="text"
                  value={expenses.contractors}
                  onChange={(e) => setExpenses({...expenses, contractors: formatCurrency(e.target.value)})}
                  className="form-field pl-8"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-700">Cloud & Software</span>
                <span className="text-sm text-gray-500">AWS, tools, licenses</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="text"
                  value={expenses.cloudSoftware}
                  onChange={(e) => setExpenses({...expenses, cloudSoftware: formatCurrency(e.target.value)})}
                  className="form-field pl-8"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-700">Supply Costs</span>
                <span className="text-sm text-gray-500">Materials, equipment</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="text"
                  value={expenses.supplies}
                  onChange={(e) => setExpenses({...expenses, supplies: formatCurrency(e.target.value)})}
                  className="form-field pl-8"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-700">Other R&D Expenses</span>
                <span className="text-sm text-gray-500">Testing, research</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="text"
                  value={expenses.other}
                  onChange={(e) => setExpenses({...expenses, other: formatCurrency(e.target.value)})}
                  className="form-field pl-8"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

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
                  Calculate My Credits
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
        {/* Success Animation */}
        <div className="text-center mb-8 success-bounce">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-green-400 to-blue-500 
                        rounded-full flex items-center justify-center">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Congratulations! 🎉
          </h2>
          <p className="text-xl text-gray-600">
            You qualify for significant R&D tax credits
          </p>
        </div>

        {/* Credit Breakdown */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="card-glass p-6 text-center">
            <div className="text-sm font-medium text-gray-600 mb-2">
              Federal R&D Credit
            </div>
            <div className="text-4xl font-bold text-green-600 mb-2">
              ${federalCredit.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">
              Direct payment from IRS
            </div>
          </div>

          <div className="card-glass p-6 text-center">
            <div className="text-sm font-medium text-gray-600 mb-2">
              Total Qualified Expenses
            </div>
            <div className="text-4xl font-bold text-blue-600 mb-2">
              ${totalQRE.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">
              Research & development costs
            </div>
          </div>
        </div>

        {/* ROI Highlight */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-medium text-gray-700">Your Investment</p>
              <p className="text-3xl font-bold text-gray-900">${price.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-orange-600">
                {roiMultiplier}x
              </div>
              <p className="text-sm font-medium text-gray-600">ROI</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-medium text-gray-700">Your Return</p>
              <p className="text-3xl font-bold text-green-600">
                ${federalCredit.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* What's Included */}
        <div className="mb-8">
          <h3 className="font-semibold text-gray-900 mb-4">
            Your Complete R&D Credit Package Includes:
          </h3>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              'IRS Form 6765 - Completed & Ready to File',
              'Technical Narrative Documentation',
              'QRE Calculation Workbook',
              'Audit Defense Documentation',
              'Multi-Year Credit Analysis',
              'State Credit Applications',
              'Filing Instructions Guide',
              'Ongoing Support Access'
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <button 
          onClick={handleProceedToCheckout}
          className="w-full btn-gradient text-xl py-4 transform hover:scale-105 flex items-center justify-center gap-3"
        >
          Get My R&D Tax Credits Now
          <ArrowRight className="w-6 h-6" />
        </button>

        {/* Urgency */}
        <div className="mt-6 text-center">
          <p className="text-sm text-orange-600 font-medium">
            ⏰ 2022 credits expire July 2026 - Don't leave money on the table
          </p>
        </div>
      </div>
    </div>
  );
};

export default AmazingCalculator;