import React, { useState, useEffect } from 'react';
import { Calculator, Info, DollarSign, Users, Package, AlertCircle, ChevronRight, ChevronLeft, Building, Shield, Lock, CheckCircle, Clock, TrendingUp, FileText, Share2, Zap } from 'lucide-react';

const CreditCalculator = () => {
  // State for calculator inputs
  const [formData, setFormData] = useState({
    // Basic info
    companyName: '',
    taxYear: '2024',
    startupYear: '',
    grossReceipts: '',
    industry: '',
    
    // QRE inputs (Qualified Research Expenses)
    w2Wages: '',
    contractorCosts: '',
    cloudCosts: '',
    softwareLicenses: '',
    supplies: '',
    
    // Percentage allocations (keeping original field names)
    w2Percentage: '30',
    contractorPercentage: '50',
    
    // Additional factors
    stateCredit: false,
    selectedState: '',
    priorYearCredit: false,
    priorYearAmount: ''
  });

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

        {/* Urgency Banner */}
        {isEndOfYear && (
          <div className="max-w-5xl mx-auto bg-gradient-to-r from-orange-100 to-red-100 border border-orange-300 rounded-2xl p-6 mx-4">
            <div className="flex items-center justify-center gap-3 text-orange-800">
              <div className="w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-700" />
              </div>
              <span className="text-lg font-bold">Tax Year Ending Soon!</span>
              <span className="text-base">Maximize your 2024 deductions before Dec 31st</span>
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

  // Calculate QREs with percentage allocations and safe parsing
  const calculateQREs = () => {
    // Safely parse all input values with defaults
    const wages = safeParseFloat(formData.w2Wages, 0);
    const contractors = safeParseFloat(formData.contractorCosts, 0);
    const cloud = safeParseFloat(formData.cloudCosts, 0);
    const software = safeParseFloat(formData.softwareLicenses, 0);
    const supplies = safeParseFloat(formData.supplies, 0);
    
    // Parse R&D time percentages using safe parsing
    const wagePercent = safeParsePercent(formData.w2Percentage, 30);
    const contractorPercent = safeParsePercent(formData.contractorPercentage, 50);

    // Apply percentage allocations for wages and contractors
    const qualifiedWages = wages * wagePercent;
    const qualifiedContractors = contractors * contractorPercent * 0.65; // 65% of allocated contractor costs per IRS rules
    const qualifiedCloud = cloud * 1.0;
    const qualifiedSoftware = software * 1.0;
    const qualifiedSupplies = supplies * 1.0;

    const totalQREs = qualifiedWages + qualifiedContractors + qualifiedCloud + qualifiedSoftware + qualifiedSupplies;

    return {
      wages: qualifiedWages,
      contractors: qualifiedContractors,
      cloud: qualifiedCloud,
      software: qualifiedSoftware,
      supplies: qualifiedSupplies,
      total: totalQREs,
      wagePercent: wagePercent,
      contractorPercent: contractorPercent
    };
  };

  // Calculate federal credit with safe parsing
  const calculateFederalCredit = (qres) => {
    const currentYear = parseInt(formData.taxYear) || 2024;
    const startYear = parseInt(formData.startupYear) || currentYear;
    const isStartup = currentYear - startYear <= 5;
    const grossReceipts = safeParseFloat(formData.grossReceipts, 0);

    const creditRate = 0.14;
    const baseAmount = 0;
    const creditable = Math.max(0, qres.total - baseAmount);
    let federalCredit = creditable * creditRate;

    let payrollTaxOffset = 0;
    if (isStartup && grossReceipts < 5000000) {
      payrollTaxOffset = Math.min(federalCredit, 500000);
    }

    const isSmallBusinessTaxpayer = grossReceipts < 31000000;
    let refundableCredit = 0;
    if (isSmallBusinessTaxpayer && currentYear >= 2025) {
      refundableCredit = Math.min(federalCredit * 0.5, 250000);
    }

    let section174ABenefit = 0;
    if (
      currentYear >= 2025 ||
      (currentYear >= 2022 && currentYear <= 2024 && isSmallBusinessTaxpayer)
    ) {
      section174ABenefit = qres.total * 0.21;
    }

    const regularCreditCap = grossReceipts * 0.75;
    federalCredit = Math.min(federalCredit, regularCreditCap);

    return {
      creditAmount: federalCredit,
      payrollTaxOffset: payrollTaxOffset,
      refundableCredit: refundableCredit,
      isStartupEligible: isStartup && grossReceipts < 5000000,
      isSmallBusinessTaxpayer: isSmallBusinessTaxpayer,
      effectiveRate: qres.total > 0 ? (federalCredit / qres.total) : 0,
      section174ABenefit: section174ABenefit
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

  // Perform calculation
  const performCalculation = () => {
    const qres = calculateQREs();
    const federal = calculateFederalCredit(qres);
    const state = calculateStateCredit(qres);
    
    const totalCredit = federal.creditAmount + state;
    const totalBenefit = totalCredit + (federal.section174ABenefit || 0);
    
    const retroactiveBenefit = calculateRetroactiveBenefit(qres);
    const multiYearProjection = calculateMultiYearProjection(qres, federal, state);
    
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
      details: generateDetailedBreakdown(qres, federal, state)
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-base font-semibold text-gray-800 mb-3">
                    Tax Year
                  </label>
                  <select
                    value={formData.taxYear}
                    onChange={(e) => updateFormData('taxYear', e.target.value)}
                    className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-3 focus:ring-blue-500/30 focus:border-blue-500 transition-all text-lg font-medium bg-white shadow-sm"
                  >
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                    <option value="2022">2022</option>
                  </select>
                </div>

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
                    max={formData.taxYear}
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
            <h2 className="text-2xl font-bold mb-6">Your AI & Technology Work</h2>
            <p className="text-gray-600 mb-2">
              Include all time and money spent on AI tools, custom GPTs, chatbots, automations, and process improvements
            </p>
            <p className="text-sm text-blue-700 font-medium mb-6 p-3 bg-blue-50 rounded-lg">
              💡 If you've tinkered with AI or built a workflow that saves time — you're probably eligible.
            </p>

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
                    value={formData.w2Wages}
                    onChange={(e) => updateFormData('w2Wages', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="50,000"
                  />
                </div>
                
                {formData.w2Wages && (
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
                        value={formData.w2Percentage}
                        onChange={(e) => updateFormData('w2Percentage', e.target.value)}
                        className="flex-1"
                      />
                      <div className="w-16 text-center">
                        <span className="text-sm font-medium">{formData.w2Percentage}%</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      = {formatCurrency(safeParseFloat(formData.w2Wages) * safeParsePercent(formData.w2Percentage, 30))} in qualified wages
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
                    value={formData.contractorCosts}
                    onChange={(e) => updateFormData('contractorCosts', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="20,000"
                  />
                </div>
                
                {formData.contractorCosts && (
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
                        value={formData.contractorPercentage}
                        onChange={(e) => updateFormData('contractorPercentage', e.target.value)}
                        className="flex-1"
                      />
                      <div className="w-16 text-center">
                        <span className="text-sm font-medium">{formData.contractorPercentage}%</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      = {formatCurrency(safeParseFloat(formData.contractorCosts) * safeParsePercent(formData.contractorPercentage, 50) * 0.65)} qualified (65% of allocated costs per IRS rules)
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
                    value={formData.cloudCosts}
                    onChange={(e) => updateFormData('cloudCosts', e.target.value)}
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
                    value={formData.softwareLicenses}
                    onChange={(e) => updateFormData('softwareLicenses', e.target.value)}
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
                    value={formData.supplies}
                    onChange={(e) => updateFormData('supplies', e.target.value)}
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

            {/* State Information Section - Below the buttons */}
            <div className="mt-8 bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">State R&D Credit Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Complex Portal States */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    States Requiring Specialized Filing
                  </h4>
                  <p className="text-sm text-orange-700 mb-3">
                    These states require online portal applications with complex procedures:
                  </p>
                  <div className="space-y-2">
                    {unsupportedStates.map(state => (
                      <div key={state.code} className="text-sm">
                        <span className="font-medium">{state.name}</span>
                        <p className="text-xs text-orange-600 ml-2">{state.reason}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 mt-3 italic">
                    Contact us for specialized assistance with these states.
                  </p>
                </div>

                {/* States Without Credits */}
                <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Info className="w-5 h-5" />
                    States Without R&D Credits
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    These states don't offer R&D tax credit programs:
                  </p>
                  <div className="grid grid-cols-2 gap-1">
                    {statesWithoutCredit.map(state => (
                      <div key={state} className="text-sm text-gray-600">
                        • {state}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-3 italic">
                    Federal credits still available in these states.
                  </p>
                </div>
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
                {/* Full Results - Shown After Email - OPTIMIZED ORDER */}
                
                {/* SECTION 1: VALUE - Show them the money first */}
                <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-lg p-6 text-white text-center">
                  <h3 className="text-xl font-bold mb-2">Your Calculated Tax Benefit</h3>
                  <p className="text-4xl font-bold">
                    {formatCurrency(results.totalBenefit || 0)}
                  </p>
                  <p className="text-sm opacity-90 mt-2">
                    Combined federal credits, state credits, and Section 174A deductions
                  </p>
                </div>

                {/* SECTION 2: URGENCY - Limited-time opportunity */}
                <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 rounded-lg p-5 shadow-lg">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">🔥</span>
                    <div className="w-full">
                      <h3 className="text-lg font-bold text-gray-900 mb-3">
                        Limited-Time Opportunity: New Law Supercharges R&D Credits
                      </h3>
                      
                      <div className="space-y-2 text-sm text-gray-800">
                        <div className="flex items-start gap-2">
                          <span className="text-orange-600 font-bold mt-0.5">▸</span>
                          <p>
                            <strong>Amend 2022–2024 returns</strong> through July 3, 2026 — claim credits you missed
                          </p>
                        </div>
                        
                        <div className="flex items-start gap-2">
                          <span className="text-orange-600 font-bold mt-0.5">▸</span>
                          <p>
                            <strong>100% immediate expensing of R&D costs</strong> — retroactive to 2022 for qualifying businesses
                          </p>
                        </div>
                        
                        <div className="flex items-start gap-2">
                          <span className="text-orange-600 font-bold mt-0.5">▸</span>
                          <p>
                            <strong>Expanded refundability</strong> for businesses under $31M in revenue — get cash back faster
                          </p>
                        </div>
                        
                        <div className="flex items-start gap-2">
                          <span className="text-orange-600 font-bold mt-0.5">▸</span>
                          <p>
                            <strong>Permanent 100% bonus depreciation</strong> for eligible assets — maximize your deductions
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                        <p className="text-sm font-bold text-red-900 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Act Fast: You must file amended returns by July 3, 2026 to unlock this one-time benefit.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 3: PRIMARY CTA - Strike while the iron is hot */}
                <div className="bg-gradient-to-b from-green-50 to-green-100 border-2 border-green-300 rounded-lg p-6">
                  {/* Main Headline */}
                  <div className="text-center mb-6">
                    <p className="text-sm text-gray-600 mb-2">Your estimated tax benefit:</p>
                    <p className="text-4xl font-bold text-green-700 mb-3">{formatCurrency(results.totalBenefit || 0)}</p>
                    <h3 className="text-xl font-bold text-gray-800">
                      Let's turn this into real money in your pocket
                    </h3>
                  </div>

                  {/* What's Included - Clear List */}
                  <div className="bg-white rounded-lg p-4 mb-6">
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="text-lg">📦</span>
                      Everything you need to claim your credit:
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-start gap-2">
                        <span className="text-green-600 mt-0.5">✓</span>
                        <div>
                          <span className="font-medium text-gray-800">IRS Form 6765</span>
                          <p className="text-xs text-gray-600">All sections completed & calculated</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-600 mt-0.5">✓</span>
                        <div>
                          <span className="font-medium text-gray-800">Technical Narrative</span>
                          <p className="text-xs text-gray-600">IRS-compliant documentation</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-600 mt-0.5">✓</span>
                        <div>
                          <span className="font-medium text-gray-800">Section 174A Deduction</span>
                          <p className="text-xs text-gray-600">Immediate expensing calculations</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-600 mt-0.5">✓</span>
                        <div>
                          <span className="font-medium text-gray-800">Compliance Memo</span>
                          <p className="text-xs text-gray-600">"How this was prepared" documentation</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-600 mt-0.5">✓</span>
                        <div>
                          <span className="font-medium text-gray-800">Recordkeeping Checklist</span>
                          <p className="text-xs text-gray-600">What to save for audit protection</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-600 mt-0.5">✓</span>
                        <div>
                          <span className="font-medium text-gray-800">Filing Instructions</span>
                          <p className="text-xs text-gray-600">Step-by-step guide to file yourself or hand to your CPA</p>
                        </div>
                      </div>
                      {formData.stateCredit && formData.selectedState && (
                        <div className="flex items-start gap-2">
                          <span className="text-green-600 mt-0.5">✓</span>
                          <div>
                            <span className="font-medium text-gray-800">State Forms</span>
                            <p className="text-xs text-gray-600">{statesWithCredit.find(s => s.code === formData.selectedState)?.name} credit forms</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Pricing - Clear and Simple */}
                  <div className="bg-white rounded-lg p-4 mb-6">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Your investment:</span>
                        <span className="font-semibold">${getTieredPricing(results.totalCredit).toLocaleString()}</span>
                      </div>
                      {formData.stateCredit && formData.selectedState && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">+ State paperwork</span>
                          <span className="font-medium">$250</span>
                        </div>
                      )}
                      <div className="border-t pt-2 flex justify-between items-center">
                        <span className="font-bold text-lg">Total Due Today</span>
                        <span className="font-bold text-2xl text-green-600">
                          ${((getTieredPricing(results.totalCredit) + ((formData.stateCredit && formData.selectedState) ? 250 : 0))).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    
                    {/* ROI Callout */}
                    <div className="mt-3 p-3 bg-green-50 rounded text-center">
                      <p className="text-sm text-green-800">
                        <strong>That's a {Math.round((results.totalBenefit / (getTieredPricing(results.totalCredit) + ((formData.stateCredit && formData.selectedState) ? 250 : 0))) * 100)}x return</strong> on your investment
                      </p>
                    </div>
                  </div>
                  
                  {/* Main CTA Button */}
                  <button
                    onClick={() => {
                      const basePrice = getTieredPricing(results.totalCredit);
                      const stateAddon = (formData.stateCredit && formData.selectedState) ? 250 : 0;
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
                    className="w-full bg-green-600 text-white py-4 px-8 rounded-lg font-bold text-lg hover:bg-green-700 transform hover:scale-105 transition-all shadow-lg"
                  >
                    Get My R&D Tax Credit Package →
                  </button>
                  
                  {/* Trust Elements */}
                  <div className="mt-4 space-y-2">
                    <p className="text-sm text-center text-gray-700 font-medium">
                      ⚡ Documents ready instantly after purchase
                    </p>
                    <p className="text-xs text-center text-gray-600">
                      Join 2,847+ businesses who've successfully claimed their credits
                    </p>
                    <div className="flex justify-center items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Secure checkout
                      </span>
                      <span className="flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        100% IRS compliant
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        No hidden fees
                      </span>
                    </div>
                    
                    {/* Service Disclaimer */}
                    <div className="mt-3 pt-3 border-t border-green-200">
                      <p className="text-xs text-center text-gray-600 italic">
                        This is a document preparation service, not tax advice. We prepare IRS-compliant forms and documentation 
                        for you to file yourself or provide to your tax professional.
                      </p>
                    </div>
                  </div>
                </div>



                {/* SECTION 4: CREDIBILITY - Build trust with breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                    <h3 className="text-sm font-medium text-green-600 mb-2">Total Tax Savings</h3>
                    <p className="text-3xl font-bold text-green-700">{formatCurrency(results.totalBenefit || 0)}</p>
                    <p className="text-xs text-green-600 mt-1">
                      Combined credits + deductions
                    </p>
                    {results.federal.isStartupEligible && (
                      <p className="text-xs text-green-700 font-medium mt-2 p-2 bg-green-100 rounded">
                        💰 Up to {formatCurrency(results.federal.payrollTaxOffset)} can be a cash refund!
                      </p>
                    )}
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                    <h3 className="text-sm font-medium text-blue-600 mb-2">R&D Tax Credits</h3>
                    <p className="text-2xl font-bold text-blue-700">{formatCurrency(results.totalCredit || 0)}</p>
                    <div className="text-xs text-blue-600 mt-1 space-y-1">
                      <div>Federal: {formatCurrency(results.federal.creditAmount || 0)}</div>
                      {results.state > 0 && <div>State: {formatCurrency(results.state || 0)}</div>}
                    </div>
                    <p className="text-xs text-blue-500 mt-2">
                      Direct reduction of taxes owed
                    </p>
                  </div>
                  
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 text-center">
                    <h3 className="text-sm font-medium text-purple-600 mb-2">
                      Instant Write-Off
                      <InfoTooltip text="This is a tax deduction that reduces your taxable income — saving you 21% in corporate taxes. It's not a refundable credit, but still real money saved!" />
                    </h3>
                    <p className="text-2xl font-bold text-purple-700">{formatCurrency(results.section174ABenefit || 0)}</p>
                    <p className="text-xs text-purple-600 mt-1">Tax deduction value</p>
                    <p className="text-xs text-purple-500 mt-1">
                      (Reduces taxable income by {formatCurrency(results.qres.total || 0)})
                    </p>
                    {parseInt(formData.taxYear) < 2025 && !results.federal.isSmallBusinessTaxpayer && (
                      <p className="text-xs text-purple-600 mt-1">Available 2025+ for all businesses</p>
                    )}
                    {parseInt(formData.taxYear) >= 2022 && parseInt(formData.taxYear) <= 2024 && results.federal.isSmallBusinessTaxpayer && (
                      <p className="text-xs text-purple-600 mt-1 font-medium">Retroactive for small businesses!</p>
                    )}
                  </div>
                </div>

                {/* SECTION 5: QUALIFICATION - Why they qualify */}
                {getQualificationReasons().length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">✅ Why You Likely Qualify</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      {getQualificationReasons().map(reason => (
                        <li key={reason}>• {reason}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* SECTION 6: SOCIAL PROOF - High value indicator */}
                {results.totalBenefit > 50000 && (
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-lg p-4 flex items-start gap-3">
                    <span className="text-2xl">🌟</span>
                    <div>
                      <p className="font-bold text-gray-900">You're above average!</p>
                      <p className="text-sm text-gray-700">
                        Most small businesses claim $20K–$40K. Your work really qualifies.
                      </p>
                    </div>
                  </div>
                )}

                {/* SECTION 7: ADDITIONAL VALUE - Future opportunities */}
                {(results.retroactiveBenefit > 0 || results.multiYearProjection > results.totalBenefit) && (
                  <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-lg p-6 text-white">
                    <h3 className="text-xl font-bold mb-3">💰 Your Total Savings Opportunity</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-sm opacity-90 mb-1">This Year</p>
                        <p className="text-2xl font-bold">{formatCurrency(results.totalBenefit || 0)}</p>
                      </div>
                      {results.retroactiveBenefit > 0 && (
                        <div className="text-center">
                          <p className="text-sm opacity-90 mb-1">Past Years Recovery</p>
                          <p className="text-2xl font-bold">+{formatCurrency(results.retroactiveBenefit || 0)}</p>
                        </div>
                      )}
                      <div className="text-center">
                        <p className="text-sm opacity-90 mb-1">Next 3 Years</p>
                        <p className="text-2xl font-bold">{formatCurrency(results.multiYearProjection || 0)}</p>
                      </div>
                    </div>
                  </div>
                )}

                <LookbackUpsell />

                {/* SECTION 8: RISK MITIGATION - Address concerns */}
                <RiskMitigation />

                {/* SECTION 9: SUPPORTING INFO - Detailed breakdown (collapsed by default) */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="flex items-center justify-between w-full text-left"
                  >
                    <h3 className="text-lg font-semibold">Detailed Breakdown</h3>
                    <ChevronRight className={`w-5 h-5 transition-transform ${showDetails ? 'rotate-90' : ''}`} />
                  </button>
                  
                  {showDetails && (
                    <div className="mt-4 space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Your AI & Tech R&D Expenses</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Employee Time ({Math.round(results.qres.wagePercent * 100)}%)</span>
                            <span>{formatCurrency(results.qres.wages)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Contractors ({Math.round(results.qres.contractorPercent * 100)}% × 65%)</span>
                            <span>{formatCurrency(results.qres.contractors)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Cloud & APIs</span>
                            <span>{formatCurrency(results.qres.cloud)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>AI Tools & Software</span>
                            <span>{formatCurrency(results.qres.software)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Other Supplies</span>
                            <span>{formatCurrency(results.qres.supplies)}</span>
                          </div>
                          <div className="flex justify-between font-semibold pt-2 border-t">
                            <span>Total Qualified R&D</span>
                            <span>{formatCurrency(results.qres.total)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* SECTION 10: SHARE OPTIONS - Secondary actions */}
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => {
                      const shareData = {
                        company: formData.companyName,
                        totalBenefit: results.totalBenefit,
                        breakdown: results.details
                      };
                      navigator.clipboard.writeText(JSON.stringify(shareData, null, 2));
                      alert('Report data copied! You can now share with your CPA.');
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700 underline flex items-center gap-1"
                  >
                    <Share2 className="w-4 h-4" />
                    Share Report with Your CPA
                  </button>
                  
                  <button
                    onClick={() => {
                      const summary = `R&D Tax Credit Summary
Company: ${formData.companyName}
Tax Year: ${formData.taxYear}
Total Tax Benefit: ${formatCurrency(results.totalBenefit)}
- Federal Credit: ${formatCurrency(results.federal.creditAmount)}
- State Credit: ${formatCurrency(results.state)}
- Section 174A Deduction: ${formatCurrency(results.section174ABenefit)}
Total Qualified R&D Expenses: ${formatCurrency(results.qres.total)}`;
                      navigator.clipboard.writeText(summary);
                      alert('Summary copied to clipboard!');
                    }}
                    className="text-sm text-gray-600 hover:text-gray-700 underline flex items-center gap-1"
                  >
                    <FileText className="w-3 h-3" />
                    📋 Copy Summary
                  </button>
                </div>
              </>
            )}

            {/* SECTION 11: DISCLAIMERS - Keep at bottom for compliance */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
                  <p className="font-semibold mb-1">Important Disclaimers:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li><strong>This is not tax advice</strong> — we prepare forms for you to file or provide to your tax professional</li>
                    <li>These are estimates based on simplified calculations</li>
                    <li>Building custom GPTs and prompt engineering qualify as R&D when properly documented</li>
                    <li>Documentation is required to substantiate all activities</li>
                    <li>Consider consulting a tax professional for complex situations</li>
                  </ul>
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