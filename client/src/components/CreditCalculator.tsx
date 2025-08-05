import React, { useState, useEffect } from 'react';
import { Calculator, Info, DollarSign, Users, Package, AlertCircle, ChevronRight, ChevronLeft, Building, Shield, Lock, CheckCircle, Clock, TrendingUp, FileText, Share2 } from 'lucide-react';

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
  const [results, setResults] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [savedProgress, setSavedProgress] = useState(false);
  
  // Email capture state
  const [email, setEmail] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [showFullResults, setShowFullResults] = useState(false);

  // States that offer R&D tax credits
  const statesWithCredit = [
    { code: 'AZ', name: 'Arizona', rate: 0.24 },
    { code: 'CA', name: 'California', rate: 0.15 },
    { code: 'CO', name: 'Colorado', rate: 0.03 },
    { code: 'CT', name: 'Connecticut', rate: 0.06 },
    { code: 'IL', name: 'Illinois', rate: 0.065 },
    { code: 'IN', name: 'Indiana', rate: 0.15 },
    { code: 'MA', name: 'Massachusetts', rate: 0.15 },
    { code: 'MD', name: 'Maryland', rate: 0.10 },
    { code: 'NJ', name: 'New Jersey', rate: 0.10 },
    { code: 'NY', name: 'New York', rate: 0.05 },
    { code: 'PA', name: 'Pennsylvania', rate: 0.10 },
    { code: 'RI', name: 'Rhode Island', rate: 0.225 },
    { code: 'TX', name: 'Texas', rate: 0.05 },
    { code: 'UT', name: 'Utah', rate: 0.05 },
    { code: 'WA', name: 'Washington', rate: 0.015 }
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
  const safeParseFloat = (value, defaultValue = 0) => {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  };

  // Utility function to safely parse percentages (0-100 range)
  const safeParsePercent = (value, defaultValue = 0) => {
    const parsed = parseFloat(value);
    if (isNaN(parsed)) return defaultValue / 100;
    return Math.max(0, Math.min(100, parsed)) / 100;
  };

  // Trust Bar Component
  const TrustBar = () => (
    <div className="flex justify-center items-center gap-4 md:gap-6 py-3 border-b border-gray-100 mb-6 text-xs md:text-sm">
      <div className="flex items-center gap-2 text-gray-600">
        <Shield className="w-4 h-4 text-green-600" />
        <span className="hidden sm:inline">IRS Compliant</span>
        <span className="sm:hidden">IRS OK</span>
      </div>
      <div className="flex items-center gap-2 text-gray-600">
        <Lock className="w-4 h-4 text-blue-600" />
        <span className="hidden sm:inline">Bank-Level Security</span>
        <span className="sm:hidden">Secure</span>
      </div>
      <div className="flex items-center gap-2 text-gray-600">
        <CheckCircle className="w-4 h-4 text-purple-600" />
        <span>2,847 Credits</span>
      </div>
    </div>
  );

  // Value Props Component - NEW
  const ValueProps = () => (
    <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-6 text-xs md:text-sm">
      <div className="flex items-center gap-2 text-gray-700">
        <span className="text-lg">🧠</span>
        <span className="font-medium">Built for AI adopters</span>
      </div>
      <div className="flex items-center gap-2 text-gray-700">
        <span className="text-lg">💸</span>
        <span className="font-medium">Claim up to $500K in refunds</span>
      </div>
      <div className="flex items-center gap-2 text-gray-700">
        <span className="text-lg">🕒</span>
        <span className="font-medium">Takes 10 minutes — no tax knowledge needed</span>
      </div>
    </div>
  );

  // Branding Header Component
  const BrandingHeader = () => (
    <div className="text-center mb-6">
      <div className="inline-flex items-center gap-2 text-sm text-gray-600 mb-2">
        <Building className="w-4 h-4" />
        <span className="font-medium">SMBTaxCredits.com</span>
      </div>
      <h1 className="text-2xl md:text-3xl font-bold mb-2">
        Get money back for using AI to improve your business
      </h1>
      <p className="text-gray-600 text-sm md:text-base">
        The R&D tax credit calculator built specifically for small businesses using AI
      </p>
    </div>
  );

  // Industry-Specific Examples Component - expanded
  const IndustryExamples = ({ industry }) => {
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

  // Qualification Quick Check Component
  const QualificationQuickCheck = () => {
    const score = Object.values(qualificationChecks).filter(Boolean).length;
    
    return (
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 mb-6">
        <h3 className="font-medium text-gray-900 mb-3">
          Quick Check: Do any of these apply to you? (check all that apply)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {[
            { key: 'aiTools', label: 'We use ChatGPT, Claude, or other AI tools for work' },
            { key: 'customGPTs', label: 'We\'ve built custom GPTs or chatbots' },
            { key: 'prompts', label: 'We\'ve developed prompt templates or libraries' },
            { key: 'automation', label: 'We\'ve automated tasks with Zapier, Make, or code' },
            { key: 'testing', label: 'We test and improve our AI prompts or workflows' },
            { key: 'improvement', label: 'We\'ve made our processes 10%+ better with tech' }
          ].map(item => (
            <label key={item.key} className="flex items-start cursor-pointer">
              <input
                type="checkbox"
                checked={qualificationChecks[item.key]}
                onChange={(e) => setQualificationChecks({...qualificationChecks, [item.key]: e.target.checked})}
                className="w-4 h-4 text-green-600 rounded mt-0.5"
              />
              <span className="ml-2 text-sm">{item.label}</span>
            </label>
          ))}
        </div>
        {score > 0 && (
          <div className="mt-3 p-2 bg-green-100 rounded text-sm font-medium text-green-700">
            ✅ Great news! Based on {score} {score === 1 ? 'activity' : 'activities'}, you likely qualify for R&D tax credits!
          </div>
        )}
        {score === 0 && (
          <div className="mt-3 text-xs text-gray-600">
            Check the boxes that apply to see if you qualify
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
  const getTieredPricing = (totalCredit) => {
    const credit = safeParseFloat(totalCredit, 0);
    if (credit < 10000) return 500;
    if (credit < 50000) return 750;
    if (credit < 100000) return 1000;
    return 1500;
  };
  
  // Get qualification reasons for display
  const getQualificationReasons = () => {
    const reasons = [];
    const labels = {
      aiTools: 'Using AI tools like ChatGPT or Claude',
      customGPTs: 'Built custom GPTs or chatbots',
      prompts: 'Developed prompt templates or libraries',
      automation: 'Automated tasks with Zapier, Make, or code',
      testing: 'Testing and improving AI prompts or workflows',
      improvement: 'Made processes 10%+ better with technology'
    };
    
    Object.keys(qualificationChecks).forEach(key => {
      if (qualificationChecks[key] && labels[key]) {
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
  const formatCurrency = (amount) => {
    const safeAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(safeAmount);
  };

  // Info tooltip component with better positioning
  const InfoTooltip = ({ text }) => (
    <div className="group relative inline-block ml-1">
      <Info className="w-4 h-4 text-gray-400 cursor-help" />
      <div className="opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto absolute z-50 w-64 p-2 mt-1 text-sm text-white bg-gray-800 rounded-lg shadow-lg -left-28 transition-opacity duration-200">
        {text}
        <div className="absolute -top-1 left-32 w-2 h-2 bg-gray-800 transform rotate-45"></div>
      </div>
    </div>
  );

  // Progress indicator component
  const ProgressIndicator = () => (
    <div className="flex justify-between mb-8">
      {['Company Info', 'Your AI Work', 'Extra Credits', 'Your Results'].map((label, index) => {
        const step = index + 1;
        return (
          <div key={step} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center font-semibold mb-2
                ${currentStep >= step 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-500'}
              `}>
                {step}
              </div>
              <span className="text-xs text-gray-600 hidden sm:block text-center">{label}</span>
            </div>
            {step < 4 && (
              <div className={`
                flex-1 h-1 mx-2 mt-5
                ${currentStep > step ? 'bg-blue-600' : 'bg-gray-200'}
              `} />
            )}
          </div>
        );
      })}
    </div>
  );

  // Update handler
  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">Tell us about your business</h2>
            
            <p className="text-sm text-gray-600 -mt-4 mb-4">
              Even small businesses with no technical team can qualify.
            </p>
            
            <QualificationQuickCheck />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your business name
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => updateFormData('companyName', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Your Company, Inc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Industry Type
              </label>
              <select
                value={formData.industry}
                onChange={(e) => updateFormData('industry', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select your industry</option>
                {industries.map(ind => (
                  <option key={ind.value} value={ind.value}>{ind.label}</option>
                ))}
              </select>
              <IndustryExamples industry={formData.industry} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tax Year
                </label>
                <select
                  value={formData.taxYear}
                  onChange={(e) => updateFormData('taxYear', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year Business Started
                  <InfoTooltip text="When your business started — newer companies get extra benefits!" />
                </label>
                <input
                  type="number"
                  value={formData.startupYear}
                  onChange={(e) => updateFormData('startupYear', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="2020"
                  min="1900"
                  max={formData.taxYear}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Annual Revenue
                <InfoTooltip text="We need this to calculate your maximum credit and special benefits. Your data is encrypted and never shared." />
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  value={formData.grossReceipts}
                  onChange={(e) => updateFormData('grossReceipts', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="1000000"
                />
              </div>
            </div>

            <UrgencyBanner />
            <RiskMitigation />
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">Your R&D Expenses</h2>
            
            <p className="text-sm text-gray-600 -mt-4 mb-6">
              Enter your expenses below. We'll calculate the qualified portion based on how much time was spent on R&D activities.
            </p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  W-2 Employee Wages & Benefits
                  <InfoTooltip text="Total wages and benefits for W-2 employees. We'll apply the R&D percentage below." />
                </label>
                <div className="relative mb-3">
                  <DollarSign className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={formData.w2Wages}
                    onChange={(e) => updateFormData('w2Wages', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="150000"
                  />
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <label className="block text-sm font-medium text-blue-900 mb-2">
                    % of time spent on R&D activities: {formData.w2Percentage}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.w2Percentage}
                    onChange={(e) => updateFormData('w2Percentage', e.target.value)}
                    className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-blue-700 mt-1">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contractor & Consultant Costs
                  <InfoTooltip text="Payments to 1099 contractors and consultants. Only 65% of qualified contractor costs count per IRS rules." />
                </label>
                <div className="relative mb-3">
                  <DollarSign className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={formData.contractorCosts}
                    onChange={(e) => updateFormData('contractorCosts', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="50000"
                  />
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <label className="block text-sm font-medium text-green-900 mb-2">
                    % of contractor work for R&D: {formData.contractorPercentage}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.contractorPercentage}
                    onChange={(e) => updateFormData('contractorPercentage', e.target.value)}
                    className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-green-700 mt-1">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cloud Computing & AWS Costs
                  <InfoTooltip text="Cloud hosting, computing, and AI API costs (OpenAI, Claude, etc.) used for R&D activities." />
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={formData.cloudCosts}
                    onChange={(e) => updateFormData('cloudCosts', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="12000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Software Licenses & Tools
                  <InfoTooltip text="Development tools, AI software subscriptions, and other software used in R&D work." />
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={formData.softwareLicenses}
                    onChange={(e) => updateFormData('softwareLicenses', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="8000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supplies & Materials
                  <InfoTooltip text="Physical supplies, materials, and equipment used specifically for R&D activities." />
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={formData.supplies}
                    onChange={(e) => updateFormData('supplies', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="5000"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg mt-6">
              <h4 className="font-medium text-gray-900 mb-2">Expense Tips:</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Include ChatGPT Plus, Claude Pro, and other AI subscriptions</li>
                <li>• Development tools like GitHub, AWS, and hosting costs qualify</li>
                <li>• Employee time spent on AI experimentation counts</li>
                <li>• Contractor work on custom GPTs and automation qualifies</li>
              </ul>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">Additional Credits & Benefits</h2>
            
            <p className="text-sm text-gray-600 -mt-4 mb-6">
              Maximize your savings with state credits and other opportunities.
            </p>

            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="stateCredit"
                    checked={formData.stateCredit}
                    onChange={(e) => updateFormData('stateCredit', e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded mt-0.5"
                  />
                  <div className="flex-1">
                    <label htmlFor="stateCredit" className="font-medium text-gray-900 cursor-pointer">
                      Claim state R&D tax credit
                    </label>
                    <p className="text-sm text-gray-600 mt-1">
                      Many states offer additional R&D credits on top of federal benefits.
                    </p>
                  </div>
                </div>
                
                {formData.stateCredit && (
                  <div className="mt-4 pl-8">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select your state
                    </label>
                    <select
                      value={formData.selectedState}
                      onChange={(e) => updateFormData('selectedState', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Choose your state</option>
                      {statesWithCredit.map(state => (
                        <option key={state.code} value={state.code}>
                          {state.name} ({(state.rate * 100).toFixed(1)}% credit)
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="priorYearCredit"
                    checked={formData.priorYearCredit}
                    onChange={(e) => updateFormData('priorYearCredit', e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded mt-0.5"
                  />
                  <div className="flex-1">
                    <label htmlFor="priorYearCredit" className="font-medium text-gray-900 cursor-pointer">
                      I have unused R&D credits from prior years
                    </label>
                    <p className="text-sm text-gray-600 mt-1">
                      Unused credits can be carried forward for up to 20 years.
                    </p>
                  </div>
                </div>
                
                {formData.priorYearCredit && (
                  <div className="mt-4 pl-8">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estimated amount of unused credits
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        value={formData.priorYearAmount}
                        onChange={(e) => updateFormData('priorYearAmount', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="25000"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <span className="text-lg">💡</span>
                Pro Tips for Maximum Credits:
              </h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Document all AI experimentation and testing activities</li>
                <li>• Keep records of failed experiments (they still qualify!)</li>
                <li>• Track time spent on prompt engineering and optimization</li>
                <li>• Consider amending prior years if you qualify retroactively</li>
              </ul>
            </div>
          </div>
        );

      case 4:
        // Perform calculation when reaching results step
        if (!results) {
          performCalculation();
          return <div className="text-center py-8">Calculating your results...</div>;
        }

        if (!showFullResults && !emailSubmitted) {
          return (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Your R&D Tax Credit Estimate</h2>
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {formatCurrency(results.totalBenefit)}
                </div>
                <p className="text-gray-600">Estimated total tax savings</p>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 text-center">
                <div className="mb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">You Qualify!</h3>
                  <p className="text-gray-600 mb-4">
                    Based on your {getQualificationReasons().length} qualifying activities:
                  </p>
                  <ul className="text-sm text-gray-700 space-y-1 text-left max-w-md mx-auto">
                    {getQualificationReasons().slice(0, 3).map((reason, index) => (
                      <li key={index}>• {reason}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white rounded-lg p-4 mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Get Your Complete Analysis</h4>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email for detailed breakdown"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-3"
                  />
                  <button
                    onClick={() => {
                      if (email) {
                        setEmailSubmitted(true);
                        setShowFullResults(true);
                      }
                    }}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
                  >
                    Get My Complete Results
                  </button>
                  <p className="text-xs text-gray-500 mt-2">
                    We'll never spam you. Unsubscribe anytime.
                  </p>
                </div>
              </div>
            </div>
          );
        }

        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Your Complete R&D Tax Credit Analysis</h2>
              <div className="text-4xl font-bold text-green-600 mb-2">
                {formatCurrency(results.totalBenefit)}
              </div>
              <p className="text-gray-600">Total estimated tax savings for {formData.taxYear}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(results.federal.creditAmount)}
                </div>
                <div className="text-sm text-gray-600">Federal R&D Credit</div>
              </div>
              
              {results.state > 0 && (
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="text-2xl font-bold text-purple-600">
                    {formatCurrency(results.state)}
                  </div>
                  <div className="text-sm text-gray-600">State R&D Credit</div>
                </div>
              )}
              
              {results.section174ABenefit > 0 && (
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="text-2xl font-bold text-orange-600">
                    {formatCurrency(results.section174ABenefit)}
                  </div>
                  <div className="text-sm text-gray-600">Section 174A Benefit</div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Qualified Research Expenses Breakdown</h3>
              <div className="space-y-3">
                {results.qres.wages > 0 && (
                  <div className="flex justify-between">
                    <span>W-2 Wages ({(results.qres.wagePercent * 100).toFixed(0)}% qualified)</span>
                    <span className="font-medium">{formatCurrency(results.qres.wages)}</span>
                  </div>
                )}
                {results.qres.contractors > 0 && (
                  <div className="flex justify-between">
                    <span>Contractor Costs (65% of {(results.qres.contractorPercent * 100).toFixed(0)}% qualified)</span>
                    <span className="font-medium">{formatCurrency(results.qres.contractors)}</span>
                  </div>
                )}
                {results.qres.cloud > 0 && (
                  <div className="flex justify-between">
                    <span>Cloud Computing Costs</span>
                    <span className="font-medium">{formatCurrency(results.qres.cloud)}</span>
                  </div>
                )}
                {results.qres.software > 0 && (
                  <div className="flex justify-between">
                    <span>Software Licenses</span>
                    <span className="font-medium">{formatCurrency(results.qres.software)}</span>
                  </div>
                )}
                {results.qres.supplies > 0 && (
                  <div className="flex justify-between">
                    <span>Supplies & Materials</span>
                    <span className="font-medium">{formatCurrency(results.qres.supplies)}</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Total Qualified Research Expenses</span>
                  <span>{formatCurrency(results.qres.total)}</span>
                </div>
              </div>
            </div>

            <LookbackUpsell />

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Next Steps</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <div className="font-medium">Document Your Activities</div>
                    <div className="text-sm text-gray-600">We'll provide templates to document your qualifying R&D work</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <div className="font-medium">File Your Credit</div>
                    <div className="text-sm text-gray-600">Complete Form 6765 with your tax return or amendment</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <div>
                    <div className="font-medium">Get Your Refund</div>
                    <div className="text-sm text-gray-600">Receive your credit as a refund or offset against future taxes</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={() => {
                  const data = {
                    company: formData.companyName,
                    email: email,
                    results: results,
                    timestamp: new Date().toISOString()
                  };
                  console.log('Results data:', data);
                  // Here you would typically send to your backend/CRM
                }}
                className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:from-green-700 hover:to-blue-700 transition-all inline-flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Get Professional Help
              </button>
              <p className="text-sm text-gray-600 mt-2">
                Connect with a tax professional to maximize your credits
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Trust Bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4">
          <TrustBar />
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header Section */}
        <BrandingHeader />
        
        {/* Value Props */}
        <ValueProps />

        {/* Urgency Banner - Show on all steps */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-lg mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Clock className="w-5 h-5" />
            <span className="font-semibold">Limited Time: 2024 Tax Year</span>
          </div>
          <p className="text-sm opacity-90">
            File by April 15th to claim credits for AI improvements made in 2024. Don't leave money on the table!
          </p>
        </div>

        {/* Progress Indicator */}
        <ProgressIndicator />

        {/* Main Calculator Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 md:p-8">
            {renderStep()}

            {/* Navigation */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-100 mt-8">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  disabled={currentStep === 1}
                  className="px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <SaveProgressButton />
              </div>
              
              {currentStep < 4 && (
                <button
                  onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg flex items-center gap-1"
                >
                  {currentStep === 3 ? 'Calculate My Credits' : 'Continue'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Testimonials Section - Show on step 1 */}
        {currentStep === 1 && (
          <div className="mt-12 bg-white rounded-xl p-8 shadow-sm">
            <h3 className="text-xl font-bold text-center mb-8">Trusted by Small Businesses</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full mx-auto flex items-center justify-center">
                    <span className="text-green-600 font-bold text-lg">$47K</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">"Claimed $47,000 for our AI chatbot development"</p>
                <p className="text-xs text-gray-500">- Sarah, E-commerce Store</p>
              </div>
              <div className="text-center">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full mx-auto flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-lg">$23K</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">"Got $23,000 back for automating our workflows"</p>
                <p className="text-xs text-gray-500">- Mike, Marketing Agency</p>
              </div>
              <div className="text-center">
                <div className="mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full mx-auto flex items-center justify-center">
                    <span className="text-purple-600 font-bold text-lg">$31K</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">"Claimed $31,000 for custom GPT development"</p>
                <p className="text-xs text-gray-500">- Alex, SaaS Company</p>
              </div>
            </div>
          </div>
        )}

        {/* Security Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <div className="flex items-center justify-center gap-4 mb-2">
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              256-bit SSL
            </span>
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3" />
              No data sharing
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              SOC 2 Compliant
            </span>
          </div>
          <p>Your information is secure and will never be shared with third parties.</p>
        </div>
      </div>
    </div>
  );
};

export default CreditCalculator;
