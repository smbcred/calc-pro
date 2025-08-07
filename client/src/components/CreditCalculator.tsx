import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { Calculator, Info, Users, Package, AlertCircle, ChevronRight, ChevronLeft, Building, Shield, Lock, CheckCircle, Clock, TrendingUp, FileText, Share2, Zap, Calendar, AlertTriangle, Quote, Check, Trophy, DollarSign, Target, ArrowRight } from 'lucide-react';

interface CreditCalculatorProps {
  onResultsReady?: (results: any) => void;
}

const CreditCalculator: React.FC<CreditCalculatorProps> = ({ onResultsReady }) => {
  // State for calculator inputs
  const [formData, setFormData] = useState({
    // Basic info
    companyName: '',
    startupYear: '',
    grossReceipts: '',
    industry: '',
    selectedYears: ['2024'], // Array of selected tax years
    
    // Additional factors
    priorYearCredit: false,
    priorYearAmount: ''
  });

  // Multi-year data for each selected year
  const [yearlyData, setYearlyData] = useState<Record<string, {
    w2Wages: string;
    contractorCosts: string;
    cloudCosts: string;
    softwareLicenses: string;
    supplies: string;
    w2Percentage: string;
    contractorPercentage: string;
  }>>({
    '2024': {
      w2Wages: '',
      contractorCosts: '',
      cloudCosts: '',
      softwareLicenses: '',
      supplies: '',
      w2Percentage: '30',
      contractorPercentage: '50'
    }
  });

  const [currentYear, setCurrentYear] = useState('2024'); // For year navigation
  const [showMultiYearUpsell, setShowMultiYearUpsell] = useState(false);

  // State for qualification checks
  const [qualificationChecks, setQualificationChecks] = useState<Record<string, boolean>>({
    aiTools: false,
    customGPTs: false,
    prompts: false,
    automation: false,
    testing: false,
    improvement: false
  });

  // State for calculation results
  const [results, setResults] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [savedProgress, setSavedProgress] = useState(false);
  
  // Email capture state
  const [email, setEmail] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [showFullResults, setShowFullResults] = useState(false);


  // Industry types for specific examples - expanded list
  const industries = [
    { value: 'freelancer', label: 'Freelancer/Solopreneur' },
    { value: 'ecommerce', label: 'E-commerce/Online Store' },
    { value: 'saas', label: 'Software/SaaS' },
    { value: 'agency', label: 'Marketing/Creative Agency' },
    { value: 'consulting', label: 'Consulting/Professional Services' },
    { value: 'manufacturing', label: 'Manufacturing/Production' },
    { value: 'healthcare', label: 'Healthcare/Medical Practice' },
    { value: 'finance', label: 'Finance/Accounting' },
    { value: 'realestate', label: 'Real Estate/Property Management' },
    { value: 'restaurant', label: 'Restaurant/Food Service' },
    { value: 'construction', label: 'Construction/Contracting' },
    { value: 'education', label: 'Education/Training' },
    { value: 'nonprofit', label: 'Non-Profit Organization' },
    { value: 'legal', label: 'Legal Services' },
    { value: 'logistics', label: 'Logistics/Transportation' },
    { value: 'fitness', label: 'Fitness/Wellness' },
    { value: 'media', label: 'Media/Content Creation' },
    { value: 'travel', label: 'Travel/Hospitality' },
    { value: 'automotive', label: 'Automotive/Dealership' },
    { value: 'agriculture', label: 'Agriculture/Farming' },
    { value: 'other', label: 'Other Business Type' }
  ];

  // Utility function to safely parse numbers
  const safeParseFloat = (value: any, defaultValue = 0) => {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  };

  // Utility function to safely parse percentages (0-100 range)
  const safeParsePercent = (value: any, defaultValue = 0) => {
    const parsed = parseFloat(value);
    if (isNaN(parsed)) return defaultValue / 100;
    return Math.max(0, Math.min(100, parsed)) / 100;
  };







  // Professional Calculator Header
  const BrandingHeader = () => (
    <div className="bg-white border-b border-gray-200 mb-12">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Brand Badge */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-3 text-sm text-blue-600 font-semibold bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
            <div className="w-5 h-5 bg-gradient-to-r from-blue-600 to-teal-600 rounded-full flex items-center justify-center">
              <Calculator className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold">SMBTaxCredits.com</span>
          </div>
        </div>
        
        {/* Main Headlines */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-slate-800 leading-tight">
            R&D Tax Credit Calculator for AI & Automation
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Calculate your federal tax credits for using ChatGPT, automation tools, and AI in your business
          </p>
        </div>
        
        {/* Trust Bar */}
        <div className="flex flex-wrap justify-center items-center gap-6 mb-8 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span className="text-blue-600">🏛️</span>
            <span className="font-medium">IRS Section 41 Qualified</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-600">🔒</span>
            <span className="font-medium">Bank-Level Encryption</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-purple-600">⚡</span>
            <span className="font-medium">Results in 2 Minutes</span>
          </div>
        </div>
        
        {/* Value Proposition Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <div className="text-3xl font-bold text-green-700 mb-2">$28,500</div>
            <div className="text-sm font-semibold text-green-800 mb-1">Average Credit</div>
            <div className="text-xs text-green-600">For businesses under $5M revenue</div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📄</span>
            </div>
            <div className="text-lg font-bold text-blue-700 mb-2">IRS Form 6765</div>
            <div className="text-sm font-semibold text-blue-800 mb-1">Ready to File</div>
            <div className="text-xs text-blue-600">Complete documentation package</div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📅</span>
            </div>
            <div className="text-lg font-bold text-purple-700 mb-2">3-Year Lookback</div>
            <div className="text-sm font-semibold text-purple-800 mb-1">2022-2024 Eligible</div>
            <div className="text-xs text-purple-600">Deadline: July 2026</div>
          </div>
        </div>
      </div>
    </div>
  );

  // Industry-Specific Examples Component - expanded  
  const IndustryExamples = ({ industry }: { industry: string }) => {
    const examples: Record<string, string[]> = {
      freelancer: [
        "Using ChatGPT to write client proposals faster",
        "Building custom workflows to automate repetitive tasks", 
        "Testing new AI tools to improve service delivery",
        "Creating content templates using AI assistance"
      ],
      ecommerce: [
        "Building custom GPTs for product descriptions",
        "AI-powered customer service chatbots",
        "Inventory prediction algorithms",
        "Personalized email campaigns with AI"
      ],
      saas: [
        "API development and testing",
        "Feature experimentation with AI",
        "Performance optimization",
        "Custom integrations and automations"
      ],
      agency: [
        "Content generation prompt libraries",
        "Campaign optimization with AI tools",
        "Client reporting automation",
        "Custom GPTs for client work"
      ],
      consulting: [
        "Process automation development",
        "Custom analysis tools",
        "AI-powered research systems",
        "Client deliverable automation"
      ],
      manufacturing: [
        "Quality control AI systems",
        "Predictive maintenance algorithms",
        "Supply chain optimization",
        "Production process improvements"
      ],
      healthcare: [
        "Patient communication automation",
        "Scheduling optimization systems",
        "Data analysis tools",
        "Documentation improvement with AI"
      ],
      finance: [
        "Risk assessment automation",
        "Report generation systems",
        "Compliance checking tools",
        "Customer service chatbots"
      ],
      realestate: [
        "ChatGPT scripts for property descriptions that sell faster",
        "Using AI to analyze market trends and pricing",
        "Building automated lead qualification systems",
        "Testing virtual tour and staging technologies"
      ],
      restaurant: [
        "Using AI to predict busy times and reduce food waste",
        "ChatGPT for creating seasonal menu descriptions",
        "Testing inventory management apps with AI features",
        "Building automated customer ordering systems"
      ],
      construction: [
        "AI tools to estimate project costs more accurately",
        "Using ChatGPT to write detailed project proposals",
        "Testing drone technology for site inspections",
        "Building automated safety compliance checklists"
      ],
      education: [
        "Custom learning GPTs",
        "Automated grading systems",
        "Student engagement chatbots",
        "Curriculum optimization tools"
      ],
      nonprofit: [
        "Donor engagement automation",
        "Grant writing AI assistants",
        "Impact measurement tools",
        "Volunteer matching systems"
      ],
      legal: [
        "Document review automation",
        "Legal research AI tools",
        "Contract analysis systems",
        "Client intake chatbots"
      ],
      logistics: [
        "Route optimization algorithms",
        "Delivery prediction systems",
        "Warehouse automation tools",
        "Fleet management AI"
      ],
      fitness: [
        "Personalized workout GPTs",
        "Member retention analysis",
        "Class scheduling optimization",
        "Nutrition planning chatbots"
      ],
      media: [
        "Content generation systems",
        "Audience analytics AI",
        "Automated video editing tools",
        "Social media optimization"
      ],
      travel: [
        "Booking optimization systems",
        "Customer service chatbots",
        "Dynamic pricing algorithms",
        "Itinerary planning AI"
      ],
      automotive: [
        "Service scheduling automation",
        "Parts inventory AI",
        "Customer follow-up systems",
        "Pricing optimization tools"
      ],
      agriculture: [
        "Crop yield prediction models",
        "Weather pattern analysis",
        "Resource optimization systems",
        "Market pricing AI tools"
      ],
      other: [
        "Custom GPT development",
        "Process automation with AI",
        "Workflow improvements",
        "Testing and optimization"
      ]
    };
    
    if (!industry || !examples[industry]) return null;
    
    return (
      <div className="bg-blue-50 p-3 rounded-lg mt-3">
        <p className="text-xs font-medium text-blue-900 mb-1">
          Common qualifying activities in your industry:
        </p>
        <ul className="text-xs text-blue-700 space-y-0.5">
          {examples[industry].slice(0, 4).map((item: string) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
      </div>
    );
  };

  // Enhanced Qualification Quick Check Component
  const QualificationQuickCheck = () => {
    const score = Object.values(qualificationChecks).filter(Boolean).length;
    
    return (
      <div className="bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 rounded-xl p-6 mb-8 border border-green-200 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">
            Check all activities your business does:
          </h3>
        </div>
        
        <div className="grid grid-cols-1 gap-3">
          {[
            { key: 'aiTools', label: 'We use ChatGPT, Claude, or other AI tools to improve our work', icon: '🤖', popular: true },
            { key: 'customGPTs', label: 'We\'ve built custom GPTs or chatbots', icon: '⚡', premium: true },
            { key: 'prompts', label: 'We\'ve developed prompt templates or libraries', icon: '📝' },
            { key: 'automation', label: 'We\'ve automated tasks with Zapier, Make, or code', icon: '🔄', popular: true },
            { key: 'testing', label: 'We test and improve our AI prompts or workflows', icon: '🧪' },
            { key: 'improvement', label: 'We\'ve improved processes 10%+ with technology', icon: '📈', premium: true }
          ].map(item => (
            <label key={item.key} className="group flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer transition-all">
              <input
                type="checkbox"
                checked={qualificationChecks[item.key]}
                onChange={(e) => setQualificationChecks({...qualificationChecks, [item.key]: e.target.checked})}
                className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
              />
              <div className="flex items-center gap-2 flex-1">
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium text-gray-800 group-hover:text-blue-800">{item.label}</span>
                {item.popular && (
                  <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full font-medium">Most Common</span>
                )}
                {item.premium && (
                  <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full font-medium">High Value</span>
                )}
              </div>
            </label>
          ))}
        </div>
        
        {score > 0 && (
          <div className="mt-4 p-4 bg-gradient-to-r from-green-100 to-blue-100 rounded-xl border border-green-300">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-green-800 text-lg">Excellent! You Likely Qualify</span>
            </div>
            <p className="text-green-700 text-sm mb-2">
              Based on <strong>{score} qualifying {score === 1 ? 'activity' : 'activities'}</strong>, you could be eligible for substantial R&D tax credits.
            </p>
            <div className="flex items-center gap-2 text-sm text-green-600">
              <TrendingUp className="w-4 h-4" />
              <span className="font-medium">Estimated potential: $25K - $150K+ in credits</span>
            </div>
          </div>
        )}
        
        {score === 0 && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 text-gray-600">
              <Info className="w-4 h-4" />
              <span className="text-sm">Select activities above to see if you qualify for credits</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Urgency Banner Component
  const UrgencyBanner = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;
    const isQ4 = currentMonth >= 9;
    const daysLeft = Math.floor((new Date(currentYear, 11, 31) - new Date()) / (1000 * 60 * 60 * 24));
    
    // Check if they're filing for last year (amendment opportunity)
    if (parseInt(formData.taxYear) === lastYear) {
      return (
        <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 mb-4 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-yellow-900">
            <strong>Amendment Opportunity:</strong> Claim previous years before July 2026 deadline. 
            You can amend 2022-2024 returns to claim R&D credits.
          </div>
        </div>
      );
    }
    
    if (isQ4) {
      return (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 flex items-start gap-2">
          <Clock className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-amber-900">
            <strong>Tax Year Ending Soon:</strong> Only {daysLeft} days left to maximize your {currentYear} R&D activities. 
            Document your AI work now to claim credits!
          </div>
        </div>
      );
    }
    return null;
  };
  
  // Get federal-only pricing based on credit amount
  const getFederalPricing = (federalCredit: number) => {
    const credit = safeParseFloat(federalCredit, 0);
    
    // Federal pricing tiers: Under $10K = $500, $10K-50K = $750, $50K-100K = $1000, Over $100K = $1500
    if (credit < 10000) return 500;
    else if (credit < 50000) return 750;
    else if (credit < 100000) return 1000;
    else return 1500;
  };





  // Available tax years (current year + 3 previous years)
  const getAvailableYears = () => {
    const currentYear = new Date().getFullYear();
    return [currentYear, currentYear - 1, currentYear - 2, currentYear - 3];
  };

  // Helper function to add/remove years from selection
  const toggleYear = (year: number) => {
    const yearStr = year.toString();
    const currentSelected = formData.selectedYears || [];
    
    if (currentSelected.includes(yearStr)) {
      // Remove year
      const newYears = currentSelected.filter(y => y !== yearStr);
      setFormData(prev => ({ ...prev, selectedYears: newYears }));
      
      // Remove yearly data for this year
      const newYearlyData = { ...yearlyData };
      delete newYearlyData[yearStr];
      setYearlyData(newYearlyData);
    } else {
      // Add year
      const newYears = [...currentSelected, yearStr].sort().reverse(); // Most recent first
      setFormData(prev => ({ ...prev, selectedYears: newYears }));
      
      // Initialize yearly data for this year
      setYearlyData(prev => ({
        ...prev,
        [yearStr]: {
          w2Wages: '',
          contractorCosts: '',
          cloudCosts: '',
          softwareLicenses: '',
          supplies: '',
          w2Percentage: '30',
          contractorPercentage: '50'
        }
      }));
    }
  };
  
  // Get qualification reasons for display
  const getQualificationReasons = () => {
    const reasons: string[] = [];
    const labels: Record<string, string> = {
      aiTools: 'Using ChatGPT, Claude, or similar AI tools to improve business operations',
      customGPTs: 'Built custom GPTs or chatbots',
      prompts: 'Developed prompt templates or libraries',
      automation: 'Automated tasks with Zapier, Make, or code',
      testing: 'Testing and improving AI prompts or workflows',
      improvement: 'Made processes 10%+ better with technology'
    };
    
    Object.keys(qualificationChecks).forEach(key => {
      if ((qualificationChecks as any)[key] && labels[key]) {
        reasons.push(labels[key]);
      }
    });
    
    return reasons;
  };

  // Risk Mitigation Component
  const RiskMitigation = () => (
    <div className="bg-gray-50 rounded-lg p-4 mt-4">
      <h4 className="text-sm font-medium text-gray-900 mb-3">
        Real SMB Concerns Addressed:
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="flex gap-2">
          <span className="text-lg">📊</span>
          <div className="text-xs text-gray-600">
            <strong className="text-gray-900">"My business is too small for this"</strong>
            <p>No minimum business size required - even part-time businesses qualify</p>
          </div>
        </div>
        <div className="flex gap-2">
          <span className="text-lg">⏰</span>
          <div className="text-xs text-gray-600">
            <strong className="text-gray-900">"I don't have time to learn tax code"</strong>
            <p>We handle all the tax code complexity - you just answer simple questions</p>
          </div>
        </div>
        <div className="flex gap-2">
          <span className="text-lg">💼</span>
          <div className="text-xs text-gray-600">
            <strong className="text-gray-900">"I just use ChatGPT, not building rockets"</strong>
            <p>Even 10 hours/month of ChatGPT work qualifies for significant credits!</p>
          </div>
        </div>
        <div className="flex gap-2">
          <span className="text-lg">👨‍💼</span>
          <div className="text-xs text-gray-600">
            <strong className="text-gray-900">"My CPA never mentioned this"</strong>
            <p>We include a CPA cover letter explaining everything professionally</p>
          </div>
        </div>
      </div>
      
      {/* Additional Reassurance */}
      <div className="bg-blue-50 rounded-lg p-3 mt-3 border border-blue-200">
        <div className="text-xs text-blue-800">
          <strong>✅ Reality check:</strong> Freelancers, consultants, and small business owners working just 10-15 hours/month with AI tools are claiming $15K-$50K+ in credits. No minimum revenue requirements.
        </div>
      </div>
    </div>
  );

  // Multi-Year Selection Component
  const MultiYearSelector = () => {
    const availableYears = getAvailableYears();
    const selectedCount = formData.selectedYears?.length || 0;
    const discount = 0; // Simplified federal-only pricing - no discounts
    
    return (
      <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          Select Tax Years to File
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {availableYears.map(year => {
            const isSelected = formData.selectedYears?.includes(year.toString()) || false;
            const isCurrent = year === new Date().getFullYear();
            
            return (
              <button
                key={year}
                onClick={() => toggleYear(year)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-100 text-blue-800' 
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                <div className="text-lg font-bold">{year}</div>
                <div className="text-xs">
                  {isCurrent ? 'Current Year' : 'Lookback'}
                </div>
                {isSelected && (
                  <div className="text-xs font-medium text-blue-600 mt-1">✓ Selected</div>
                )}
              </button>
            );
          })}
        </div>

        {selectedCount > 1 && (
          <div className="bg-green-100 rounded-lg p-4 border border-green-300">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="font-bold text-green-800">
                Multi-Year Savings: {Math.round(discount * 100)}% Discount!
              </span>
            </div>
            <p className="text-sm text-green-700">
              Filing {selectedCount} years together saves you money and maximizes your total recovery.
            </p>
          </div>
        )}

        {selectedCount === 1 && (
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <span className="font-medium text-yellow-800">Consider Adding More Years</span>
            </div>
            <p className="text-sm text-yellow-700 mb-3">
              Most businesses have been using ChatGPT and automation tools for 2+ years. Add previous years to:
            </p>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Get 15-25% multi-year discount</li>
              <li>• Maximize total recovery amount</li>
              <li>• Claim before July 2026 amendment deadline</li>
            </ul>
          </div>
        )}
      </div>
    );
  };

  // Lookback Opportunity Component
  const LookbackUpsell = () => {
    if (!results || !formData.startupYear) return null;
    
    const eligibleYears = [];
    const currentYear = new Date().getFullYear();
    const startYear = parseInt(formData.startupYear);
    
    for (let year = currentYear - 1; year >= Math.max(2021, startYear); year--) {
      eligibleYears.push(year);
    }
    
    if (eligibleYears.length > 0) {
      const potentialAdditional = results.totalCredit * eligibleYears.length * 0.8;
      
      return (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-4">
          <div className="flex items-start gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-purple-900 mb-1">
                💎 Additional Credits Available
              </h4>
              <p className="text-sm text-purple-800">
                You may be able to claim credits for {eligibleYears.length === 1 ? 'year' : 'years'} {eligibleYears.join(', ')} too!
              </p>
              <p className="text-sm font-medium text-purple-900 mt-1">
                Potential additional savings: {formatCurrency(potentialAdditional)}
              </p>
              <p className="text-xs text-purple-700 mt-1">
                We'll include lookback analysis in your report
              </p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Save Progress Component
  const SaveProgressButton = () => (
    <button
      onClick={() => {
        const progressData = {
          formData,
          qualificationChecks,
          currentStep,
          timestamp: new Date().toISOString()
        };
        localStorage.setItem('rd_credit_progress', JSON.stringify(progressData));
        setSavedProgress(true);
        setTimeout(() => setSavedProgress(false), 3000);
      }}
      className="text-sm text-gray-500 hover:text-gray-700 underline flex items-center gap-1"
    >
      <FileText className="w-3 h-3" />
      {savedProgress ? 'Progress Saved!' : 'Save Progress'}
    </button>
  );

  // Load saved progress on mount
  useEffect(() => {
    const saved = localStorage.getItem('rd_credit_progress');
    if (saved) {
      try {
        const { formData: savedForm, qualificationChecks: savedChecks, currentStep: savedStep } = JSON.parse(saved);
        setFormData(savedForm);
        setQualificationChecks(savedChecks || qualificationChecks);
        // Don't auto-jump to saved step, let user start fresh
      } catch (e) {
        console.error('Error loading saved progress:', e);
      }
    }
  }, []);

  // Calculate QREs with percentage allocations and safe parsing for multi-year data
  const calculateQREs = () => {
    const yearlyQREs = {};
    let totalCombinedQRE = 0;

    formData.selectedYears.forEach(year => {
      const data = yearlyData[year] || {};
      
      // Safely parse all input values with defaults
      const wages = safeParseFloat(data.w2Wages, 0);
      const contractors = safeParseFloat(data.contractorCosts, 0);
      const cloud = safeParseFloat(data.cloudCosts, 0);
      const software = safeParseFloat(data.softwareLicenses, 0);
      const supplies = safeParseFloat(data.supplies, 0);
      
      // Parse R&D time percentages using safe parsing
      const wagePercent = safeParsePercent(data.w2Percentage, 30);
      const contractorPercent = safeParsePercent(data.contractorPercentage, 50);

      // Apply percentage allocations for wages and contractors
      const qualifiedWages = wages * wagePercent;
      const qualifiedContractors = contractors * contractorPercent * 0.65; // 65% of allocated contractor costs per IRS rules
      const qualifiedCloud = cloud * 1.0;
      const qualifiedSoftware = software * 1.0;
      const qualifiedSupplies = supplies * 1.0;

      const yearTotalQREs = qualifiedWages + qualifiedContractors + qualifiedCloud + qualifiedSoftware + qualifiedSupplies;
      totalCombinedQRE += yearTotalQREs;

      yearlyQREs[year] = {
        wages: qualifiedWages,
        contractors: qualifiedContractors,
        cloud: qualifiedCloud,
        software: qualifiedSoftware,
        supplies: qualifiedSupplies,
        total: yearTotalQREs,
        wagePercent: wagePercent,
        contractorPercent: contractorPercent
      };
    });

    return {
      yearlyQREs,
      totalCombined: totalCombinedQRE,
      numYears: formData.selectedYears.length,
      selectedYears: formData.selectedYears,
      // Legacy compatibility for existing code that expects single year structure
      total: totalCombinedQRE,
      wages: Object.values(yearlyQREs).reduce((sum, year) => sum + year.wages, 0),
      contractors: Object.values(yearlyQREs).reduce((sum, year) => sum + year.contractors, 0),
      cloud: Object.values(yearlyQREs).reduce((sum, year) => sum + year.cloud, 0),
      software: Object.values(yearlyQREs).reduce((sum, year) => sum + year.software, 0),
      supplies: Object.values(yearlyQREs).reduce((sum, year) => sum + year.supplies, 0)
    };
  };

  // Calculate federal credit with multi-year support
  const calculateFederalCredit = (qres) => {
    const startYear = parseInt(formData.startupYear) || 2024;
    const grossReceipts = safeParseFloat(formData.grossReceipts, 0);
    const isStartup = (new Date().getFullYear() - startYear) <= 5;
    const isSmallBusinessTaxpayer = grossReceipts < 31000000;

    const yearlyCredits = {};
    let totalFederalCredit = 0;
    let totalPayrollTaxOffset = 0;
    let totalRefundableCredit = 0;
    let totalSection174ABenefit = 0;

    formData.selectedYears.forEach(year => {
      const yearInt = parseInt(year);
      const yearQRE = qres.yearlyQREs[year]?.total || 0;

      const creditRate = 0.20; // 20% federal R&D tax credit rate
      const baseAmount = 0;
      const creditable = Math.max(0, yearQRE - baseAmount);
      let federalCredit = creditable * creditRate;

      let payrollTaxOffset = 0;
      if (isStartup && grossReceipts < 5000000) {
        payrollTaxOffset = Math.min(federalCredit, 500000);
      }

      let refundableCredit = 0;
      if (isSmallBusinessTaxpayer && yearInt >= 2025) {
        refundableCredit = Math.min(federalCredit * 0.5, 250000);
      }

      let section174ABenefit = 0;
      if (
        yearInt >= 2025 ||
        (yearInt >= 2022 && yearInt <= 2024 && isSmallBusinessTaxpayer)
      ) {
        section174ABenefit = yearQRE * 0.21;
      }

      const regularCreditCap = grossReceipts * 0.75;
      federalCredit = Math.min(federalCredit, regularCreditCap);

      yearlyCredits[year] = {
        creditAmount: federalCredit,
        payrollTaxOffset: payrollTaxOffset,
        refundableCredit: refundableCredit,
        section174ABenefit: section174ABenefit,
        effectiveRate: yearQRE > 0 ? (federalCredit / yearQRE) : 0
      };

      totalFederalCredit += federalCredit;
      totalPayrollTaxOffset += payrollTaxOffset;
      totalRefundableCredit += refundableCredit;
      totalSection174ABenefit += section174ABenefit;
    });

    return {
      yearlyCredits,
      creditAmount: totalFederalCredit,
      payrollTaxOffset: totalPayrollTaxOffset,
      refundableCredit: totalRefundableCredit,
      isStartupEligible: isStartup && grossReceipts < 5000000,
      isSmallBusinessTaxpayer: isSmallBusinessTaxpayer,
      effectiveRate: qres.total > 0 ? (totalFederalCredit / qres.total) : 0,
      section174ABenefit: totalSection174ABenefit
    };
  };



  // Calculate retroactive benefit
  const calculateRetroactiveBenefit = (currentQres) => {
    const currentYear = parseInt(formData.taxYear) || 2024;
    const grossReceipts = safeParseFloat(formData.grossReceipts, 0);
    const isSmallBusiness = grossReceipts <= 31000000;
    
    if (currentYear < 2025) return 0;
    
    const estimatedPriorYearQres = currentQres.total * 0.85;
    
    let benefit = 0;
    const corporateTaxRate = 0.21;
    
    if (!isSmallBusiness) {
      const yearsOfCapitalizedExpenses = 3;
      const unamortizedPortion = 0.8;
      benefit = estimatedPriorYearQres * yearsOfCapitalizedExpenses * unamortizedPortion * corporateTaxRate;
    }
    
    return benefit;
  };



  // Perform calculation - federal only
  const performCalculation = () => {
    const qres = calculateQREs();
    const federal = calculateFederalCredit(qres);
    
    const totalCredit = federal.creditAmount;
    const totalBenefit = totalCredit + (federal.section174ABenefit || 0);
    
    const retroactiveBenefit = calculateRetroactiveBenefit(qres);
    
    // Federal-only pricing
    const pricing = getFederalPricing(totalCredit);
    
    const results = {
      qres,
      federal,
      totalCredit,
      totalBenefit,
      section174ABenefit: federal.section174ABenefit || 0,
      retroactiveBenefit,
      estimatedRefund: federal.payrollTaxOffset > 0 ? federal.payrollTaxOffset : totalCredit * 0.9,
      pricing,
      details: generateDetailedBreakdown(qres, federal),
      selectedYears: formData.selectedYears,
      yearlyBreakdown: qres.yearlyQREs
    };
    
    setResults(results);
  };

  // Generate detailed breakdown - federal only
  const generateDetailedBreakdown = (qres, federal) => {
    const currentYear = parseInt(formData.taxYear) || 2024;
    const isRetroactive174A = currentYear >= 2022 && currentYear <= 2024 && federal.isSmallBusinessTaxpayer;
    
    return {
      timestamp: new Date().toISOString(),
      company: formData.companyName,
      taxYear: formData.taxYear,
      qualifiedExpenses: {
        w2Wages: { input: formData.w2Wages, qualified: qres.wages },
        contractors: { input: formData.contractorCosts, qualified: qres.contractors },
        cloudComputing: { input: formData.cloudCosts, qualified: qres.cloud },
        software: { input: formData.softwareLicenses, qualified: qres.software },
        supplies: { input: formData.supplies, qualified: qres.supplies },
        totalQRE: qres.total
      },
      federalCredit: {
        amount: federal.creditAmount,
        rate: federal.effectiveRate,
        isStartup: federal.isStartupEligible,
        payrollTaxOffset: federal.payrollTaxOffset,
        section174ABenefit: federal.section174ABenefit,
        isRetroactive174A: isRetroactive174A
      },
      section174ABenefit: federal.section174ABenefit || 0,
      isRetroactive174A: isRetroactive174A,
      totalBenefit: federal.creditAmount + (federal.section174ABenefit || 0)
    };
  };

  // Format currency with safe handling
  const formatCurrency = (amount: any) => {
    const safeAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(safeAmount);
  };

  // Info tooltip component with better positioning
  const InfoTooltip = ({ text }: { text: string }) => (
    <div className="group relative inline-block ml-1">
      <Info className="w-4 h-4 text-gray-400 cursor-help" />
      <div className="opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto absolute z-50 w-64 p-2 mt-1 text-sm text-white bg-gray-800 rounded-lg shadow-lg -left-28 transition-opacity duration-200">
        {text}
        <div className="absolute -top-1 left-32 w-2 h-2 bg-gray-800 transform rotate-45"></div>
      </div>
    </div>
  );

  // Simple Progress Indicator
  const ProgressIndicator = () => {
    return (
      <div className="text-center mb-8">
        <span className="text-sm font-medium text-gray-600">Step {currentStep} of 4 • 2 minutes to complete</span>
      </div>
    );
  };

  // Update handler
  const updateFormData = (field: any, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Industry-specific value propositions
  const getIndustryValueProp = (industry: string) => {
    const valueProp = {
      freelancer: { title: "Freelancers average $18K in credits", description: "ChatGPT subscriptions, workflow automation, and client delivery improvements qualify", avgSavings: "$18K" },
      saas: { title: "SaaS companies average $85K in credits", description: "Development time, cloud infrastructure, and AI integrations qualify", avgSavings: "$85K" },
      agency: { title: "Agencies average $42K in credits", description: "Custom tools, automation development, and client solution R&D qualify", avgSavings: "$42K" },
      ecommerce: { title: "E-commerce businesses average $31K in credits", description: "Inventory management systems, AI chatbots, and personalization tools qualify", avgSavings: "$31K" },
      consulting: { title: "Consultants average $22K in credits", description: "ChatGPT for research, custom analysis tools, and client methodology development qualify", avgSavings: "$22K" },
      manufacturing: { title: "Manufacturers average $127K in credits", description: "Process optimization, IoT systems, and quality control automation qualify", avgSavings: "$127K" },
      healthcare: { title: "Healthcare practices average $64K in credits", description: "Patient management systems, AI diagnostics, and workflow automation qualify", avgSavings: "$64K" }
    };
    
    return valueProp[industry] || { title: "Small businesses average $31K in credits", description: "ChatGPT, automation tools, and business process improvements typically qualify", avgSavings: "$31K" };
  };

  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            {/* Step Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">Let's Check Your R&D Qualification</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Takes 2 minutes to see if you qualify for $15,000-$75,000 in tax credits
              </p>
            </div>
            
            <QualificationQuickCheck />
            
            <div className="card-elevated p-8 md:p-10 space-y-8">
              <div className="space-y-4">
                <label className="block text-lg font-semibold text-gray-900 mb-3">
                  Company Name
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => updateFormData('companyName', e.target.value)}
                  className="input-enhanced text-xl"
                  placeholder="Your Company, Inc."
                />
                <p className="text-sm text-gray-500">As shown on tax returns</p>
              </div>

              <div className="space-y-4">
                <label className="block text-lg font-semibold text-gray-900 mb-3">
                  Industry
                </label>
                <select
                  value={formData.industry}
                  onChange={(e) => updateFormData('industry', e.target.value)}
                  className="input-enhanced text-xl"
                >
                  <option value="">Choose your industry type</option>
                  {industries.map(ind => (
                    <option key={ind.value} value={ind.value}>{ind.label}</option>
                  ))}
                </select>
                <p className="text-sm text-gray-500 mt-2">Choose closest match</p>
                <IndustryExamples industry={formData.industry} />
                
                {/* Enhanced Industry-Specific Value Props */}
                {formData.industry && (
                  <div className="mt-6 status-info rounded-2xl p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-blue-900 mb-3">
                          {getIndustryValueProp(formData.industry).title}
                        </h4>
                        <p className="text-blue-800 mb-3 leading-relaxed">
                          {getIndustryValueProp(formData.industry).description}
                        </p>
                        <div className="inline-flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-full">
                          <span className="text-sm font-bold text-blue-700">
                            Typical savings: {getIndustryValueProp(formData.industry).avgSavings}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Primary Tax Year Selection */}
              <div>
                <label className="block text-base font-semibold text-gray-800 mb-3">
                  Primary Tax Year to File
                  <InfoTooltip text="Select the main tax year you want to file for. You can add additional years later for multi-year savings." />
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {getAvailableYears().map(year => {
                    const isSelected = formData.selectedYears?.includes(year.toString()) || false;
                    const isCurrent = year === new Date().getFullYear();
                    
                    return (
                      <button
                        key={year}
                        type="button"
                        onClick={() => {
                          // For Step 1, only allow single year selection
                          setFormData(prev => ({ 
                            ...prev, 
                            selectedYears: [year.toString()],
                            taxYear: year.toString()
                          }));
                          // Initialize yearly data for this year
                          setYearlyData({
                            [year.toString()]: {
                              w2Wages: '',
                              contractorCosts: '',
                              cloudCosts: '',
                              softwareLicenses: '',
                              supplies: '',
                              w2Percentage: '30',
                              contractorPercentage: '50'
                            }
                          });
                        }}
                        className={`p-4 rounded-xl border-2 transition-all text-center ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-100 text-blue-800' 
                            : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                        }`}
                      >
                        <div className="text-xl font-bold">{year}</div>
                        <div className="text-sm text-gray-600">
                          {isCurrent ? 'Current Year' : 'Lookback'}
                        </div>
                        {isSelected && (
                          <div className="text-sm font-medium text-blue-600 mt-1">✓ Selected</div>
                        )}
                      </button>
                    );
                  })}
                </div>
                
                {/* Selected Year Confirmation */}
                {formData.selectedYears.length > 0 && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 text-blue-800">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        Filing for tax year {formData.selectedYears[0]}
                      </span>
                    </div>
                    <p className="text-xs text-blue-600 mt-1">
                      Add additional years in Step 4 for multi-year savings up to 25% off!
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <label className="block text-lg font-semibold text-gray-900 mb-3">
                  Annual Revenue
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg font-semibold pointer-events-none">$</span>
                  <input
                    type="number"
                    min="0"
                    value={formData.grossReceipts}
                    onChange={(e) => updateFormData('grossReceipts', e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl bg-white/50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-200 placeholder:text-gray-400 text-xl"
                    placeholder="1,000,000"
                  />
                </div>
                <p className="text-sm text-gray-500">Determines your tax benefit type</p>
                
                {/* Enhanced Benefits Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="status-success rounded-2xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Zap className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-green-900 mb-1">Under $5M Revenue?</h4>
                        <p className="text-sm text-green-700">Get immediate cash refunds instead of waiting for tax savings</p>
                      </div>
                    </div>
                  </div>
                  <div className="status-info rounded-2xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Building className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-blue-900 mb-1">LLC & S-Corp Benefits</h4>
                        <p className="text-sm text-blue-700">Claim credits on your personal return with pass-through advantages</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
            
            <div className="flex justify-center pt-8 border-t border-gray-100">
              <button
                onClick={() => setCurrentStep(2)}
                disabled={!formData.companyName || !formData.grossReceipts || formData.selectedYears.length === 0}
                className="bg-blue-600 text-white py-4 px-8 rounded-xl font-semibold text-xl shadow-lg hover:bg-blue-700 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
              >
                <span className="flex items-center gap-3">
                  Calculate My Credit →
                  <ChevronRight className="w-6 h-6" />
                </span>
              </button>
            </div>
            <p className="text-sm text-gray-500 text-center mt-3">No payment required • See results instantly</p>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-10">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 gradient-primary rounded-2xl mb-4">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                  Calculate Your {currentYear} R&D Tax Credit
                </h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  Enter expenses from January - December {currentYear} to see your estimated federal tax credit
                  {formData.selectedYears.length > 1 && (
                    <span className="block text-blue-600 font-medium mt-2">
                      Currently entering data for {currentYear}
                    </span>
                  )}
                </p>
                
                {/* Year-specific contextual messaging */}
                <div className="mt-4">
                  {currentYear === '2024' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 max-w-md mx-auto">
                      <p className="text-sm text-green-700 font-medium">Current year calculation</p>
                      <p className="text-xs text-green-600">Year-to-date expenses through {new Date().toLocaleDateString('en-US', { month: 'long' })}</p>
                    </div>
                  )}
                  {currentYear === '2023' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 max-w-md mx-auto">
                      <p className="text-sm text-blue-700 font-medium">Prior year credit (amendment possible)</p>
                      <p className="text-xs text-blue-600">Calculating historical credit for {currentYear} - ensure you have records</p>
                    </div>
                  )}
                  {currentYear === '2022' && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 max-w-md mx-auto">
                      <p className="text-sm text-orange-700 font-medium">Final year eligible - July 2026 deadline</p>
                      <p className="text-xs text-orange-600">Calculating historical credit for {currentYear} - ensure you have records</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Running Total Display */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-4 max-w-md mx-auto">
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">{currentYear} qualifying expenses so far</div>
                  <div className="text-2xl font-bold text-green-600">
                    {(() => {
                      const data = yearlyData[currentYear] || {};
                      const wages = safeParseFloat(data.w2Wages, 0);
                      const contractors = safeParseFloat(data.contractorCosts, 0);
                      const cloud = safeParseFloat(data.cloudCosts, 0);
                      const software = safeParseFloat(data.softwareLicenses, 0);
                      const supplies = safeParseFloat(data.supplies, 0);
                      
                      const wagePercent = safeParsePercent(data.w2Percentage, 30);
                      const contractorPercent = safeParsePercent(data.contractorPercentage, 50);
                      
                      const qualifiedWages = wages * wagePercent;
                      const qualifiedContractors = contractors * contractorPercent * 0.65;
                      const totalQRE = qualifiedWages + qualifiedContractors + cloud + software + supplies;
                      
                      return formatCurrency(totalQRE);
                    })()}
                  </div>
                  <div className="text-xs text-gray-500">
                    Estimated {currentYear} credit: ~{(() => {
                      const data = yearlyData[currentYear] || {};
                      const wages = safeParseFloat(data.w2Wages, 0);
                      const contractors = safeParseFloat(data.contractorCosts, 0);
                      const cloud = safeParseFloat(data.cloudCosts, 0);
                      const software = safeParseFloat(data.softwareLicenses, 0);
                      const supplies = safeParseFloat(data.supplies, 0);
                      
                      const wagePercent = safeParsePercent(data.w2Percentage, 30);
                      const contractorPercent = safeParsePercent(data.contractorPercentage, 50);
                      
                      const qualifiedWages = wages * wagePercent;
                      const qualifiedContractors = contractors * contractorPercent * 0.65;
                      const totalQRE = qualifiedWages + qualifiedContractors + cloud + software + supplies;
                      
                      return formatCurrency(totalQRE * 0.20); // 20% federal R&D credit rate
                    })()}
                    {currentYear !== '2024' && <span className="ml-2 text-orange-500">(Amendment required)</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Year Navigation for Multi-Year */}
            {formData.selectedYears.length > 1 && (
              <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Select Year to Enter Data</h3>
                  <div className="text-sm text-gray-600">
                    {formData.selectedYears.length} years selected
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {formData.selectedYears.sort().reverse().map(year => (
                    <button
                      key={year}
                      onClick={() => setCurrentYear(year)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        currentYear === year
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {year}
                      {Object.values(yearlyData[year] || {}).some(v => v && v !== '30' && v !== '50') && (
                        <span className="ml-2 text-xs">✓</span>
                      )}
                    </button>
                  ))}
                </div>
                
                {/* Copy Previous Year Button */}
                {formData.selectedYears.length > 1 && currentYear !== formData.selectedYears.sort().reverse()[0] && (
                  <div className="mt-4">
                    <button
                      onClick={() => {
                        const previousYear = (parseInt(currentYear) + 1).toString();
                        if (yearlyData[previousYear]) {
                          setYearlyData(prev => ({
                            ...prev,
                            [currentYear]: { ...yearlyData[previousYear] }
                          }));
                        }
                      }}
                      className="bg-green-100 text-green-700 px-4 py-2 rounded-lg font-medium hover:bg-green-200 transition-all flex items-center gap-2"
                    >
                      <span>📋</span>
                      Copy from {parseInt(currentYear) + 1}
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                <span>💡</span>
                Entering data for: <strong>{currentYear}</strong>
              </h3>
              <p className="text-sm text-blue-800">
                Include all {currentYear} expenses and activities related to AI, automation, and technology improvements.
              </p>
            </div>





            {/* Enhanced Expense Form */}
            <div className="card-elevated p-8 space-y-8">
              <div className="space-y-4">
                <label className="block text-lg font-semibold text-gray-900 mb-3">
                  Employee Costs (Including Yourself)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg font-semibold pointer-events-none">$</span>
                  <input
                    type="number"
                    min="0"
                    value={yearlyData[currentYear]?.w2Wages || ''}
                    onChange={(e) => setYearlyData(prev => ({
                      ...prev,
                      [currentYear]: { ...prev[currentYear], w2Wages: e.target.value }
                    }))}
                    className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl bg-white/50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-200 placeholder:text-gray-400 text-xl"
                    placeholder="0"
                  />
                </div>
                <p className="text-sm text-gray-500">Include all {currentYear} salaries for anyone working on AI, automation, or tech improvements</p>
                <p className="text-xs text-blue-600 mt-1">💡 <a href="#" className="underline">Not sure? Use our estimator</a></p>
                
                {yearlyData[currentYear]?.w2Wages && (
                  <div className="mt-6 status-info rounded-2xl p-6">
                    <label className="block text-base font-semibold text-blue-900 mb-4">
                      What % of their time is spent on R&D activities?
                      <span className="font-normal text-blue-700 ml-2">(In {currentYear}: Most businesses 20-60%)</span>
                    </label>
                    <div className="flex items-center gap-4 mb-4">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={yearlyData[currentYear]?.w2Percentage || '30'}
                        onChange={(e) => setYearlyData(prev => ({
                          ...prev,
                          [currentYear]: { ...prev[currentYear], w2Percentage: e.target.value }
                        }))}
                        className="flex-1 h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="bg-blue-100 px-4 py-2 rounded-xl text-center min-w-[60px]">
                        <span className="text-lg font-bold text-blue-800">{yearlyData[currentYear]?.w2Percentage || '30'}%</span>
                      </div>
                    </div>
                    <div className="bg-blue-100 rounded-xl p-4">
                      <p className="text-blue-800 font-medium">
                        Qualified wages: <span className="text-xl font-bold">{formatCurrency(safeParseFloat(yearlyData[currentYear]?.w2Wages) * safeParsePercent(yearlyData[currentYear]?.w2Percentage, 30))}</span>
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <label className="block text-lg font-semibold text-gray-900 mb-3">
                  Contractor & Consultant Costs
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg font-semibold pointer-events-none">$</span>
                  <input
                    type="number"
                    min="0"
                    value={yearlyData[currentYear]?.contractorCosts || ''}
                    onChange={(e) => setYearlyData(prev => ({
                      ...prev,
                      [currentYear]: { ...prev[currentYear], contractorCosts: e.target.value }
                    }))}
                    className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl bg-white/50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-200 placeholder:text-gray-400 text-xl"
                    placeholder="0"
                  />
                </div>
                <p className="text-sm text-gray-500">Include all {currentYear} contractor costs: developers, AI consultants, automation specialists, etc.</p>
                
                {yearlyData[currentYear]?.contractorCosts && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      What % of contractor work was R&D?
                      <span className="font-normal text-gray-500 ml-1">(Typical {currentYear}: 40-80%)</span>
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={yearlyData[currentYear]?.contractorPercentage || '50'}
                        onChange={(e) => setYearlyData(prev => ({
                          ...prev,
                          [currentYear]: { ...prev[currentYear], contractorPercentage: e.target.value }
                        }))}
                        className="flex-1"
                      />
                      <div className="w-16 text-center">
                        <span className="text-sm font-medium">{yearlyData[currentYear]?.contractorPercentage || '50'}%</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      = {formatCurrency(safeParseFloat(yearlyData[currentYear]?.contractorCosts) * safeParsePercent(yearlyData[currentYear]?.contractorPercentage, 50) * 0.65)} qualified (65% of allocated costs per IRS Section 41)
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cloud & API Costs
                  <InfoTooltip text="OpenAI API, AWS, Google Cloud, or any cloud services for your AI work" />
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg font-semibold pointer-events-none">$</span>
                  <input
                    type="number"
                    min="0"
                    value={yearlyData[currentYear]?.cloudCosts || ''}
                    onChange={(e) => setYearlyData(prev => ({
                      ...prev,
                      [currentYear]: { ...prev[currentYear], cloudCosts: e.target.value }
                    }))}
                    className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl bg-white/50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-200 placeholder:text-gray-400"
                    placeholder="e.g., $200/mo for ChatGPT Plus"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AI Tools & Software
                  <InfoTooltip text="ChatGPT Plus, Claude Pro, Zapier, development tools, or any software for building" />
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg font-semibold pointer-events-none">$</span>
                  <input
                    type="number"
                    min="0"
                    value={yearlyData[currentYear]?.softwareLicenses || ''}
                    onChange={(e) => setYearlyData(prev => ({
                      ...prev,
                      [currentYear]: { ...prev[currentYear], softwareLicenses: e.target.value }
                    }))}
                    className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl bg-white/50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-200 placeholder:text-gray-400"
                    placeholder="e.g., $20/mo for ChatGPT Plus"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Other Tech Supplies
                  <InfoTooltip text="Hardware, testing tools, or any other supplies for your tech work" />
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg font-semibold pointer-events-none">$</span>
                  <input
                    type="number"
                    min="0"
                    value={yearlyData[currentYear]?.supplies || ''}
                    onChange={(e) => setYearlyData(prev => ({
                      ...prev,
                      [currentYear]: { ...prev[currentYear], supplies: e.target.value }
                    }))}
                    className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl bg-white/50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-200 placeholder:text-gray-400"
                    placeholder="3,000"
                  />
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>💡 Pro tip:</strong> Include ALL experimentation time — even 10 hours/month testing ChatGPT prompts and trying different automation tools counts as qualifying R&D activity!
              </p>
            </div>

            <div className="flex gap-4 justify-between">
              <button
                onClick={() => setCurrentStep(1)}
                className="bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 flex items-center"
              >
                <ChevronLeft className="mr-2 w-5 h-5" />
                Back
              </button>
              <div className="flex gap-4">
                <SaveProgressButton />
                <button
                  onClick={() => {
                    setCurrentStep(3);
                  }}
                  className="bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 flex items-center"
                >
                  Get My Credit Estimate →
                  <ChevronRight className="ml-2 w-5 h-5" />
                </button>
                <p className="text-sm text-gray-500 text-center mt-3">Calculation based on IRS Section 41 methodology</p>
              </div>
            </div>
          </div>
        );

      case 3:
        // If email not captured yet, show email capture with partial results
        if (!emailSubmitted) {
          return (
            <div className="space-y-6">
              {/* Value Prop Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                  <h3 className="font-bold text-green-900 mb-2">Your {currentYear} Estimate</h3>
                  <div className="text-2xl font-bold text-green-600">
                    {(() => {
                      const data = yearlyData[currentYear] || {};
                      const wages = safeParseFloat(data.w2Wages, 0);
                      const contractors = safeParseFloat(data.contractorCosts, 0);
                      const cloud = safeParseFloat(data.cloudCosts, 0);
                      const software = safeParseFloat(data.softwareLicenses, 0);
                      const supplies = safeParseFloat(data.supplies, 0);
                      
                      const wagePercent = safeParsePercent(data.w2Percentage, 30);
                      const contractorPercent = safeParsePercent(data.contractorPercentage, 50);
                      
                      const qualifiedWages = wages * wagePercent;
                      const qualifiedContractors = contractors * contractorPercent * 0.65;
                      const totalQRE = qualifiedWages + qualifiedContractors + cloud + software + supplies;
                      
                      const lowEnd = Math.round(totalQRE * 0.18);
                      const highEnd = Math.round(totalQRE * 0.22);
                      
                      return `${formatCurrency(lowEnd)} - ${formatCurrency(highEnd)}`;
                    })()}
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
                  <h3 className="font-bold text-blue-900 mb-2">Free Credit Analysis</h3>
                  <div className="text-lg font-semibold text-blue-600">No Payment Required</div>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 text-center">
                  <h3 className="font-bold text-purple-900 mb-2">Based on Your Data</h3>
                  <div className="text-lg font-semibold text-purple-600">Actual Business Expenses</div>
                </div>
              </div>

              {/* Range Section */}
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4 text-gray-900">Your {currentYear} R&D Tax Credit Estimate</h2>
                <p className="text-lg text-gray-600">
                  Get your exact calculation and see how to claim it
                </p>
              </div>
              
              {/* Email Capture Form */}
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-xl">
                <h3 className="text-2xl font-bold text-center mb-4">Get Your Free {currentYear} R&D Credit Report</h3>
                <p className="text-gray-600 text-center mb-6">
                  See your exact credit amount with detailed breakdown
                </p>
                
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <p className="text-blue-900 font-medium text-center mb-3">What your FREE report includes:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span>Exact {currentYear} credit calculation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span>Qualifying expense breakdown</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span>How the credit works for your business</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span>Next steps to claim your credit</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span>Future year savings potential</span>
                    </div>
                  </div>
                </div>

                <div className="max-w-md mx-auto">
                  <div className="space-y-4">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-lg"
                      placeholder="Enter email for instant report"
                    />
                    <button
                      onClick={() => {
                        if (email && email.includes('@')) {
                          console.log('Email captured:', email);
                          performCalculation();
                          setEmailSubmitted(true);
                          setShowFullResults(true);
                          setCurrentStep(4);
                        }
                      }}
                      disabled={!email || !email.includes('@')}
                      className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-4 px-8 rounded-lg font-bold text-lg hover:from-blue-700 hover:to-green-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed"
                    >
                      Get My Free Report →
                    </button>
                    
                    {/* Trust Elements */}
                    <div className="text-center text-xs text-gray-500 space-y-1">
                      <p>✓ Free report, no payment required</p>
                      <p>✓ Based on your actual business data</p>
                      <p>✓ Takes 30 seconds</p>
                    </div>
                  </div>
                </div>
                
                {/* Opportunity Messaging */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-4">Based on your {currentYear} activities, you could claim similar credits for:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto text-sm">
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <p className="font-medium text-orange-700">Previous years (2022-2023)</p>
                        <p className="text-xs text-orange-600">If you did similar AI work</p>
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="font-medium text-green-700">Future years</p>
                        <p className="text-xs text-green-600">As you continue using AI</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-4">Most businesses claim 2-3 years of credits</p>
                  </div>
                </div>
              </div>

              {/* What SMBs Really Want to Know */}
              <div className="card-elevated border border-blue-200 p-8 mt-8 bg-gradient-to-br from-blue-50 to-green-50">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">What Small Business Owners Really Want to Know</h3>
                  <p className="text-gray-600">Simple answers to your practical questions</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h5 className="font-bold text-gray-900 mb-2">"How do I explain this to my CPA?"</h5>
                        <p className="text-sm text-gray-700">
                          <strong className="text-green-600">We include a CPA cover letter</strong> explaining everything in professional terms. Your CPA gets organized documentation that makes their job easier.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <h5 className="font-bold text-gray-900 mb-2">"What if I already filed my taxes?"</h5>
                        <p className="text-sm text-gray-700">
                          <strong className="text-green-600">July 2026 deadline for previous years.</strong> We help you file amendments to claim missed credits from 2022-2024.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Clock className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h5 className="font-bold text-gray-900 mb-2">"Can I claim past years I missed?"</h5>
                        <p className="text-sm text-gray-700">
                          <strong className="text-green-600">Yes! Amend 2022-2024 returns before July 2026.</strong> Many clients recover $50K+ in missed credits from previous years of AI and automation work.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h5 className="font-bold text-gray-900 mb-2">"What records do I need to keep?"</h5>
                        <p className="text-sm text-gray-700">
                          <strong className="text-green-600">Checklist included for record keeping.</strong> Simple checklist shows exactly what to save for future audits.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 bg-gradient-to-r from-green-100 to-blue-100 rounded-xl p-4 border border-green-200">
                  <div className="text-center">
                    <p className="font-semibold text-gray-900 mb-1">✅ Everything handled for you</p>
                    <p className="text-sm text-gray-700">CPA cover letter + amendment support + record-keeping checklist + professional documentation</p>
                  </div>
                </div>
              </div>

              {/* Why CPAs Don't Mention This - After Email Capture */}
              <div className="card-elevated border-l-4 border-orange-500 p-8 mt-8 bg-gradient-to-r from-orange-50 to-yellow-50">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-orange-900 mb-4">
                      "My CPA never mentioned this - am I missing out?"
                    </h3>
                    <div className="space-y-3 text-orange-800">
                      <p className="leading-relaxed">
                        <strong>Most CPAs focus on traditional tax services</strong> – handling 1040s, business deductions, and quarterly filings. R&D tax credits are a specialized area that requires specific expertise and additional time investment.
                      </p>
                      <p className="leading-relaxed">
                        Think of it like specialized medical care. Your general practitioner handles most health needs, but specialists focus on specific areas. <strong>R&D credits require deep knowledge</strong> of complex tax rules, qualification criteria, and proper documentation.
                      </p>
                      <div className="bg-orange-100 rounded-xl p-4 mt-4">
                        <p className="font-medium text-orange-900 mb-2">The good news:</p>
                        <p className="text-sm">We handle the specialized R&D credit work, then provide your CPA with complete documentation for seamless filing. <strong>Result: A tax refund check or direct deposit from the U.S. Treasury.</strong></p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        }
        
        // Auto-advance to calculation since we removed the intermediate step  
        performCalculation();
        setCurrentStep(4);
        return null;

      case 4:
        if (!results) return null;

        const currentTaxYear = formData.taxYear || '2024';
        const calculatedCredit = results.federal?.creditAmount || 0;
        const dynamicPrice = getFederalPricing(calculatedCredit);

        return (
          <div className="space-y-6">
            {/* SECTION 1: THE BIG REVEAL */}
            <div className="text-center bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl p-8 border border-blue-200">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                Your {currentTaxYear} R&D Tax Credit Calculation
              </h2>
              <div className="text-6xl md:text-7xl font-black mb-4 text-green-600">
                {formatCurrency(calculatedCredit)}
              </div>
              <p className="text-lg text-gray-600 mb-4">Your Federal Tax Credit</p>
              <p className="text-sm text-gray-500 mb-6">Based on your qualifying AI and automation expenses</p>
              <button className="text-blue-600 underline font-medium hover:text-blue-800">
                See calculation breakdown
              </button>
            </div>

            {/* SECTION 2: THE OFFER */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-xl">
              <h3 className="text-2xl font-bold text-center mb-6 text-gray-900">
                Your Complete R&D Tax Credit Filing Package
              </h3>
              
              <div className="bg-blue-50 rounded-xl p-6 mb-6">
                <h4 className="font-bold text-blue-900 mb-4">What's Included:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>IRS Form 6765 - Complete and ready to file</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>Supporting documentation package</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>Detailed expense breakdown</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>CPA coordination letter</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>Step-by-step filing instructions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>Technical narratives for your activities</span>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <h4 className="text-xl font-bold text-gray-900 mb-2">Your Investment:</h4>
                <div className="text-4xl font-bold text-blue-600 mb-4">${dynamicPrice.toLocaleString()}</div>
                <p className="text-sm text-gray-600 mb-6">
                  Based on your credit amount of {formatCurrency(calculatedCredit)}
                </p>
                <button
                  onClick={() => {
                    console.log('Proceeding to checkout with credit:', calculatedCredit, 'price:', dynamicPrice);
                    window.location.href = '/checkout';
                  }}
                  className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-4 px-8 rounded-xl font-bold text-xl hover:from-blue-700 hover:to-green-700 shadow-lg"
                >
                  Generate My Filing Package →
                </button>
              </div>
            </div>

            {/* SECTION 3: DIY COMPARISON */}
            <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-green-50 border border-slate-200 rounded-2xl p-8 shadow-xl">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-slate-800 mb-4">Time Investment: DIY vs Our Service</h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* DIY Column */}
                <div className="bg-white rounded-2xl p-6 border-2 border-red-300 shadow-lg">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-3xl">😰</span>
                    </div>
                    <h4 className="text-2xl font-bold text-red-800">Do It Yourself</h4>
                    <p className="text-sm text-red-600 mt-1">The hard way</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
                      <span className="text-sm font-medium text-red-800">Research IRS regulations</span>
                      <span className="font-bold text-red-600">40+ hours</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
                      <span className="text-sm font-medium text-red-800">Organize documentation</span>
                      <span className="font-bold text-red-600">20+ hours</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
                      <span className="text-sm font-medium text-red-800">Complete Form 6765</span>
                      <span className="font-bold text-red-600">15+ hours</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-100 rounded-lg border border-red-300">
                      <span className="text-sm font-bold text-red-900">Total Time Investment</span>
                      <span className="font-black text-red-700">75+ hours</span>
                    </div>
                    <div className="text-center mt-4 p-3 bg-red-200 rounded-lg">
                      <span className="text-sm font-bold text-red-800">Risk: Missing documentation = IRS rejection</span>
                    </div>
                  </div>
                </div>

                {/* Our Service Column */}
                <div className="bg-white rounded-2xl p-6 border-2 border-green-300 shadow-lg">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-3xl">✅</span>
                    </div>
                    <h4 className="text-2xl font-bold text-green-800">Our Service</h4>
                    <p className="text-sm text-green-600 mt-1">The smart way</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                      <span className="text-sm font-medium text-green-800">Order your package</span>
                      <span className="font-bold text-green-600">5 minutes</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                      <span className="text-sm font-medium text-green-800">Download complete filing</span>
                      <span className="font-bold text-green-600">24-48 hours</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                      <span className="text-sm font-medium text-green-800">Submit to IRS/CPA</span>
                      <span className="font-bold text-green-600">5 minutes</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-100 rounded-lg border border-green-300">
                      <span className="text-sm font-bold text-green-900">Total Time Investment</span>
                      <span className="font-black text-green-700">10 minutes</span>
                    </div>
                    <div className="text-center mt-4 p-3 bg-green-200 rounded-lg">
                      <span className="text-sm font-bold text-green-800">IRS-compliant methodology + complete documentation</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 4: MULTI-YEAR OPPORTUNITY */}
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-center mb-6 text-gray-900">Claim Additional Years</h3>
              
              <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
                <div className="text-center mb-4">
                  <p className="text-gray-700 mb-4">Based on your {currentTaxYear} activities, you likely qualify for:</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-800">{currentTaxYear}: {formatCurrency(calculatedCredit)}</span>
                    </div>
                    <span className="text-sm text-green-600">Included - ${dynamicPrice}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-gray-400 rounded"></div>
                      <span className="font-medium text-gray-700">{parseInt(currentTaxYear) - 1}: ~{formatCurrency(calculatedCredit * 0.9)}</span>
                    </div>
                    <span className="text-sm text-gray-600">Add for $297</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-gray-400 rounded"></div>
                      <span className="font-medium text-gray-700">{parseInt(currentTaxYear) - 2}: ~{formatCurrency(calculatedCredit * 0.85)}</span>
                    </div>
                    <span className="text-sm text-gray-600">Add for $297</span>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 mt-4 pt-4">
                  <div className="text-center">
                    <p className="font-bold text-lg text-gray-900">
                      Potential Total: ~{formatCurrency(calculatedCredit + (calculatedCredit * 0.9) + (calculatedCredit * 0.85))}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-red-100 border border-red-300 rounded-lg p-4 mb-6">
                <div className="text-center text-red-800">
                  <p className="font-bold">July 2026 deadline for amending 2022-2024 returns</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button className="bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700">
                  Continue with {currentTaxYear} Only - ${dynamicPrice}
                </button>
                <button className="bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700">
                  Add All Available Years - ${dynamicPrice + 594}
                </button>
              </div>
            </div>

            {/* SECTION 5: WHAT YOU GET */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-center mb-6 text-gray-900">Professional Documentation Package Includes:</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="text-center mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <h4 className="font-bold text-gray-900">IRS Forms:</h4>
                  </div>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li>• Form 6765 with all schedules</li>
                    <li>• Amendment forms for prior years</li>
                    <li>• Complete calculations and worksheets</li>
                  </ul>
                </div>
                
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="text-center mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                    <h4 className="font-bold text-gray-900">Supporting Documents:</h4>
                  </div>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li>• Technical narrative explaining R&D activities</li>
                    <li>• Expense qualification worksheets</li>
                    <li>• Time allocation documentation</li>
                    <li>• Four-part test compliance memo</li>
                  </ul>
                </div>
                
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <div className="text-center mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Shield className="w-6 h-6 text-purple-600" />
                    </div>
                    <h4 className="font-bold text-gray-900">CPA Resources:</h4>
                  </div>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li>• Cover letter for your tax preparer</li>
                    <li>• R&D credit explanation sheet</li>
                    <li>• Filing instructions</li>
                  </ul>
                </div>
              </div>
              
              <div className="text-center mt-6 p-4 bg-blue-100 rounded-lg">
                <p className="font-medium text-blue-800">Download complete package within 24-48 hours</p>
              </div>
            </div>

            {/* SECTION 6: SUCCESS METRICS */}
            <div className="bg-gray-50 rounded-2xl p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Join 500+ Businesses Who've Claimed Their Credits</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <div className="text-4xl font-bold text-green-600 mb-2">${(45000).toLocaleString()}</div>
                  <p className="text-gray-700 font-medium">Average credit claimed</p>
                </div>
                <div>
                  <div className="text-4xl font-bold text-blue-600 mb-2">48hrs</div>
                  <p className="text-gray-700 font-medium">Document turnaround</p>
                </div>
                <div>
                  <div className="text-4xl font-bold text-purple-600 mb-2">${(23000000).toLocaleString()}</div>
                  <p className="text-gray-700 font-medium">Total credits processed</p>
                </div>
              </div>
            </div>

            {/* SECTION 7: FINAL CTA */}
            <div className="text-center bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8 border-2 border-green-200">
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                Ready to Claim Your {formatCurrency(calculatedCredit)} Credit?
              </h3>
              
              <button
                onClick={() => {
                  console.log('Final CTA clicked - proceeding to checkout');
                  window.location.href = '/checkout';
                }}
                className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-6 px-12 rounded-2xl font-bold text-2xl hover:from-green-700 hover:to-blue-700 shadow-lg transform hover:scale-105 transition-all mb-4"
              >
                Generate Filing Package - ${dynamicPrice}
              </button>
              
              <p className="text-sm text-gray-600">
                ✓ Secure checkout ✓ Download in 24-48 hours
              </p>
              
              <div className="mt-6 text-sm text-gray-500">
                Questions? support@smbtaxcredits.com
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 bg-[length:20px_20px] opacity-25"></div>
      
      {/* Main Container with Perfect Centering */}
      <div className="relative flex items-center justify-center min-h-screen py-8 px-4">
        <div className="w-full max-w-6xl">
          {/* Main Calculator Container */}
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-blue-400/15 to-green-400/15 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-gradient-to-br from-green-400/15 to-blue-400/15 rounded-full blur-3xl"></div>
            
            <div className="relative z-10 px-8 py-12 md:px-12 md:py-16">
              <BrandingHeader />
              
              {currentStep < 4 && <ProgressIndicator />}
              
              {/* Form Content Container with Better Spacing */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 md:p-10 border border-gray-100 shadow-lg mx-auto max-w-3xl">
                {renderStep()}
              </div>
            </div>
          </div>
          
          {/* Enhanced Footer - Same as Landing Page */}
          <footer className="bg-gray-900 text-white py-16 mt-12 rounded-3xl">
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
                    <li><a href="/calculator" className="hover:text-white">R&D Credit Calculator</a></li>
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
    </div>
  );
};

export default CreditCalculator;