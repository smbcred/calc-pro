import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { 
  Building2, DollarSign, MapPin, ChevronLeft, ChevronRight,
  CheckCircle, Loader, AlertCircle, Save, Users, Calendar
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FormData {
  // Step 1: Basic Info
  companyName: string;
  ein: string;
  entityType: string;
  yearFounded: string;
  
  // Step 2: Revenue & Employees
  annualRevenue: string;
  employeeCount: string;
  rdEmployeeCount: string;
  
  // Step 3: R&D States
  primaryState: string;
  rdStates: string[];
  hasMultipleStates: boolean;
}

interface CompanyInfoFormProps {
  customerEmail: string;
  onComplete?: () => void;
  onBack?: () => void;
}

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming', 'District of Columbia'
];

const ENTITY_TYPES = [
  'C-Corporation',
  'S-Corporation', 
  'LLC',
  'Partnership',
  'Sole Proprietorship',
  'Other'
];

const CompanyInfoForm: React.FC<CompanyInfoFormProps> = ({ customerEmail, onComplete, onBack }) => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    ein: '',
    entityType: '',
    yearFounded: '',
    annualRevenue: '',
    employeeCount: '',
    rdEmployeeCount: '',
    primaryState: '',
    rdStates: [],
    hasMultipleStates: false,
  });

  // Load existing data on mount
  useEffect(() => {
    const loadExistingData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/company/info', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: customerEmail }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.companyInfo) {
            setFormData(prev => ({ ...prev, ...data.companyInfo }));
          }
        }
      } catch (error) {
        console.error('Failed to load existing data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingData();
  }, [customerEmail]);

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-save progress
    saveProgress({ ...formData, [field]: value });
  };

  const handleStateToggle = (state: string) => {
    const updatedStates = formData.rdStates.includes(state)
      ? formData.rdStates.filter(s => s !== state)
      : [...formData.rdStates, state];
    
    handleInputChange('rdStates', updatedStates);
  };

  const saveProgress = async (data: FormData) => {
    try {
      setIsSaving(true);
      await fetch('/api/company/save-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: customerEmail, formData: data }),
      });
    } catch (error) {
      console.error('Failed to save progress:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.companyName && formData.ein && formData.entityType && formData.yearFounded);
      case 2:
        return !!(formData.annualRevenue && formData.employeeCount);
      case 3:
        return !!(formData.primaryState && (formData.rdStates.length > 0 || !formData.hasMultipleStates));
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep) && currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    try {
      setIsLoading(true);
      const response = await fetch('/api/company/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: customerEmail, formData }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit company information');
      }

      toast({
        title: 'Success!',
        description: 'Company information saved successfully',
      });

      onComplete?.();
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: 'Error',
        description: 'Failed to save company information',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && currentStep === 1) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <div className="text-center py-12">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading company information...</p>
        </div>
      </div>
    );
  }

  const steps = [
    { number: 1, title: 'Basic Info', icon: Building2, completed: validateStep(1) },
    { number: 2, title: 'Revenue & Staff', icon: Users, completed: validateStep(2) },
    { number: 3, title: 'R&D Locations', icon: MapPin, completed: validateStep(3) },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Company Information</h2>
            <p className="text-gray-600">Complete your business details for R&D tax credit eligibility</p>
          </div>
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Overview</span>
            </button>
          )}
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = currentStep === step.number;
            const isCompleted = step.completed;

            return (
              <div key={step.number} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                      isCompleted
                        ? 'bg-green-500 border-green-500 text-white'
                        : isActive
                        ? 'bg-blue-500 border-blue-500 text-white'
                        : 'bg-gray-100 border-gray-300 text-gray-400'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <StepIcon className="w-5 h-5" />
                    )}
                  </div>
                  <span className="text-xs font-medium text-gray-600 mt-1">
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex-1 h-px bg-gray-300 mx-4"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Content */}
      <div className="p-8">
        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <Building2 className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-bold text-gray-900">Basic Company Information</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter legal company name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  EIN (Federal Tax ID) *
                </label>
                <input
                  type="text"
                  value={formData.ein}
                  onChange={(e) => handleInputChange('ein', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="XX-XXXXXXX"
                  pattern="[0-9]{2}-[0-9]{7}"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Entity Type *
                </label>
                <select
                  value={formData.entityType}
                  onChange={(e) => handleInputChange('entityType', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select entity type</option>
                  {ENTITY_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year Founded *
                </label>
                <input
                  type="number"
                  value={formData.yearFounded}
                  onChange={(e) => handleInputChange('yearFounded', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="YYYY"
                  min="1800"
                  max={new Date().getFullYear()}
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Revenue & Employees */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-bold text-gray-900">Revenue & Employee Information</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Annual Revenue (USD) *
                </label>
                <select
                  value={formData.annualRevenue}
                  onChange={(e) => handleInputChange('annualRevenue', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select revenue range</option>
                  <option value="Under $1M">Under $1M</option>
                  <option value="$1M - $5M">$1M - $5M</option>
                  <option value="$5M - $10M">$5M - $10M</option>
                  <option value="$10M - $25M">$10M - $25M</option>
                  <option value="$25M - $50M">$25M - $50M</option>
                  <option value="$50M - $100M">$50M - $100M</option>
                  <option value="Over $100M">Over $100M</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Employee Count *
                </label>
                <select
                  value={formData.employeeCount}
                  onChange={(e) => handleInputChange('employeeCount', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select employee count</option>
                  <option value="1-10">1-10</option>
                  <option value="11-25">11-25</option>
                  <option value="26-50">26-50</option>
                  <option value="51-100">51-100</option>
                  <option value="101-250">101-250</option>
                  <option value="251-500">251-500</option>
                  <option value="500+">500+</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  R&D Employee Count (Optional)
                </label>
                <input
                  type="number"
                  value={formData.rdEmployeeCount}
                  onChange={(e) => handleInputChange('rdEmployeeCount', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Number of employees involved in R&D activities"
                  min="0"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Include full-time, part-time, and contract employees involved in qualified R&D activities
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: R&D States */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <MapPin className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-bold text-gray-900">R&D Location Information</h3>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Business State *
                </label>
                <select
                  value={formData.primaryState}
                  onChange={(e) => handleInputChange('primaryState', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select your primary state</option>
                  {US_STATES.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center gap-3 mb-4">
                  <input
                    type="checkbox"
                    checked={formData.hasMultipleStates}
                    onChange={(e) => handleInputChange('hasMultipleStates', e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    We conduct R&D activities in multiple states
                  </span>
                </label>

                {formData.hasMultipleStates && (
                  <div>
                    <p className="text-sm text-gray-600 mb-3">
                      Select all states where you conduct qualified R&D activities:
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-4">
                      {US_STATES.map(state => (
                        <label key={state} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={formData.rdStates.includes(state)}
                            onChange={() => handleStateToggle(state)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <span>{state}</span>
                        </label>
                      ))}
                    </div>
                    {formData.rdStates.length > 0 && (
                      <p className="text-sm text-green-600 mt-2">
                        {formData.rdStates.length} state{formData.rdStates.length !== 1 ? 's' : ''} selected
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Progress Saving Indicator */}
        {isSaving && (
          <div className="flex items-center gap-2 text-sm text-blue-600 mt-4">
            <Save className="w-4 h-4 animate-pulse" />
            <span>Saving progress...</span>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              currentStep === 1
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </button>

          {currentStep < 3 ? (
            <button
              onClick={handleNext}
              disabled={!validateStep(currentStep)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                validateStep(currentStep)
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!validateStep(3) || isLoading}
              className={`bg-gradient-to-r from-blue-600 to-green-600 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 ${
                (!validateStep(3) || isLoading) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader className="w-5 h-5 animate-spin" />
                  Submitting...
                </span>
              ) : (
                'Complete Company Info'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyInfoForm;