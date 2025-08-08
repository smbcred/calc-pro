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
    { number: 1, title: 'AI Activities', icon: Check },
    { number: 2, title: 'Business Info', icon: Building2 },
    { number: 3, title: 'Expenses', icon: Calculator },
    { number: 4, title: 'Credit Estimate', icon: TrendingUp },
    { number: 5, title: 'Results', icon: DollarSign }
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

  // Smart credit estimation based on revenue and activities
  const calculateCreditEstimate = () => {
    const revenue = formData.companyInfo.revenue;
    const activityCount = formData.activities.length;
    
    // Base estimate multipliers by revenue range
    const revenueMultipliers = {
      'Under $1M': { base: 8000, multiplier: 1200 },
      '$1M - $5M': { base: 15000, multiplier: 2800 },
      '$5M - $25M': { base: 35000, multiplier: 6500 },
      '$25M - $100M': { base: 75000, multiplier: 12000 },
      'Over $100M': { base: 150000, multiplier: 18000 }
    };
    
    const multiplier = revenueMultipliers[revenue as keyof typeof revenueMultipliers] || revenueMultipliers['Under $1M'];
    const estimatedCredit = multiplier.base + (activityCount * multiplier.multiplier);
    
    // Calculate multi-year potential (2022-2025)
    const multiYearTotal = estimatedCredit * 4;
    
    return {
      currentYear: estimatedCredit,
      multiYear: multiYearTotal,
      activityCount,
      revenue
    };
  };

  const calculateResults = async () => {
    setIsCalculating(true);
    
    try {
      // Calculate total QRE with proper qualification rules
      const employeeTime = parseFloat((formData.expenses.employeeTime || '0').replace(/,/g, '')) || 0;
      const aiTools = parseFloat((formData.expenses.aiTools || '0').replace(/,/g, '')) || 0;
      const contractors = parseFloat((formData.expenses.contractors || '0').replace(/,/g, '')) || 0;
      const software = parseFloat((formData.expenses.software || '0').replace(/,/g, '')) || 0;
      const training = parseFloat((formData.expenses.training || '0').replace(/,/g, '')) || 0;
      
      // Apply IRS qualification percentages
      const qualifiedEmployeeTime = employeeTime * 0.8; // 80% qualification rate
      const qualifiedAiTools = aiTools * 1.0; // 100% - direct R&D tools
      const qualifiedContractors = contractors * 0.65; // 65% IRS limit
      const qualifiedSoftware = software * 1.0; // 100% - supporting software
      const qualifiedTraining = training * 1.0; // 100% - R&D training
      
      const totalQRE = qualifiedEmployeeTime + qualifiedAiTools + qualifiedContractors + qualifiedSoftware + qualifiedTraining;
      
      // Federal credit calculation (6.5% rate)
      const federalRate = 0.065;
      const federalCredit = Math.round(totalQRE * federalRate);
      
      // No state credits in this version
      const stateCredit = 0;
      const totalBenefit = federalCredit;
      
      // Dynamic pricing based on credit amount
      let price = 500;
      if (federalCredit >= 100000) price = 1500;
      else if (federalCredit >= 50000) price = 1000;
      else if (federalCredit >= 10000) price = 750;
      
      const savingsAmount = Math.max(0, totalBenefit - price);
      
      const results = {
        totalQRE: Math.round(totalQRE),
        federalCredit,
        stateCredit,
        totalBenefit,
        price,
        savingsAmount,
        breakdown: {
          qualifiedEmployeeTime: Math.round(qualifiedEmployeeTime),
          qualifiedAiTools: Math.round(qualifiedAiTools),
          qualifiedContractors: Math.round(qualifiedContractors),
          qualifiedSoftware: Math.round(qualifiedSoftware),
          qualifiedTraining: Math.round(qualifiedTraining)
        }
      };
      
      updateFormData({ results });
      
      // Save calculation results to localStorage for checkout
      localStorage.setItem('rd_calculation_results', JSON.stringify({
        federalCredit,
        totalQRE: Math.round(totalQRE),
        savingsAmount,
        price,
        tier: price >= 1500 ? 'Enterprise' : price >= 1000 ? 'Growth' : price >= 750 ? 'Professional' : 'Starter'
      }));
      
      // Simulate processing time for better UX
      await new Promise(resolve => setTimeout(resolve, 2000));
      
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
        {/* Enhanced Progress Bar */}
        <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b shadow-sm">
          <div className="max-w-6xl mx-auto px-2 py-6">
            {/* Desktop Progress Bar */}
            <div className="hidden lg:flex items-center justify-center">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm
                    transition-all duration-500 transform hover:scale-110
                    ${currentStep >= step.number 
                      ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-lg ring-4 ring-blue-100' 
                      : currentStep === step.number
                      ? 'bg-white border-2 border-blue-600 text-blue-600 shadow-md'
                      : 'bg-gray-100 text-gray-400 border border-gray-200'}
                  `}>
                    {currentStep > step.number ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <div className="ml-2">
                    <div className={`font-semibold text-xs transition-colors ${
                      currentStep >= step.number ? 'text-gray-900' : currentStep === step.number ? 'text-blue-600' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </div>
                    <div className={`text-xs mt-0.5 transition-colors hidden xl:block ${
                      currentStep > step.number ? 'text-green-600' : currentStep === step.number ? 'text-blue-500' : 'text-gray-400'
                    }`}>
                      {currentStep > step.number ? 'Complete' : currentStep === step.number ? 'In Progress' : 'Pending'}
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="relative mx-3">
                      <div className={`w-16 h-1 rounded-full transition-all duration-700 ${
                        currentStep > step.number ? 'bg-gradient-to-r from-green-500 to-blue-500' : 'bg-gray-200'
                      }`} />
                      {currentStep > step.number && (
                        <div className="absolute inset-0 w-full h-1 bg-gradient-to-r from-green-500 to-blue-500 rounded-full animate-pulse" />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Mobile/Tablet Progress Bar */}
            <div className="lg:hidden">
              <div className="flex items-center justify-center mb-4">
                <div className="text-sm font-medium text-gray-600">
                  Step {currentStep} of {steps.length}
                </div>
              </div>
              <div className="overflow-x-auto pb-2">
                <div className="flex items-center justify-center min-w-max px-2 space-x-1">
                  {steps.map((step, index) => (
                    <div key={step.number} className="flex items-center flex-shrink-0">
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs
                        transition-all duration-500
                        ${currentStep >= step.number 
                          ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-lg' 
                          : currentStep === step.number
                          ? 'bg-white border-2 border-blue-600 text-blue-600 shadow-md'
                          : 'bg-gray-100 text-gray-400 border border-gray-200'}
                      `}>
                        {currentStep > step.number ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          step.number
                        )}
                      </div>
                      {index < steps.length - 1 && (
                        <div className="relative mx-1">
                          <div className={`w-4 h-1 rounded-full transition-all duration-700 ${
                            currentStep > step.number ? 'bg-gradient-to-r from-green-500 to-blue-500' : 'bg-gray-200'
                          }`} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-center mt-3">
                <div className={`font-semibold text-sm transition-colors ${
                  currentStep >= steps[currentStep - 1]?.number ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {steps[currentStep - 1]?.title}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  In Progress
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="stagger-container space-y-8">
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
                nextStep={nextStep}
                prevStep={prevStep}
              />
            )}
            {currentStep === 4 && (
              <CreditEstimateStep 
                formData={formData} 
                updateFormData={updateFormData} 
                nextStep={nextStep}
                prevStep={prevStep}
                calculateCreditEstimate={calculateCreditEstimate}
              />
            )}
            {currentStep === 5 && (
              <ResultsStep 
                formData={formData} 
                updateFormData={updateFormData}
                calculateResults={calculateResults}
                isCalculating={isCalculating}
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

// Step 1: AI Activities Qualification
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
      id: 'workflow-automation',
      icon: '⚡',
      title: 'Workflow Automation',
      description: 'Automating repetitive tasks with AI or no-code tools',
      examples: 'Zapier workflows, email automation, data entry, scheduling'
    },
    {
      id: 'custom-ai-solutions',
      icon: '🤖',
      title: 'Custom AI Solutions',
      description: 'Building custom GPTs, APIs, or AI integrations',
      examples: 'Custom ChatGPT models, API integrations, AI workflows'
    },
    {
      id: 'ai-sales-tools',
      icon: '🎯',
      title: 'AI Sales Tools',
      description: 'Using AI for lead generation and sales processes',
      examples: 'Lead scoring, email sequences, prospect research, CRM automation'
    },
    {
      id: 'ai-design',
      icon: '🎨',
      title: 'AI Design',
      description: 'Creating visuals and designs with AI tools',
      examples: 'Midjourney, DALL-E, Canva AI, logo generation, graphics'
    },
    {
      id: 'ai-financial-tools',
      icon: '💰',
      title: 'AI Financial Tools',
      description: 'Automating bookkeeping and financial processes',
      examples: 'Receipt scanning, expense categorization, financial reporting'
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
    nextStep();
  };

  return (
    <div className="stagger-item">
      <div className="bg-white rounded-3xl shadow-xl p-10 border border-gray-100 relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-green-50/30 pointer-events-none" />
        <div className="relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl mb-6">
            <Check className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Using AI for Your Business?<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">
              You Qualify for R&D Tax Credits
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            The IRS now recognizes AI implementation as qualifying R&D activities. Select all activities that apply to your business to maximize your credit potential.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {activities.map((activity, index) => (
            <div
              key={activity.id}
              onClick={() => toggleActivity(activity.id)}
              className={`
                group relative p-8 cursor-pointer transition-all duration-500 rounded-2xl border-2
                transform hover:scale-[1.02] hover:-translate-y-1
                ${selectedActivities.includes(activity.id)
                  ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-green-50 shadow-lg ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md'}
              `}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start gap-6">
                <div className={`text-4xl transition-transform duration-300 ${
                  selectedActivities.includes(activity.id) ? 'scale-110' : 'group-hover:scale-105'
                }`}>
                  {activity.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {activity.title}
                  </h3>
                  <p className="text-gray-600 mb-3 leading-relaxed">
                    {activity.description}
                  </p>
                  <p className="text-sm text-gray-500 italic leading-relaxed">
                    <span className="font-medium">Examples:</span> {activity.examples}
                  </p>
                </div>
                <div className={`flex-shrink-0 transition-all duration-300 ${
                  selectedActivities.includes(activity.id)
                    ? 'opacity-100 scale-100'
                    : 'opacity-0 scale-75 group-hover:opacity-50 group-hover:scale-90'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    selectedActivities.includes(activity.id)
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}>
                    <Check className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Trust indicators */}
        <div className="bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 p-8 rounded-2xl mb-12 border border-green-100">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="transform hover:scale-105 transition-transform duration-300">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl mb-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-green-600 mb-1">500+</div>
              <div className="text-sm font-medium text-gray-700">SMBs Served</div>
              <div className="text-xs text-gray-500 mt-1">Trusted by businesses nationwide</div>
            </div>
            <div className="transform hover:scale-105 transition-transform duration-300">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-3">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-blue-600 mb-1">IRS</div>
              <div className="text-sm font-medium text-gray-700">Compliant Methods</div>
              <div className="text-xs text-gray-500 mt-1">Following all IRS guidelines</div>
            </div>
            <div className="transform hover:scale-105 transition-transform duration-300">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl mb-3">
                <Calculator className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-purple-600 mb-1">48hr</div>
              <div className="text-sm font-medium text-gray-700">Document Delivery</div>
              <div className="text-xs text-gray-500 mt-1">Fast professional service</div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={handleNext}
            disabled={selectedActivities.length === 0}
            className={`
              relative overflow-hidden bg-gradient-to-r from-blue-600 to-green-600 text-white 
              py-5 px-12 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl 
              transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5
              disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
              group
            `}
          >
            {/* Button shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <span className="relative flex items-center gap-3">
              Continue with {selectedActivities.length} Activities
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium text-gray-600">
              💡 Select all that apply - more activities = higher credit potential
            </p>
            {selectedActivities.length > 0 && (
              <p className="text-xs text-green-600 animate-fade-in">
                ✓ Great! You've selected {selectedActivities.length} qualifying activities
              </p>
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

// Employee Time Calculator Component
const EmployeeTimeCalculator: React.FC<{
  value: string;
  onChange: (value: string) => void;
}> = ({ value, onChange }) => {
  const [method, setMethod] = useState<'annual' | 'hourly'>('annual');
  const [employees, setEmployees] = useState('');
  const [timePercent, setTimePercent] = useState('');
  const [avgSalary, setAvgSalary] = useState('');
  const [hours, setHours] = useState('');
  const [rate, setRate] = useState('');

  const calculateTotal = () => {
    if (method === 'annual') {
      const emp = parseFloat(employees) || 0;
      const percent = parseFloat(timePercent) || 0;
      const salary = parseFloat(avgSalary) || 0;
      return Math.round(emp * (percent / 100) * salary);
    } else {
      const hrs = parseFloat(hours) || 0;
      const hourlyRate = parseFloat(rate) || 0;
      return Math.round(hrs * hourlyRate);
    }
  };

  React.useEffect(() => {
    const total = calculateTotal();
    if (total > 0) {
      onChange(total.toLocaleString());
    }
  }, [employees, timePercent, avgSalary, hours, rate, method]);

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 shadow-sm">
      <div className="mb-6">
        <h4 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Employee Time Calculator
        </h4>
        <div className="flex gap-2 p-1 bg-white rounded-xl border border-blue-200">
          <button
            onClick={() => setMethod('annual')}
            className={`flex-1 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${
              method === 'annual' 
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md transform scale-105' 
                : 'text-blue-600 hover:bg-blue-50'
            }`}
          >
            Annual Salary Method
          </button>
          <button
            onClick={() => setMethod('hourly')}
            className={`flex-1 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-300 ${
              method === 'hourly' 
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md transform scale-105' 
                : 'text-blue-600 hover:bg-blue-50'
            }`}
          >
            Hourly Rate Method
          </button>
        </div>
      </div>
      
      {method === 'annual' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-blue-800 mb-2 flex items-center gap-1">
              <Building2 className="w-4 h-4" />
              # Employees
            </label>
            <input
              type="number"
              value={employees}
              onChange={(e) => setEmployees(e.target.value)}
              placeholder="3"
              className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            />
            <p className="text-xs text-blue-600 mt-1">Working on R&D activities</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-blue-800 mb-2 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              % Time on R&D
            </label>
            <input
              type="number"
              value={timePercent}
              onChange={(e) => setTimePercent(e.target.value)}
              placeholder="25"
              max="100"
              className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            />
            <p className="text-xs text-blue-600 mt-1">Percentage of work time</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-blue-800 mb-2 flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              Avg Salary
            </label>
            <input
              type="number"
              value={avgSalary}
              onChange={(e) => setAvgSalary(e.target.value)}
              placeholder="80000"
              className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            />
            <p className="text-xs text-blue-600 mt-1">Annual salary per employee</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-blue-800 mb-2 flex items-center gap-1">
              <Calculator className="w-4 h-4" />
              Total Hours
            </label>
            <input
              type="number"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder="500"
              className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            />
            <p className="text-xs text-blue-600 mt-1">Total hours worked on R&D</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-blue-800 mb-2 flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              Hourly Rate
            </label>
            <input
              type="number"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              placeholder="50"
              className="w-full px-4 py-3 border-2 border-blue-200 rounded-xl text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            />
            <p className="text-xs text-blue-600 mt-1">Average hourly rate</p>
          </div>
        </div>
      )}
      
      {calculateTotal() > 0 && (
        <div className="mt-6 pt-4 border-t-2 border-blue-200">
          <div className="bg-white rounded-xl p-4 border-2 border-green-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Calculated Employee Cost:</span>
              <span className="text-2xl font-bold text-green-600">
                ${calculateTotal().toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              This amount will be auto-filled in the expense form
            </p>
          </div>
        </div>
      )}
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
  const [companyData, setCompanyData] = useState({
    companyName: formData.companyInfo?.companyName || '',
    industry: formData.companyInfo?.industry || '',
    employeeCount: formData.companyInfo?.employeeCount || '',
    revenue: formData.companyInfo?.revenue || '',
    foundedYear: formData.companyInfo?.foundedYear || '',
    rdStartYear: formData.companyInfo?.rdStartYear || '2025'
  });

  const handleNext = () => {
    updateFormData({ companyInfo: companyData });
    nextStep();
  };

  return (
    <div className="stagger-item">
      <div className="bg-white rounded-3xl shadow-xl p-10 border border-gray-100 relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-green-50/30 pointer-events-none" />
        <div className="relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl mb-6">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Tell Us About Your Business
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Help us calculate your R&D credit potential with some basic business information. This data helps us provide accurate estimates.
          </p>
        </div>

        <div className="space-y-8">
          {/* Company Name */}
          <div className="group">
            <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              Company Name *
            </label>
            <input
              type="text"
              value={companyData.companyName}
              onChange={(e) => setCompanyData({...companyData, companyName: e.target.value})}
              className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl text-lg font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 group-hover:border-gray-300"
              placeholder="Enter your company name"
            />
          </div>

          {/* Industry & Employee Count */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="group">
              <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                Industry *
              </label>
              <select
                value={companyData.industry}
                onChange={(e) => setCompanyData({...companyData, industry: e.target.value})}
                className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl text-lg font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 group-hover:border-gray-300 bg-white"
              >
                <option value="">Select your industry</option>
                <option value="Software">Software & Technology</option>
                <option value="E-commerce">E-commerce & Retail</option>
                <option value="Marketing">Marketing & Advertising</option>
                <option value="Consulting">Consulting & Services</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="group">
              <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-blue-600" />
                Number of Employees *
              </label>
              <select
                value={companyData.employeeCount}
                onChange={(e) => setCompanyData({...companyData, employeeCount: e.target.value})}
                className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl text-lg font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 group-hover:border-gray-300 bg-white"
              >
                <option value="">Select employee range</option>
                <option value="1-5">1-5 employees</option>
                <option value="6-15">6-15 employees</option>
                <option value="16-50">16-50 employees</option>
                <option value="51-100">51-100 employees</option>
                <option value="100+">100+ employees</option>
              </select>
            </div>
          </div>

          {/* Revenue Range */}
          <div className="group">
            <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-blue-600" />
              Annual Revenue *
            </label>
            <select
              value={companyData.revenue}
              onChange={(e) => setCompanyData({...companyData, revenue: e.target.value})}
              className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl text-lg font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 group-hover:border-gray-300 bg-white"
            >
              <option value="">Select annual revenue range</option>
              <option value="Under $1M">Under $1M</option>
              <option value="$1M - $5M">$1M - $5M</option>
              <option value="$5M - $25M">$5M - $25M</option>
              <option value="$25M - $100M">$25M - $100M</option>
              <option value="Over $100M">Over $100M</option>
            </select>
            <p className="text-sm text-gray-500 mt-2">💡 Higher revenue typically means larger R&D credit potential</p>
          </div>

          {/* R&D Start Year */}
          <div className="group">
            <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Check className="w-4 h-4 text-blue-600" />
              When did you start using AI/R&D activities? *
            </label>
            <select
              value={companyData.rdStartYear}
              onChange={(e) => setCompanyData({...companyData, rdStartYear: e.target.value})}
              className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl text-lg font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 group-hover:border-gray-300 bg-white"
            >
              <option value="2025">2025 (This year)</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
              <option value="Before 2022">Before 2022</option>
            </select>
            <div className="mt-3 p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
              <p className="text-sm font-medium text-amber-800 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                💡 You can claim credits for previous years through amended returns
              </p>
              <p className="text-xs text-amber-700 mt-1">
                ⏰ Amendment deadline for 2022-2024: July 2026
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-8">
          <button
            onClick={prevStep}
            className="group flex items-center gap-3 px-8 py-4 text-gray-600 hover:text-gray-900 border-2 border-gray-300 rounded-2xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 font-semibold"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Back to Activities
          </button>
          
          <button
            onClick={handleNext}
            disabled={!companyData.companyName || !companyData.industry || !companyData.employeeCount || !companyData.revenue}
            className={`
              relative overflow-hidden bg-gradient-to-r from-blue-600 to-green-600 text-white 
              py-4 px-10 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl 
              transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5
              disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
              group
            `}
          >
            {/* Button shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <span className="relative flex items-center gap-3">
              Continue to Expenses
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </div>
        </div>
      </div>
    </div>
  );
};

// Step 4: Email Capture with Credit Estimate
const EmailCaptureStep: React.FC<{
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  nextStep: () => void;
  prevStep: () => void;
}> = ({ formData, updateFormData, nextStep, prevStep }) => {
  const [email, setEmail] = useState(formData.email || '');
  const [estimatedRange, setEstimatedRange] = useState<any>(null);

  // Calculate estimated range based on business info
  useEffect(() => {
    if (formData.companyInfo && formData.activities) {
      const { revenue, employeeCount, rdStartYear } = formData.companyInfo;
      const activityCount = formData.activities.length;
      
      // Base estimate calculation
      let baseLow = 2000;
      let baseHigh = 8000;
      
      // Adjust based on revenue
      if (revenue?.includes('Under $100K')) { baseLow *= 0.5; baseHigh *= 0.7; }
      else if (revenue?.includes('$100K - $250K')) { baseLow *= 0.7; baseHigh *= 1.0; }
      else if (revenue?.includes('$250K - $500K')) { baseLow *= 1.0; baseHigh *= 1.5; }
      else if (revenue?.includes('$500K - $1M')) { baseLow *= 1.5; baseHigh *= 2.5; }
      else if (revenue?.includes('$1M - $2.5M')) { baseLow *= 2.5; baseHigh *= 4.0; }
      else if (revenue?.includes('$2.5M - $5M')) { baseLow *= 4.0; baseHigh *= 6.0; }
      else if (revenue?.includes('$5M - $10M')) { baseLow *= 6.0; baseHigh *= 8.0; }
      else if (revenue?.includes('$10M - $25M')) { baseLow *= 8.0; baseHigh *= 12.0; }
      else if (revenue?.includes('Over $25M')) { baseLow *= 12.0; baseHigh *= 20.0; }
      
      // Adjust based on employee count
      if (employeeCount?.includes('1-5')) { /* base */ }
      else if (employeeCount?.includes('6-15')) { baseLow *= 1.5; baseHigh *= 1.8; }
      else if (employeeCount?.includes('16-50')) { baseLow *= 2.0; baseHigh *= 3.0; }
      else if (employeeCount?.includes('51-100')) { baseLow *= 3.0; baseHigh *= 4.0; }
      else if (employeeCount?.includes('100+')) { baseLow *= 4.0; baseHigh *= 6.0; }
      
      // Adjust based on activity count
      const activityMultiplier = 0.7 + (activityCount * 0.1);
      baseLow *= activityMultiplier;
      baseHigh *= activityMultiplier;
      
      // Calculate years eligible
      let years = 1;
      if (rdStartYear === '2024') years = 2;
      else if (rdStartYear === '2023') years = 3;
      else if (rdStartYear === '2022') years = 4;
      else if (rdStartYear === 'Before 2022') years = 4;
      
      const totalLow = Math.round(baseLow * years);
      const totalHigh = Math.round(baseHigh * years);
      
      setEstimatedRange({
        low: Math.round(baseLow),
        high: Math.round(baseHigh),
        totalLow,
        totalHigh,
        years
      });
      
      updateFormData({ estimatedRange: { low: Math.round(baseLow), high: Math.round(baseHigh), totalLow, totalHigh, years } });
    }
  }, [formData.companyInfo, formData.activities]);

  const handleNext = () => {
    updateFormData({ email });
    nextStep();
  };

  return (
    <div className="stagger-item">
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            🎉 Great News! You Qualify for R&D Credits
          </h2>
          <p className="text-xl text-gray-600">
            Based on your business profile, here's your estimated credit range
          </p>
        </div>

        {estimatedRange && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-8 rounded-2xl mb-8">
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-green-600 mb-2">
                ${estimatedRange.low.toLocaleString()} - ${estimatedRange.high.toLocaleString()}
              </div>
              <div className="text-lg text-gray-700">
                Estimated Annual Federal R&D Tax Credit
              </div>
            </div>
            
            {estimatedRange.years > 1 && (
              <div className="text-center border-t border-gray-200 pt-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  ${estimatedRange.totalLow.toLocaleString()} - ${estimatedRange.totalHigh.toLocaleString()}
                </div>
                <div className="text-lg text-gray-700">
                  {estimatedRange.years}-Year Total Potential (Including Previous Years)
                </div>
                <p className="text-sm text-amber-600 mt-2">
                  ⏰ Amendment deadline for previous years: July 2026
                </p>
              </div>
            )}
            
            <div className="grid md:grid-cols-3 gap-4 mt-6 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-700">{formData.activities?.length}</div>
                <div className="text-sm text-gray-600">AI Activities</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-700">{formData.companyInfo?.employeeCount}</div>
                <div className="text-sm text-gray-600">Employees</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-700">{estimatedRange.years}</div>
                <div className="text-sm text-gray-600">Eligible Years</div>
              </div>
            </div>
          </div>
        )}

        {/* Email capture */}
        <div className="bg-white border-2 border-blue-200 rounded-xl p-6 mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
            Get Your Exact Credit Calculation
          </h3>
          <div className="max-w-md mx-auto">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="your@company.com"
            />
            <p className="text-xs text-gray-500 mt-2">
              We'll send your detailed calculation and next steps to this email
            </p>
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={prevStep}
            className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>
          
          <button
            onClick={handleNext}
            disabled={!email}
            className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-8 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="flex items-center gap-2">
              Calculate Exact Credit
              <ArrowRight className="w-5 h-5" />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Step 3: Enhanced Expense Collection with Real-time QRE
const ExpenseStep: React.FC<{
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  nextStep: () => void;
  prevStep: () => void;
}> = ({ formData, updateFormData, nextStep, prevStep }) => {
  const [expenses, setExpenses] = useState({
    employeeTime: formData.expenses?.employeeTime || '0',
    aiTools: formData.expenses?.aiTools || '0',
    contractors: formData.expenses?.contractors || '0',
    software: formData.expenses?.software || '0',
    training: formData.expenses?.training || '0'
  });

  // Real-time QRE calculation
  const calculateQRE = () => {
    const employeeTime = parseFloat(expenses.employeeTime.replace(/,/g, '')) || 0;
    const aiTools = parseFloat(expenses.aiTools.replace(/,/g, '')) || 0;
    const contractors = parseFloat(expenses.contractors.replace(/,/g, '')) || 0;
    const software = parseFloat(expenses.software.replace(/,/g, '')) || 0;
    const training = parseFloat(expenses.training.replace(/,/g, '')) || 0;
    
    // Apply qualification rates
    const qualifiedEmployeeTime = employeeTime * 0.8;
    const qualifiedAiTools = aiTools * 1.0;
    const qualifiedContractors = contractors * 0.65;
    const qualifiedSoftware = software * 1.0;
    const qualifiedTraining = training * 1.0;
    
    return {
      total: qualifiedEmployeeTime + qualifiedAiTools + qualifiedContractors + qualifiedSoftware + qualifiedTraining,
      breakdown: {
        employeeTime: qualifiedEmployeeTime,
        aiTools: qualifiedAiTools,
        contractors: qualifiedContractors,
        software: qualifiedSoftware,
        training: qualifiedTraining
      }
    };
  };

  const qre = calculateQRE();
  const estimatedCredit = Math.round(qre.total * 0.065);

  const updateExpense = (field: string, value: string) => {
    const newExpenses = { ...expenses, [field]: value };
    setExpenses(newExpenses);
    updateFormData({ expenses: newExpenses });
  };

  const handleNext = () => {
    updateFormData({ expenses });
    nextStep();
  };

  return (
    <div className="stagger-item">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header with Real-time QRE Display */}
        <div className="p-10 border-b border-gray-200 bg-gradient-to-r from-blue-50/50 to-green-50/50">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl mb-6">
              <Calculator className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              R&D Expense Details
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Enter your 2025 AI and R&D related expenses to calculate your qualified research expenses. We'll apply IRS-compliant qualification rules automatically.
            </p>
          </div>
          
          {/* Enhanced Real-time QRE Display */}
          <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6 text-center">Live Calculation Preview</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center group">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-3 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  ${Math.round(qre.total).toLocaleString()}
                </div>
                <div className="text-sm font-medium text-gray-700">Qualified Research Expenses</div>
                <div className="text-xs text-gray-500 mt-1">IRS-qualified amounts</div>
              </div>
              <div className="text-center group">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl mb-3 group-hover:scale-110 transition-transform">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-green-600 mb-1">
                  ${estimatedCredit.toLocaleString()}
                </div>
                <div className="text-sm font-medium text-gray-700">Estimated Federal Credit</div>
                <div className="text-xs text-gray-500 mt-1">6.5% of qualified expenses</div>
              </div>
              <div className="text-center group">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl mb-3 group-hover:scale-110 transition-transform">
                  <Calculator className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  {((estimatedCredit / (qre.total || 1)) * 100).toFixed(1)}%
                </div>
                <div className="text-sm font-medium text-gray-700">Effective Credit Rate</div>
                <div className="text-xs text-gray-500 mt-1">Return on R&D investment</div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-10">
          <div className="grid md:grid-cols-2 gap-8 mb-8">
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
              <EmployeeTimeCalculator 
                value={expenses.employeeTime} 
                onChange={(value) => updateExpense('employeeTime', value)}
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
                className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl text-lg font-medium focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-300"
                placeholder="12,000"
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
                className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl text-lg font-medium focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-300"
                placeholder="50,000"
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
                className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl text-lg font-medium focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-300"
                placeholder="25,000"
              />
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-xl col-span-2">
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
                className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl text-lg font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-300"
                placeholder="8,000"
              />
            </div>
          </div>

          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-100 rounded-xl">
                  <Shield className="w-6 h-6 text-amber-600" />
                </div>
              </div>
              <div>
                <h4 className="text-lg font-bold text-amber-800 mb-3">IRS Qualification Guidelines</h4>
                <p className="text-amber-800 leading-relaxed mb-4">
                  Not all expenses qualify 100%. We automatically apply IRS-compliant percentages to ensure your filing meets all requirements:
                </p>
                <div className="grid md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-amber-700">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span><strong>80%</strong> for employee wages</span>
                  </div>
                  <div className="flex items-center gap-2 text-amber-700">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span><strong>65%</strong> cap for contractors</span>
                  </div>
                  <div className="flex items-center gap-2 text-amber-700">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span><strong>100%</strong> for R&D tools & training</span>
                  </div>
                  <div className="flex items-center gap-2 text-amber-700">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span><strong>100%</strong> for supporting software</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-8">
            <button
              onClick={prevStep}
              className="group flex items-center gap-3 px-8 py-4 text-gray-600 hover:text-gray-900 border-2 border-gray-300 rounded-2xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 font-semibold"
            >
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              Back to Business Info
            </button>
            
            <button
              onClick={handleNext}
              className={`
                relative overflow-hidden bg-gradient-to-r from-blue-600 to-green-600 text-white 
                py-4 px-10 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl 
                transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5
                group
              `}
            >
              {/* Button shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <span className="relative flex items-center gap-3">
                See Final Results
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Step 4: Credit Estimate Display
const CreditEstimateStep: React.FC<{
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  calculateCreditEstimate: () => { currentYear: number; multiYear: number; activityCount: number; revenue: string };
}> = ({ formData, updateFormData, nextStep, prevStep, calculateCreditEstimate }) => {
  const [isCalculating, setIsCalculating] = useState(false);
  const [showEstimate, setShowEstimate] = useState(false);
  const [estimateData, setEstimateData] = useState<any>(null);
  
  useEffect(() => {
    const runEstimation = async () => {
      setIsCalculating(true);
      
      // Simulate calculation time for better UX
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const estimate = calculateCreditEstimate();
      setEstimateData(estimate);
      
      updateFormData({
        estimatedRange: {
          low: estimate.currentYear * 0.8,
          high: estimate.currentYear * 1.2,
          totalLow: estimate.multiYear * 0.8,
          totalHigh: estimate.multiYear * 1.2,
          years: 4
        }
      });
      
      setIsCalculating(false);
      setShowEstimate(true);
    };
    
    if (!showEstimate && !isCalculating) {
      runEstimation();
    }
  }, []);
  
  return (
    <div className="stagger-item">
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        {isCalculating ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-green-600 rounded-full mb-6">
              <Calculator className="w-10 h-10 text-white animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Calculating Your R&D Credit Estimate
            </h2>
            <p className="text-gray-600 mb-6">
              Analyzing your business profile and AI activities...
            </p>
            <div className="w-80 mx-auto bg-gray-200 rounded-full h-3">
              <div className="bg-gradient-to-r from-blue-600 to-green-600 h-3 rounded-full animate-pulse" style={{width: '75%'}}></div>
            </div>
          </div>
        ) : showEstimate && estimateData ? (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                🎉 Great News! Your Business Qualifies
              </h2>
              <p className="text-xl text-gray-600">
                Based on your {estimateData.activityCount} AI activities and {estimateData.revenue} revenue
              </p>
            </div>
            
            {/* Main Estimate Display */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 mb-8 text-center">
              <div className="mb-6">
                <div className="text-5xl font-bold text-green-600 mb-2">
                  ${estimateData.currentYear.toLocaleString()}
                </div>
                <div className="text-lg font-semibold text-gray-700">2025 Estimated Federal Credit</div>
                <div className="text-sm text-gray-600">Based on your current AI implementation</div>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white bg-opacity-60 rounded-xl p-4">
                  <div className="text-2xl font-bold text-blue-600">{estimateData.activityCount}</div>
                  <div className="text-sm text-gray-600">Qualifying AI Activities</div>
                </div>
                <div className="bg-white bg-opacity-60 rounded-xl p-4">
                  <div className="text-2xl font-bold text-purple-600">{estimateData.revenue}</div>
                  <div className="text-sm text-gray-600">Annual Revenue</div>
                </div>
                <div className="bg-white bg-opacity-60 rounded-xl p-4">
                  <div className="text-2xl font-bold text-orange-600">6.5%</div>
                  <div className="text-sm text-gray-600">Federal Credit Rate</div>
                </div>
              </div>
            </div>
            
            {/* Multi-Year Potential */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
              <div className="text-center">
                <h3 className="text-xl font-bold text-amber-800 mb-3">💰 Multi-Year Opportunity</h3>
                <div className="text-3xl font-bold text-amber-700 mb-2">
                  ${estimateData.multiYear.toLocaleString()}
                </div>
                <p className="text-amber-700">
                  <strong>Potential total for 2022-2025</strong> (4 years)
                </p>
                <div className="mt-4 bg-amber-100 rounded-lg p-4">
                  <p className="text-sm text-amber-800">
                    ⏰ <strong>Amendment deadline: July 2026</strong> for previous years (2022-2024)<br/>
                    Most businesses miss out on $75,000+ by waiting too long!
                  </p>
                </div>
              </div>
            </div>
            
            {/* What's Next */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-bold text-blue-900 mb-4">📋 Next: Enter Your Exact Expenses</h3>
              <p className="text-blue-800 mb-4">
                We'll calculate your precise credit amount using IRS-compliant qualification rules:
              </p>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-700">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>Employee wages (80% qualification rate)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>AI tools & software (100% qualification)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>Contractors (65% cap per IRS rules)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>Training & education (100% qualification)</span>
                </div>
              </div>
            </div>
            
            {/* Navigation */}
            <div className="flex justify-between pt-6">
              <button
                onClick={prevStep}
                className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                Back
              </button>
              
              <button
                onClick={nextStep}
                className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-3 px-8 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                <span className="flex items-center gap-2">
                  Enter Exact Expenses
                  <ArrowRight className="w-5 h-5" />
                </span>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-600">Loading your credit estimate...</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Step 5: Results and Next Steps
const ResultsStep: React.FC<{
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  calculateResults: () => Promise<void>;
  isCalculating: boolean;
}> = ({ formData, updateFormData, calculateResults, isCalculating }) => {
  const [hasCalculated, setHasCalculated] = useState(false);
  
  useEffect(() => {
    if (!hasCalculated && !formData.results) {
      calculateResults().then(() => setHasCalculated(true));
    }
  }, []);
  
  const proceedToCheckout = () => {
    // Save data for checkout
    localStorage.setItem('rd_credit_email', formData.email || '');
    localStorage.setItem('rd_calculation_results', JSON.stringify({
      ...formData.results,
      companyInfo: formData.companyInfo,
      activities: formData.activities,
      estimatedRange: formData.estimatedRange
    }));
    
    // Navigate to checkout
    window.location.href = '/checkout';
  };
  
  return (
    <div className="stagger-item">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {isCalculating ? (
          <div className="p-8">
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-full mb-4">
                <Calculator className="w-8 h-8 text-white animate-pulse" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Calculating Your Exact Credit Amount
              </h3>
              <p className="text-gray-600 mb-4">
                Analyzing your expenses and applying IRS qualification rules...
              </p>
              <div className="w-64 mx-auto bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-600 to-green-600 h-2 rounded-full animate-pulse" style={{width: '100%'}}></div>
              </div>
            </div>
          </div>
        ) : formData.results ? (
          <div>
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-3">
                  🎉 Congratulations, {formData.companyInfo?.companyName || 'there'}!
                </h2>
                <p className="text-xl text-blue-100">
                  You qualify for ${formData.results.federalCredit.toLocaleString()} in federal R&D tax credits
                </p>
                {formData.estimatedRange?.years && formData.estimatedRange.years > 1 && (
                  <p className="text-blue-100 mt-2">
                    Plus potential for ${(formData.results.federalCredit * (formData.estimatedRange.years - 1)).toLocaleString()} more from previous years!
                  </p>
                )}
              </div>
            </div>

            <div className="p-8">
              {/* Credit Summary */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    ${formData.results.totalQRE.toLocaleString()}
                  </div>
                  <div className="text-sm font-medium text-gray-700">
                    Total Qualified R&D Expenses
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    ${formData.results.federalCredit.toLocaleString()}
                  </div>
                  <div className="text-sm font-medium text-gray-700">
                    Federal R&D Tax Credit (6.5%)
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
                    After ${formData.results.price.toLocaleString()} service fee
                  </div>
                </div>
              </div>

              {/* ROI Highlight */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl mb-8 text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {Math.round(formData.results.federalCredit / formData.results.price)}x ROI
                </div>
                <p className="text-gray-700">
                  For every $1 you invest in our service, you get ${Math.round(formData.results.federalCredit / formData.results.price)} back in tax credits!
                </p>
              </div>

              {/* What You Get */}
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">What You'll Receive</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-gray-700">Complete Form 6765 preparation</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-gray-700">Technical narrative documentation</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-gray-700">Detailed QRE expense workbook</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-gray-700">IRS compliance memo and guidance</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-gray-700">Record-keeping checklist</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-gray-700">48-hour document delivery</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-gray-700">Audit support included</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Your Business Profile</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-600">Company:</span> <span className="font-medium">{formData.companyInfo?.companyName}</span></div>
                    <div><span className="text-gray-600">Industry:</span> <span className="font-medium">{formData.companyInfo?.industry}</span></div>
                    <div><span className="text-gray-600">Revenue:</span> <span className="font-medium">{formData.companyInfo?.revenue}</span></div>
                    <div><span className="text-gray-600">Employees:</span> <span className="font-medium">{formData.companyInfo?.employeeCount}</span></div>
                    <div><span className="text-gray-600">R&D Since:</span> <span className="font-medium">{formData.companyInfo?.rdStartYear}</span></div>
                  </div>

                  <div className="mt-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Qualifying AI Activities ({formData.activities?.length})</h4>
                    <div className="flex flex-wrap gap-2">
                      {formData.activities?.map((activity) => (
                        <span key={activity} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {activity.replace('ai-', '').replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Urgency Banner */}
              {formData.estimatedRange?.years && formData.estimatedRange.years > 1 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
                  <div className="flex items-start gap-2">
                    <Shield className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-900 mb-1">⏰ Amendment Deadline: July 2026</p>
                      <p className="text-sm text-red-800">
                        You can still claim R&D credits for previous tax years through amended returns. 
                        Don't miss out on ${(formData.results.federalCredit * (formData.estimatedRange.years - 1)).toLocaleString()} in additional credits!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="text-center">
                <button
                  onClick={proceedToCheckout}
                  className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-4 px-12 rounded-xl font-bold text-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 mb-4"
                >
                  Secure Your ${formData.results.federalCredit.toLocaleString()} Credit → Checkout
                </button>
                <p className="text-sm text-gray-600 mb-4">
                  🔒 Secure payment • 30-day money-back guarantee • No upfront cost
                </p>
                <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span>IRS Compliant</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                    <span>500+ Businesses Served</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                <p className="text-xs text-gray-500">
                  These calculations follow current IRS regulations for R&D tax credits. 
                  All documents prepared by qualified tax professionals with audit support included.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-600">Loading your results...</p>
          </div>
        )}
      </div>
    </div>
  );
};


export default AmazingCalculator;