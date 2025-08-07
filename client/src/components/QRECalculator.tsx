import React, { useState, useEffect } from 'react';
import { 
  Calculator, DollarSign, Users, UserCheck, Package, Cloud,
  TrendingUp, CheckCircle, AlertCircle, Loader, FileText,
  Download, Mail, ChevronLeft
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface QREData {
  wages: {
    entries: Array<{
      employeeName: string;
      role: string;
      annualSalary: number;
      rdPercentage: number;
      qualifiedAmount: number;
    }>;
    total: number;
  };
  contractors: {
    entries: Array<{
      contractorName: string;
      amount: number;
      qualifiedAmount: number;
      description: string;
    }>;
    total: number;
  };
  supplies: {
    entries: Array<{
      supplyType: string;
      amount: number;
      rdPercentage: number;
      qualifiedAmount: number;
    }>;
    total: number;
  };
  cloudSoftware: {
    entries: Array<{
      serviceName: string;
      annualCost: number;
      rdPercentage: number;
      qualifiedAmount: number;
    }>;
    total: number;
  };
  grandTotal: number;
  taxCreditEstimate: number;
}

interface QRECalculatorProps {
  customerEmail: string;
  onBack?: () => void;
  onViewCredits?: (qreAmount: number) => void;
}

const QRECalculator: React.FC<QRECalculatorProps> = ({ customerEmail, onBack, onViewCredits }) => {
  const { toast } = useToast();
  const [qreData, setQreData] = useState<QREData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  useEffect(() => {
    loadQREData();
  }, [customerEmail]);

  const loadQREData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/qre/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: customerEmail }),
      });

      if (!response.ok) {
        throw new Error('Failed to calculate QRE');
      }

      const data = await response.json();
      setQreData(data);
    } catch (error) {
      console.error('QRE calculation error:', error);
      toast({
        title: 'Error',
        description: 'Failed to calculate qualified research expenses',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateReport = async () => {
    try {
      setIsGeneratingReport(true);
      const response = await fetch('/api/qre/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: customerEmail }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      toast({
        title: 'Success!',
        description: 'QRE report has been generated and sent to your email',
      });
    } catch (error) {
      console.error('Report generation error:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate QRE report',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <div className="text-center py-12">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Calculating your Qualified Research Expenses...</p>
        </div>
      </div>
    );
  }

  if (!qreData) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Calculate QRE</h3>
          <p className="text-gray-600">Please ensure all required information is completed in the previous sections.</p>
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
            <h2 className="text-2xl font-bold text-gray-900">QRE Calculation Results</h2>
            <p className="text-gray-600">Your Qualified Research Expenses breakdown and tax credit estimate</p>
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

        {/* Total Summary - Prominent Display */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Calculator className="w-6 h-6 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Total Qualified Research Expenses</span>
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                ${qreData.grandTotal.toLocaleString()}
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="w-6 h-6 text-green-600" />
                <span className="text-sm font-medium text-gray-700">Estimated Tax Credit (20%)</span>
              </div>
              <div className="text-4xl font-bold text-green-600">
                ${qreData.taxCreditEstimate.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QRE Breakdown */}
      <div className="p-6 space-y-6">
        {/* Wages Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Qualified Wages
              <span className="ml-auto text-2xl font-bold text-blue-600">
                ${qreData.wages.total.toLocaleString()}
              </span>
            </CardTitle>
            <CardDescription>
              Employee wages for time spent on qualified R&D activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            {qreData.wages.entries.length > 0 ? (
              <div className="space-y-3">
                {qreData.wages.entries.map((entry, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{entry.employeeName}</div>
                      <div className="text-sm text-gray-600">
                        {entry.role} • ${entry.annualSalary.toLocaleString()} × {entry.rdPercentage}% R&D time
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-blue-600">
                        ${entry.qualifiedAmount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No wage expenses recorded</p>
            )}
          </CardContent>
        </Card>

        {/* Contractors Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-green-600" />
              Qualified Contractor Expenses
              <span className="ml-auto text-2xl font-bold text-green-600">
                ${qreData.contractors.total.toLocaleString()}
              </span>
            </CardTitle>
            <CardDescription>
              65% of contractor costs for R&D work qualify for the credit
            </CardDescription>
          </CardHeader>
          <CardContent>
            {qreData.contractors.entries.length > 0 ? (
              <div className="space-y-3">
                {qreData.contractors.entries.map((entry, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{entry.contractorName}</div>
                      <div className="text-sm text-gray-600">
                        ${entry.amount.toLocaleString()} × 65% qualification rate
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {entry.description}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">
                        ${entry.qualifiedAmount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No contractor expenses recorded</p>
            )}
          </CardContent>
        </Card>

        {/* Supplies Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-600" />
              Qualified Supply Expenses
              <span className="ml-auto text-2xl font-bold text-purple-600">
                ${qreData.supplies.total.toLocaleString()}
              </span>
            </CardTitle>
            <CardDescription>
              Materials and supplies used directly in R&D activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            {qreData.supplies.entries.length > 0 ? (
              <div className="space-y-3">
                {qreData.supplies.entries.map((entry, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{entry.supplyType}</div>
                      <div className="text-sm text-gray-600">
                        ${entry.amount.toLocaleString()} × {entry.rdPercentage}% R&D usage
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-purple-600">
                        ${entry.qualifiedAmount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No supply expenses recorded</p>
            )}
          </CardContent>
        </Card>

        {/* Cloud/Software Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="w-5 h-5 text-orange-600" />
              Qualified Cloud/Software Expenses
              <span className="ml-auto text-2xl font-bold text-orange-600">
                ${qreData.cloudSoftware.total.toLocaleString()}
              </span>
            </CardTitle>
            <CardDescription>
              Cloud services and software used for R&D activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            {qreData.cloudSoftware.entries.length > 0 ? (
              <div className="space-y-3">
                {qreData.cloudSoftware.entries.map((entry, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{entry.serviceName}</div>
                      <div className="text-sm text-gray-600">
                        ${entry.annualCost.toLocaleString()}/year × {entry.rdPercentage}% R&D usage
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-orange-600">
                        ${entry.qualifiedAmount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No cloud/software expenses recorded</p>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-4 pt-6 border-t border-gray-200">
          {/* Primary Action - View Credit Calculation */}
          {onViewCredits && qreData.grandTotal > 0 && (
            <button
              onClick={() => onViewCredits(qreData.grandTotal)}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              <span className="flex items-center justify-center gap-2">
                <Calculator className="w-5 h-5" />
                Calculate Tax Credits (6.5% + State Credits)
              </span>
            </button>
          )}
          
          {/* Secondary Actions */}
          <div className="flex gap-4">
            <button
              onClick={generateReport}
              disabled={isGeneratingReport}
              className="flex-1 bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGeneratingReport ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader className="w-5 h-5 animate-spin" />
                  Generating Report...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <FileText className="w-5 h-5" />
                  Generate QRE Report
                </span>
              )}
            </button>
            
            <button
              onClick={() => window.print()}
              className="px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Print/Save
              </span>
            </button>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Important Disclaimer</p>
              <p>
                This calculation is an estimate based on the information provided. Final R&D tax credit amounts 
                may vary based on IRS requirements, documentation quality, and professional review. 
                Please consult with a qualified tax professional for final filing and compliance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRECalculator;