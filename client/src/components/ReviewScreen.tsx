import React, { useState, useEffect } from 'react';
import { 
  Building2, FileText, DollarSign, Users, MapPin, Calculator,
  Edit, CheckCircle, AlertCircle, Loader, Download, FileCheck,
  ChevronLeft, Star, TrendingUp, Package, Cloud, UserCheck
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ReviewData {
  companyInfo: {
    companyName: string;
    ein: string;
    entityType: string;
    yearFounded: string;
    annualRevenue: string;
    employeeCount: string;
    rdEmployeeCount: string;
    primaryState: string;
    rdStates: string[];
    hasMultipleStates: boolean;
  } | null;
  
  rdActivities: {
    businessDescription: string;
    rdActivities: string;
  } | null;
  
  expenses: {
    wages: Array<{
      employeeName: string;
      role: string;
      annualSalary: number;
      rdPercentage: number;
      rdAmount: number;
    }>;
    contractors: Array<{
      contractorName: string;
      amount: number;
      qualifiedAmount: number;
      description: string;
    }>;
    supplies: Array<{
      supplyType: string;
      amount: number;
      rdPercentage: number;
      rdAmount: number;
    }>;
    cloudSoftware: Array<{
      serviceName: string;
      annualCost: number;
      rdPercentage: number;
      qualifiedAmount: number;
    }>;
    totals: {
      wages: number;
      contractors: number;
      supplies: number;
      cloudSoftware: number;
      grandTotal: number;
    };
  } | null;
  
  completionStatus: {
    companyInfo: number;
    rdActivities: number;
    expenses: number;
    canGenerate: boolean;
  };
}

interface ReviewScreenProps {
  customerEmail: string;
  onBack?: () => void;
  onEditSection?: (section: string) => void;
}

const ReviewScreen: React.FC<ReviewScreenProps> = ({ customerEmail, onBack, onEditSection }) => {
  const { toast } = useToast();
  const [reviewData, setReviewData] = useState<ReviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingDocuments, setIsGeneratingDocuments] = useState(false);

  useEffect(() => {
    loadReviewData();
  }, [customerEmail]);

  const loadReviewData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/review/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: customerEmail }),
      });

      if (!response.ok) {
        throw new Error('Failed to load review data');
      }

      const data = await response.json();
      setReviewData(data);
    } catch (error) {
      console.error('Review data loading error:', error);
      toast({
        title: 'Error',
        description: 'Failed to load review data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateDocuments = async () => {
    try {
      setIsGeneratingDocuments(true);
      const response = await fetch('/api/review/generate-documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: customerEmail }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate documents');
      }

      toast({
        title: 'Success!',
        description: 'Documents are being generated and will be sent to your email',
      });
    } catch (error) {
      console.error('Document generation error:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate documents',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingDocuments(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <div className="text-center py-12">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading your information for review...</p>
        </div>
      </div>
    );
  }

  if (!reviewData) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Review Data</h3>
          <p className="text-gray-600">Please ensure all sections are completed first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Application Review</h2>
            <p className="text-gray-600">Review all your information before generating documents</p>
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

        {/* Completion Status */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Application Status</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${reviewData.completionStatus.companyInfo === 100 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <span className="text-sm font-medium">Company Info: {reviewData.completionStatus.companyInfo}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${reviewData.completionStatus.rdActivities === 100 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <span className="text-sm font-medium">R&D Activities: {reviewData.completionStatus.rdActivities}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${reviewData.completionStatus.expenses > 0 ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  <span className="text-sm font-medium">Expenses: {reviewData.completionStatus.expenses}%</span>
                </div>
              </div>
            </div>
            <div className="text-center">
              {reviewData.completionStatus.canGenerate ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-6 h-6" />
                  <span className="font-semibold">Ready to Generate</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-yellow-600">
                  <AlertCircle className="w-6 h-6" />
                  <span className="font-semibold">Complete Required Sections</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Review Content */}
      <div className="p-6 space-y-6">
        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                Company Information
                {reviewData.completionStatus.companyInfo === 100 && (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
              </div>
              {onEditSection && (
                <button
                  onClick={() => onEditSection('company')}
                  className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reviewData.companyInfo ? (
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="mb-3">
                    <span className="text-sm font-medium text-gray-700">Company Name:</span>
                    <p className="text-gray-900">{reviewData.companyInfo.companyName || 'Not provided'}</p>
                  </div>
                  <div className="mb-3">
                    <span className="text-sm font-medium text-gray-700">EIN:</span>
                    <p className="text-gray-900">{reviewData.companyInfo.ein || 'Not provided'}</p>
                  </div>
                  <div className="mb-3">
                    <span className="text-sm font-medium text-gray-700">Entity Type:</span>
                    <p className="text-gray-900">{reviewData.companyInfo.entityType || 'Not provided'}</p>
                  </div>
                  <div className="mb-3">
                    <span className="text-sm font-medium text-gray-700">Year Founded:</span>
                    <p className="text-gray-900">{reviewData.companyInfo.yearFounded || 'Not provided'}</p>
                  </div>
                </div>
                <div>
                  <div className="mb-3">
                    <span className="text-sm font-medium text-gray-700">Annual Revenue:</span>
                    <p className="text-gray-900">{reviewData.companyInfo.annualRevenue || 'Not provided'}</p>
                  </div>
                  <div className="mb-3">
                    <span className="text-sm font-medium text-gray-700">Employee Count:</span>
                    <p className="text-gray-900">{reviewData.companyInfo.employeeCount || 'Not provided'}</p>
                  </div>
                  <div className="mb-3">
                    <span className="text-sm font-medium text-gray-700">Primary State:</span>
                    <p className="text-gray-900">{reviewData.companyInfo.primaryState || 'Not provided'}</p>
                  </div>
                  {reviewData.companyInfo.rdStates && reviewData.companyInfo.rdStates.length > 0 && (
                    <div className="mb-3">
                      <span className="text-sm font-medium text-gray-700">R&D States:</span>
                      <p className="text-gray-900">{reviewData.companyInfo.rdStates.join(', ')}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-gray-500 italic">Company information not completed</p>
            )}
          </CardContent>
        </Card>

        {/* R&D Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-600" />
                R&D Activities
                {reviewData.completionStatus.rdActivities === 100 && (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
              </div>
              {onEditSection && (
                <button
                  onClick={() => onEditSection('rd-activities')}
                  className="flex items-center gap-1 px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reviewData.rdActivities ? (
              <div className="space-y-4">
                <div>
                  <span className="text-sm font-medium text-gray-700">Business Description:</span>
                  <p className="text-gray-900 mt-1">{reviewData.rdActivities.businessDescription || 'Not provided'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">R&D Activities:</span>
                  <p className="text-gray-900 mt-1">{reviewData.rdActivities.rdActivities || 'Not provided'}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 italic">R&D activities not completed</p>
            )}
          </CardContent>
        </Card>

        {/* Expense Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-purple-600" />
                Expense Summary
                {reviewData.completionStatus.expenses > 0 && (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
              </div>
              {onEditSection && (
                <button
                  onClick={() => onEditSection('expenses')}
                  className="flex items-center gap-1 px-3 py-1 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {reviewData.expenses ? (
              <div className="space-y-4">
                {/* Totals Overview */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Users className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-gray-700">Wages</span>
                      </div>
                      <p className="font-semibold text-blue-600">${reviewData.expenses.totals.wages.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <UserCheck className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-gray-700">Contractors</span>
                      </div>
                      <p className="font-semibold text-green-600">${reviewData.expenses.totals.contractors.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Package className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium text-gray-700">Supplies</span>
                      </div>
                      <p className="font-semibold text-purple-600">${reviewData.expenses.totals.supplies.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Cloud className="w-4 h-4 text-orange-600" />
                        <span className="text-sm font-medium text-gray-700">Cloud/Software</span>
                      </div>
                      <p className="font-semibold text-orange-600">${reviewData.expenses.totals.cloudSoftware.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="text-center mt-4 pt-4 border-t border-gray-200">
                    <span className="text-sm font-medium text-gray-700">Total Qualified Expenses:</span>
                    <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                      ${reviewData.expenses.totals.grandTotal.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Detailed Breakdown */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Wages ({reviewData.expenses.wages.length} entries)</h4>
                    {reviewData.expenses.wages.length > 0 ? (
                      <div className="space-y-1 text-sm">
                        {reviewData.expenses.wages.slice(0, 3).map((wage, index) => (
                          <p key={index} className="text-gray-600">
                            {wage.employeeName} - ${wage.rdAmount.toLocaleString()}
                          </p>
                        ))}
                        {reviewData.expenses.wages.length > 3 && (
                          <p className="text-gray-500">... and {reviewData.expenses.wages.length - 3} more</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No wage entries</p>
                    )}
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Contractors ({reviewData.expenses.contractors.length} entries)</h4>
                    {reviewData.expenses.contractors.length > 0 ? (
                      <div className="space-y-1 text-sm">
                        {reviewData.expenses.contractors.slice(0, 3).map((contractor, index) => (
                          <p key={index} className="text-gray-600">
                            {contractor.contractorName} - ${contractor.qualifiedAmount.toLocaleString()}
                          </p>
                        ))}
                        {reviewData.expenses.contractors.length > 3 && (
                          <p className="text-gray-500">... and {reviewData.expenses.contractors.length - 3} more</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No contractor entries</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 italic">Expense information not completed</p>
            )}
          </CardContent>
        </Card>

        {/* Generate Documents Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-green-600" />
              Generate Final Documents
            </CardTitle>
            <CardDescription>
              Generate complete R&D tax credit documentation package
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Your document package will include:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Qualified Research Expenses (QRE) calculation report</li>
                  <li>• Federal and state tax credit breakdown</li>
                  <li>• Supporting documentation and expense details</li>
                  <li>• Form 6765 preparation worksheets</li>
                  <li>• Compliance checklist and filing instructions</li>
                </ul>
              </div>

              <button
                onClick={handleGenerateDocuments}
                disabled={!reviewData.completionStatus.canGenerate || isGeneratingDocuments}
                className={`w-full px-6 py-4 rounded-lg font-semibold text-white shadow-lg transition-all ${
                  reviewData.completionStatus.canGenerate && !isGeneratingDocuments
                    ? 'bg-gradient-to-r from-green-600 to-blue-600 hover:shadow-xl transform hover:scale-105'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                {isGeneratingDocuments ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader className="w-5 h-5 animate-spin" />
                    Generating Documents...
                  </span>
                ) : reviewData.completionStatus.canGenerate ? (
                  <span className="flex items-center justify-center gap-2">
                    <Download className="w-5 h-5" />
                    Generate Complete Documentation Package
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Complete Required Sections to Generate Documents
                  </span>
                )}
              </button>

              {!reviewData.completionStatus.canGenerate && (
                <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                  <strong>Required to generate documents:</strong>
                  <ul className="mt-1 space-y-1">
                    {reviewData.completionStatus.companyInfo !== 100 && (
                      <li>• Complete Company Information section</li>
                    )}
                    {reviewData.completionStatus.rdActivities !== 100 && (
                      <li>• Complete R&D Activities section</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReviewScreen;