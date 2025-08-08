import React, { useState } from 'react';
import { Link } from 'wouter';
import { 
  ArrowLeft, Check, CreditCard, Shield, Lock, FileText, 
  Clock, Users, Zap, ChevronRight, Star, AlertCircle 
} from 'lucide-react';

interface CheckoutPageProps {
  calculationResults?: any;
  userEmail?: string;
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({ calculationResults, userEmail }) => {
  const [selectedYears, setSelectedYears] = useState<string[]>(['2025']);
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutEmail, setCheckoutEmail] = useState('');

  // Get calculation results from props or localStorage
  const getCalculationResults = () => {
    if (calculationResults) {
      return calculationResults;
    }
    
    // Check localStorage for results from calculator
    if (typeof window !== 'undefined') {
      const storedResults = localStorage.getItem('rd_calculation_results');
      if (storedResults) {
        try {
          const parsed = JSON.parse(storedResults);
          // Convert calculator API format to checkout format
          return {
            federal: { creditAmount: parsed.federalCredit || 28500 },
            totalBenefit: parsed.savingsAmount ? (parsed.federalCredit + parsed.savingsAmount) : 33700,
            industry: 'Software/Tech',
            totalQRE: parsed.totalQRE,
            tier: parsed.tier,
            basePrice: parsed.price
          };
        } catch (error) {
          console.error('Error parsing stored results:', error);
        }
      }
    }
    
    // Default fallback
    return {
      federal: { creditAmount: 28500 },
      totalBenefit: 33700,
      industry: 'Software/Tech'
    };
  };
  
  const results = getCalculationResults();

  // Get email from props or localStorage
  const savedEmail = userEmail || 
                     (typeof window !== 'undefined' ? localStorage.getItem('rd_credit_email') : null);
  
  // Use saved email or checkout email input
  const email = savedEmail || checkoutEmail;

  // Dynamic pricing based on credit amount
  const calculateBasePrice = (creditAmount: number) => {
    if (creditAmount < 10000) return 500;
    if (creditAmount <= 50000) return 750;
    if (creditAmount <= 100000) return 1000;
    return 1500;
  };

  const basePrice = results.basePrice || calculateBasePrice(results.federal?.creditAmount || 0);
  const additionalYearPrice = 297;
  const additionalYearsCount = selectedYears.length - 1; // Current year is included
  const totalPrice = basePrice + (additionalYearsCount * additionalYearPrice);

  const availableYears = [
    { year: '2025', label: 'Current Year', included: true, estimatedCredit: results.federal?.creditAmount || 0 },
    { year: '2024', label: 'Lookback', price: additionalYearPrice, estimatedCredit: Math.round((results.federal?.creditAmount || 0) * 0.9) },
    { year: '2023', label: 'Lookback', price: additionalYearPrice, estimatedCredit: Math.round((results.federal?.creditAmount || 0) * 0.85) },
    { year: '2022', label: 'Lookback', price: additionalYearPrice, estimatedCredit: Math.round((results.federal?.creditAmount || 0) * 0.8) }
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

  const handleContinueToPayment = async () => {
    // Validate email before proceeding
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address to continue');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Save email to localStorage if not already saved
      if (!savedEmail && typeof window !== 'undefined') {
        localStorage.setItem('rd_credit_email', email);
      }

      // Convert selected years to numbers
      const yearsAsNumbers = selectedYears.map(year => parseInt(year));
      
      console.log('Initiating Stripe checkout:', {
        email,
        tierBasePrice: basePrice,
        yearsSelected: yearsAsNumbers,
        totalExpected: totalPrice
      });

      // Call our Stripe checkout API
      const response = await fetch('/api/stripeCheckout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          tierBasePrice: basePrice,
          yearsSelected: yearsAsNumbers,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();
      
      console.log('Redirecting to Stripe:', url);
      
      // Redirect to Stripe Checkout
      window.location.href = url;
      
    } catch (error) {
      console.error('Checkout error:', error);
      alert(`Payment setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsProcessing(false);
    }
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
              <div>
                <h1 className="text-xl font-bold text-gray-900">Complete Your R&D Tax Credit Order</h1>
                <div className="text-sm text-blue-600 font-medium">Final Step • Secure Checkout</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-green-700">
              <Shield className="w-5 h-5" />
              <span className="font-medium">256-bit Encryption</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Enhanced Results Summary with ROI */}
        <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-2xl p-8 mb-8 border border-green-200 relative overflow-hidden">
          {/* ROI Badge */}
          <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold">
            {Math.round((results.federal?.creditAmount || 0) / basePrice)}x ROI
          </div>
          
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Get {formatCurrency(results.federal?.creditAmount || 0)} for just {formatCurrency(basePrice)}</h2>
            
            <div className="flex justify-center items-center gap-12 mb-6">
              <div className="text-center">
                <div className="text-5xl font-black text-green-600 mb-2">{formatCurrency(results.federal?.creditAmount || 0)}</div>
                <div className="text-lg font-semibold text-gray-700">Your Credit</div>
                <div className="text-sm text-gray-600">Direct payment from IRS</div>
              </div>
              <div className="text-6xl text-gray-400 font-light">→</div>
              <div className="text-center">
                <div className="text-4xl font-black text-blue-600 mb-2">{formatCurrency(basePrice)}</div>
                <div className="text-lg font-semibold text-gray-700">Your Investment</div>
                <div className="text-sm text-gray-600">Complete filing package</div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl p-4 border border-yellow-200">
              <p className="text-lg font-bold text-gray-900 mb-1">
                {Math.round((results.federal?.creditAmount || 0) / basePrice)}x return on investment
              </p>
              <p className="text-sm text-gray-700">
                You're getting {formatCurrency((results.federal?.creditAmount || 0) - basePrice)} more than you're paying
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced July 2026 Deadline Callout */}
        <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-8 mb-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-orange-800 mb-4">⏰ July 2026 Amendment Deadline</h3>
            <p className="text-lg text-orange-700 mb-4 leading-relaxed">
              You have until July 2026 to claim 2022-2024 credits. After that, these credits expire forever. 
              <strong className="block mt-2 text-xl">Most businesses miss out on $75,000+ by waiting too long.</strong>
            </p>
            <div className="bg-orange-100 rounded-xl p-4">
              <p className="text-orange-800 font-bold text-lg">
                Don't let $75,000+ in tax credits slip away. Act now while you still can.
              </p>
            </div>
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
                      <div className="text-sm text-gray-600">
                        ~{formatCurrency(yearOption.estimatedCredit)} credit
                        {!yearOption.included && yearOption.price && ` for +${formatCurrency(yearOption.price)}`}
                      </div>
                      {!yearOption.included && selectedYears.includes(yearOption.year) && (
                        <div className="text-sm text-blue-600 font-medium">✓ Adding this year to your filing</div>
                      )}
                    </div>
                  </div>
                  {!yearOption.included && (
                    <div className="text-lg font-bold text-gray-900">
                      +{formatCurrency(yearOption.price || 0)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Enhanced Running Total */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="text-center">
              <h4 className="font-bold text-blue-800 mb-4">Your Selected Credits & Investment</h4>
              <div className="space-y-2 mb-4">
                {selectedYears.map(year => {
                  const yearData = availableYears.find(y => y.year === year);
                  return (
                    <div key={year} className="flex justify-between items-center text-sm">
                      <span className="text-blue-700">{year}: ~{formatCurrency(yearData?.estimatedCredit || 0)} credit</span>
                      <span className="text-blue-700 font-medium">
                        {yearData?.included ? 'Included' : `+${formatCurrency(yearData?.price || 0)}`}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-blue-300 pt-4">
                <div className="flex justify-between items-center text-lg font-bold text-blue-800">
                  <span>Total Credits: {formatCurrency(selectedYears.reduce((sum, year) => {
                    const yearData = availableYears.find(y => y.year === year);
                    return sum + (yearData?.estimatedCredit || 0);
                  }, 0))}</span>
                  <span>Total Investment: {formatCurrency(totalPrice)}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Why Add Previous Years */}
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="text-center mb-3">
              <h4 className="font-bold text-yellow-800">💡 Most clients add all years to maximize credits</h4>
            </div>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• July 2026 deadline to amend 2022-2024 returns</li>
              <li>• Most businesses using AI qualify for multiple years</li>
              <li>• Same documentation covers all years</li>
              <li>• Just $297 per additional year</li>
            </ul>
          </div>
        </div>

        {/* Enhanced Pricing Summary with Value Comparison */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Investment Summary & Value</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <div>
                <span className="font-medium text-gray-900">Base (2025):</span>
                <div className="text-sm text-green-600">→ Gets you {formatCurrency(results.federal?.creditAmount || 0)}</div>
              </div>
              <span className="font-bold text-gray-900">{formatCurrency(basePrice)}</span>
            </div>
            
            {additionalYearsCount > 0 && (
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <div>
                  <span className="font-medium text-gray-900">
                    Additional Years ({additionalYearsCount}):
                  </span>
                  <div className="text-sm text-green-600">
                    → Gets you ~{formatCurrency(selectedYears.slice(1).reduce((sum, year) => {
                      const yearData = availableYears.find(y => y.year === year);
                      return sum + (yearData?.estimatedCredit || 0);
                    }, 0))}
                  </div>
                </div>
                <span className="font-bold text-gray-900">{formatCurrency(additionalYearsCount * additionalYearPrice)}</span>
              </div>
            )}
            
            <div className="border-t-2 border-gray-300 pt-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 -mx-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total Investment:</span>
                  <span className="text-2xl font-bold text-blue-600">{formatCurrency(totalPrice)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total Credits:</span>
                  <span className="text-2xl font-bold text-green-600">
                    {formatCurrency(selectedYears.reduce((sum, year) => {
                      const yearData = availableYears.find(y => y.year === year);
                      return sum + (yearData?.estimatedCredit || 0);
                    }, 0))}
                  </span>
                </div>
                <div className="border-t border-gray-300 pt-2 mt-2">
                  <div className="text-center">
                    <span className="text-lg font-bold text-purple-600">
                      Your Net Gain: {formatCurrency(selectedYears.reduce((sum, year) => {
                        const yearData = availableYears.find(y => y.year === year);
                        return sum + (yearData?.estimatedCredit || 0);
                      }, 0) - totalPrice)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced What's Included - Scannable Groups */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Your Professional Filing Package Includes:</h3>
          
          <div className="space-y-6">
            {/* IRS Forms & Compliance */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-3 text-lg">📋 IRS Forms & Compliance</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900">Form 6765 (completed)</div>
                    <div className="text-sm text-gray-600">Ready-to-file IRS form</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900">All required schedules</div>
                    <div className="text-sm text-gray-600">Supporting IRS documentation</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Supporting Documentation */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-3 text-lg">📄 Supporting Documentation</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900">Technical narratives</div>
                    <div className="text-sm text-gray-600">Detailed activity descriptions</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900">Expense worksheets</div>
                    <div className="text-sm text-gray-600">Complete cost breakdowns</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900">Time allocation records</div>
                    <div className="text-sm text-gray-600">Activity time tracking</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Resources */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-3 text-lg">👨‍💼 Professional Resources</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900">CPA explanation letter</div>
                    <div className="text-sm text-gray-600">Professional cover letter</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900">Filing instructions</div>
                    <div className="text-sm text-gray-600">Step-by-step guidance</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900">Email support</div>
                    <div className="text-sm text-gray-600">Questions answered promptly</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery & Success */}
          <div className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4">
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-green-600" />
                <span className="font-medium text-gray-700">Documents ready within 24-48 hours of payment</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-gray-700">Join 523 businesses who've successfully claimed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Email Input Section (if no email saved) */}
        {!savedEmail && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 mb-8">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-blue-900 mb-2">📧 Enter Your Email to Continue</h3>
              <p className="text-blue-700">We'll send your R&D credit documents to this email address</p>
            </div>
            <div className="max-w-md mx-auto">
              <input
                type="email"
                value={checkoutEmail}
                onChange={(e) => setCheckoutEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                required
              />
              <p className="text-sm text-blue-600 mt-2 text-center">
                Free to provide • No spam • Secure & encrypted
              </p>
            </div>
          </div>
        )}

        {/* Enhanced CTA Section */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 mb-6">
            <p className="text-lg font-semibold text-gray-900 mb-2">
              You've done the hard work. Now claim your {formatCurrency(selectedYears.reduce((sum, year) => {
                const yearData = availableYears.find(y => y.year === year);
                return sum + (yearData?.estimatedCredit || 0);
              }, 0))} in credits.
            </p>
            <p className="text-gray-600">After payment: Receive documents within 48 hours</p>
            {savedEmail && (
              <p className="text-sm text-blue-600 mt-2">Documents will be sent to: {savedEmail}</p>
            )}
          </div>

          <button
            onClick={handleContinueToPayment}
            disabled={isProcessing || (!savedEmail && (!checkoutEmail || !checkoutEmail.includes('@')))}
            className={`bg-gradient-to-r from-blue-600 to-green-600 text-white py-6 px-12 rounded-xl font-bold text-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 mb-4 ${
              isProcessing || (!savedEmail && (!checkoutEmail || !checkoutEmail.includes('@'))) ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <span className="flex items-center gap-3">
              {isProcessing ? (
                <>
                  <div className="w-7 h-7 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-7 h-7" />
                  Complete My Order - {formatCurrency(totalPrice)}
                  <ChevronRight className="w-7 h-7" />
                </>
              )}
            </span>
          </button>
          
          <div className="flex items-center justify-center gap-2 mb-6 text-sm text-gray-600">
            <span>💳 All major cards</span>
            <span>•</span>
            <span>🔒 256-bit encryption</span>
          </div>

          <div className="flex items-center justify-center gap-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-600" />
              <span>Secure & Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-green-600" />
              <span>No Hidden Fees</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Fast Delivery</span>
            </div>
          </div>

          {/* Support Information */}
          <div className="mt-8 bg-gray-50 rounded-xl p-6">
            <h4 className="font-semibold text-gray-900 mb-3">Questions before ordering?</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <strong>Email:</strong> support@smbtaxcredits.com
              </p>
              <p>
                <strong>Average response time:</strong> 2 hours during business days
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;