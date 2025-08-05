import React, { useState, useEffect } from 'react';
import { Calculator, Info, DollarSign, Users, Package, AlertCircle, ChevronRight, ChevronLeft, Building, Shield, Lock, CheckCircle, Clock, TrendingUp, FileText, Share2, Zap, Calendar } from 'lucide-react';

const CreditCalculator = () => {
  // State for calculator inputs
  const [formData, setFormData] = useState({
    // Basic info
    companyName: '',
    startupYear: '',
    grossReceipts: '',
    industry: '',
    selectedYears: ['2024'], // Array of selected tax years
    
    // Additional factors
    stateCredit: false,
    selectedState: '',
    priorYearCredit: false,
    priorYearAmount: ''
  });

  // Multi-year data for each selected year
  const [yearlyData, setYearlyData] = useState({
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
  const [qualificationChecks, setQualificationChecks] = useState({
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
  const [showStateDetails, setShowStateDetails] = useState(false);

  // States that offer R&D tax credits
  // Supported states with detailed filing information
  const statesWithCredit = [
    { code: 'AK', name: 'Alaska', rate: 0.18, form: 'Form 6390', method: 'PDF with return' },
    { code: 'AR', name: 'Arkansas', rate: 0.20, form: 'AEDC Application', method: 'PDF/email application' },
    { code: 'CA', name: 'California', rate: 0.15, form: 'CA Form 3523', method: 'File with return' },
    { code: 'CO', name: 'Colorado', rate: 0.03, form: 'Form 112CR', method: 'Standard filing' },
    { code: 'CT', name: 'Connecticut', rate: 0.06, form: 'Form CT-1120RC', method: 'C-corp only, paper accepted' },
    { code: 'DE', name: 'Delaware', rate: 0.10, form: 'Form 2070AC', method: 'Standard filing' },
    { code: 'GA', name: 'Georgia', rate: 0.10, form: 'Form IT-RD', method: 'Paper or e-file' },
    { code: 'HI', name: 'Hawaii', rate: 0.20, form: 'Form N-346', method: 'PDF + annual survey' },
    { code: 'ID', name: 'Idaho', rate: 0.05, form: 'Form 67', method: 'PDF accepted' },
    { code: 'IL', name: 'Illinois', rate: 0.065, form: 'Schedule 1299-D', method: 'Standard filing' },
    { code: 'IN', name: 'Indiana', rate: 0.15, form: 'Schedule IT-20REC', method: 'Paper or e-file' },
    { code: 'KS', name: 'Kansas', rate: 0.065, form: 'Schedule K-53', method: 'No preapproval needed' },
    { code: 'ME', name: 'Maine', rate: 0.05, form: 'Form 1040RC', method: 'PDF accepted' },
    { code: 'MA', name: 'Massachusetts', rate: 0.15, form: 'Schedule RC', method: 'PDF accepted' },
    { code: 'MN', name: 'Minnesota', rate: 0.10, form: 'Form RD', method: 'Refundable for SMBs' },
    { code: 'NE', name: 'Nebraska', rate: 0.15, form: 'Form 3800N', method: 'PDF format' },
    { code: 'NJ', name: 'New Jersey', rate: 0.10, form: 'Form 306', method: 'Paper/e-file supported' },
    { code: 'NM', name: 'New Mexico', rate: 0.04, form: 'RPD-41246/41247', method: 'PDF acceptable' },
    { code: 'ND', name: 'North Dakota', rate: 0.04, form: 'Schedule R&D', method: 'Paper-based' },
    { code: 'OH', name: 'Ohio', rate: 0.075, form: 'Schedule R or CAT', method: 'Paper accepted' },
    { code: 'RI', name: 'Rhode Island', rate: 0.225, form: 'Schedule RTC', method: 'PDF filing' },
    { code: 'SC', name: 'South Carolina', rate: 0.05, form: 'Form TC-18', method: 'PDF accepted' },
    { code: 'TX', name: 'Texas', rate: 0.05, form: 'Form 05-178', method: 'PDF Franchise Tax forms' },
    { code: 'UT', name: 'Utah', rate: 0.05, form: 'TC-675R', method: 'PDF filing allowed' },
    { code: 'VT', name: 'Vermont', rate: 0.27, form: 'Schedule RDC', method: '27% of federal credit' },
    { code: 'WI', name: 'Wisconsin', rate: 0.05, form: 'Schedule R or CR', method: 'PDF accepted' }
  ];

  // Unsupported states with reasons
  const unsupportedStates = [
    { code: 'AZ', name: 'Arizona', reason: 'Requires Commerce Authority portal application for refundable portion' },
    { code: 'FL', name: 'Florida', reason: 'Annual cap; must apply via FL Tax Credit Portal on March 20' },
    { code: 'LA', name: 'Louisiana', reason: 'LED submission must be online (portal required)' },
    { code: 'MD', name: 'Maryland', reason: 'Commerce Department application via portal due by Nov 15' },
    { code: 'MO', name: 'Missouri', reason: 'DED requires application via portal or email' },
    { code: 'PA', name: 'Pennsylvania', reason: 'myPATH portal mandatory for application by Dec 1' },
    { code: 'VA', name: 'Virginia', reason: 'Form RDC must be submitted online via state portal' }
  ];

  // States with no R&D credit
  const statesWithoutCredit = [
    'Mississippi', 'North Carolina', 'Tennessee', 'Washington', 'District of Columbia', 'West Virginia'
  ];

  // Industry types for specific examples - expanded list
  const industries = [
    { value: 'ecommerce', label: 'E-commerce/Retail' },
    { value: 'saas', label: 'Software/SaaS' },
    { value: 'agency', label: 'Marketing/Creative Agency' },
    { value: 'consulting', label: 'Consulting/Professional Services' },
    { value: 'manufacturing', label: 'Manufacturing/Production' },
    { value: 'healthcare', label: 'Healthcare/Medical' },
    { value: 'finance', label: 'Finance/Insurance' },
    { value: 'realestate', label: 'Real Estate/Property Management' },
    { value: 'restaurant', label: 'Restaurant/Food Service' },
    { value: 'construction', label: 'Construction/Contracting' },
    { value: 'education', label: 'Education/Training' },
    { value: 'nonprofit', label: 'Non-Profit/NGO' },
    { value: 'legal', label: 'Legal Services' },
    { value: 'logistics', label: 'Logistics/Transportation' },
    { value: 'fitness', label: 'Fitness/Wellness' },
    { value: 'media', label: 'Media/Publishing' },
    { value: 'travel', label: 'Travel/Hospitality' },
    { value: 'automotive', label: 'Automotive/Dealership' },
    { value: 'agriculture', label: 'Agriculture/Farming' },
    { value: 'other', label: 'Other' }
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

  // Enhanced Trust Bar Component with Social Proof
  const TrustBar = () => (
    <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-green-100 rounded-xl py-4 px-6 mb-8">
      <div className="flex flex-wrap justify-center items-center gap-6 text-sm">
        <div className="flex items-center gap-2 text-green-700 font-medium">
          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
            <Shield className="w-3 h-3 text-green-600" />
          </div>
          <span>IRS Compliant Forms</span>
        </div>
        <div className="flex items-center gap-2 text-blue-700 font-medium">
          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
            <Lock className="w-3 h-3 text-blue-600" />
          </div>
          <span>Secure & Private</span>
        </div>
        <div className="flex items-center gap-2 text-purple-700 font-medium">
          <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-3 h-3 text-purple-600" />
          </div>
          <span>2,847+ Successfully Filed</span>
        </div>
        <div className="flex items-center gap-2 text-orange-700 font-medium">
          <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
            <TrendingUp className="w-3 h-3 text-orange-600" />
          </div>
          <span>$127M+ Claimed</span>
        </div>
      </div>
    </div>
  );

  // Enhanced Value Props Component with Perfect Centering and Visual Appeal
  const ValueProps = () => {
    const currentMonth = new Date().getMonth();
    const isEndOfYear = currentMonth >= 10; // Nov/Dec
    
    return (
      <div className="mb-12">
        {/* Primary Value Props with Perfect Centering */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 px-4">
            <div className="bg-gradient-to-br from-green-50 via-white to-green-100 border border-green-200 rounded-2xl p-8 text-center shadow-sm hover:shadow-lg transition-all group">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-green-800 mb-3">Average $125K Saved</h3>
              <p className="text-base text-green-700 font-medium">Cash refunds + tax credits</p>
              <div className="mt-3 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full inline-block">
                Real cash back to your business
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 border border-blue-200 rounded-2xl p-8 text-center shadow-sm hover:shadow-lg transition-all group">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-blue-800 mb-3">Ready in 10 Minutes</h3>
              <p className="text-base text-blue-700 font-medium">No tax expertise required</p>
              <div className="mt-3 text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full inline-block">
                Simple step-by-step process
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 via-white to-purple-100 border border-purple-200 rounded-2xl p-8 text-center shadow-sm hover:shadow-lg transition-all group">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-purple-800 mb-3">Built for AI Users</h3>
              <p className="text-base text-purple-700 font-medium">ChatGPT, automations, & more</p>
              <div className="mt-3 text-sm text-purple-600 bg-purple-50 px-3 py-1 rounded-full inline-block">
                93% of AI users qualify
              </div>
            </div>
          </div>
        </div>

        {/* Show urgency banner only on step 1 */}
        {currentStep === 1 && (
          <div className="max-w-5xl mx-auto bg-gradient-to-r from-orange-100 to-red-100 border border-orange-300 rounded-2xl p-6 mx-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="text-2xl">🔥</span>
                <span className="text-lg font-bold text-orange-800">Limited-Time Opportunity: New Law Supercharges R&D Credits</span>
              </div>
              <div className="space-y-2 text-sm text-orange-800">
                <div className="flex items-center justify-center gap-1">
                  <span className="text-orange-600 font-bold">▸</span>
                  <span><strong>Amend 2022–2024 returns</strong> through July 3, 2026 — claim credits you missed</span>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-orange-600 font-bold">▸</span>
                  <span><strong>100% immediate expensing of R&D costs</strong> — retroactive to 2022 for qualifying businesses</span>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-orange-600 font-bold">▸</span>
                  <span><strong>Expanded refundability</strong> for businesses under $31M in revenue — get cash back faster</span>
                </div>
              </div>
              <div className="mt-4 p-2 bg-red-100 border border-red-300 rounded-lg">
                <p className="text-sm font-bold text-red-900 flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4" />
                  Act Fast: You must file amended returns by July 3, 2026 to unlock this one-time benefit.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Enhanced Branding Header with Perfect Centering and Spacing
  const BrandingHeader = () => (
    <div className="text-center mb-12 max-w-4xl mx-auto">
      <div className="inline-flex items-center gap-3 text-sm text-blue-600 font-semibold mb-6 bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
        <Building className="w-4 h-4" />
        <span>SMBTaxCredits.com</span>
      </div>
      
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent leading-tight">
        Turn Your AI Tools Into Cash Refunds
      </h1>
      
      <p className="text-gray-700 text-xl md:text-2xl mb-8 max-w-3xl mx-auto font-medium leading-relaxed">
        Claim up to <span className="font-bold text-green-600 bg-green-50 px-2 py-1 rounded">$500,000</span> in R&D tax credits for using ChatGPT, 
        automation tools, and AI in your business
      </p>
      
      <div className="flex flex-wrap justify-center gap-6 text-base text-gray-600 max-w-2xl mx-auto">
        <span className="flex items-center gap-2 bg-white/60 px-4 py-2 rounded-full">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <span className="font-medium">No tax knowledge required</span>
        </span>
        <span className="flex items-center gap-2 bg-white/60 px-4 py-2 rounded-full">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <span className="font-medium">IRS-compliant documentation</span>
        </span>
        <span className="flex items-center gap-2 bg-white/60 px-4 py-2 rounded-full">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <span className="font-medium">Instant results</span>
        </span>
      </div>
    </div>
  );

  // Industry-Specific Examples Component - expanded
  const IndustryExamples = ({ industry }: { industry: string }) => {
    const examples = {
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
        "Property valuation AI models",
        "Automated listing descriptions",
        "Lead qualification chatbots",
        "Market analysis automation"
      ],
      restaurant: [
        "AI menu optimization",
        "Inventory management systems",
        "Customer preference analysis",
        "Automated ordering chatbots"
      ],
      construction: [
        "Project estimation AI tools",
        "Safety compliance automation",
        "Resource optimization systems",
        "Bid proposal generators"
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
          {examples[industry].slice(0, 4).map(item => (
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
            Do You Qualify? <span className="text-green-600">(Quick Check)</span>
          </h3>
        </div>
        
        <p className="text-gray-700 mb-4">
          Most businesses using AI qualify for significant credits. Check all that apply:
        </p>
        
        <div className="grid grid-cols-1 gap-3">
          {[
            { key: 'aiTools', label: 'We use ChatGPT, Claude, or other AI tools for work', icon: '🤖', popular: true },
            { key: 'customGPTs', label: 'We\'ve built custom GPTs or chatbots', icon: '⚡', premium: true },
            { key: 'prompts', label: 'We\'ve developed prompt templates or libraries', icon: '📝' },
            { key: 'automation', label: 'We\'ve automated tasks with Zapier, Make, or code', icon: '🔄', popular: true },
            { key: 'testing', label: 'We test and improve our AI prompts or workflows', icon: '🧪' },
            { key: 'improvement', label: 'We\'ve made our processes 10%+ better with tech', icon: '📈', premium: true }
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
            <strong>Amendment Opportunity:</strong> You can still amend your {lastYear} return — but time is running out. 
            The Big Beautiful Bill gives you a one-time opportunity to claim retroactive deductions.
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
  
  // Get tiered pricing based on credit amount
  const getTieredPricing = (totalCredit: any) => {
    const credit = safeParseFloat(totalCredit, 0);
    if (credit < 10000) return 500;
    if (credit < 50000) return 750;
    if (credit < 100000) return 1000;
    return 1500;
  };

  // Get tiered state add-on pricing with exact pricing structure
  const getStateAddonPricing = (totalCredit: any) => {
    const basePrice = getTieredPricing(totalCredit);
    if (basePrice === 500) return 250;  // 50%
    if (basePrice === 750) return 325;  // ~43%
    if (basePrice === 1000) return 375; // ~37%
    return 450; // 30% for $1500 tier
  };

  // Multi-year discount calculation
  const getMultiYearDiscount = (numYears: number) => {
    if (numYears >= 4) return 0.25; // 25% discount for 4 years
    if (numYears >= 3) return 0.20; // 20% discount for 3 years
    if (numYears >= 2) return 0.15; // 15% discount for 2 years
    return 0; // No discount for single year
  };

  // Available tax years (current year + 3 previous years)
  const getAvailableYears = () => {
    const currentYear = new Date().getFullYear();
    return [currentYear, currentYear - 1, currentYear - 2, currentYear - 3];
  };

  // Helper function to add/remove years from selection
  const toggleYear = (year: number) => {
    const yearStr = year.toString();
    const currentSelected = formData.selectedYears;
    
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
      aiTools: 'Using AI tools like ChatGPT or Claude',
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
        Common Concerns Addressed:
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="flex gap-2">
          <span className="text-lg">📊</span>
          <div className="text-xs text-gray-600">
            <strong className="text-gray-900">We're too small</strong>
            <p>Credits start at just $10K in AI tool expenses</p>
          </div>
        </div>
        <div className="flex gap-2">
          <span className="text-lg">🔍</span>
          <div className="text-xs text-gray-600">
            <strong className="text-gray-900">What about audits?</strong>
            <p>Less than 1% audit rate with proper documentation</p>
          </div>
        </div>
        <div className="flex gap-2">
          <span className="text-lg">💼</span>
          <div className="text-xs text-gray-600">
            <strong className="text-gray-900">We just use ChatGPT</strong>
            <p>Prompt engineering and testing absolutely qualify!</p>
          </div>
        </div>
        <div className="flex gap-2">
          <span className="text-lg">📝</span>
          <div className="text-xs text-gray-600">
            <strong className="text-gray-900">Documentation is hard</strong>
            <p>We provide templates that take 15 minutes to complete</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Multi-Year Selection Component
  const MultiYearSelector = () => {
    const availableYears = getAvailableYears();
    const selectedCount = formData.selectedYears.length;
    const discount = getMultiYearDiscount(selectedCount);
    
    return (
      <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          Select Tax Years to File
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {availableYears.map(year => {
            const isSelected = formData.selectedYears.includes(year.toString());
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
              Most businesses have been using AI tools for 2+ years. Add previous years to:
            </p>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Get 15-25% multi-year discount</li>
              <li>• Maximize total recovery amount</li>
              <li>• Take advantage of "Big Beautiful Bill" deadline</li>
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

      const creditRate = 0.14;
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

  // Calculate state credit
  const calculateStateCredit = (qres) => {
    if (!formData.stateCredit || !formData.selectedState) return 0;
    
    const state = statesWithCredit.find(s => s.code === formData.selectedState);
    if (!state) return 0;
    
    return qres.total * state.rate;
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

  // Calculate multi-year projection
  const calculateMultiYearProjection = (qres, federal, state) => {
    const growthRate = 1.1;
    let totalProjected = 0;
    
    for (let year = 0; year < 3; year++) {
      const projectedQres = qres.total * Math.pow(growthRate, year);
      const projectedFederal = projectedQres * federal.effectiveRate;
      const projectedState = state > 0 ? projectedQres * (state / qres.total) : 0;
      
      const currentYear = parseInt(formData.taxYear) || 2024;
      const projectedYear = currentYear + year;
      let projected174A = 0;
      
      if (projectedYear >= 2025) {
        projected174A = projectedQres * 0.21;
      } else if (projectedYear >= 2022 && projectedYear <= 2024 && federal.isSmallBusinessTaxpayer) {
        projected174A = projectedQres * 0.21;
      }
      
      totalProjected += projectedFederal + projectedState + projected174A;
    }
    
    return totalProjected;
  };

  // Perform calculation with multi-year support
  const performCalculation = () => {
    const qres = calculateQREs();
    const federal = calculateFederalCredit(qres);
    const state = calculateStateCredit(qres);
    
    const totalCredit = federal.creditAmount + state;
    const totalBenefit = totalCredit + (federal.section174ABenefit || 0);
    
    const retroactiveBenefit = calculateRetroactiveBenefit(qres);
    const multiYearProjection = calculateMultiYearProjection(qres, federal, state);
    
    // Multi-year specific calculations
    const numYears = formData.selectedYears.length;
    const multiYearDiscount = getMultiYearDiscount(numYears);
    
    const results = {
      qres,
      federal,
      state,
      totalCredit,
      totalBenefit,
      section174ABenefit: federal.section174ABenefit || 0,
      retroactiveBenefit,
      multiYearProjection,
      estimatedRefund: federal.payrollTaxOffset > 0 ? federal.payrollTaxOffset : totalCredit * 0.9,
      details: generateDetailedBreakdown(qres, federal, state),
      // Multi-year specific data
      numYears,
      multiYearDiscount,
      selectedYears: formData.selectedYears,
      yearlyBreakdown: qres.yearlyQREs
    };
    
    setResults(results);
  };

  // Generate detailed breakdown
  const generateDetailedBreakdown = (qres, federal, state) => {
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
      stateCredit: {
        state: formData.selectedState,
        amount: state
      },
      section174ABenefit: federal.section174ABenefit || 0,
      isRetroactive174A: isRetroactive174A,
      totalBenefit: federal.creditAmount + state + (federal.section174ABenefit || 0)
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

  // Enhanced Progress Indicator with Benefits Messaging
  const ProgressIndicator = () => {
    const steps = [
      { label: 'Company Info', benefit: '2 min', icon: '🏢' },
      { label: 'Your AI Work', benefit: '3 min', icon: '🤖' },
      { label: 'Extra Credits', benefit: '2 min', icon: '💰' },
      { label: 'Your Results', benefit: 'Cash!', icon: '🎉' }
    ];

    return (
      <div className="mb-8 max-w-4xl mx-auto">
        {/* Progress Bar with Perfect Centering */}
        <div className="relative">
          <div className="flex items-center justify-between mb-6 px-4">
            {steps.map((stepInfo, index) => {
              const step = index + 1;
              const isActive = currentStep >= step;
              const isCompleted = currentStep > step;
              
              return (
                <div key={step} className="flex flex-col items-center relative z-10 bg-white rounded-full p-2">
                  <div className={`
                    w-16 h-16 rounded-full flex items-center justify-center font-bold mb-3 border-3 transition-all duration-300 shadow-lg
                    ${isActive 
                      ? 'bg-gradient-to-r from-blue-500 to-green-500 text-white border-transparent transform scale-110' 
                      : 'bg-white text-gray-400 border-gray-300'}
                    ${isCompleted ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white' : ''}
                  `}>
                    <span className="text-2xl">
                      {isCompleted ? '✓' : stepInfo.icon}
                    </span>
                  </div>
                  <div className="text-center min-w-[100px]">
                    <span className="text-sm font-semibold text-gray-800 block">{stepInfo.label}</span>
                    <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-full mt-1 inline-block">
                      {stepInfo.benefit}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Progress Line */}
          <div className="absolute top-8 left-0 right-0 h-1 bg-gray-200 rounded-full mx-16">
            <div 
              className="h-full bg-gradient-to-r from-blue-400 to-green-400 rounded-full transition-all duration-500"
              style={{width: `${((currentStep - 1) / 3) * 100}%`}}
            />
          </div>
        </div>
        
        {/* Step Message */}
        <div className="text-center bg-blue-50 rounded-xl py-3 px-6 mx-auto max-w-sm">
          <p className="text-base text-blue-800 font-medium">
            Step {currentStep} of 4 · Average time: <span className="font-bold text-blue-600">10 minutes</span>
          </p>
        </div>
      </div>
    );
  };

  // Update handler
  const updateFormData = (field: any, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold mb-4 text-gray-900">Tell us about your business</h2>
              <p className="text-lg text-gray-600 max-w-xl mx-auto">
                Even small businesses with no technical team can qualify for substantial credits.
              </p>
            </div>
            
            <QualificationQuickCheck />
            
            <div className="bg-gray-50/50 rounded-xl p-8 space-y-6">
              <div>
                <label className="block text-base font-semibold text-gray-800 mb-3">
                  Your business name
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => updateFormData('companyName', e.target.value)}
                  className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-3 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-lg font-medium bg-white shadow-sm"
                  placeholder="Your Company, Inc."
                />
              </div>

              <div>
                <label className="block text-base font-semibold text-gray-800 mb-3">
                  Industry Type
                </label>
                <select
                  value={formData.industry}
                  onChange={(e) => updateFormData('industry', e.target.value)}
                  className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-3 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-lg font-medium bg-white shadow-sm"
                >
                  <option value="">Select your industry</option>
                  {industries.map(ind => (
                    <option key={ind.value} value={ind.value}>{ind.label}</option>
                  ))}
                </select>
                <IndustryExamples industry={formData.industry} />
              </div>

              {/* Multi-Year Selection - Strategic Upsell Point */}


              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                <div>
                  <label className="block text-base font-semibold text-gray-800 mb-3">
                    Year Business Started
                    <InfoTooltip text="When your business started — newer companies get extra benefits!" />
                  </label>
                  <input
                    type="number"
                    value={formData.startupYear}
                    onChange={(e) => updateFormData('startupYear', e.target.value)}
                    className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-3 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-lg font-medium bg-white shadow-sm"
                    placeholder="2020"
                    min="1900"
                    max="2025"
                  />
                </div>
              </div>

              <div>
                <label className="block text-base font-semibold text-gray-800 mb-3">
                  Annual Revenue
                  <InfoTooltip text="We need this to calculate your maximum credit and special benefits. Your data is encrypted and never shared." />
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-4 w-6 h-6 text-gray-400" />
                  <input
                    type="number"
                    value={formData.grossReceipts}
                    onChange={(e) => updateFormData('grossReceipts', e.target.value)}
                    className="w-full pl-14 pr-5 py-4 border border-gray-300 rounded-xl focus:ring-3 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-lg font-medium bg-white shadow-sm"
                    placeholder="1,000,000"
                  />
                </div>
                <p className="text-sm text-blue-600 mt-3 font-medium bg-blue-50 px-4 py-2 rounded-lg">
                  💡 Businesses under $5M can get cash refunds through payroll tax offsets
                </p>
              </div>

            </div>
            
            <div className="flex justify-between items-center pt-8 border-t border-gray-200">
              <SaveProgressButton />
              <button
                onClick={() => setCurrentStep(2)}
                disabled={!formData.companyName || !formData.startupYear || !formData.grossReceipts}
                className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-5 px-10 rounded-2xl font-bold text-xl hover:from-blue-700 hover:to-green-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed flex items-center shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                Continue to Your AI Work 🚀
                <ChevronRight className="ml-3 w-6 h-6" />
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4 text-gray-900">Your AI & Technology Expenses</h2>
              <p className="text-lg text-gray-600">
                Include all time and money spent on AI tools, custom GPTs, chatbots, automations, and process improvements
              </p>
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
                Include all expenses and activities from {currentYear} related to AI, automation, and technology improvements.
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-green-900 mb-2">💡 What counts as R&D?</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>✓ Building custom GPTs or chatbots for your business</li>
                <li>✓ Developing and testing AI prompts that work for your needs</li>
                <li>✓ Creating automations with Zapier, Make, or custom code</li>
                <li>✓ Time spent experimenting with AI to improve processes</li>
                <li>✓ Integrating AI tools into your workflows</li>
              </ul>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="inline w-4 h-4 mr-1" />
                  Total Employee Wages
                  <InfoTooltip text="Total wages for employees who work on AI projects, automation, or tech improvements (we'll calculate the R&D portion next)" />
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={yearlyData[currentYear]?.w2Wages || ''}
                    onChange={(e) => setYearlyData(prev => ({
                      ...prev,
                      [currentYear]: { ...prev[currentYear], w2Wages: e.target.value }
                    }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="50,000"
                  />
                </div>
                
                {yearlyData[currentYear]?.w2Wages && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      What % of their time is spent on R&D activities?
                      <span className="font-normal text-gray-500 ml-1">(Most businesses: 20-60%)</span>
                    </label>
                    <div className="flex items-center gap-3">
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
                        className="flex-1"
                      />
                      <div className="w-16 text-center">
                        <span className="text-sm font-medium">{yearlyData[currentYear]?.w2Percentage || '30'}%</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      = {formatCurrency(safeParseFloat(yearlyData[currentYear]?.w2Wages) * safeParsePercent(yearlyData[currentYear]?.w2Percentage, 30))} in qualified wages
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Package className="inline w-4 h-4 mr-1" />
                  Total Contractor/Freelancer Costs
                  <InfoTooltip text="Total paid to developers, AI consultants, automation experts, or anyone helping build your tech" />
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={yearlyData[currentYear]?.contractorCosts || ''}
                    onChange={(e) => setYearlyData(prev => ({
                      ...prev,
                      [currentYear]: { ...prev[currentYear], contractorCosts: e.target.value }
                    }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="20,000"
                  />
                </div>
                
                {yearlyData[currentYear]?.contractorCosts && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      What % of contractor work was R&D?
                      <span className="font-normal text-gray-500 ml-1">(Typical: 40-80%)</span>
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
                      = {formatCurrency(safeParseFloat(yearlyData[currentYear]?.contractorCosts) * safeParsePercent(yearlyData[currentYear]?.contractorPercentage, 50) * 0.65)} qualified (65% of allocated costs per IRS rules)
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
                  <DollarSign className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={yearlyData[currentYear]?.cloudCosts || ''}
                    onChange={(e) => setYearlyData(prev => ({
                      ...prev,
                      [currentYear]: { ...prev[currentYear], cloudCosts: e.target.value }
                    }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="5,000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AI Tools & Software
                  <InfoTooltip text="ChatGPT Plus, Claude Pro, Zapier, development tools, or any software for building" />
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={yearlyData[currentYear]?.softwareLicenses || ''}
                    onChange={(e) => setYearlyData(prev => ({
                      ...prev,
                      [currentYear]: { ...prev[currentYear], softwareLicenses: e.target.value }
                    }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="2,000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Other Tech Supplies
                  <InfoTooltip text="Hardware, testing tools, or any other supplies for your tech work" />
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={yearlyData[currentYear]?.supplies || ''}
                    onChange={(e) => setYearlyData(prev => ({
                      ...prev,
                      [currentYear]: { ...prev[currentYear], supplies: e.target.value }
                    }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="3,000"
                  />
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>💡 Pro tip:</strong> Include ALL experimentation time — testing prompts, trying different AI tools, and failed attempts all count as R&D!
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
                  onClick={() => setCurrentStep(3)}
                  className="bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 flex items-center"
                >
                  Continue
                  <ChevronRight className="ml-2 w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">Boost your savings even more</h2>

            <div className="space-y-4">
              <div className="border rounded-xl p-6 bg-gradient-to-br from-blue-50 to-green-50">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.stateCredit}
                    onChange={(e) => updateFormData('stateCredit', e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="ml-3 text-lg font-semibold text-gray-900">My state offers R&D tax credits</span>
                </label>
                
                {formData.stateCredit && (
                  <div className="mt-6 space-y-4">
                    <div>
                      <label className="block text-base font-semibold text-gray-800 mb-3">
                        Select Your State
                      </label>
                      <select
                        value={formData.selectedState}
                        onChange={(e) => updateFormData('selectedState', e.target.value)}
                        className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-3 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-lg font-medium bg-white shadow-sm"
                      >
                        <option value="">Choose a state</option>
                        {statesWithCredit.map(state => (
                          <option key={state.code} value={state.code}>
                            {state.name} - {(state.rate * 100).toFixed(1)}% credit
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Show selected state details */}
                    {formData.selectedState && (
                      <div className="bg-white rounded-xl p-4 border border-blue-200">
                        {(() => {
                          const selectedState = statesWithCredit.find(s => s.code === formData.selectedState);
                          const unsupportedState = unsupportedStates.find(s => s.code === formData.selectedState);
                          
                          if (selectedState) {
                            return (
                              <div className="space-y-2">
                                <h4 className="font-semibold text-green-800 flex items-center gap-2">
                                  <CheckCircle className="w-5 h-5" />
                                  {selectedState.name} R&D Credit Details
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="font-medium">Credit Rate:</span>
                                    <span className="ml-2 text-green-600 font-bold">{(selectedState.rate * 100).toFixed(1)}%</span>
                                  </div>
                                  <div>
                                    <span className="font-medium">Required Form:</span>
                                    <span className="ml-2">{selectedState.form}</span>
                                  </div>
                                  <div className="md:col-span-2">
                                    <span className="font-medium">Filing Method:</span>
                                    <span className="ml-2 text-blue-600">{selectedState.method}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          } else if (unsupportedState) {
                            return (
                              <div className="space-y-2">
                                <h4 className="font-semibold text-orange-800 flex items-center gap-2">
                                  <AlertCircle className="w-5 h-5" />
                                  {unsupportedState.name} - Complex Process
                                </h4>
                                <p className="text-sm text-orange-700 bg-orange-50 p-3 rounded-lg">
                                  <strong>Why it's complex:</strong> {unsupportedState.reason}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Contact us for specialized assistance with portal-based state filings.
                                </p>
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="border rounded-lg p-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.priorYearCredit}
                    onChange={(e) => updateFormData('priorYearCredit', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="ml-3 font-medium">I've successfully claimed R&D credits before</span>
                </label>
                
                {formData.priorYearCredit && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prior Year Credit Amount
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        value={formData.priorYearAmount}
                        onChange={(e) => updateFormData('priorYearAmount', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="10,000"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setCurrentStep(2)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 flex items-center justify-center"
              >
                <ChevronLeft className="mr-2 w-5 h-5" />
                Back
              </button>
              <button
                onClick={() => {
                  performCalculation();
                  setCurrentStep(4);
                }}
                className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 flex items-center justify-center"
              >
                <Calculator className="mr-2 w-5 h-5" />
                See My Savings
              </button>
            </div>

            {/* State Information Section - Redesigned */}
            <div className="mt-8">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">State R&D Credit Coverage</h3>
                <p className="text-gray-600">See which states we support and how we can help</p>
              </div>
              
              {/* Visual Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white text-center">
                  <div className="text-3xl font-bold mb-1">26</div>
                  <div className="text-green-100 text-sm">States We Support</div>
                  <div className="text-xs text-green-200 mt-1">Easy filing process</div>
                </div>
                
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white text-center">
                  <div className="text-3xl font-bold mb-1">7</div>
                  <div className="text-orange-100 text-sm">Portal Required</div>
                  <div className="text-xs text-orange-200 mt-1">Specialized assistance</div>
                </div>
                
                <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl p-6 text-white text-center">
                  <div className="text-3xl font-bold mb-1">6</div>
                  <div className="text-gray-100 text-sm">No State Credits</div>
                  <div className="text-xs text-gray-200 mt-1">Federal only</div>
                </div>
              </div>

              {/* Expandable Details */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <button
                    onClick={() => setShowStateDetails(!showStateDetails)}
                    className="w-full flex items-center justify-between text-left hover:text-blue-600 transition-colors"
                  >
                    <span className="font-semibold text-gray-900">View All State Details</span>
                    <ChevronRight className={`w-5 h-5 transition-transform ${showStateDetails ? 'rotate-90' : ''}`} />
                  </button>
                </div>
                
                {showStateDetails && (
                  <div className="p-6 space-y-6">
                    {/* Supported States - Compact Grid */}
                    <div>
                      <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Supported States (26)
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {statesWithCredit.map(state => (
                          <div key={state.code} className="bg-green-50 rounded-lg p-2 text-center border border-green-200">
                            <div className="font-medium text-green-800 text-sm">{state.name}</div>
                            <div className="text-xs text-green-600">{(state.rate * 100).toFixed(1)}% credit</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Complex Portal States */}
                      <div>
                        <h4 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          Portal Required States (7)
                        </h4>
                        <div className="space-y-2">
                          {unsupportedStates.map(state => (
                            <div key={state.code} className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                              <div className="font-medium text-orange-800">{state.name}</div>
                              <div className="text-xs text-orange-600">Specialized assistance available</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* States Without Credits */}
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <Info className="w-4 h-4" />
                          No State Credits (6)
                        </h4>
                        <div className="space-y-2">
                          {statesWithoutCredit.map(state => (
                            <div key={state} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                              <div className="font-medium text-gray-700">{state}</div>
                              <div className="text-xs text-gray-500">Federal credits still available</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 4:
        if (!results) return null;

        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">Your Tax Savings Opportunity</h2>
            
            <UrgencyBanner />

            {/* Email Gate for Full Results */}
            {!showFullResults ? (
              <>
                {/* Quick Summary - Show range ONLY if email not captured yet */}
                <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-lg p-6 text-white text-center">
                  <h3 className="text-xl font-bold mb-2">Your Estimated Tax Benefit</h3>
                  <p className="text-3xl font-bold">
                    {formatCurrency(Math.floor(results.totalBenefit * 0.8))} - {formatCurrency(Math.ceil(results.totalBenefit * 1.2))}
                  </p>
                  <p className="text-sm opacity-90 mt-2">
                    Based on businesses like yours claiming the R&D tax credit
                  </p>
                </div>

                {/* Social Proof First */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <p className="text-gray-700 italic mb-2">
                    "We thought R&D credits were just for big tech companies. Turns out our custom GPTs and automation work qualified for over $20,000!"
                  </p>
                  <p className="text-sm text-gray-600">— Sarah, Marketing Agency Owner</p>
                </div>

                {/* Email Capture Section */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
                  <h3 className="text-lg font-semibold mb-2">Get your full breakdown + filing instructions</h3>
                  <p className="text-gray-600 mb-4">
                    We'll email your personalized report with exact calculations, documentation templates, and step-by-step claiming instructions.
                  </p>
                  {!emailSubmitted ? (
                    <div className="space-y-4">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => {
                          if (email && email.includes('@')) {
                            console.log('Email captured:', email);
                            console.log('Results data:', results.details);
                            localStorage.setItem('rd_credit_email', email);
                            localStorage.setItem('rd_credit_results', JSON.stringify(results));
                            setEmailSubmitted(true);
                            setTimeout(() => setShowFullResults(true), 1000);
                          }
                        }}
                        disabled={!email || !email.includes('@')}
                        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        Send My Personalized Report
                      </button>
                      <p className="text-xs text-gray-500 text-center italic">
                        Free instant access • No credit card required • Unsubscribe anytime
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-green-600 font-medium">✅ Success! Check your email at {email}</p>
                      <p className="text-sm text-gray-600 mt-1">Your report is on its way (check spam if needed)</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* HERO VALUE SECTION - Enhanced readability with distinct sections */}
                <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-xl">
                  {/* Header Section */}
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-full px-4 py-2 mb-4">
                      <span className="text-sm font-semibold">✨ Your Personalized Results</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                      {formData.selectedYears && formData.selectedYears.length > 1 
                        ? `${formData.selectedYears.length}-Year Total: ${formatCurrency(results.totalBenefit || 0)}`
                        : `You Could Save ${formatCurrency(results.totalBenefit || 0)}`
                      }
                    </h2>

                    {/* Multi-Year Savings Badge */}
                    {formData.selectedYears && formData.selectedYears.length > 1 && results.multiYearDiscount > 0 && (
                      <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 rounded-full px-4 py-2 mb-4">
                        <span className="text-sm font-bold">
                          🎉 You saved {Math.round(results.multiYearDiscount * 100)}% with multi-year filing!
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Enhanced Value Breakdown with Distinct Colors */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 text-center">
                      <div className="text-3xl font-bold mb-2">{formatCurrency(results.federal.creditAmount || 0)}</div>
                      <div className="text-blue-100 font-medium">Federal Credit</div>
                      {formData.selectedYears && formData.selectedYears.length > 1 && (
                        <div className="text-xs text-blue-200 mt-1">{formData.selectedYears.length} years</div>
                      )}
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 text-center">
                      <div className="text-3xl font-bold mb-2">{formatCurrency(results.section174ABenefit || 0)}</div>
                      <div className="text-green-100 font-medium">Section 174A</div>
                      {formData.selectedYears && formData.selectedYears.length > 1 && (
                        <div className="text-xs text-green-200 mt-1">Tax deduction</div>
                      )}
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 text-center">
                      <div className="text-3xl font-bold mb-2">{formatCurrency(results.state || 0)}</div>
                      <div className="text-purple-100 font-medium">State Credit</div>
                      {formData.stateCredit && (
                        <div className="text-xs text-purple-200 mt-1">Current year only</div>
                      )}
                    </div>
                  </div>

                  {/* Multi-Year Summary */}
                  {formData.selectedYears && formData.selectedYears.length > 1 && (
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">Filing Summary</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="text-center">
                          <div className="text-gray-600 text-sm mb-1">Years Selected</div>
                          <div className="text-xl font-bold text-gray-900">{formData.selectedYears ? formData.selectedYears.join(', ') : '2024'}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-gray-600 text-sm mb-1">Per Year Average</div>
                          <div className="text-xl font-bold text-gray-900">{formatCurrency((results.totalBenefit || 0) / (formData.selectedYears?.length || 1))}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Urgency Banner */}
                  <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-center gap-2 text-sm font-semibold">
                      <Clock className="w-5 h-5" />
                      <span>Limited Time: File amended returns by July 2026 for maximum benefit</span>
                    </div>
                  </div>
                </div>

                {/* PRIMARY CTA SECTION - Single focused action */}
                <div className="bg-white border-2 border-green-200 rounded-2xl p-6 shadow-lg">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Get Your Complete R&D Credit Package
                    </h3>
                    <p className="text-gray-600">
                      All forms, documentation, and filing instructions ready in 5 minutes
                    </p>
                  </div>

                  {/* Package Options - Clear Pricing */}
                  <div className="space-y-4 mb-6">
                    {/* Federal Package */}
                    <div className="border-2 border-green-300 rounded-lg p-4 bg-green-50">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <h4 className="font-bold text-green-900">
                            {formData.selectedYears && formData.selectedYears.length > 1 
                              ? `${formData.selectedYears.length}-Year Federal Package`
                              : 'Federal R&D Credit Package'
                            }
                          </h4>
                          <p className="text-sm text-green-700">
                            IRS Form 6765 + documentation + filing guide
                            {formData.selectedYears && formData.selectedYears.length > 1 && (
                              <span> • {formData.selectedYears.length} years of forms</span>
                            )}
                          </p>
                          {formData.selectedYears && formData.selectedYears.length > 1 && (
                            <div className="text-xs text-green-600 mt-1">
                              ✅ {Math.round(getMultiYearDiscount(formData.selectedYears.length) * 100)}% multi-year discount applied
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-700">
                            ${getTieredPricing(results.totalCredit, formData.selectedYears?.length || 1).toLocaleString()}
                          </div>
                          {formData.selectedYears && formData.selectedYears.length > 1 && (
                            <div className="text-sm text-green-600 line-through">
                              ${(getTieredPricing(results.totalCredit) * formData.selectedYears.length).toLocaleString()}
                            </div>
                          )}
                          {formData.selectedYears && formData.selectedYears.length > 1 && (
                            <div className="text-xs text-green-600 mt-1">
                              Save ${((getTieredPricing(results.totalCredit) * formData.selectedYears.length) - 
                                getTieredPricing(results.totalCredit, formData.selectedYears.length)).toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* State Add-On */}
                    <div className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      formData.stateCredit ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50'
                    }`}>
                      <label className="flex justify-between items-center cursor-pointer">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={formData.stateCredit}
                              onChange={(e) => updateFormData('stateCredit', e.target.checked)}
                              className="w-5 h-5 text-blue-600 rounded"
                            />
                            <div>
                              <h4 className="font-bold text-gray-900">Add State Credit Filing</h4>
                              <p className="text-sm text-gray-600">State forms + additional savings</p>
                            </div>
                          </div>
                          {formData.stateCredit && (
                            <div className="mt-3 ml-8">
                              <select
                                value={formData.selectedState}
                                onChange={(e) => updateFormData('selectedState', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              >
                                <option value="">Choose your state</option>
                                {statesWithCredit.map(state => (
                                  <option key={state.code} value={state.code}>
                                    {state.name} - {(state.rate * 100).toFixed(1)}% credit
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-xl font-bold text-blue-700">+${getStateAddonPricing(results.totalCredit)}</div>
                        </div>
                      </label>
                    </div>
                  </div>



                  {/* What's Included - Enhanced for Multi-Year */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h4 className="font-bold text-gray-900 mb-3 text-center">📦 Complete IRS-Ready Package</h4>
                    <div className="text-sm text-gray-700 text-center">
                      ✓ Form 6765 • ✓ Technical documentation • ✓ Filing instructions • ✓ 24-48hr delivery
                      {formData.selectedYears.length > 1 && (
                        <span> • ✓ {formData.selectedYears.length} years of forms</span>
                      )}
                      {formData.stateCredit && formData.selectedState && (
                        <span> • ✓ State credit forms</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Total & CTA */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xl font-bold text-gray-900">Total Investment:</span>
                      <span className="text-3xl font-bold text-green-600">
                        ${((getTieredPricing(results.totalCredit, formData.selectedYears?.length || 1) + 
                            ((formData.stateCredit && formData.selectedState) ? getStateAddonPricing(results.totalCredit) : 0))
                          ).toLocaleString()}
                      </span>
                    </div>
                    
                    {/* ROI Display - Enhanced for multi-year */}
                    <div className="bg-green-50 rounded-xl p-4 mb-4 text-center border border-green-200">
                      <p className="text-lg font-bold text-green-800 mb-1">
                        {Math.round(results.totalBenefit / 
                          (getTieredPricing(results.totalCredit, formData.selectedYears?.length || 1) + 
                           ((formData.stateCredit && formData.selectedState) ? getStateAddonPricing(results.totalCredit) : 0))
                        )}x Return on Investment
                      </p>
                      <p className="text-sm text-green-700">
                        Your ${((getTieredPricing(results.totalCredit, formData.selectedYears?.length || 1) + 
                                 ((formData.stateCredit && formData.selectedState) ? getStateAddonPricing(results.totalCredit) : 0))
                               ).toLocaleString()} investment → {formatCurrency(results.totalBenefit)} in tax savings
                      </p>
                      {formData.selectedYears && formData.selectedYears.length > 1 && (
                        <p className="text-xs text-green-600 mt-1">
                          That's {formatCurrency(results.totalBenefit / formData.selectedYears.length)} per year average!
                        </p>
                      )}
                    </div>

                    {/* Multi-Year Selection Section - Always visible for upselling */}
                    <div className={`border-2 rounded-xl p-6 mb-6 ${
                      formData.selectedYears && formData.selectedYears.length === 1 
                        ? 'border-orange-200 bg-orange-50' 
                        : 'border-green-200 bg-green-50'
                    }`}>
                      <div className="text-center mb-4">
                        {formData.selectedYears && formData.selectedYears.length === 1 ? (
                          <>
                            <h3 className="text-xl font-bold text-orange-800 mb-2">🚀 Maximize Your Savings!</h3>
                            <p className="text-orange-700">File multiple years and save big with our multi-year discount</p>
                          </>
                        ) : (
                          <>
                            <h3 className="text-xl font-bold text-green-800 mb-2">📅 Multi-Year Filing Selected</h3>
                            <p className="text-green-700">Great choice! You're saving with our multi-year discount</p>
                          </>
                        )}
                      </div>
                      
                      <MultiYearSelector />
                      
                      {/* Dynamic pricing preview */}
                      <div className="mt-4 bg-white rounded-lg p-4 border border-gray-200">
                        <div className="text-center">
                          {formData.selectedYears && formData.selectedYears.length === 1 ? (
                            <>
                              <div className="text-lg font-bold text-green-600 mb-1">
                                Save up to 25% with multi-year filing
                              </div>
                              <div className="text-sm text-gray-600">
                                The more years you file, the bigger your discount
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="text-lg font-bold text-green-600 mb-1">
                                {Math.round(getMultiYearDiscount(formData.selectedYears?.length || 1) * 100)}% Multi-Year Discount Applied
                              </div>
                              <div className="text-sm text-gray-600">
                                You're saving ${((getTieredPricing(results.totalCredit) * (formData.selectedYears?.length || 1)) - 
                                  getTieredPricing(results.totalCredit, formData.selectedYears?.length || 1)).toLocaleString()} 
                                vs individual year pricing
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        const basePrice = getTieredPricing(results.totalCredit, formData.selectedYears?.length || 1);
                        const stateAddon = (formData.stateCredit && formData.selectedState) ? getStateAddonPricing(results.totalCredit) : 0;
                        const totalPrice = basePrice + stateAddon;
                        
                        console.log('Proceeding to checkout with:', {
                          email,
                          results: results.details,
                          totalBenefit: results.totalBenefit,
                          basePrice,
                          stateAddon,
                          totalPrice,
                          state: formData.selectedState
                        });
                        window.location.href = '/checkout';
                      }}
                      className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-5 px-8 rounded-xl font-bold text-xl hover:from-green-700 hover:to-blue-700 transform hover:scale-[1.02] transition-all shadow-xl"
                    >
                      Get My Tax Credit Package →
                    </button>
                    
                    {/* Condensed Trust Elements */}
                    <div className="mt-4 text-center space-y-2">
                      <p className="text-sm font-medium text-gray-700">⚡ Instant delivery • 2,847+ successful claims • 100% IRS compliant</p>
                      <div className="flex justify-center items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Lock className="w-3 h-3" />
                          Secure checkout
                        </span>
                        <span className="flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          Money-back guarantee
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* TIME SAVINGS & COMPETITIVE ADVANTAGE */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
                  <h4 className="font-bold text-gray-900 mb-4 text-center">⏰ Why Choose Our Service?</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h5 className="font-semibold text-green-800">Save Massive Time & Effort:</h5>
                      <ul className="text-sm text-gray-700 space-y-2">
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 mt-0.5">✓</span>
                          <span><strong>Complete in 1-2 hours</strong> vs. 40+ hours doing it yourself</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 mt-0.5">✓</span>
                          <span><strong>Delivered in 24-48 hours</strong> vs. weeks with traditional firms</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-green-600 mt-0.5">✓</span>
                          <span><strong>No research required</strong> — we handle all IRS complexity</span>
                        </li>
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <h5 className="font-semibold text-blue-800">Industry Cost Comparison:</h5>
                      <div className="bg-white rounded-lg p-4 text-sm space-y-2">
                        <div className="grid grid-cols-3 gap-2 text-xs font-semibold text-gray-600 border-b pb-1">
                          <span>Provider</span>
                          <span>Typical Fee</span>
                          <span>Your Cost</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <span>Specialist Firms</span>
                          <span className="text-red-600">15-35%</span>
                          <span className="font-bold text-red-600">${Math.round(results.totalBenefit * 0.25).toLocaleString()}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <span>General CPAs</span>
                          <span className="text-red-600">10-20%</span>
                          <span className="font-bold text-red-600">${Math.round(results.totalBenefit * 0.15).toLocaleString()}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs border-t pt-1">
                          <span className="font-bold">Our Flat Fee</span>
                          <span className="font-bold text-green-600">Fixed</span>
                          <span className="font-bold text-green-600">${getTieredPricing(results.totalCredit, formData.selectedYears?.length || 1).toLocaleString()}</span>
                        </div>
                        <div className="bg-green-100 p-2 rounded text-center mt-2">
                          <span className="font-bold text-green-800">You save: ${(Math.round(results.totalBenefit * 0.15) - getTieredPricing(results.totalCredit, formData.selectedYears?.length || 1)).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* WHAT YOU'LL NEED TO CLAIM YOUR REFUND */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-bold text-blue-900 mb-3 text-center">📋 What You'll Need to Claim Your Credit</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <h5 className="font-semibold text-blue-800">Employee Records:</h5>
                      <ul className="text-blue-700 space-y-1">
                        <li>• Payroll records for R&D staff</li>
                        <li>• Time tracking logs</li>
                        <li>• Job descriptions showing R&D duties</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h5 className="font-semibold text-blue-800">Business Expenses:</h5>
                      <ul className="text-blue-700 space-y-1">
                        <li>• Cloud computing invoices</li>
                        <li>• Software subscription receipts</li>
                        <li>• Contractor agreements & payments</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h5 className="font-semibold text-blue-800">Project Documentation:</h5>
                      <ul className="text-blue-700 space-y-1">
                        <li>• Development timelines</li>
                        <li>• Technical specifications</li>
                        <li>• Testing & iteration records</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h5 className="font-semibold text-blue-800">Tax Documents:</h5>
                      <ul className="text-blue-700 space-y-1">
                        <li>• Previous tax returns</li>
                        <li>• Gross receipts statements</li>
                        <li>• Business formation documents</li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-blue-100 rounded-lg text-center">
                    <p className="text-sm text-blue-800 font-medium">
                      💡 Our package includes a detailed checklist and guidance for gathering these documents
                    </p>
                  </div>
                </div>

                {/* QUALIFICATION & SOCIAL PROOF - Condensed */}
                {getQualificationReasons().length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2 text-center">✅ Why You Qualify</h4>
                    <div className="text-sm text-blue-800 text-center">
                      {getQualificationReasons().slice(0, 3).join(' • ')}
                      {getQualificationReasons().length > 3 && ' + more'}
                    </div>
                  </div>
                )}







                {/* DETAILED BREAKDOWN OF YOUR REFUND */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="flex items-center justify-center w-full text-sm text-gray-600 hover:text-gray-800"
                  >
                    <span>Detailed breakdown of your refund</span>
                    <ChevronRight className={`w-4 h-4 ml-1 transition-transform ${showDetails ? 'rotate-90' : ''}`} />
                  </button>
                  
                  {showDetails && (
                    <div className="mt-4 space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Your Qualified R&D Expenses</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Employee Time ({Math.round((results.qres.wagePercent || 0) * 100)}%)</span>
                            <span>{formatCurrency(results.qres.wages || 0)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Contractors ({Math.round((results.qres.contractorPercent || 0) * 100)}% × 65%)</span>
                            <span>{formatCurrency(results.qres.contractors || 0)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Cloud & APIs</span>
                            <span>{formatCurrency(results.qres.cloud || 0)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>AI Tools & Software</span>
                            <span>{formatCurrency(results.qres.software || 0)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Other Supplies</span>
                            <span>{formatCurrency(results.qres.supplies || 0)}</span>
                          </div>
                          <div className="border-t pt-1 flex justify-between font-medium">
                            <span>Total Qualified R&D Expenses</span>
                            <span>{formatCurrency(results.qres.total || 0)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Federal R&D Credit Calculation</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>QRE × {((results.federal.rate || 0) * 100).toFixed(1)}% credit rate</span>
                            <span>{formatCurrency(results.federal.creditAmount || 0)}</span>
                          </div>
                          {results.federal.isStartupEligible && (
                            <div className="flex justify-between text-green-700">
                              <span>Can offset payroll tax (startup eligible)</span>
                              <span>Up to {formatCurrency(results.federal.payrollTaxOffset || 0)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {results.state > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">State Credit</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>{statesWithCredit.find(s => s.code === formData.selectedState)?.name} ({((statesWithCredit.find(s => s.code === formData.selectedState)?.rate || 0) * 100).toFixed(1)}%)</span>
                              <span>{formatCurrency(results.state || 0)}</span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <h4 className="font-medium mb-2">Section 174A Immediate Deduction</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>R&D expenses × 21% tax rate</span>
                            <span>{formatCurrency(results.section174ABenefit || 0)}</span>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
                            This deduction reduces your taxable income by {formatCurrency(results.qres.total || 0)}, 
                            saving approximately 21% in corporate taxes.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* COMPREHENSIVE LEGAL DISCLAIMERS */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
                  <p className="font-semibold mb-3">Important Legal Disclaimers:</p>
                  <ul className="list-disc list-inside space-y-2">
                    <li><strong>This is not tax advice</strong> — We provide document preparation services only. This service prepares forms and supporting documentation for you to file yourself or provide to your tax professional.</li>
                    <li><strong>Consult a tax professional</strong> — For complex tax situations, audit defense, or personalized tax advice, we strongly recommend consulting with a qualified CPA or tax attorney.</li>
                    <li><strong>Estimates only</strong> — All calculations are estimates based on simplified methodologies and information you provide. Actual credits may vary based on IRS review and additional documentation requirements.</li>
                    <li><strong>No liability</strong> — We disclaim all liability for errors, omissions, or any consequences arising from use of these estimates or prepared documents. Users assume full responsibility for the accuracy and completeness of information provided.</li>
                    <li><strong>IRS compliance</strong> — While our forms follow IRS guidelines, we cannot guarantee IRS acceptance or audit protection. Documentation and substantiation of all claimed activities is your responsibility.</li>
                    <li><strong>No refund guarantee</strong> — We cannot guarantee any specific tax credit amount or IRS acceptance. Our service prepares documentation based on provided information only.</li>
                  </ul>
                  <p className="mt-4 text-xs font-medium">
                    By purchasing this service, you acknowledge these limitations and agree to use the prepared documents at your own risk and discretion.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setCurrentStep(1);
                setResults(null);
                setEmail('');
                setEmailSubmitted(false);
                setShowFullResults(false);
                setQualificationChecks({
                  aiTools: false,
                  customGPTs: false,
                  prompts: false,
                  automation: false,
                  testing: false,
                  improvement: false
                });
                setFormData({
                  companyName: '',
                  taxYear: '2024',
                  startupYear: '',
                  grossReceipts: '',
                  industry: '',
                  w2Wages: '',
                  contractorCosts: '',
                  cloudCosts: '',
                  softwareLicenses: '',
                  supplies: '',
                  w2Percentage: '30',
                  contractorPercentage: '50',
                  stateCredit: false,
                  selectedState: '',
                  priorYearCredit: false,
                  priorYearAmount: ''
                });
              }}
              className="w-full text-center text-sm text-gray-500 hover:text-gray-700 underline mt-6"
            >
              Start over with a new calculation
            </button>
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
              <TrustBar />
              <ValueProps />
              
              {currentStep < 4 && <ProgressIndicator />}
              
              {/* Form Content Container with Better Spacing */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 md:p-10 border border-gray-100 shadow-lg mx-auto max-w-3xl">
                {renderStep()}
              </div>
            </div>
          </div>
          
          {/* Enhanced Footer with Better Spacing */}
          <div className="text-center mt-12 space-y-6">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl px-8 py-5 inline-flex flex-wrap items-center justify-center gap-8 text-sm text-gray-600 border border-white/50 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 text-green-600" />
                </div>
                <span className="font-medium">SSL Secured</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Lock className="w-4 h-4 text-blue-600" />
                </div>
                <span className="font-medium">GDPR Compliant</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-purple-600" />
                </div>
                <span className="font-medium">IRS Approved</span>
              </div>
            </div>
            
            <div className="text-sm text-gray-500 space-x-2">
              <span className="font-semibold text-blue-600">SMBTaxCredits.com</span>
              <span>·</span>
              <a href="#" className="hover:text-gray-700 transition-colors hover:underline">Terms</a>
              <span>·</span>
              <a href="#" className="hover:text-gray-700 transition-colors hover:underline">Privacy</a>
              <span>·</span>
              <a href="#" className="hover:text-gray-700 transition-colors hover:underline">Contact</a>
              <span>·</span>
              <span className="text-gray-400">© 2024 All rights reserved</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditCalculator;