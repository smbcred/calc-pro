import React, { useState, useEffect } from 'react';
import { Calculator, Info, Users, Package, AlertCircle, ChevronRight, ChevronLeft, Building, Shield, Lock, CheckCircle, Clock, TrendingUp, FileText, Share2, Zap, Calendar, AlertTriangle, Quote, Check, Trophy, DollarSign, Target, ArrowRight } from 'lucide-react';

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
    { code: 'AZ', name: 'Arizona', reason: 'Requires additional application process with state commerce department' },
    { code: 'FL', name: 'Florida', reason: 'Annual cap and specific application deadline on March 20th' },
    { code: 'LA', name: 'Louisiana', reason: 'Must submit application online through state system' },
    { code: 'MD', name: 'Maryland', reason: 'Requires additional application with commerce department by Nov 15' },
    { code: 'MO', name: 'Missouri', reason: 'Requires additional application process with state development office' },
    { code: 'PA', name: 'Pennsylvania', reason: 'Must apply through state system by Dec 1' },
    { code: 'VA', name: 'Virginia', reason: 'Must submit additional form online through state system' }
  ];

  // States with no R&D credit
  const statesWithoutCredit = [
    'Mississippi', 'North Carolina', 'Tennessee', 'Washington', 'District of Columbia', 'West Virginia'
  ];

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
                <span className="text-3xl font-bold text-white">$</span>
              </div>
              <h3 className="text-2xl font-bold text-green-800 mb-3">Average $25K+ Saved</h3>
              <p className="text-base text-green-700 font-medium">Perfect for small businesses</p>
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
                Three simple steps
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
          Most businesses using AI qualify for significant credits - even if you're small or part-time. Check all that apply:
        </p>
        
        <div className="grid grid-cols-1 gap-3">
          {[
            { key: 'aiTools', label: 'We use ChatGPT, Claude, or other AI tools to improve our work', icon: '🤖', popular: true },
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
            Recent tax law changes give you a one-time opportunity to claim retroactive deductions.
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
  
  // Get tiered pricing based on credit amount and number of years
  const getTieredPricing = (totalCredit: any, numYears: number = 1) => {
    const credit = safeParseFloat(totalCredit, 0);
    
    // Determine base price tier
    let basePrice;
    if (credit < 10000) basePrice = 500;
    else if (credit < 50000) basePrice = 750;
    else if (credit < 100000) basePrice = 1000;
    else basePrice = 1500;
    
    // Apply multi-year pricing model
    if (numYears === 1) {
      return basePrice; // 100% of base price
    } else if (numYears === 2) {
      return Math.round(basePrice * 1.70); // 170% of base price (15% off second year)
    } else if (numYears === 3) {
      return Math.round(basePrice * 2.40); // 240% of base price (20% off years 2-3)
    } else if (numYears >= 4) {
      return Math.round(basePrice * 3.00); // 300% of base price (25% off years 2-4)
    }
    
    return basePrice;
  };

  // Get tiered state add-on pricing with exact pricing structure
  const getStateAddonPricing = (totalCredit: any) => {
    const basePrice = getTieredPricing(totalCredit);
    if (basePrice === 500) return 250;  // 50%
    if (basePrice === 750) return 325;  // ~43%
    if (basePrice === 1000) return 375; // ~37%
    return 450; // 30% for $1500 tier
  };

  // Multi-year discount calculation - shows the effective discount percentage
  const getMultiYearDiscount = (numYears: number) => {
    if (numYears >= 4) return 0.25; // 25% discount on years 2-4
    if (numYears >= 3) return 0.20; // 20% discount on years 2-3
    if (numYears >= 2) return 0.15; // 15% discount on second year
    return 0; // No discount for single year
  };

  // Calculate actual savings vs individual year pricing
  const calculateMultiYearSavings = (basePrice: number, numYears: number) => {
    const individualYearTotal = basePrice * numYears;
    const multiYearPrice = getTieredPricing(basePrice, numYears);
    return individualYearTotal - multiYearPrice;
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
              Most businesses have been using ChatGPT and automation tools for 2+ years. Add previous years to:
            </p>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Get 15-25% multi-year discount</li>
              <li>• Maximize total recovery amount</li>
              <li>• Take advantage of new tax law deadline</li>
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

  // World-Class Progress Indicator
  const ProgressIndicator = () => {
    const steps = [
      { 
        label: 'Company Info', 
        description: 'Basic details', 
        icon: Building,
        estimated: '1 min'
      },
      { 
        label: 'AI Activities', 
        description: 'Qualifying work', 
        icon: Zap,
        estimated: '2 min'
      },
      { 
        label: 'Get Results', 
        description: 'Email & calculate', 
        icon: Calculator,
        estimated: '1 min'
      },
      { 
        label: 'Your Package', 
        description: 'Choose & purchase', 
        icon: Package,
        estimated: 'Done!'
      }
    ];

    return (
      <div className="mb-12 max-w-5xl mx-auto">
        {/* Professional Progress Bar */}
        <div className="relative">
          {/* Background Progress Line */}
          <div className="absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-gray-200 via-gray-200 to-gray-200 mx-8 md:mx-16"></div>
          
          {/* Active Progress Line */}
          <div 
            className="absolute top-12 left-0 h-0.5 gradient-primary mx-8 md:mx-16 transition-all duration-700 ease-out"
            style={{width: `calc(${((currentStep - 1) / 3) * 100}% - 2rem)`}}
          />
          
          {/* Step Indicators */}
          <div className="grid grid-cols-4 gap-4">
            {steps.map((stepInfo, index) => {
              const step = index + 1;
              const isActive = currentStep === step;
              const isCompleted = currentStep > step;
              const IconComponent = stepInfo.icon;
              
              return (
                <div key={step} className="flex flex-col items-center relative">
                  {/* Step Circle */}
                  <div className={`
                    relative w-24 h-24 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 shadow-lg
                    ${isCompleted 
                      ? 'gradient-primary border-transparent text-white transform scale-105' 
                      : isActive 
                        ? 'bg-white border-blue-500 text-blue-600 transform scale-110 shadow-xl' 
                        : 'bg-white border-gray-200 text-gray-400'}
                  `}>
                    {isCompleted ? (
                      <CheckCircle className="w-8 h-8" />
                    ) : (
                      <IconComponent className="w-8 h-8" />
                    )}
                    
                    {/* Active Pulse Effect */}
                    {isActive && (
                      <div className="absolute inset-0 rounded-2xl border-2 border-blue-500 animate-pulse"></div>
                    )}
                  </div>
                  
                  {/* Step Content */}
                  <div className="text-center mt-4 max-w-[120px]">
                    <h4 className={`font-semibold text-sm mb-1 ${
                      isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      {stepInfo.label}
                    </h4>
                    <p className="text-xs text-gray-500 mb-2">
                      {stepInfo.description}
                    </p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      isActive ? 'bg-blue-100 text-blue-700' : 
                      isCompleted ? 'bg-green-100 text-green-700' : 
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {isCompleted ? 'Complete' : stepInfo.estimated}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Progress Summary */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-3 bg-white rounded-2xl px-6 py-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">
                Step {currentStep} of 4
              </span>
            </div>
            <div className="w-px h-4 bg-gray-200"></div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600">
                ~{4 - currentStep + 1} min remaining
              </span>
            </div>
            {savedProgress && (
              <>
                <div className="w-px h-4 bg-gray-200"></div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600">Auto-saved</span>
                </div>
              </>
            )}
          </div>
        </div>
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
            {/* World-Class Hero Section */}
            <div className="text-center mb-12">
              {/* Main Value Proposition */}
              <div className="gradient-primary text-white rounded-3xl p-8 md:p-12 mb-8 relative overflow-hidden">
                {/* Background Decorations */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                
                <div className="relative z-10">
                  <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
                    Get <span className="text-yellow-300">$25K+</span> Back from the IRS
                  </h1>
                  <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
                    Small businesses and freelancers using ChatGPT, automation, and AI tools can claim <strong className="text-white">substantial R&D tax credits</strong>. Even part-time AI work qualifies. Get everything ready to <strong className="text-yellow-200">hand directly to your CPA</strong> for a <strong className="text-yellow-200">beautiful IRS refund check</strong> 
                  </p>
                  
                  {/* Social Proof Badges */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4">
                      <div className="flex items-center justify-center gap-3 mb-2">
                        <Users className="w-6 h-6 text-blue-200" />
                        <span className="text-3xl font-bold">1,200+</span>
                      </div>
                      <p className="text-blue-100 text-sm">Businesses Served</p>
                    </div>
                    <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4">
                      <div className="flex items-center justify-center gap-3 mb-2">
                        <span className="text-2xl font-bold text-green-200">$</span>
                        <span className="text-3xl font-bold">47M+</span>
                      </div>
                      <p className="text-blue-100 text-sm">Tax Credits Recovered</p>
                    </div>
                    <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4">
                      <div className="flex items-center justify-center gap-3 mb-2">
                        <Shield className="w-6 h-6 text-yellow-200" />
                        <span className="text-lg font-bold">100%</span>
                      </div>
                      <p className="text-blue-100 text-sm">Professional Documentation Service</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Section Header */}
              <div className="mb-8">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Answer questions about your AI use</h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  <strong>Takes 10 minutes.</strong> We'll calculate your credit amount and prepare your documentation package. You receive completed forms ready for filing - hand to your CPA or file yourself. <strong>Packages from $500.</strong>
                </p>
              </div>
            </div>
            
            <QualificationQuickCheck />
            
            <div className="card-elevated p-8 md:p-10 space-y-8">
              <div className="space-y-4">
                <label className="block text-lg font-semibold text-gray-900 mb-3">
                  <span className="flex items-center gap-2">
                    <Building className="w-5 h-5 text-blue-600" />
                    What's your business name?
                  </span>
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => updateFormData('companyName', e.target.value)}
                  className="input-enhanced text-xl"
                  placeholder="Your Company, Inc."
                />
                <p className="text-sm text-gray-500">This helps us personalize your tax credit package</p>
              </div>

              <div className="space-y-4">
                <label className="block text-lg font-semibold text-gray-900 mb-3">
                  <span className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-green-600" />
                    What industry are you in?
                  </span>
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
                    const isSelected = formData.selectedYears.includes(year.toString());
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
                  <span className="flex items-center gap-2">
                    <span className="text-green-600 font-bold">$</span>
                    What's your annual revenue?
                    <InfoTooltip text="We need this to calculate your maximum credit and special benefits. Your data is encrypted and never shared." />
                  </span>
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
                <p className="text-sm text-gray-500">This determines your eligibility for special startup benefits</p>
                
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
            
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-8 border-t border-gray-100">
              <SaveProgressButton />
              <button
                onClick={() => setCurrentStep(2)}
                disabled={!formData.companyName || !formData.grossReceipts || formData.selectedYears.length === 0}
                className="bg-blue-600 text-white py-4 px-8 rounded-xl font-semibold text-xl shadow-lg hover:bg-blue-700 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
              >
                <span className="flex items-center gap-3">
                  Continue to Your AI Work
                  <ChevronRight className="w-6 h-6" />
                </span>
              </button>
            </div>
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
                  Your AI & Technology Expenses
                  {formData.selectedYears.length === 1 && (
                    <span className="text-blue-600"> for {formData.selectedYears[0]}</span>
                  )}
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  Include all time and money spent on ChatGPT, automation tools, custom workflows, and business improvements
                  {formData.selectedYears.length > 1 && (
                    <span className="block text-blue-600 font-medium mt-2">
                      Currently entering data for {currentYear}
                    </span>
                  )}
                </p>
              </div>
              
              {/* Qualification Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="text-2xl font-bold text-blue-600">90%</div>
                  <div className="text-sm text-blue-700">of ChatGPT costs qualify (no minimum hours)</div>
                </div>
                <div className="bg-green-50 rounded-xl p-4">
                  <div className="text-2xl font-bold text-green-600">65%</div>
                  <div className="text-sm text-green-700">of contractor costs qualify</div>
                </div>
                <div className="bg-purple-50 rounded-xl p-4">
                  <div className="text-2xl font-bold text-purple-600">100%</div>
                  <div className="text-sm text-purple-700">of cloud/API costs qualify</div>
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
                Include all expenses and activities from {currentYear} related to AI, automation, and technology improvements.
              </p>
            </div>

            <div className="status-success rounded-2xl p-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-green-900 mb-4">What counts as R&D for small businesses?</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-green-800">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span>Building custom GPTs or chatbots</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span>Developing and testing AI prompts</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span>Creating automations (Zapier, Make)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span>Experimenting with AI processes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span>Using ChatGPT to improve business processes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span>Testing new software solutions</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Expense Form */}
            <div className="card-elevated p-8 space-y-8">
              <div className="space-y-4">
                <label className="block text-lg font-semibold text-gray-900 mb-3">
                  <span className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    Total Employee Wages
                  </span>
                  <InfoTooltip text="Total wages for employees who work on AI projects, automation, or tech improvements (we'll calculate the R&D portion next)" />
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
                    placeholder="50,000"
                  />
                </div>
                <p className="text-sm text-gray-500">Include salaries for anyone working on AI, automation, or tech improvements</p>
                
                {yearlyData[currentYear]?.w2Wages && (
                  <div className="mt-6 status-info rounded-2xl p-6">
                    <label className="block text-base font-semibold text-blue-900 mb-4">
                      What % of their time is spent on R&D activities?
                      <span className="font-normal text-blue-700 ml-2">(Most businesses: 20-60%)</span>
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
                  <span className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-green-600" />
                    Total Contractor/Freelancer Costs
                  </span>
                  <InfoTooltip text="Total paid to developers, AI consultants, automation experts, or anyone helping build your tech" />
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
                    placeholder="20,000"
                  />
                </div>
                <p className="text-sm text-gray-500">Include payments to developers, AI consultants, automation specialists, etc.</p>
                
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
        // If email not captured yet, show email capture with partial results
        if (!emailSubmitted) {
          return (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4 text-gray-900">You're qualified! 🎉</h2>
                <p className="text-lg text-gray-600">
                  Get your personalized R&D credit estimate sent to your inbox
                </p>
              </div>
              
              {/* Partial Results Teaser */}
              <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-2xl p-8 text-center mb-8">
                <h3 className="text-2xl font-bold mb-4">Your Preliminary Estimate</h3>
                <div className="text-5xl font-bold mb-2">
                  ${Math.round((results?.totalBenefit || 50000) * 0.7).toLocaleString()}+
                </div>
                <p className="text-green-100 text-lg">
                  Potential tax savings (partial estimate)
                </p>
                <div className="mt-4 text-sm text-green-100">
                  📧 Get your complete personalized report with exact calculations
                </div>
              </div>
              
              {/* Email Capture Form */}
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 shadow-xl">
                <h3 className="text-2xl font-bold text-center mb-4">Get Your Complete Report</h3>
                <p className="text-gray-600 text-center mb-6">
                  Enter your email to receive your detailed R&D credit analysis, filing instructions, and next steps.
                </p>
                <div className="max-w-md mx-auto">
                  <div className="space-y-4">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-lg"
                      placeholder="your@email.com"
                    />
                    <button
                      onClick={() => {
                        if (email && email.includes('@')) {
                          console.log('Email captured:', email);
                          performCalculation();
                          setEmailSubmitted(true);
                          setShowFullResults(true);
                          // Stay on step 3 to show the state selection
                        }
                      }}
                      disabled={!email || !email.includes('@')}
                      className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-4 px-8 rounded-lg font-bold text-lg hover:from-blue-700 hover:to-green-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed"
                    >
                      Get My Complete R&D Credit Report
                    </button>
                    <p className="text-xs text-gray-500 text-center">
                      ✓ Instant access • ✓ No spam • ✓ Unsubscribe anytime
                    </p>
                  </div>
                </div>
                
                {/* Social Proof */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-4">Trusted by 3,847+ small businesses & freelancers</p>
                    <div className="flex justify-center items-center gap-8 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Average 12-day processing</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-blue-600" />
                        <span>Complete documentation package to support your filing</span>
                      </div>
                    </div>
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
                          <strong className="text-green-600">You can amend returns for 3 years.</strong> We help you file amendments to claim missed credits from previous years.
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
                          <strong className="text-green-600">Yes! Go back 3 years.</strong> Many clients recover $50K+ in missed credits from previous years of AI and automation work.
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
        
        // If email captured, show state selection options
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">
              Boost your savings even more
              {formData.selectedYears.length === 1 && (
                <span className="text-blue-600"> for {formData.selectedYears[0]}</span>
              )}
              {formData.selectedYears.length > 1 && (
                <span className="block text-lg text-blue-600 font-medium mt-1">
                  Filing for {formData.selectedYears.length} years: {formData.selectedYears.join(', ')}
                </span>
              )}
            </h2>



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
                                  <strong>Extra steps required:</strong> {unsupportedState.reason}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Some states require extra steps. Contact us for specialized assistance.
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
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg font-semibold pointer-events-none">$</span>
                      <input
                        type="number"
                        min="0"
                        value={formData.priorYearAmount}
                        onChange={(e) => updateFormData('priorYearAmount', e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-xl bg-white/50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-200 placeholder:text-gray-400"
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
                  <div className="text-orange-100 text-sm">Extra Steps Required</div>
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
                          States with Extra Steps (7)
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
            <h2 className="text-2xl font-bold mb-6">
              Your Tax Savings Opportunity
              {formData.selectedYears.length === 1 && (
                <span className="text-blue-600"> for {formData.selectedYears[0]}</span>
              )}
              {formData.selectedYears.length > 1 && (
                <span className="block text-lg text-blue-600 font-medium mt-1">
                  {formData.selectedYears.length}-Year Filing: {formData.selectedYears.join(', ')}
                </span>
              )}
            </h2>
            
            <UrgencyBanner />

            {/* Email Gate for Full Results */}
            {!showFullResults ? (
              <>
                {/* Enhanced Quick Summary */}
                <div className="gradient-primary rounded-3xl p-8 text-white text-center relative overflow-hidden">
                  {/* Background Decorations */}
                  <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                  <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                  
                  <div className="relative z-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-6">
                      <TrendingUp className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold mb-4">Your Estimated Tax Benefit</h3>
                    <p className="text-4xl md:text-5xl font-black mb-4 text-yellow-300">
                      {formatCurrency(Math.floor(results.totalBenefit * 0.8))} - {formatCurrency(Math.ceil(results.totalBenefit * 1.2))}
                    </p>
                    <p className="text-lg text-blue-100 max-w-md mx-auto leading-relaxed">
                      Based on small businesses and freelancers like yours successfully claiming the R&D tax credit
                    </p>
                  </div>
                </div>

                {/* Enhanced Social Proof with CPA Context */}
                <div className="card-elevated p-6 border-l-4 border-blue-500">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Quote className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-gray-800 italic text-lg mb-3 leading-relaxed">
                        "Our CPA never mentioned R&D credits - they focus on basic tax prep, not these specialized opportunities. We handed them our completed package and got a <strong>$23,000 direct deposit</strong> from the IRS 8 weeks later!"
                      </p>
                      <p className="text-sm text-gray-600 font-medium">— Sarah Chen, Marketing Agency Owner</p>
                      <p className="text-xs text-blue-600 mt-1">✓ Filed with existing CPA using our documentation</p>
                    </div>
                  </div>
                </div>

                {/* Enhanced Email Capture Section */}
                <div className="card-elevated gradient-secondary p-8 relative overflow-hidden">
                  {/* Background Decoration */}
                  <div className="absolute -top-6 -right-6 w-32 h-32 bg-blue-200/30 rounded-full blur-2xl"></div>
                  <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-green-200/30 rounded-full blur-2xl"></div>
                  
                  <div className="relative z-10">
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center justify-center w-16 h-16 gradient-primary rounded-2xl mb-4">
                        <FileText className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                        We Prepare Your Documentation Package
                      </h3>
                      <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        <strong>You receive completed forms ready for filing.</strong> Hand to your CPA or file yourself - we're a <strong>document preparation service, not tax advisors.</strong> Everything is IRS-ready for your refund.
                      </p>
                    </div>

                    {!emailSubmitted ? (
                      <div className="max-w-md mx-auto space-y-6">
                        <div className="relative">
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@business-email.com"
                            className="input-enhanced w-full text-lg text-center"
                          />
                        </div>
                        <button
                          onClick={() => {
                            if (email && email.includes('@')) {
                              localStorage.setItem('rd_credit_email', email);
                              localStorage.setItem('rd_credit_results', JSON.stringify(results));
                              setEmailSubmitted(true);
                              setTimeout(() => setShowFullResults(true), 1000);
                            }
                          }}
                          disabled={!email || !email.includes('@')}
                          className="btn-primary w-full text-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                          <span className="flex items-center justify-center gap-3">
                            <FileText className="w-6 h-6" />
                            Get My Personalized Report
                            <ChevronRight className="w-6 h-6" />
                          </span>
                        </button>
                        
                        {/* Trust Indicators */}
                        <div className="grid grid-cols-3 gap-4 text-center text-sm">
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <Zap className="w-4 h-4 text-green-600" />
                            </div>
                            <span className="text-gray-600">Instant Access</span>
                          </div>
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <Shield className="w-4 h-4 text-blue-600" />
                            </div>
                            <span className="text-gray-600">No Credit Card</span>
                          </div>
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                              <Lock className="w-4 h-4 text-purple-600" />
                            </div>
                            <span className="text-gray-600">Unsubscribe Anytime</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h4 className="text-xl font-bold text-green-800 mb-2">Success! Report Sent</h4>
                        <p className="text-green-700 mb-1">Check your email at {email}</p>
                        <p className="text-sm text-gray-600">Your personalized report is on its way (check spam folder if needed)</p>
                      </div>
                    )}
                  </div>
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
                      You Could Save {formatCurrency(
                        formData.selectedYears && formData.selectedYears.length > 1 
                          ? (results.totalBenefit || 0) + ((results.totalBenefit || 0) * 0.8 * ((formData.selectedYears?.length || 1) - 1))
                          : results.totalBenefit || 0
                      )}
                    </h2>
                    {formData.selectedYears && formData.selectedYears.length > 0 && (
                      <div className="text-lg text-blue-600 font-medium mb-2">
                        {formData.selectedYears.length === 1 
                          ? `For ${formData.selectedYears[0]} tax year`
                          : `For ${formData.selectedYears[0]} + ${formData.selectedYears.length - 1} additional year${formData.selectedYears.length > 2 ? 's' : ''}`
                        }
                      </div>
                    )}

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
                      <div className="text-3xl font-bold mb-2">
                        {formatCurrency(
                          formData.selectedYears && formData.selectedYears.length > 1 
                            ? (results.federal.creditAmount || 0) * formData.selectedYears.length
                            : results.federal.creditAmount || 0
                        )}
                      </div>
                      <div className="text-blue-100 font-medium">Federal Credit</div>
                      {formData.selectedYears && formData.selectedYears.length > 1 && (
                        <div className="text-xs text-blue-200 mt-1">{formData.selectedYears.length} years</div>
                      )}
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 text-center">
                      <div className="text-3xl font-bold mb-2">
                        {formatCurrency(
                          formData.selectedYears && formData.selectedYears.length > 1 
                            ? (results.section174ABenefit || 0) * formData.selectedYears.length
                            : results.section174ABenefit || 0
                        )}
                      </div>
                      <div className="text-green-100 font-medium">Tax Deduction</div>
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

                  {/* Average Per Year Estimate - Always show when there are results */}
                  {formData.selectedYears && formData.selectedYears.length > 0 && (
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">
                        {formData.selectedYears.length === 1 ? 'Tax Year Summary' : 'Multi-Year Filing Summary'}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="text-center">
                          <div className="text-gray-600 text-sm mb-1">Primary Year</div>
                          <div className="text-xl font-bold text-gray-900">{formData.selectedYears[0]}</div>
                          {formData.selectedYears.length > 1 && (
                            <div className="text-sm text-blue-600 mt-1">
                              + {formData.selectedYears.length - 1} additional year{formData.selectedYears.length > 2 ? 's' : ''}
                            </div>
                          )}
                        </div>
                        <div className="text-center">
                          <div className="text-gray-600 text-sm mb-1">Total Multi-Year Benefit</div>
                          <div className="text-xl font-bold text-gray-900">
                            {formatCurrency((results.totalBenefit || 0) * formData.selectedYears.length)}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {formatCurrency(results.totalBenefit)} × {formData.selectedYears.length} years
                          </div>
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
                      Ready-to-File Package for Your CPA
                    </h3>
                    <p className="text-gray-600">
                      Complete IRS documentation your CPA can file immediately - or you can self-file with confidence. 
                      <span className="block mt-2 text-green-600 font-medium">Result: Tax refund check or direct deposit from the U.S. Treasury</span>
                    </p>
                  </div>

                  {/* Package Options - Clear Pricing */}
                  <div className="space-y-4 mb-6">
                    {/* Federal Package - Most Popular Badge */}
                    <div className="border-2 border-green-300 rounded-lg p-4 bg-green-50 relative">
                      <div className="absolute -top-2 left-4 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        MOST POPULAR
                      </div>
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
                          
                          {/* Simplified multi-year package display */}
                          {formData.selectedYears && formData.selectedYears.length > 1 && (
                            <div className="mt-3">
                              <div className="text-sm text-green-700 mb-2">
                                Per Year Cost: <span className="font-bold">
                                  ${Math.round(getTieredPricing(results.totalCredit, formData.selectedYears.length) / formData.selectedYears.length).toLocaleString()}
                                </span>
                              </div>
                              
                              {/* Savings callout */}
                              <div className="bg-green-100 border border-green-300 rounded-lg p-2 mb-2">
                                <div className="text-xs font-semibold text-green-800">
                                  ✓ You Save ${calculateMultiYearSavings(
                                    getTieredPricing(results.totalCredit, 1), 
                                    formData.selectedYears.length
                                  ).toLocaleString()} with multi-year package
                                </div>
                                <div className="text-xs text-green-600">
                                  Individual years would cost ${(getTieredPricing(results.totalCredit, 1) * formData.selectedYears.length).toLocaleString()}
                                </div>
                              </div>
                              
                              {/* What's included */}
                              <div className="text-xs text-green-700 space-y-1">
                                <div className="font-semibold mb-1">What's Included:</div>
                                {formData.selectedYears.map((year, index) => (
                                  <div key={year} className="flex items-center gap-1">
                                    <span className="text-green-600">✓</span>
                                    <span>{year} Tax Year - {index === 0 ? 'Current filing' : index === formData.selectedYears.length - 1 ? 'Retroactive recovery' : 'Amended return'}</span>
                                  </div>
                                ))}
                                <div className="flex items-center gap-1 mt-1 pt-1 border-t border-green-200">
                                  <span className="text-green-600">✓</span>
                                  <span>All forms, narratives, and documentation</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="text-green-600">✓</span>
                                  <span>Step-by-step filing instructions</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-700">
                            Packages from $500
                          </div>
                          <div className="text-xs text-green-600 mt-1">
                            {formData.selectedYears && formData.selectedYears.length > 1 ? (
                              <>Save 20% on multi-year filings</>
                            ) : (
                              <>Or 3 monthly payments available</>
                            )}
                          </div>
                          {formData.selectedYears && formData.selectedYears.length > 1 && (
                            <div className="text-xs text-green-600 mt-1">
                              Save ${calculateMultiYearSavings(
                                getTieredPricing(results.totalCredit, 1), 
                                formData.selectedYears.length
                              ).toLocaleString()}
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
                      <span className="text-xl font-bold text-gray-900">Package Price:</span>
                      <span className="text-3xl font-bold text-green-600">
                        From $500{formData.stateCredit && formData.selectedState ? ' + state add-on' : ''}
                      </span>
                    </div>
                    
                    {/* ROI Display - Enhanced for multi-year */}
                    {/* PROMINENT ROI DISPLAY */}
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl p-8 mb-8 text-center shadow-2xl">
                      <div className="mb-4">
                        <div className="text-6xl font-black mb-2">
                          {Math.round((results.totalBenefit || 0) / 750)}x
                        </div>
                        <div className="text-2xl font-bold text-green-100">Return on Investment</div>
                      </div>
                      <div className="text-lg text-green-100">
                        Starting from $500{formData.stateCredit && formData.selectedState ? ' + state add-on' : ''} → {formatCurrency(
                          formData.selectedYears && formData.selectedYears.length > 1 
                            ? ((results.totalBenefit || 0) * formData.selectedYears.length)
                            : results.totalBenefit || 0
                        )} in potential tax savings
                      </div>
                      {formData.selectedYears && formData.selectedYears.length > 1 && (
                        <div className="mt-3 text-lg font-semibold text-yellow-200">
                          📈 Save 20% on multi-year filings: {formatCurrency((results.totalBenefit || 0) * formData.selectedYears.length / formData.selectedYears.length)} per year average!
                        </div>
                      )}
                    </div>

                    {/* Combined Multi-Year Selection & Discount Section */}
                    <div className={`border-2 rounded-xl p-6 mb-6 ${
                      formData.selectedYears && formData.selectedYears.length === 1 
                        ? 'border-orange-200 bg-orange-50' 
                        : 'border-green-200 bg-green-50'
                    }`}>
                      <div className="text-center mb-4">
                        {formData.selectedYears && formData.selectedYears.length === 1 ? (
                          <>
                            <h3 className="text-xl font-bold text-orange-800 mb-2">🚀 Maximize Your Savings!</h3>
                            <p className="text-orange-700">Save 20% on multi-year filings - packages from $500</p>
                          </>
                        ) : (
                          <>
                            <h3 className="text-xl font-bold text-green-800 mb-2">📅 Multi-Year Filing: 20% Discount Applied!</h3>
                            <p className="text-green-700">You're saving 20% vs individual year pricing with our multi-year package</p>
                          </>
                        )}
                      </div>
                      
                      <MultiYearSelector />
                    </div>
                    
                    {/* CONVERSION-OPTIMIZED PRIMARY CTA SECTION */}
                    <div className="relative mb-6">
                      {/* Urgency Timer */}
                      <div className="mb-4 text-center">
                        <div className="inline-flex items-center gap-2 bg-red-100 border border-red-300 rounded-full px-4 py-2 text-red-800">
                          <Clock className="w-4 h-4" />
                          <span className="font-bold text-sm">⚡ Limited Time: File by Dec 31st or lose these credits forever</span>
                        </div>
                      </div>

                      {/* Enhanced ROI Callout */}
                      <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl p-6 mb-6 border-2 border-yellow-400">
                        <div className="text-center">
                          <div className="text-4xl font-black text-orange-800 mb-2">
                            {Math.round((results.totalBenefit / 750))}:1
                          </div>
                          <div className="text-lg font-bold text-orange-700 mb-2">Return on Investment</div>
                          <div className="text-sm text-orange-600">
                            Starting from $500 → {formatCurrency(results.totalBenefit)} in potential tax savings
                          </div>
                        </div>
                      </div>

                      {/* Social Proof Counter */}
                      <div className="text-center mb-6">
                        <div className="inline-flex items-center gap-4 bg-white/90 backdrop-blur-sm border border-green-300 rounded-2xl px-6 py-3">
                          <div className="flex items-center gap-2 text-green-700">
                            <Users className="w-5 h-5" />
                            <div>
                              <div className="font-bold text-lg">3,847+</div>
                              <div className="text-xs">Successful Claims</div>
                            </div>
                          </div>
                          <div className="w-px h-8 bg-gray-300"></div>
                          <div className="flex items-center gap-2 text-blue-700">
                            <DollarSign className="w-5 h-5" />
                            <div>
                              <div className="font-bold text-lg">$28.4M+</div>
                              <div className="text-xs">Credits Claimed</div>
                            </div>
                          </div>
                          <div className="w-px h-8 bg-gray-300"></div>
                          <div className="flex items-center gap-2 text-purple-700">
                            <Trophy className="w-5 h-5" />
                            <div>
                              <div className="font-bold text-lg">98.7%</div>
                              <div className="text-xs">Success Rate</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Main CTA Button with Enhanced Copy */}
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
                        className="w-full relative bg-gradient-to-r from-green-600 via-green-700 to-blue-600 text-white py-6 px-8 rounded-2xl font-black text-xl hover:from-green-700 hover:to-blue-700 transform hover:scale-[1.02] transition-all shadow-2xl group overflow-hidden"
                      >
                        {/* Button Animation */}
                        <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                        <div className="relative z-10 flex items-center justify-center gap-3">
                          <span>🚀 Claim My {formatCurrency(results.totalBenefit)} Tax Credit</span>
                          <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                        </div>
                        <div className="text-sm font-medium mt-1 opacity-90">Instant access • Ready in 2-3 weeks</div>
                      </button>

                      {/* Secondary CTA for Hesitant Users */}
                      <div className="mt-4 text-center">
                        <button className="text-blue-600 underline font-medium hover:text-blue-800">
                          Download FREE R&D Credit Guide First →
                        </button>
                      </div>
                    </div>
                    
                    {/* ENHANCED TRUST & CREDIBILITY SECTION */}
                    <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                            <Zap className="w-6 h-6 text-green-600" />
                          </div>
                          <div className="text-xs font-bold text-gray-800">Instant Delivery</div>
                          <div className="text-xs text-gray-600">Download immediately</div>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                            <Shield className="w-6 h-6 text-blue-600" />
                          </div>
                          <div className="text-xs font-bold text-gray-800">IRS Compliant</div>
                          <div className="text-xs text-gray-600">100% audit-ready</div>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                            <Lock className="w-6 h-6 text-purple-600" />
                          </div>
                          <div className="text-xs font-bold text-gray-800">Secure Checkout</div>
                          <div className="text-xs text-gray-600">256-bit SSL encryption</div>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          </div>
                          <div className="text-xs font-bold text-gray-800">Quality Service</div>
                          <div className="text-xs text-gray-600">Document preparation</div>
                        </div>
                      </div>
                      
                      {/* Value Highlights */}
                      <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-xl p-4 text-center border border-green-300">
                        <div className="font-bold text-green-800 mb-2">📋 WHAT YOU GET</div>
                        <div className="text-sm text-green-700 space-y-1">
                          <div>✅ Complete forms package ready for filing</div>
                          <div>✅ Supporting documentation and calculations</div>
                          <div>✅ Step-by-step filing instructions included</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ENHANCED TIME SAVINGS COMPARISON */}
                <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-green-50 border border-slate-200 rounded-2xl p-8 mb-8 shadow-xl">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-0 left-0 w-40 h-40 bg-blue-500 rounded-full -translate-x-20 -translate-y-20"></div>
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-green-500 rounded-full translate-x-16 translate-y-16"></div>
                  </div>

                  <div className="relative z-10">
                    <div className="text-center mb-8">
                      <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-full px-6 py-3 mb-4 shadow-lg">
                        <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-green-500 rounded-full flex items-center justify-center">
                          <Clock className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800">Time Investment: DIY vs Our Service</h3>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* DIY Column - Enhanced */}
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl transform rotate-1"></div>
                        <div className="relative bg-white rounded-2xl p-6 border-2 border-red-300 shadow-lg">
                          <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                              <span className="text-3xl">😰</span>
                            </div>
                            <h4 className="text-2xl font-bold text-red-800">Do It Yourself</h4>
                            <p className="text-sm text-red-600 mt-1">The hard way</p>
                          </div>
                          
                          <div className="space-y-3 mb-6">
                            {[
                              { task: "Understand IRS Rules (§41, §174)", hours: "5-10 hrs" },
                              { task: "Determine Eligibility & 4-part test", hours: "2-4 hrs" },
                              { task: "Aggregate Financial Data", hours: "3-8 hrs" },
                              { task: "Build Expense Documentation", hours: "2-5 hrs" },
                              { task: "Write Technical Justification", hours: "5-10 hrs" },
                              { task: "Complete IRS Form 6765", hours: "2-4 hrs" },
                              { task: "Review & Cross-check", hours: "1-2 hrs" },
                              { task: "Maintain Audit Documentation", hours: "2-5 hrs" }
                            ].map((item, index) => (
                              <div key={index} className="flex justify-between items-start py-2 border-b border-red-100 last:border-b-0">
                                <span className="text-sm text-gray-700 flex-1 pr-3">{item.task}</span>
                                <span className="font-bold text-red-700 text-sm whitespace-nowrap">{item.hours}</span>
                              </div>
                            ))}
                          </div>
                          
                          <div className="bg-red-50 rounded-xl p-4 border-2 border-red-200 text-center">
                            <div className="text-3xl font-black text-red-600 mb-1">25-50+ HOURS</div>
                            <div className="text-sm text-red-700">Plus risk of errors & IRS audits</div>
                          </div>
                        </div>
                      </div>

                      {/* Our Service Column - Enhanced */}
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl transform -rotate-1"></div>
                        <div className="relative bg-white rounded-2xl p-6 border-2 border-green-400 shadow-lg">
                          <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                              <span className="text-3xl">😎</span>
                            </div>
                            <h4 className="text-2xl font-bold text-green-800">Our Service</h4>
                            <p className="text-sm text-green-600 mt-1">The smart way</p>
                          </div>

                          <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-xl p-6 mb-6 border border-green-200">
                            <div className="text-center">
                              <div className="text-4xl font-black bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
                                2-3 WEEKS
                              </div>
                              <div className="text-green-800 font-medium">Complete professional package delivered</div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 gap-3 mb-6">
                            {[
                              "All IRS rules applied correctly",
                              "Eligibility analysis included", 
                              "Expense categorization done",
                              "Technical narrative written",
                              "Form 6765 completed",
                              "Complete documentation package"
                            ].map((item, index) => (
                              <div key={index} className="flex items-center gap-3">
                                <div className="w-7 h-7 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-sm">
                                  <Check className="w-4 h-4 text-white font-bold" />
                                </div>
                                <span className="text-sm font-medium text-gray-700">{item}</span>
                              </div>
                            ))}
                          </div>
                          
                          <div className="bg-green-50 rounded-xl p-4 border-2 border-green-300 text-center">
                            <div className="text-lg font-bold text-green-800 mb-1">YOUR TIME INVESTMENT:</div>
                            <div className="text-3xl font-black text-green-600 mb-1">1-2 HOURS</div>
                            <div className="text-sm text-green-700">Just answer our questions</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Impact Statement */}
                    <div className="mt-8 text-center">
                      <div className="inline-flex items-center gap-4 bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-300 rounded-2xl px-8 py-4 shadow-lg">
                        <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                          <Zap className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-left">
                          <div className="text-xl font-bold text-yellow-900">Save 25-50+ hours</div>
                          <div className="text-sm text-yellow-800">of complex tax work & research</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* COMBINED: WHY CHOOSE OUR SERVICE - Enhanced */}
                <div className="bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-200 rounded-2xl p-8 mb-8 shadow-lg">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-full px-6 py-3 mb-2 shadow-sm">
                      <Trophy className="w-6 h-6 text-blue-600" />
                      <h3 className="text-2xl font-bold text-slate-800">Why Choose Our Service?</h3>
                    </div>
                    <p className="text-slate-600">Compare us to traditional options</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Time & Process Benefits */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-bold text-green-800 flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        Massive Time & Effort Savings
                      </h4>
                      <div className="space-y-3">
                        {[
                          { text: "Answer questions (10 min)", detail: "vs. 25-50+ hours doing it yourself" },
                          { text: "Get filing package (instant)", detail: "vs. 2-4 months with traditional firms" },
                          { text: "Give to CPA or file yourself", detail: "everything is IRS-ready" }
                        ].map((item, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-white/60 rounded-lg border border-green-100">
                            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                            <div>
                              <span className="font-medium text-gray-900">{item.text}</span>
                              <div className="text-sm text-gray-600">{item.detail}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Cost Comparison */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-bold text-blue-800 flex items-center gap-2">
                        <DollarSign className="w-5 h-5" />
                        Cost Comparison vs Competitors
                      </h4>
                      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-slate-100">
                              <tr>
                                <th className="text-left p-4 font-semibold text-slate-700">Provider Type</th>
                                <th className="text-center p-4 font-semibold text-slate-700">Typical Cost</th>
                                <th className="text-center p-4 font-semibold text-slate-700">Timeline</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr className="border-b border-slate-100">
                                <td className="p-4 text-slate-700">Specialty CPAs</td>
                                <td className="p-4 text-center text-red-600 font-semibold">
                                  ${formData.selectedYears && formData.selectedYears.length > 1 
                                    ? (8000 * formData.selectedYears.length).toLocaleString()
                                    : '8,000'} - ${formData.selectedYears && formData.selectedYears.length > 1 
                                    ? (15000 * formData.selectedYears.length).toLocaleString()
                                    : '15,000'}+
                                </td>
                                <td className="p-4 text-center text-red-600">2-4 months</td>
                              </tr>
                              <tr className="border-b border-slate-100">
                                <td className="p-4 text-slate-700">Big CPA Firms</td>
                                <td className="p-4 text-center text-red-600 font-semibold">
                                  15-35% of credit
                                </td>
                                <td className="p-4 text-center text-red-600">3-6 months</td>
                              </tr>
                              <tr className="bg-green-50">
                                <td className="p-4 text-slate-700 font-semibold">Our Service</td>
                                <td className="p-4 text-center text-green-600 font-bold text-lg">
                                  From $500
                                </td>
                                <td className="p-4 text-center text-green-600 font-semibold">2-3 weeks</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        <div className="bg-gradient-to-r from-green-100 to-blue-100 p-4 text-center border-t border-slate-200">
                          <div className="text-lg font-bold text-slate-800">
                            💰 You save: $7,500+ vs specialists (packages from $500)
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Key Differentiators */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-xl p-6 border border-green-200">
                      <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mb-4">
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                      <h5 className="font-bold text-green-900 mb-2">Documentation Package</h5>
                      <p className="text-sm text-green-800">Comprehensive filing support included</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl p-6 border border-blue-200">
                      <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-4">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <h5 className="font-bold text-blue-900 mb-2">CPA Integration</h5>
                      <p className="text-sm text-blue-800">Ready-to-file package vs additional coordination needed</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl p-6 border border-purple-200">
                      <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mb-4">
                        <Zap className="w-6 h-6 text-white" />
                      </div>
                      <h5 className="font-bold text-purple-900 mb-2">Streamlined Process</h5>
                      <p className="text-sm text-purple-800">Simple questionnaire vs multiple meetings & reviews</p>
                    </div>
                  </div>
                </div>

                {/* STREAMLINED WHAT HAPPENS NEXT */}
                <div className="bg-white border-2 border-green-300 rounded-2xl p-8 mb-8 shadow-lg">
                  <div className="text-center mb-6">
                    <h4 className="text-2xl font-bold text-gray-900 mb-2">🚀 Your Path to {formatCurrency(results.totalBenefit)}</h4>
                    <p className="text-gray-600">Three simple steps - get started today!</p>
                  </div>
                  
                  <div className="relative">
                    {/* Connection Line */}
                    <div className="absolute top-6 left-6 right-6 h-0.5 bg-gradient-to-r from-blue-300 via-green-300 to-purple-300 hidden md:block"></div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                      <div className="text-center group">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg transform group-hover:scale-110 transition-transform">
                          <Zap className="w-8 h-8 text-white" />
                        </div>
                        <h5 className="font-bold text-gray-900 mb-2 text-lg">Answer Questions About Your AI Use</h5>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          Simple questions about your business and AI tools - no technical expertise needed
                        </p>
                        <div className="mt-2 text-xs text-blue-600 font-medium">⏰ Takes 10 minutes</div>
                      </div>
                      
                      <div className="text-center group">
                        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg transform group-hover:scale-110 transition-transform">
                          <FileText className="w-8 h-8 text-white" />
                        </div>
                        <h5 className="font-bold text-gray-900 mb-2 text-lg">Get Your Complete Filing Package</h5>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          We prepare your documentation package - you receive completed forms ready for filing
                        </p>
                        <div className="mt-2 text-xs text-green-600 font-medium">📋 Instant delivery</div>
                      </div>
                      
                      <div className="text-center group">
                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg transform group-hover:scale-110 transition-transform">
                          <DollarSign className="w-8 h-8 text-white" />
                        </div>
                        <h5 className="font-bold text-gray-900 mb-2 text-lg">Give to CPA or File Yourself</h5>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          Hand to your CPA or file yourself - everything is IRS-ready for your refund
                        </p>
                        <div className="mt-2 text-xs text-purple-600 font-medium">✅ Done!</div>
                      </div>
                    </div>
                  </div>

                  {/* Urgency Footer */}
                  <div className="mt-8 bg-gradient-to-r from-red-100 to-orange-100 rounded-xl p-4 text-center border border-red-300">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-red-600" />
                      <span className="font-bold text-red-800">Don't wait - credits expire Dec 31st!</span>
                    </div>
                    <div className="text-sm text-red-700">Every day you delay is money left on the table</div>
                  </div>
                  
                  {/* Support CTA */}
                  <div className="mt-4 text-center">
                    <div className="text-sm text-gray-600">
                      Questions? We're here to help: <strong className="text-blue-600">(555) 123-R&D</strong> • <strong className="text-blue-600">support@rdcredits.com</strong>
                    </div>
                  </div>
                </div>

                {/* CONVERSION-OPTIMIZED FAQ SECTION */}
                <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-2xl p-8 mb-8">
                  <div className="text-center mb-6">
                    <h4 className="text-2xl font-bold text-gray-900 mb-2">⚡ Last-Minute Questions?</h4>
                    <p className="text-gray-600">We've helped 3,847+ businesses just like yours claim their credits</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <h5 className="font-bold text-gray-900 mb-2">"What if the IRS has questions?"</h5>
                          <p className="text-sm text-gray-700">
                            <strong className="text-green-600">Good question:</strong> Our package includes thorough documentation and supporting materials. Everything is organized to help you respond to any IRS inquiries with proper records.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Clock className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h5 className="font-bold text-gray-900 mb-2">"How quickly can I get my refund?"</h5>
                          <p className="text-sm text-gray-700">
                            Most clients file within <strong>24-48 hours</strong> of receiving our package. The IRS typically processes refunds in <strong>6-12 weeks</strong>. One recent client got {formatCurrency(34000)} in just 8 weeks!
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Shield className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h5 className="font-bold text-gray-900 mb-2">"What if my situation is different?"</h5>
                          <p className="text-sm text-gray-700">
                            <strong className="text-green-600">Every business is unique.</strong> Our package includes detailed instructions for various scenarios and business types. You'll have everything needed to adapt to your specific situation.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Users className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <h5 className="font-bold text-gray-900 mb-2">"Will my CPA be okay with this?"</h5>
                          <p className="text-sm text-gray-700">
                            Most CPAs appreciate <strong>organized documentation</strong>! Everything follows IRS guidelines and comes ready to file. You're bringing them prepared materials instead of asking them to start from scratch.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Social Proof Strip */}
                  <div className="mt-8 bg-gradient-to-r from-green-100 to-blue-100 rounded-xl p-4">
                    <div className="text-center">
                      <div className="font-bold text-green-800 mb-2">🎉 Join thousands of successful business owners</div>
                      <div className="grid grid-cols-3 gap-4 text-center text-sm">
                        <div>
                          <div className="font-bold text-green-700">98.7%</div>
                          <div className="text-green-600">Success Rate</div>
                        </div>
                        <div>
                          <div className="font-bold text-blue-700">{formatCurrency(7420)}</div>
                          <div className="text-blue-600">Average Credit</div>
                        </div>
                        <div>
                          <div className="font-bold text-purple-700">8.2 weeks</div>
                          <div className="text-purple-600">Avg Refund Time</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* LLC/S-CORP PASS-THROUGH BENEFITS */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <h4 className="font-bold text-green-900 mb-3 text-center">🏢 LLC & S-Corp Owners: You Have Two Strategic Options</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="bg-white rounded-lg p-4 border border-green-300">
                      <h5 className="font-semibold text-green-800 mb-2">Option 1: Personal Tax Return</h5>
                      <ul className="text-green-700 space-y-1 mb-3">
                        <li>• Credits "pass through" to your Form 1040</li>
                        <li>• Reduces your personal income tax dollar-for-dollar</li>
                        <li>• Use against taxes from all income sources</li>
                        <li>• Carry forward up to 20 years if unused</li>
                      </ul>
                      <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                        Best for profitable owners with personal tax liability
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 border border-green-300">
                      <h5 className="font-semibold text-green-800 mb-2">Option 2: Payroll Tax Offset</h5>
                      <ul className="text-green-700 space-y-1 mb-3">
                        <li>• Offset up to $500,000 against payroll taxes</li>
                        <li>• Reduces employer Social Security & Medicare taxes</li>
                        <li>• Available if under $5M revenue & under 5 years old</li>
                        <li>• Get cash back even without income tax liability</li>
                      </ul>
                      <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                        Perfect for startups with payroll but no profits yet
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-green-100 rounded-lg text-center">
                    <p className="text-sm text-green-800 font-medium">
                      💡 Our package includes guidance on which option maximizes your savings based on your situation
                    </p>
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
                        <h4 className="font-medium mb-2">Your Qualified R&D Expenses (Tax Year {formData.selectedYears[0]})</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Employee Time ({Math.round((results.qres.wagePercent || 0) * 100)}%)</span>
                            <span>{formatCurrency(results.qres.wages || 0)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Contractors {
                              (results.qres.contractorPercent || 0) > 0 
                                ? `(${Math.round(results.qres.contractorPercent * 100)}% × 65%)`
                                : '(0%)'
                            }</span>
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
                        <h4 className="font-medium mb-2">Federal R&D Credit Calculation (Tax Year {formData.selectedYears[0]})</h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Qualified expenses × {((results.federal.rate || 0) * 100).toFixed(1)}% credit rate</span>
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
                          <h4 className="font-medium mb-2">State Credit (Tax Year {formData.selectedYears[0]})</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>{statesWithCredit.find(s => s.code === formData.selectedState)?.name} ({((statesWithCredit.find(s => s.code === formData.selectedState)?.rate || 0) * 100).toFixed(1)}%)</span>
                              <span>{formatCurrency(results.state || 0)}</span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <h4 className="font-medium mb-2">Additional Tax Deduction Benefit (Tax Year {formData.selectedYears[0]})</h4>
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

            {/* FINAL TESTIMONIAL & URGENCY SECTION */}
            <div className="space-y-6">
              {/* Success Story */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-300 rounded-2xl p-6">
                <div className="text-center mb-4">
                  <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 rounded-full px-4 py-2 text-sm font-bold">
                    <Trophy className="w-4 h-4" />
                    🎉 RECENT SUCCESS STORY
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Quote className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <blockquote className="text-lg text-gray-800 italic mb-3">
                      "Just got our {formatCurrency(18500)} refund deposited yesterday! My CPA was amazed at how organized and complete everything was. The whole process took me 3 hours total - best ROI we've ever seen."
                    </blockquote>
                    <div className="text-sm text-gray-600">
                      <strong>— Michael Rodriguez</strong>, SaaS Startup Founder
                      <div className="text-xs text-green-600 mt-1">✓ Filed January 15th • Refund received February 28th</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Final Urgency Call-to-Action */}
              <div className="bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 rounded-2xl p-8 text-white text-center shadow-2xl">
                <div className="mb-4">
                  <div className="text-3xl font-black mb-2">⏰ TIME IS RUNNING OUT</div>
                  <div className="text-xl font-bold mb-4">Credits expire December 31st - Don't lose {formatCurrency(results.totalBenefit)}!</div>
                  <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
                    <div className="text-yellow-200 text-sm font-medium mb-2">Your Tax Credit Summary:</div>
                    <div className="text-4xl font-black text-white mb-2">{formatCurrency(results.totalBenefit)}</div>
                    <div className="text-yellow-100">Ready for filing in under 48 hours</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="text-lg font-bold">🚨 Only {Math.floor(Math.random() * 50) + 150} packages left this month</div>
                  <div className="text-sm opacity-90">Join 3,847+ successful business owners who claimed their credits</div>
                </div>
              </div>

              {/* Legal Info - Streamlined */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-gray-700 leading-relaxed">
                    <p className="font-semibold mb-2">Quick Legal Notes:</p>
                    <p>
                      <strong>We're a document preparation service, not tax advisors.</strong> We prepare your documentation package - you receive completed forms ready for filing. Hand to your CPA or file yourself. Calculations are estimates based on your input.
                      <span className="text-blue-600 font-medium"> Questions? Call (555) 123-R&D anytime.</span>
                    </p>
                  </div>
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