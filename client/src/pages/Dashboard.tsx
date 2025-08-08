import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  Building2, User, FileText, DollarSign, FolderOpen, Settings,
  BarChart3, LogOut, Menu, X, TrendingUp, Calculator,
  Mail, Phone, Calendar, Star, CheckCircle, Lock, Circle,
  HelpCircle, ExternalLink, ArrowRight, Clock, AlertCircle
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import CompanyInfoForm from '@/components/CompanyInfoForm';
import ExpenseCollectionForm from '@/components/ExpenseCollectionForm';
import QRECalculator from '@/components/QRECalculator';
import CreditCalculator from '@/components/CreditCalculator';
import ReviewScreen from '@/components/ReviewScreen';
import DocumentsPage from '@/components/DocumentsPage';

interface CustomerInfo {
  email: string;
  name?: string;
  totalPaid: number;
  planType: string;
  purchaseDate: string;
  selectedYears?: string;
  hasSubmissions?: boolean;
  submissions?: any[];
}

interface MenuItemType {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const Dashboard: React.FC = () => {
  const [, setLocation] = useLocation();
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentQRE, setCurrentQRE] = useState<number>(0);
  const { toast } = useToast();

  // Check authentication and load customer info
  useEffect(() => {
    const checkAuth = async () => {
      const authEmail = sessionStorage.getItem('authEmail');
      if (!authEmail) {
        setLocation('/login');
        return;
      }

      try {
        const response = await fetch('/api/customer/info', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: authEmail }),
        });

        if (!response.ok) {
          throw new Error('Failed to load customer info');
        }

        const data = await response.json();
        setCustomerInfo(data);
      } catch (error) {
        console.error('Auth check failed:', error);
        setLocation('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [setLocation]);

  const handleLogout = () => {
    sessionStorage.removeItem('authEmail');
    setLocation('/');
  };

  // Calculate progress for each section
  const getProgressData = () => {
    if (!customerInfo || !customerInfo.hasSubmissions || !customerInfo.submissions?.length) {
      return {
        companyInfo: 0,
        rdActivities: 0,
        expenses: 0,
        canGenerate: false
      };
    }

    const submission = customerInfo.submissions[0]; // Latest submission
    let companyScore = 0;
    let rdScore = 0;
    let expenseScore = 0;

    // Company Info (4 required fields)
    if (submission['Entity Name']) companyScore += 25;
    if (submission['Entity Type']) companyScore += 25;
    if (submission['Tax ID']) companyScore += 25;
    if (submission['Contact Name']) companyScore += 25;

    // R&D Activities (2 required fields)
    if (submission['Business Description']) rdScore += 50;
    if (submission['R&D Activities']) rdScore += 50;

    // Expenses (4 optional fields - any data counts)
    const expenseFields = [
      submission['Total Wages'],
      submission['Contractor Costs'],
      submission['Supply Costs'],
      submission['Other Expenses']
    ].filter(field => field && field > 0);
    
    expenseScore = Math.min(100, expenseFields.length * 25);

    const canGenerate = companyScore === 100 && rdScore === 100;

    return {
      companyInfo: companyScore,
      rdActivities: rdScore,
      expenses: expenseScore,
      canGenerate
    };
  };

  const progressData = getProgressData();

  const getMenuItems = (): MenuItemType[] => {
    const items = [
      { id: 'overview', label: 'Overview', icon: BarChart3 },
      { 
        id: 'company', 
        label: 'Company Info', 
        icon: Building2, 
        badge: progressData.companyInfo === 100 ? 'Complete' : progressData.companyInfo > 0 ? `${progressData.companyInfo}%` : undefined
      },
      { 
        id: 'rd-activities', 
        label: 'R&D Activities', 
        icon: FileText, 
        badge: progressData.rdActivities === 100 ? 'Complete' : progressData.rdActivities > 0 ? `${progressData.rdActivities}%` : undefined
      },
      { 
        id: 'expenses', 
        label: 'Expenses', 
        icon: DollarSign,
        badge: progressData.expenses > 0 ? `${progressData.expenses}%` : undefined
      },
    ];

    // Add QRE Results section if basic requirements are met
    if (progressData.canGenerate) {
      items.push({
        id: 'qre-results',
        label: 'QRE Results',
        icon: Calculator,
        badge: 'Ready'
      });
      
      // Add Credit Calculation section if QRE has been viewed
      items.push({
        id: 'credit-results',
        label: 'Tax Credits',
        icon: TrendingUp,
        badge: 'Calculate'
      });
      
      // Add Review section when ready
      items.push({
        id: 'review',
        label: 'Review & Generate',
        icon: FileText,
        badge: progressData.canGenerate ? 'Ready' : 'Pending'
      });
    }

    items.push(
      { id: 'documents', label: 'Documents', icon: FolderOpen },
      { id: 'settings', label: 'Settings', icon: Settings }
    );

    return items;
  };

  const menuItems = getMenuItems();

  // Calculate estimated credit based on plan type
  const getEstimatedCredit = () => {
    if (!customerInfo) return 0;
    const totalPaid = customerInfo.totalPaid;
    
    // Reverse engineer credit from pricing tiers
    if (totalPaid >= 1500) return 125000;
    if (totalPaid >= 1000) return 75000;
    if (totalPaid >= 750) return 30000;
    if (totalPaid >= 500) return 7500;
    return 0;
  };

  // Smart checklist data
  const getChecklistItems = () => {
    const hasSubmission = customerInfo?.hasSubmissions && customerInfo.submissions && customerInfo.submissions.length > 0;
    const submission = hasSubmission ? customerInfo.submissions![0] : {};
    
    return [
      {
        id: 'entity-name',
        title: 'Enter your business entity name',
        completed: !!submission['Entity Name'],
        required: true,
        tooltip: 'Legal name of your business entity as it appears on tax documents',
        section: 'company',
        category: 'Company Info'
      },
      {
        id: 'entity-type',
        title: 'Select your business entity type',
        completed: !!submission['Entity Type'],
        required: true,
        tooltip: 'Choose from C-Corp, S-Corp, LLC, Partnership, or Sole Proprietorship',
        section: 'company',
        category: 'Company Info'
      },
      {
        id: 'tax-id',
        title: 'Provide your Tax ID (EIN/SSN)',
        completed: !!submission['Tax ID'],
        required: true,
        tooltip: 'Your Federal Tax Identification Number (EIN) or Social Security Number',
        section: 'company',
        category: 'Company Info'
      },
      {
        id: 'contact-name',
        title: 'Enter primary contact name',
        completed: !!submission['Contact Name'],
        required: true,
        tooltip: 'Name of the person we should contact regarding this application',
        section: 'company',
        category: 'Company Info'
      },
      {
        id: 'business-description',
        title: 'Describe your business activities',
        completed: !!submission['Business Description'],
        required: true,
        tooltip: 'Brief overview of your business and main activities or products',
        section: 'rd-activities',
        category: 'R&D Activities'
      },
      {
        id: 'rd-activities',
        title: 'Detail your R&D activities',
        completed: !!submission['R&D Activities'],
        required: true,
        tooltip: 'Describe research, development, new products, technological challenges, etc.',
        section: 'rd-activities',
        category: 'R&D Activities'
      },
      {
        id: 'wages',
        title: 'Enter R&D wages and salaries',
        completed: !!(submission['Total Wages'] && submission['Total Wages'] > 0),
        required: false,
        tooltip: 'Total wages paid to employees involved in R&D activities',
        section: 'expenses',
        category: 'Expenses'
      },
      {
        id: 'contractor-costs',
        title: 'Add contractor and consultant costs',
        completed: !!(submission['Contractor Costs'] && submission['Contractor Costs'] > 0),
        required: false,
        tooltip: 'Payments to external contractors for R&D work (65% of amount qualifies)',
        section: 'expenses',
        category: 'Expenses'
      },
      {
        id: 'supply-costs',
        title: 'Include supply and material costs',
        completed: !!(submission['Supply Costs'] && submission['Supply Costs'] > 0),
        required: false,
        tooltip: 'Cost of supplies and materials used directly in R&D activities',
        section: 'expenses',
        category: 'Expenses'
      },
      {
        id: 'other-expenses',
        title: 'Add other qualifying R&D expenses',
        completed: !!(submission['Other Expenses'] && submission['Other Expenses'] > 0),
        required: false,
        tooltip: 'Other expenses directly related to R&D (equipment, software, etc.)',
        section: 'expenses',
        category: 'Expenses'
      }
    ];
  };

  const checklistItems = getChecklistItems();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const estimatedCredit = getEstimatedCredit();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden bg-black bg-opacity-50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:static lg:inset-0`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-green-600 rounded-xl flex items-center justify-center">
                <Calculator className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">R&D Dashboard</h2>
                <p className="text-sm text-gray-600">{customerInfo?.planType}</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Credit Estimate - Prominent Display */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-green-50">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-gray-700">Estimated Credit</span>
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                ${estimatedCredit.toLocaleString()}
              </div>
              <p className="text-xs text-gray-600 mt-1">Based on your {customerInfo?.planType} plan</p>
              <div className="mt-3 flex items-center justify-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-xs text-gray-600 ml-1">Premium Service</span>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 p-6 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {item.badge && (
                    <span className={`ml-auto text-xs px-2 py-1 rounded-full ${
                      isActive
                        ? 'bg-white bg-opacity-20 text-white'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-6 border-t border-gray-200">
            <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-green-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{customerInfo?.name || 'Customer'}</p>
                <p className="text-sm text-gray-600">{customerInfo?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 capitalize">
                    {activeSection.replace('-', ' & ')}
                  </h1>
                  <p className="text-gray-600">Manage your R&D tax credit information</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-700">Active Plan</span>
                </div>
                <Link href="/intake-portal">
                  <button className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    View Intake Form
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-6">
          {activeSection === 'overview' && (
            <div className="space-y-6">
              {/* Progress Tracker - Prominent Display */}
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Progress</h2>
                  <p className="text-gray-600">Complete all sections to generate your R&D tax credit documentation</p>
                </div>
                
                <div className="grid md:grid-cols-4 gap-6">
                  {/* Company Info */}
                  <div className="relative">
                    <div className="flex flex-col items-center">
                      <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center mb-4 transition-all ${
                        progressData.companyInfo === 100
                          ? 'bg-green-500 border-green-500 text-white'
                          : progressData.companyInfo > 0
                          ? 'bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-gray-100 border-gray-300 text-gray-400'
                      }`}>
                        {progressData.companyInfo === 100 ? (
                          <CheckCircle className="w-8 h-8" />
                        ) : (
                          <Building2 className="w-8 h-8" />
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">Company Info</h3>
                      <div className={`text-2xl font-bold mb-2 ${
                        progressData.companyInfo === 100 ? 'text-green-600' : 'text-blue-600'
                      }`}>
                        {progressData.companyInfo}%
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            progressData.companyInfo === 100 ? 'bg-green-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${progressData.companyInfo}%` }}
                        ></div>
                      </div>
                    </div>
                    {/* Connector Line */}
                    <div className="hidden md:block absolute top-8 left-full w-6 h-0.5 bg-gray-300 transform -translate-y-1/2"></div>
                  </div>

                  {/* R&D Activities */}
                  <div className="relative">
                    <div className="flex flex-col items-center">
                      <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center mb-4 transition-all ${
                        progressData.rdActivities === 100
                          ? 'bg-green-500 border-green-500 text-white'
                          : progressData.rdActivities > 0
                          ? 'bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-gray-100 border-gray-300 text-gray-400'
                      }`}>
                        {progressData.rdActivities === 100 ? (
                          <CheckCircle className="w-8 h-8" />
                        ) : (
                          <FileText className="w-8 h-8" />
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">R&D Activities</h3>
                      <div className={`text-2xl font-bold mb-2 ${
                        progressData.rdActivities === 100 ? 'text-green-600' : 'text-blue-600'
                      }`}>
                        {progressData.rdActivities}%
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            progressData.rdActivities === 100 ? 'bg-green-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${progressData.rdActivities}%` }}
                        ></div>
                      </div>
                    </div>
                    {/* Connector Line */}
                    <div className="hidden md:block absolute top-8 left-full w-6 h-0.5 bg-gray-300 transform -translate-y-1/2"></div>
                  </div>

                  {/* Expenses */}
                  <div className="relative">
                    <div className="flex flex-col items-center">
                      <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center mb-4 transition-all ${
                        progressData.expenses === 100
                          ? 'bg-green-500 border-green-500 text-white'
                          : progressData.expenses > 0
                          ? 'bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-gray-100 border-gray-300 text-gray-400'
                      }`}>
                        {progressData.expenses === 100 ? (
                          <CheckCircle className="w-8 h-8" />
                        ) : (
                          <DollarSign className="w-8 h-8" />
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">Expenses</h3>
                      <div className={`text-2xl font-bold mb-2 ${
                        progressData.expenses === 100 ? 'text-green-600' : 'text-blue-600'
                      }`}>
                        {progressData.expenses}%
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            progressData.expenses === 100 ? 'bg-green-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${progressData.expenses}%` }}
                        ></div>
                      </div>
                    </div>
                    {/* Connector Line */}
                    <div className="hidden md:block absolute top-8 left-full w-6 h-0.5 bg-gray-300 transform -translate-y-1/2"></div>
                  </div>

                  {/* Review & Generate */}
                  <div className="relative">
                    <div className="flex flex-col items-center">
                      <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center mb-4 transition-all ${
                        progressData.canGenerate
                          ? 'bg-gradient-to-r from-blue-600 to-green-600 border-transparent text-white'
                          : 'bg-gray-100 border-gray-300 text-gray-400'
                      }`}>
                        {progressData.canGenerate ? (
                          <Star className="w-8 h-8" />
                        ) : (
                          <Lock className="w-8 h-8" />
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">Review & Generate</h3>
                      <div className={`text-sm font-medium mb-2 ${
                        progressData.canGenerate ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {progressData.canGenerate ? 'Ready!' : 'Locked'}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            progressData.canGenerate ? 'bg-gradient-to-r from-blue-500 to-green-500' : 'bg-gray-300'
                          }`}
                          style={{ width: progressData.canGenerate ? '100%' : '0%' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="text-center mt-8">
                  {progressData.canGenerate ? (
                    <button className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                      Generate Documentation
                    </button>
                  ) : (
                    <div>
                      <Link href="/intake-portal">
                        <button className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
                          Complete Intake Form
                        </button>
                      </Link>
                      <p className="text-sm text-gray-600 mt-2">
                        Complete Company Info and R&D Activities to unlock document generation
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-green-600 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Estimated Credit</p>
                      <p className="text-2xl font-bold text-gray-900">${estimatedCredit.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-blue-600 rounded-xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Purchase Date</p>
                      <p className="text-2xl font-bold text-gray-900">{customerInfo?.purchaseDate}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                      <Star className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Service Level</p>
                      <p className="text-lg font-bold text-gray-900">Premium</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Smart Checklist */}
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Application Checklist</h3>
                    <p className="text-gray-600">Complete these items to maximize your R&D tax credit</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {checklistItems.filter(item => item.completed).length}/{checklistItems.length}
                    </div>
                    <div className="text-sm text-gray-500">completed</div>
                  </div>
                </div>

                <TooltipProvider>
                  <div className="space-y-1">
                    {checklistItems.map((item, index) => {
                      const isCompleted = item.completed;
                      const isRequired = item.required;
                      
                      return (
                        <div key={item.id} className={`group flex items-center p-4 rounded-xl transition-all hover:bg-gray-50 ${
                          isCompleted ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
                        }`}>
                          {/* Checkbox */}
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 transition-all ${
                            isCompleted 
                              ? 'bg-green-500 border-green-500' 
                              : 'border-gray-300 group-hover:border-blue-400'
                          }`}>
                            {isCompleted && <CheckCircle className="w-4 h-4 text-white" />}
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`font-medium ${
                                isCompleted ? 'text-green-800' : 'text-gray-900'
                              }`}>
                                {item.title}
                              </span>
                              {isRequired && !isCompleted && (
                                <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-medium">
                                  Required
                                </span>
                              )}
                              {isCompleted && (
                                <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">
                                  Complete
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-600">
                              {item.category}
                            </div>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            {/* Tooltip */}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                                  <HelpCircle className="w-4 h-4 text-gray-400" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="left" className="max-w-sm">
                                <p>{item.tooltip}</p>
                              </TooltipContent>
                            </Tooltip>
                            
                            {/* Navigation Button */}
                            {!isCompleted && (
                              <button
                                onClick={() => {
                                  if (item.section === 'company' || item.section === 'rd-activities' || item.section === 'expenses') {
                                    setLocation('/intake-portal');
                                  } else {
                                    setActiveSection(item.section);
                                  }
                                }}
                                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                <span>Complete</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            )}
                            
                            {isCompleted && (
                              <button
                                onClick={() => {
                                  if (item.section === 'company' || item.section === 'rd-activities' || item.section === 'expenses') {
                                    setLocation('/intake-portal');
                                  } else {
                                    setActiveSection(item.section);
                                  }
                                }}
                                className="flex items-center gap-1 px-3 py-1.5 text-gray-600 hover:text-blue-600 text-sm hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <span>Review</span>
                                <ExternalLink className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </TooltipProvider>

                {/* Progress Summary */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {checklistItems.filter(item => item.completed && item.required).length}
                      </div>
                      <div className="text-sm text-gray-600">Required Complete</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {checklistItems.filter(item => item.completed && !item.required).length}
                      </div>
                      <div className="text-sm text-gray-600">Optional Complete</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-400">
                        {checklistItems.filter(item => !item.completed).length}
                      </div>
                      <div className="text-sm text-gray-600">Remaining</div>
                    </div>
                  </div>
                  
                  {/* Smart recommendations */}
                  <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900 mb-1">Next Steps</h4>
                        <p className="text-sm text-blue-700">
                          {checklistItems.filter(item => item.required && !item.completed).length > 0
                            ? `Complete ${checklistItems.filter(item => item.required && !item.completed).length} required items to unlock document generation.`
                            : checklistItems.filter(item => !item.required && !item.completed).length > 0
                            ? 'Great job on required items! Add expense details to maximize your credit amount.'
                            : 'Excellent! All items complete. Ready to generate your documentation.'}
                        </p>
                        {checklistItems.filter(item => item.required && !item.completed).length === 0 && (
                          <Link href="/intake-portal">
                            <button className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium">
                              Add more expense details →
                            </button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Current Status Summary */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Current Status</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-700">Completion Summary</h4>
                    <div className="text-sm text-gray-600">
                      <div className="flex justify-between mb-1">
                        <span>Company Info:</span>
                        <span className={progressData.companyInfo === 100 ? 'text-green-600 font-medium' : 'text-blue-600'}>
                          {progressData.companyInfo}% Complete
                        </span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span>R&D Activities:</span>
                        <span className={progressData.rdActivities === 100 ? 'text-green-600 font-medium' : 'text-blue-600'}>
                          {progressData.rdActivities}% Complete
                        </span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span>Expenses:</span>
                        <span className={progressData.expenses > 0 ? 'text-green-600 font-medium' : 'text-gray-500'}>
                          {progressData.expenses}% Complete
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-700">Overall Progress</h4>
                    <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                      {Math.round((progressData.companyInfo + progressData.rdActivities + progressData.expenses) / 3)}%
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
                        style={{ width: `${Math.round((progressData.companyInfo + progressData.rdActivities + progressData.expenses) / 3)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Next Steps</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                    <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
                    <span className="text-gray-800">Upload supporting documents (payroll, contracts, expenses)</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
                    <span className="text-gray-600">Schedule consultation call with tax specialist</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
                    <span className="text-gray-600">Review and finalize R&D credit documentation</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'company' && (
            <CompanyInfoForm 
              customerEmail={customerInfo?.email || ''}
              onComplete={() => {
                toast({
                  title: 'Success!',
                  description: 'Company information saved successfully',
                });
                setActiveSection('overview');
              }}
              onBack={() => setActiveSection('overview')}
            />
          )}

          {activeSection === 'expenses' && (
            <ExpenseCollectionForm 
              customerEmail={customerInfo?.email || ''}
              onComplete={() => {
                toast({
                  title: 'Success!',
                  description: 'Expense information saved successfully',
                });
                setActiveSection('overview');
              }}
              onBack={() => setActiveSection('overview')}
            />
          )}

          {activeSection === 'qre-results' && (
            <QRECalculator 
              customerEmail={customerInfo?.email || ''}
              onBack={() => setActiveSection('overview')}
              onViewCredits={(qreAmount) => {
                setCurrentQRE(qreAmount);
                setActiveSection('credit-results');
              }}
            />
          )}

          {activeSection === 'credit-results' && (
            <CreditCalculator 
              customerEmail={customerInfo?.email || ''}
              totalQRE={currentQRE}
              onBack={() => setActiveSection('qre-results')}
            />
          )}

          {activeSection === 'review' && (
            <ReviewScreen 
              customerEmail={customerInfo?.email || ''}
              onBack={() => setActiveSection('overview')}
              onEditSection={(section) => setActiveSection(section)}
            />
          )}

          {activeSection === 'documents' && (
            <DocumentsPage 
              customerEmail={customerInfo?.email || ''}
              onBack={() => setActiveSection('overview')}
            />
          )}

          {activeSection !== 'overview' && activeSection !== 'company' && activeSection !== 'expenses' && activeSection !== 'qre-results' && activeSection !== 'credit-results' && activeSection !== 'review' && activeSection !== 'documents' && (
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-green-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 capitalize">
                  {activeSection.replace('-', ' & ')}
                </h3>
                <p className="text-gray-600 mb-6">
                  This section is being built. Your information from the intake form will be displayed here.
                </p>
                <Link href="/intake-portal">
                  <button className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all">
                    View Intake Portal
                  </button>
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;