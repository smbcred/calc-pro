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
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('annual');

  // Mock calculation results if none provided
  const results = calculationResults || {
    federalCredit: 28500,
    stateCredit: 5200,
    totalCredit: 33700,
    selectedYears: ['2024', '2023', '2022'],
    industry: 'SaaS/Tech'
  };

  const packages = {
    starter: {
      name: 'Essential Package',
      price: { monthly: 497, annual: 397 },
      description: 'Perfect for single tax year filing',
      features: [
        'Complete R&D tax credit calculation',
        'IRS Form 6765 (filled out)',
        'Supporting documentation package',
        'Filing instructions for your CPA',
        'Email support'
      ],
      highlight: false,
      maxCredit: 50000
    },
    professional: {
      name: 'Professional Package',
      price: { monthly: 997, annual: 797 },
      description: 'Most popular for multi-year filings',
      features: [
        'Everything in Essential Package',
        'Multi-year filing support (up to 4 years)',
        'State R&D credit analysis',
        'Detailed expense categorization',
        'Priority email & phone support',
        'CPA consultation call (30 min)'
      ],
      highlight: true,
      maxCredit: 150000
    },
    enterprise: {
      name: 'Enterprise Package',
      price: { monthly: 1997, annual: 1597 },
      description: 'For complex businesses with high credits',
      features: [
        'Everything in Professional Package',
        'Advanced multi-entity support',
        'Custom expense analysis',
        'Dedicated tax specialist',
        'Unlimited phone support',
        'On-demand CPA consultations',
        'Audit defense guidance'
      ],
      highlight: false,
      maxCredit: null
    }
  };

  const getRecommendedPackage = () => {
    const totalCredit = results.totalCredit || 0;
    if (totalCredit > 100000 || results.selectedYears?.length > 2) return 'enterprise';
    if (totalCredit > 30000 || results.selectedYears?.length > 1) return 'professional';
    return 'starter';
  };

  const recommendedPackage = getRecommendedPackage();

  const handleContinueToPayment = () => {
    if (!selectedPackage) {
      alert('Please select a package to continue');
      return;
    }
    
    // Here we would integrate with Stripe
    console.log('Continue to Stripe payment:', {
      package: selectedPackage,
      billingPeriod,
      amount: packages[selectedPackage as keyof typeof packages].price[billingPeriod]
    });
    
    // For now, just show an alert
    alert(`Stripe integration coming soon! Selected: ${packages[selectedPackage as keyof typeof packages].name} - $${packages[selectedPackage as keyof typeof packages].price[billingPeriod]}`);
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
              <h1 className="text-xl font-bold text-gray-900">Choose Your Documentation Package</h1>
            </div>
            <div className="flex items-center gap-2 text-green-700">
              <Shield className="w-5 h-5" />
              <span className="font-medium">Secure Checkout</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Results Summary */}
        <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-2xl p-6 mb-8 border border-green-200">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Calculated R&D Tax Credits</h2>
            <div className="flex justify-center items-center gap-8 mb-4">
              <div>
                <div className="text-3xl font-bold text-green-600">${results.totalCredit?.toLocaleString() || '0'}</div>
                <div className="text-sm text-gray-600">Total Credits</div>
              </div>
              {results.selectedYears && (
                <div>
                  <div className="text-2xl font-bold text-blue-600">{results.selectedYears.length} Year{results.selectedYears.length > 1 ? 's' : ''}</div>
                  <div className="text-sm text-gray-600">Filing Period</div>
                </div>
              )}
            </div>
            <p className="text-gray-700">
              Your estimated credits are ready for professional documentation. 
              Choose a package below to get your IRS-ready forms.
            </p>
          </div>
        </div>

        {/* Billing Toggle */}
        <div className="text-center mb-8">
          <div className="inline-flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setBillingPeriod('annual')}
              className={`px-6 py-2 rounded-md transition-all ${
                billingPeriod === 'annual' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Annual (Save 20%)
            </button>
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-2 rounded-md transition-all ${
                billingPeriod === 'monthly' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
          </div>
        </div>

        {/* Package Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {Object.entries(packages).map(([key, pkg]) => (
            <div 
              key={key}
              className={`relative bg-white rounded-2xl border-2 transition-all cursor-pointer hover:shadow-lg ${
                selectedPackage === key 
                  ? 'border-blue-500 shadow-lg scale-105' 
                  : pkg.highlight 
                    ? 'border-green-400 shadow-md' 
                    : 'border-gray-200 hover:border-gray-300'
              } ${pkg.highlight ? 'lg:scale-105' : ''}`}
              onClick={() => setSelectedPackage(key)}
            >
              {/* Recommended Badge */}
              {key === recommendedPackage && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    Recommended
                  </div>
                </div>
              )}

              {/* Most Popular Badge */}
              {pkg.highlight && (
                <div className="absolute -top-3 right-6">
                  <div className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                </div>
              )}

              <div className="p-8">
                {/* Header */}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                  <p className="text-gray-600 mb-4">{pkg.description}</p>
                  
                  {/* Price */}
                  <div className="mb-4">
                    <div className="text-4xl font-bold text-gray-900">
                      ${pkg.price[billingPeriod].toLocaleString()}
                    </div>
                    {billingPeriod === 'annual' && (
                      <div className="text-sm text-gray-500 line-through">
                        ${pkg.price.monthly.toLocaleString()}/mo
                      </div>
                    )}
                  </div>

                  {/* Max Credit Info */}
                  {pkg.maxCredit && (
                    <div className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
                      Best for credits up to ${pkg.maxCredit.toLocaleString()}
                    </div>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-3 mb-6">
                  {pkg.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Selection Button */}
                <button
                  onClick={() => setSelectedPackage(key)}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                    selectedPackage === key
                      ? 'bg-blue-500 text-white'
                      : pkg.highlight
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {selectedPackage === key ? 'Selected' : 'Select Package'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Signals */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">IRS Compliant</div>
                <div className="text-sm text-gray-600">All forms meet current IRS requirements</div>
              </div>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Lock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">Secure & Private</div>
                <div className="text-sm text-gray-600">Bank-level encryption protects your data</div>
              </div>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="font-semibold text-gray-900">Fast Delivery</div>
                <div className="text-sm text-gray-600">Receive your package within 24 hours</div>
              </div>
            </div>
          </div>
        </div>

        {/* Important Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
          <div className="flex gap-4">
            <AlertCircle className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Important Notice</h3>
              <p className="text-blue-800 text-sm leading-relaxed">
                This service provides document preparation only - we are not providing tax advice. 
                All calculations are estimates. Please consult with your tax professional or CPA 
                for final filing decisions. Your actual credit may vary based on your specific circumstances.
              </p>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <button
            onClick={handleContinueToPayment}
            disabled={!selectedPackage}
            className={`inline-flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-lg transition-all ${
              selectedPackage
                ? 'bg-gradient-to-r from-blue-500 to-green-500 text-white hover:from-blue-600 hover:to-green-600 shadow-lg hover:shadow-xl'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <CreditCard className="w-6 h-6" />
            Continue to Secure Payment
            <ChevronRight className="w-5 h-5" />
          </button>
          
          {!selectedPackage && (
            <p className="text-sm text-gray-500 mt-2">Please select a package to continue</p>
          )}
        </div>

        {/* Money Back Guarantee */}
        <div className="text-center mt-8">
          <div className="inline-flex items-center gap-2 text-green-700 bg-green-50 px-4 py-2 rounded-full">
            <Check className="w-5 h-5" />
            <span className="font-medium">7-Day Satisfaction Guarantee</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;