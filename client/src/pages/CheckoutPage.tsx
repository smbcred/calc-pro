import React, { useState } from 'react';
import { Link } from 'wouter';
import { 
  ArrowLeft, Check, CreditCard, Shield, Lock, FileText, 
  Clock, Users, Zap, ChevronRight, Star, AlertCircle 
} from 'lucide-react';

interface CheckoutPageProps {
  calculationResults?: any;
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({ calculationResults }) => {
  const [selectedYears, setSelectedYears] = useState<string[]>(['2025']);

  // Get calculation results from props
  const results = calculationResults || {
    federal: { creditAmount: 28500 },
    totalBenefit: 33700,
    industry: 'SaaS/Tech'
  };

  // Dynamic pricing based on credit amount
  const calculateBasePrice = (creditAmount: number) => {
    if (creditAmount < 10000) return 500;
    if (creditAmount <= 50000) return 750;
    if (creditAmount <= 100000) return 1000;
    return 1500;
  };

  const basePrice = calculateBasePrice(results.federal?.creditAmount || 0);
  const additionalYearPrice = 297;
  const additionalYearsCount = selectedYears.length - 1; // Current year is included
  const totalPrice = basePrice + (additionalYearsCount * additionalYearPrice);

  const availableYears = [
    { year: '2025', label: 'Current Year', included: true },
    { year: '2024', label: 'Lookback', price: additionalYearPrice },
    { year: '2023', label: 'Lookback', price: additionalYearPrice },
    { year: '2022', label: 'Lookback', price: additionalYearPrice }
  ];

  const handleYearToggle = (year: string) => {
    if (year === '2025') return; // Current year is always included
    
    setSelectedYears(prev => {
      if (prev.includes(year)) {
        return prev.filter(y => y !== year);
      } else {
        return [...prev, year];
      }
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleContinueToPayment = () => {
    // Here we would integrate with Stripe
    console.log('Continue to Stripe payment:', {
      selectedYears,
      totalPrice,
      basePrice
    });
    
    // For now, just show an alert
    alert(`Stripe integration coming soon! Total: ${formatCurrency(totalPrice)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                  <span>Back to Calculator</span>
                </button>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-xl font-bold text-gray-900">Your R&D Tax Credit Documentation</h1>
            </div>
            <div className="flex items-center gap-2 text-green-700">
              <Shield className="w-5 h-5" />
              <span className="font-medium">Secure Checkout</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Results Summary */}
        <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-2xl p-6 mb-8 border border-green-200">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Federal R&D Tax Credit Analysis</h2>
            <div className="flex justify-center items-center gap-8 mb-4">
              <div>
                <div className="text-3xl font-bold text-green-600">{formatCurrency(results.federal?.creditAmount || 0)}</div>
                <div className="text-sm text-gray-600">Calculated Credit</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{formatCurrency(basePrice)}</div>
                <div className="text-sm text-gray-600">Your Price</div>
              </div>
            </div>
            <p className="text-gray-700">
              Price based on your credit amount of {formatCurrency(results.federal?.creditAmount || 0)}
            </p>
          </div>
        </div>

        {/* Year Selection Section */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8 mb-8">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">📅 Select Tax Years to File</h3>
            <p className="text-gray-600">Add previous years to maximize your credit recovery</p>
          </div>

          <div className="space-y-4">
            {availableYears.map((yearOption) => (
              <div
                key={yearOption.year}
                className={`border rounded-xl p-4 transition-all cursor-pointer ${
                  selectedYears.includes(yearOption.year)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                } ${yearOption.included ? 'opacity-100' : ''}`}
                onClick={() => handleYearToggle(yearOption.year)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedYears.includes(yearOption.year)}
                      onChange={() => handleYearToggle(yearOption.year)}
                      disabled={yearOption.included}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-semibold text-gray-900">
                        {yearOption.year} ({yearOption.label})
                        {yearOption.included && ': Included'}
                      </div>
                      {!yearOption.included && selectedYears.includes(yearOption.year) && (
                        <div className="text-sm text-blue-600">Adding this year to your filing</div>
                      )}
                    </div>
                  </div>
                  {!yearOption.included && (
                    <div className="text-lg font-bold text-gray-900">
                      +{formatCurrency(yearOption.price)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Why Add Previous Years */}
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-bold text-yellow-800 mb-2">Why add previous years?</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Most businesses using ChatGPT and AI tools qualify for 2+ years</li>
              <li>• Same documentation effort covers all years</li>
              <li>• Credits expire after 3 years - don't miss out</li>
              <li>• Multi-year discount already applied</li>
            </ul>
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Pricing Summary</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="font-medium text-gray-900">Base (2025):</span>
              <span className="font-bold text-gray-900">{formatCurrency(basePrice)}</span>
            </div>
            
            {additionalYearsCount > 0 && (
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="font-medium text-gray-900">
                  Additional Years ({additionalYearsCount}):
                </span>
                <span className="font-bold text-gray-900">{formatCurrency(additionalYearsCount * additionalYearPrice)}</span>
              </div>
            )}
            
            <div className="border-t-2 border-gray-300 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-gray-900">Total:</span>
                <span className="text-2xl font-bold text-blue-600">{formatCurrency(totalPrice)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* What's Included */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">What's Included</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <div className="font-medium text-gray-900">Complete R&D tax credit calculation</div>
                <div className="text-sm text-gray-600">Professional analysis of your qualifying activities</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <div className="font-medium text-gray-900">IRS Form 6765 (completed)</div>
                <div className="text-sm text-gray-600">Ready-to-file forms for your CPA</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <div className="font-medium text-gray-900">Supporting documentation package</div>
                <div className="text-sm text-gray-600">Complete backup for your filing</div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <div className="font-medium text-gray-900">CPA cover letter</div>
                <div className="text-sm text-gray-600">Professional explanation for your tax advisor</div>
              </div>
            </div>
          </div>
        </div>

        {/* Continue to Payment */}
        <div className="text-center">
          <button
            onClick={handleContinueToPayment}
            className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-4 px-8 rounded-xl font-bold text-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            <span className="flex items-center gap-3">
              <CreditCard className="w-6 h-6" />
              Continue to Payment - {formatCurrency(totalPrice)}
              <ChevronRight className="w-6 h-6" />
            </span>
          </button>
          
          <div className="flex items-center justify-center gap-6 mt-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-600" />
              <span>Secure SSL Encryption</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-green-600" />
              <span>No Hidden Fees</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;