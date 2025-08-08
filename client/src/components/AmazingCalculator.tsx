import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Check, Calculator, TrendingUp, ArrowRight, DollarSign, Building2, Shield, CheckCircle } from 'lucide-react';
import { Link } from 'wouter';

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
    { number: 1, title: 'Qualification & Info', icon: Check },
    { number: 2, title: 'Expenses', icon: TrendingUp },
    { number: 3, title: 'Credit Estimate', icon: Calculator },
    { number: 4, title: 'Detailed Report', icon: DollarSign }
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
    setCurrentStep(prev => Math.min(4, prev + 1));
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
    <div className="min-h-screen bg-white">
      {/* Header Navigation */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                <Calculator className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900">SMBTaxCredits.com</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/calculator" className="text-blue-600 font-medium hover:text-blue-700">
                Calculator
              </Link>
              <Link href="/login" className="text-green-600 font-medium hover:text-green-700">
                Customer Login
              </Link>
              <div className="text-sm text-gray-600">
                <span className="font-medium">🔒 Secure</span> • <span className="font-medium">⚡ Fast</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

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
              <QualificationAndBusinessStep 
                formData={formData} 
                updateFormData={updateFormData} 
                nextStep={nextStep} 
              />
            )}
            {currentStep === 2 && (
              <ExpenseStep 
                formData={formData} 
                updateFormData={updateFormData} 
                nextStep={nextStep}
                prevStep={prevStep}
              />
            )}
            {currentStep === 3 && (
              <CreditEstimateStep 
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
              <DetailedReportStep 
                formData={formData} 
                updateFormData={updateFormData}
              />
            )}
          </div>
        </div>
        
        {/* Footer */}
        <footer className="bg-gray-900 text-white py-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-xl flex items-center justify-center">
                  <Calculator className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">SMBTaxCredits.com</span>
              </div>
              <p className="text-gray-400 max-w-2xl mx-auto">
                The trusted platform for small and medium businesses to claim R&D tax credits. 
                We've helped 500+ businesses recover millions in credits they didn't know they were owed.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
              <div>
                <h4 className="font-semibold mb-4">Services</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><Link href="/calculator" className="hover:text-white">R&D Credit Calculator</Link></li>
                  <li><a href="#" className="hover:text-white">Document Preparation</a></li>
                  <li><a href="#" className="hover:text-white">Multi-Year Claims</a></li>
                  <li><a href="#" className="hover:text-white">Amendment Services</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">Resources</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white">AI Qualification Guide</a></li>
                  <li><a href="#" className="hover:text-white">IRS Requirements</a></li>
                  <li><a href="#" className="hover:text-white">Case Studies</a></li>
                  <li><a href="#" className="hover:text-white">FAQ</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">Support</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><Link href="/login" className="hover:text-white">Customer Login</Link></li>
                  <li><a href="#" className="hover:text-white">Live Chat</a></li>
                  <li><a href="#" className="hover:text-white">Contact Us</a></li>
                  <li><a href="#" className="hover:text-white">Schedule Consultation</a></li>
                  <li><a href="#" className="hover:text-white">Technical Support</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">Company</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white">About Us</a></li>
                  <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                  <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                  <li><a href="#" className="hover:text-white">Security</a></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-8">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="text-gray-400 text-sm mb-4 md:mb-0">
                  © 2024 SMBTaxCredits.com. All rights reserved. We help businesses claim legitimate R&D tax credits.
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span>Secure & Compliant</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                    <span>IRS Approved Methods</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

// Step 1: Combined Qualification and Business Info
const QualificationAndBusinessStep: React.FC<{
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  nextStep: () => void;
}> = ({ formData, updateFormData, nextStep }) => {
  const [selectedActivities, setSelectedActivities] = useState<string[]>(formData.activities || []);
  const [companyData, setCompanyData] = useState({
    companyName: formData.companyInfo?.companyName || '',
    industry: formData.companyInfo?.industry || '',
    employeeCount: formData.companyInfo?.employeeCount || '',
    revenue: formData.companyInfo?.revenue || '',
    foundedYear: formData.companyInfo?.foundedYear || '',
    primaryState: formData.companyInfo?.primaryState || '',
    email: formData.companyInfo?.email || '',
    rdStartYear: formData.companyInfo?.rdStartYear || '2025'
  });

  const activities = [
    {
      id: 'ai-content',
      icon: '✍️',
      title: 'AI Content Creation',
      description: 'Using ChatGPT, Claude, or Jasper for marketing',
      examples: 'Blog posts, social media, email campaigns, product descriptions'
    },
    {
      id: 'ai-customer-service',
      icon: '💬',
      title: 'AI Customer Support',
      description: 'Implementing chatbots or AI-assisted responses',
      examples: 'Chatbots, FAQ automation, ticket routing, response templates'
    },
    {
      id: 'ai-data-analysis',
      icon: '📊',
      title: 'AI Data Analysis',
      description: 'Using AI to analyze business data or generate insights',
      examples: 'Sales forecasting, customer segmentation, trend analysis, reporting'
    },
    {
      id: 'process-automation',
      icon: '⚡',
      title: 'Workflow Automation',
      description: 'Automating repetitive tasks with AI or no-code tools',
      examples: 'Zapier workflows, email automation, data entry, scheduling'
    }
  ];

  const toggleActivity = (id: string) => {
    const newSelected = selectedActivities.includes(id) 
      ? selectedActivities.filter(a => a !== id)
      : [...selectedActivities, id];
    
    setSelectedActivities(newSelected);
    updateFormData({ activities: newSelected });
  };

  const handleNext = () => {
    updateFormData({
      activities: selectedActivities,
      companyInfo: companyData
    });
    nextStep();
  };

  return (
    <div className="stagger-item">
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Using AI for Your Business?<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">
              You Qualify for R&D Tax Credits
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            The IRS now recognizes AI implementation as R&D. Select your AI activities below.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {activities.map((activity) => (
            <div
              key={activity.id}
              onClick={() => toggleActivity(activity.id)}
              className={`
                p-6 cursor-pointer transition-all duration-300 rounded-xl border-2
                ${selectedActivities.includes(activity.id)
                  ? 'border-blue-500 bg-blue-50 transform scale-105'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'}
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
                  <Check className="w-6 h-6 text-green-600" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Business Information Section */}
        {selectedActivities.length > 0 && (
          <div className="mt-8 p-8 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Tell Us About Your Business</h3>
            
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Your company name"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="your@company.com"
                  />
                </div>
              </div>

              {/* Industry & Revenue */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Industry *
                  </label>
                  <select
                    value={companyData.industry}
                    onChange={(e) => setCompanyData({...companyData, industry: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select industry</option>
                    <option value="Software">Software</option>
                    <option value="E-commerce">E-commerce</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Consulting">Consulting</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Annual Revenue *
                  </label>
                  <select
                    value={companyData.revenue}
                    onChange={(e) => setCompanyData({...companyData, revenue: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select range</option>
                    <option value="Under $1M">Under $1M</option>
                    <option value="$1M - $5M">$1M - $5M</option>
                    <option value="$5M - $25M">$5M - $25M</option>
                    <option value="$25M+">$25M+</option>
                  </select>
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={handleNext}
                  disabled={!companyData.companyName || !companyData.email || !companyData.industry || !companyData.revenue}
                  className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-3 px-8 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="flex items-center gap-2">
                    Continue to Expenses
                    <ArrowRight className="w-5 h-5" />
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Step 2: Expense Collection
const ExpenseStep: React.FC<{
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  nextStep: () => void;
  prevStep: () => void;
}> = ({ formData, updateFormData, nextStep, prevStep }) => {
  const [expenses, setExpenses] = useState(formData.expenses);

  const updateExpense = (field: string, value: string) => {
    const newExpenses = { ...expenses, [field]: value };
    setExpenses(newExpenses);
    updateFormData({ expenses: newExpenses });
  };

  const handleNext = () => {
    nextStep();
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
      <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
        Enter Your R&D Expenses
      </h2>
      <p className="text-gray-600 text-center mb-8">
        Enter your expenses for activities that involve AI implementation or process improvement
      </p>

      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Employee Time (Annual)
            </label>
            <input
              type="text"
              value={expenses.employeeTime}
              onChange={(e) => updateExpense('employeeTime', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="500000"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              AI Tools & Software
            </label>
            <input
              type="text"
              value={expenses.aiTools}
              onChange={(e) => updateExpense('aiTools', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="50000"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contractors & Consultants
            </label>
            <input
              type="text"
              value={expenses.contractors}
              onChange={(e) => updateExpense('contractors', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="100000"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Supporting Software
            </label>
            <input
              type="text"
              value={expenses.software}
              onChange={(e) => updateExpense('software', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="25000"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Training & Education
          </label>
          <input
            type="text"
            value={expenses.training}
            onChange={(e) => updateExpense('training', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="10000"
          />
        </div>
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={prevStep}
          className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>
        
        <button
          onClick={handleNext}
          className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-3 px-8 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
        >
          <span className="flex items-center gap-2">
            Calculate Credit
            <ArrowRight className="w-5 h-5" />
          </span>
        </button>
      </div>
    </div>
  );
};

// Step 3: Credit Estimate
const CreditEstimateStep: React.FC<{
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  isCalculating: boolean;
}> = ({ formData, updateFormData, nextStep, prevStep, isCalculating }) => {
  if (isCalculating) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Calculating Your Credits</h3>
        <p className="text-gray-600">Analyzing your R&D activities and expenses...</p>
      </div>
    );
  }

  const results = formData.results;
  if (!results) return null;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
      <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
        Your R&D Tax Credit Estimate
      </h2>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="text-center p-6 bg-blue-50 rounded-xl">
          <div className="text-2xl font-bold text-blue-600 mb-1">
            ${results.federalCredit.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Federal Credit</div>
        </div>
        
        <div className="text-center p-6 bg-green-50 rounded-xl">
          <div className="text-2xl font-bold text-green-600 mb-1">
            ${results.stateCredit.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">State Credit</div>
        </div>
        
        <div className="text-center p-6 bg-purple-50 rounded-xl">
          <div className="text-2xl font-bold text-purple-600 mb-1">
            ${results.totalBenefit.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Total Benefits</div>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={prevStep}
          className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>
        
        <button
          onClick={nextStep}
          className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-3 px-8 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
        >
          <span className="flex items-center gap-2">
            View Detailed Report
            <ArrowRight className="w-5 h-5" />
          </span>
        </button>
      </div>
    </div>
  );
};

// Step 4: Detailed Report Step
const DetailedReportStep: React.FC<{
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
}> = ({ formData }) => {
  const results = formData.results;
  if (!results) return null;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
      <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
        Detailed R&D Tax Credit Report
      </h2>
      
      <div className="space-y-8">
        {/* Summary Section */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Executive Summary</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-gray-600 mb-1">Total Qualified Research Expenses</div>
              <div className="text-2xl font-bold text-blue-600">
                ${results.totalQRE.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Estimated Total Tax Benefits</div>
              <div className="text-2xl font-bold text-green-600">
                ${results.totalBenefit.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Credit Breakdown */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Credit Breakdown</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
              <span className="font-medium">Federal R&D Credit</span>
              <span className="font-bold text-blue-600">${results.federalCredit.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
              <span className="font-medium">Estimated State Credits</span>
              <span className="font-bold text-green-600">${results.stateCredit.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
              <span className="font-semibold">Total Tax Benefits</span>
              <span className="font-bold text-purple-600 text-lg">${results.totalBenefit.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Company Information */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Company Profile</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="font-medium text-gray-700">Company</div>
              <div className="text-gray-900">{formData.companyInfo.companyName}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="font-medium text-gray-700">Industry</div>
              <div className="text-gray-900">{formData.companyInfo.industry}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="font-medium text-gray-700">Revenue Range</div>
              <div className="text-gray-900">{formData.companyInfo.revenue}</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="font-medium text-gray-700">Email</div>
              <div className="text-gray-900">{formData.companyInfo.email}</div>
            </div>
          </div>
        </div>

        {/* Qualifying Activities */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Qualifying R&D Activities</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {formData.activities.map((activity, index) => (
              <div key={index} className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-gray-900 capitalize">{activity.replace('-', ' ')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Information */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Service Investment</h3>
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg">Professional Service Fee</span>
            <span className="text-2xl font-bold text-yellow-600">${results.price.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-lg font-semibold">
            <span>Your Net Savings</span>
            <span className="text-2xl font-bold text-green-600">${results.savingsAmount.toLocaleString()}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center pt-6">
          <Link href="/checkout">
            <button className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-4 px-8 rounded-xl font-bold text-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
              <span className="flex items-center gap-3">
                Proceed to Checkout
                <ArrowRight className="w-6 h-6" />
              </span>
            </button>
          </Link>
        </div>

        {/* Disclaimer */}
        <div className="text-xs text-gray-500 text-center pt-4 border-t">
          <p>
            * This estimate is based on current tax laws and the information provided. 
            Actual credit amounts may vary. Please consult with a qualified tax professional.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AmazingCalculator;