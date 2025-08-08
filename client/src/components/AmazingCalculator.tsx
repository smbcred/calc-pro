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
    <div className="stagger-item">
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            What did you spend on R&D activities?
          </h2>
          <p className="text-xl text-gray-600">
            Enter your expenses for the current year. We'll help calculate which portions qualify.
          </p>
        </div>

        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Employee Time</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Wages and benefits for employees working on AI/R&D projects (80% typically qualifies)
              </p>
              <input
                type="text"
                value={expenses.employeeTime}
                onChange={(e) => updateExpense('employeeTime', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="150000"
              />
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">AI Tools & Software</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                ChatGPT Plus, Claude Pro, Jasper, automation tools, custom AI development
              </p>
              <input
                type="text"
                value={expenses.aiTools}
                onChange={(e) => updateExpense('aiTools', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="12000"
              />
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Contractors & Freelancers</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                External developers, AI consultants, data scientists (65% cap applies)
              </p>
              <input
                type="text"
                value={expenses.contractors}
                onChange={(e) => updateExpense('contractors', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="50000"
              />
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                  <Calculator className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Supporting Software</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Development tools, cloud services, databases used for R&D projects
              </p>
              <input
                type="text"
                value={expenses.software}
                onChange={(e) => updateExpense('software', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="25000"
              />
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Training & Education</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                AI courses, conferences, certifications, books for your team
              </p>
              <input
                type="text"
                value={expenses.training}
                onChange={(e) => updateExpense('training', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="8000"
              />
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Shield className="w-5 h-5 text-amber-600 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium mb-1">Qualification Guidelines</p>
                <p>
                  Not all expenses qualify 100%. We apply IRS-compliant percentages: 80% for wages, 
                  65% cap for contractors, and 100% for direct R&D tools and training. 
                  Our calculations follow current tax law requirements.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-6">
            <button
              onClick={prevStep}
              className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>
            
            <button
              onClick={handleNext}
              className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-3 px-8 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              <span className="flex items-center gap-2">
                Calculate Credits
                <ArrowRight className="w-5 h-5" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Step 3: Credit Estimation Display
const CreditEstimateStep: React.FC<{
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  isCalculating: boolean;
}> = ({ formData, updateFormData, nextStep, prevStep, isCalculating }) => {
  
  return (
    <div className="stagger-item">
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Your R&D Tax Credit Estimate
          </h2>
          <p className="text-xl text-gray-600">
            Based on your expenses, here's your potential federal tax credit
          </p>
        </div>

        {isCalculating ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-full mb-4">
              <Calculator className="w-8 h-8 text-white animate-pulse" />
            </div>
            <p className="text-lg text-gray-600">Calculating your credits...</p>
            <div className="w-64 mx-auto mt-4 bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-600 to-green-600 h-2 rounded-full animate-pulse" style={{width: '100%'}}></div>
            </div>
          </div>
        ) : formData.results ? (
          <div>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  ${formData.results.totalQRE.toLocaleString()}
                </div>
                <div className="text-sm font-medium text-gray-700">
                  Total Qualified Research Expenses
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  ${formData.results.federalCredit.toLocaleString()}
                </div>
                <div className="text-sm font-medium text-gray-700">
                  Federal R&D Tax Credit
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  ${formData.results.savingsAmount.toLocaleString()}
                </div>
                <div className="text-sm font-medium text-gray-700">
                  Your Net Savings
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  After ${formData.results.price} service fee
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">How We Calculated Your Credit</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex justify-between">
                  <span>Total R&D expenses entered:</span>
                  <span className="font-medium">
                    ${(parseFloat(formData.expenses.employeeTime.replace(/,/g, '')) + 
                       parseFloat(formData.expenses.aiTools.replace(/,/g, '')) + 
                       parseFloat(formData.expenses.contractors.replace(/,/g, '')) + 
                       parseFloat(formData.expenses.software.replace(/,/g, '')) + 
                       parseFloat(formData.expenses.training.replace(/,/g, ''))).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Qualified expenses (after IRS rules):</span>
                  <span className="font-medium">${formData.results.totalQRE.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>
                    Credit rate ({formData.companyInfo.revenue?.includes('Under $1M') || 
                               formData.companyInfo.revenue?.includes('$1M - $5M') ? '6%' : '14%'} ASC method):
                  </span>
                  <span className="font-medium">${formData.results.federalCredit.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={nextStep}
                className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-4 px-8 rounded-xl font-bold text-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                <span className="flex items-center gap-3">
                  View Detailed Report
                  <ArrowRight className="w-6 h-6" />
                </span>
              </button>
            </div>
          </div>
        ) : null}

        <div className="flex justify-between pt-6">
          <button
            onClick={prevStep}
            className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

// Step 4: Detailed Report and Next Steps
const DetailedReportStep: React.FC<{
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
}> = ({ formData, updateFormData }) => {
  
  const proceedToCheckout = () => {
    // Save data for checkout
    localStorage.setItem('rd_credit_email', formData.companyInfo.email);
    localStorage.setItem('rd_calculation_results', JSON.stringify({
      ...formData.results,
      companyInfo: formData.companyInfo,
      activities: formData.activities
    }));
    
    // Navigate to checkout
    window.location.href = '/checkout';
  };

  return (
    <div className="stagger-item">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-3">
              🎉 Congratulations, {formData.companyInfo.companyName}!
            </h2>
            <p className="text-xl text-blue-100">
              You qualify for ${formData.results?.federalCredit.toLocaleString()} in R&D tax credits
            </p>
          </div>
        </div>

        <div className="p-8">
          {/* Credit Summary */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Your Credit Breakdown</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Total QRE</span>
                  <span className="font-semibold">${formData.results?.totalQRE.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Federal Credit</span>
                  <span className="font-semibold text-green-600">${formData.results?.federalCredit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Service Fee</span>
                  <span className="font-semibold text-red-600">-${formData.results?.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-t-2 border-gray-200">
                  <span className="text-lg font-bold">Your Net Savings</span>
                  <span className="text-xl font-bold text-green-600">${formData.results?.savingsAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Company Profile</h3>
              <div className="space-y-2 text-sm">
                <div><span className="text-gray-600">Company:</span> <span className="font-medium">{formData.companyInfo.companyName}</span></div>
                <div><span className="text-gray-600">Industry:</span> <span className="font-medium">{formData.companyInfo.industry}</span></div>
                <div><span className="text-gray-600">Revenue:</span> <span className="font-medium">{formData.companyInfo.revenue}</span></div>
                <div><span className="text-gray-600">Primary State:</span> <span className="font-medium">{formData.companyInfo.primaryState || 'Not specified'}</span></div>
              </div>

              <div className="mt-4">
                <h4 className="font-semibold text-gray-900 mb-2">Qualifying Activities</h4>
                <div className="flex flex-wrap gap-2">
                  {formData.activities.map((activity) => (
                    <span key={activity} className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {activity.replace('ai-', '').replace('-', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* What You Get */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">What You Get</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm">Complete Form 6765 preparation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm">Technical narrative documentation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm">QRE expense workbook</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm">Compliance memo and guidance</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm">Record-keeping checklist</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm">Email support throughout filing</span>
                </div>
              </div>
            </div>
          </div>

          {/* Urgency Banner */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-start gap-2">
              <Shield className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium text-red-900 mb-1">Amendment Deadline: July 2026</p>
                <p className="text-sm text-red-800">
                  You can still claim R&D credits for previous tax years (2022, 2023, 2024) through amended returns. 
                  The deadline to amend previous returns is approaching. Don't miss out on additional credits!
                </p>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="text-center">
            <button
              onClick={proceedToCheckout}
              className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-4 px-12 rounded-xl font-bold text-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 mb-4"
            >
              Secure Your ${formData.results?.federalCredit.toLocaleString()} Credit → Checkout
            </button>
            <p className="text-sm text-gray-600">
              🔒 Secure payment • 30-day money-back guarantee • No upfront cost
            </p>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">
              These calculations are estimates based on current tax law and the information provided. 
              Actual credit amounts may vary. All documents prepared by qualified tax professionals.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AmazingCalculator;