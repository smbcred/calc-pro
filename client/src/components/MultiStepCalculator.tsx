import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Calculator, DollarSign, Building2, CheckCircle, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MultiStepCalculatorProps {
  initialStep?: number;
}

interface FormData {
  // Company Info (Step 2)
  companyName: string;
  industry: string;
  employees: string;
  annualRevenue: string;
  primaryState: string;
  email: string;
  
  // Expenses (Step 3)
  wages: number;
  wageRdPercent: number;
  contractors: number;
  contractorRdPercent: number;
  supplies: number;
  suppliesRdPercent: number;
  
  // Results (Step 4)
  totalQRE?: number;
  federalCredit?: number;
  tier?: number;
  price?: number;
  savingsAmount?: number;
}

const MultiStepCalculator: React.FC<MultiStepCalculatorProps> = ({ initialStep = 2 }) => {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    industry: '',
    employees: '',
    annualRevenue: '',
    primaryState: '',
    email: '',
    wages: 0,
    wageRdPercent: 80,
    contractors: 0,
    contractorRdPercent: 100,
    supplies: 0,
    suppliesRdPercent: 100,
  });
  const [isCalculating, setIsCalculating] = useState(false);
  const [results, setResults] = useState<any>(null);

  const steps = [
    { number: 1, title: 'Qualification', description: 'Select qualifying activities', completed: true },
    { number: 2, title: 'Company Info', description: 'Tell us about your business', completed: currentStep > 2 },
    { number: 3, title: 'Expenses', description: 'Enter your R&D expenses', completed: currentStep > 3 },
    { number: 4, title: 'Results', description: 'Your tax credit estimate', completed: currentStep > 4 },
  ];

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleNextStep = async () => {
    if (currentStep === 3) {
      // Calculate results before moving to step 4
      await calculateResults();
    }
    setCurrentStep(prev => Math.min(4, prev + 1));
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(2, prev - 1));
  };

  const calculateResults = async () => {
    try {
      setIsCalculating(true);
      
      const calculationData = {
        wages: formData.wages || 0,
        wageRdPercent: formData.wageRdPercent || 0,
        contractors: formData.contractors || 0,
        contractorRdPercent: formData.contractorRdPercent || 0,
        supplies: formData.supplies || 0,
        suppliesRdPercent: formData.suppliesRdPercent || 0,
      };

      const response = await fetch('/api/calculator/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(calculationData),
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data);
        updateFormData(data);
      }
    } catch (error) {
      console.error('Calculation error:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 2:
        return !!(formData.companyName && formData.industry && formData.employees && 
                 formData.annualRevenue && formData.primaryState && formData.email);
      case 3:
        return (formData.wages > 0) || (formData.contractors > 0) || (formData.supplies > 0);
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                  step.number === currentStep 
                    ? 'bg-blue-600 text-white'
                    : step.completed || step.number < currentStep
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step.completed && step.number < currentStep ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    step.number
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-20 h-1 mx-2 ${
                    step.number < currentStep ? 'bg-green-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Step {currentStep}: {steps.find(s => s.number === currentStep)?.title}
            </h1>
            <p className="text-gray-600">{steps.find(s => s.number === currentStep)?.description}</p>
          </div>
        </div>

        {/* Step Content */}
        <Card className="mb-8">
          <CardContent className="p-8">
            {currentStep === 2 && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Company Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => updateFormData({ companyName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Your company name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Industry *</label>
                    <select
                      value={formData.industry}
                      onChange={(e) => updateFormData({ industry: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select industry</option>
                      <option value="Software">Software</option>
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Biotech">Biotech</option>
                      <option value="Aerospace">Aerospace</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Number of Employees *</label>
                    <select
                      value={formData.employees}
                      onChange={(e) => updateFormData({ employees: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select range</option>
                      <option value="1-10">1-10</option>
                      <option value="11-50">11-50</option>
                      <option value="51-200">51-200</option>
                      <option value="201-500">201-500</option>
                      <option value="500+">500+</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Annual Revenue *</label>
                    <select
                      value={formData.annualRevenue}
                      onChange={(e) => updateFormData({ annualRevenue: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select range</option>
                      <option value="Under $1M">Under $1M</option>
                      <option value="$1M - $5M">$1M - $5M</option>
                      <option value="$5M - $25M">$5M - $25M</option>
                      <option value="$25M - $100M">$25M - $100M</option>
                      <option value="$100M+">$100M+</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Primary State *</label>
                    <select
                      value={formData.primaryState}
                      onChange={(e) => updateFormData({ primaryState: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select state</option>
                      <option value="California">California</option>
                      <option value="New York">New York</option>
                      <option value="Texas">Texas</option>
                      <option value="Florida">Florida</option>
                      <option value="Illinois">Illinois</option>
                      {/* Add more states as needed */}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateFormData({ email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="your@company.com"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div>
                <h2 className="text-xl font-semibold mb-6">R&D Expenses</h2>
                <div className="space-y-6">
                  {/* Wages */}
                  <div className="border rounded-lg p-6">
                    <h3 className="font-semibold text-lg mb-4">Employee Wages</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Total Annual Wages</label>
                        <input
                          type="number"
                          value={formData.wages}
                          onChange={(e) => updateFormData({ wages: Number(e.target.value) })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                          placeholder="500000"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">% Used for R&D</label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={formData.wageRdPercent}
                          onChange={(e) => updateFormData({ wageRdPercent: Number(e.target.value) })}
                          className="w-full"
                        />
                        <div className="text-center text-sm text-gray-600 mt-1">{formData.wageRdPercent}%</div>
                      </div>
                    </div>
                  </div>

                  {/* Contractors */}
                  <div className="border rounded-lg p-6">
                    <h3 className="font-semibold text-lg mb-4">Contractor Costs</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Total Contractor Costs</label>
                        <input
                          type="number"
                          value={formData.contractors}
                          onChange={(e) => updateFormData({ contractors: Number(e.target.value) })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                          placeholder="100000"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">% Used for R&D</label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={formData.contractorRdPercent}
                          onChange={(e) => updateFormData({ contractorRdPercent: Number(e.target.value) })}
                          className="w-full"
                        />
                        <div className="text-center text-sm text-gray-600 mt-1">{formData.contractorRdPercent}%</div>
                      </div>
                    </div>
                  </div>

                  {/* Supplies */}
                  <div className="border rounded-lg p-6">
                    <h3 className="font-semibold text-lg mb-4">Supply Costs</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Total Supply Costs</label>
                        <input
                          type="number"
                          value={formData.supplies}
                          onChange={(e) => updateFormData({ supplies: Number(e.target.value) })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                          placeholder="50000"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">% Used for R&D</label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={formData.suppliesRdPercent}
                          onChange={(e) => updateFormData({ suppliesRdPercent: Number(e.target.value) })}
                          className="w-full"
                        />
                        <div className="text-center text-sm text-gray-600 mt-1">{formData.suppliesRdPercent}%</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div>
                <h2 className="text-xl font-semibold mb-6">Your R&D Tax Credit Results</h2>
                {results && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Calculator className="w-5 h-5 text-blue-600" />
                            Total QRE
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold text-blue-600">
                            ${results.totalQRE?.toLocaleString()}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-green-600" />
                            Federal Credit
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold text-green-600">
                            ${results.federalCredit?.toLocaleString()}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-purple-600" />
                            Your Savings
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold text-purple-600">
                            ${results.savingsAmount?.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            After ${results.price} service fee
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="text-center">
                      <button
                        onClick={() => {
                          // Save email and results to localStorage for checkout
                          if (typeof window !== 'undefined') {
                            localStorage.setItem('rd_credit_email', formData.email);
                            localStorage.setItem('rd_calculation_results', JSON.stringify(results));
                          }
                          window.location.href = '/checkout';
                        }}
                        className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-4 px-8 rounded-xl font-bold text-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                      >
                        <span className="flex items-center gap-3">
                          Proceed to Checkout
                          <ArrowRight className="w-6 h-6" />
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={handlePrevStep}
            disabled={currentStep === 2}
            className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>
          
          <button
            onClick={handleNextStep}
            disabled={!isStepValid(currentStep) || (currentStep === 3 && isCalculating)}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCalculating ? (
              'Calculating...'
            ) : (
              <>
                {currentStep === 4 ? 'Done' : 'Continue'}
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MultiStepCalculator;