import React, { useState, useEffect } from 'react';
import { 
  Calculator, DollarSign, MapPin, TrendingUp, 
  CheckCircle, AlertCircle, Loader, FileText,
  Download, Info, ChevronLeft, Building2, Users
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface StateCredit {
  state: string;
  rate: number;
  maxCredit?: number;
  creditAmount: number;
  description: string;
}

interface PayrollTaxOffset {
  eligible: boolean;
  maxOffset: number;
  effectiveOffset: number;
  explanation: string;
}

interface CreditData {
  totalQRE: number;
  federalCredit: {
    traditionalMethod: number;
    rate: number;
    explanation: string;
  };
  stateCredits: StateCredit[];
  payrollTaxOffset: PayrollTaxOffset;
  totalCredits: number;
  netBenefit: number;
  companyInfo: {
    primaryState: string;
    rdStates: string[];
    employeeCount: string;
    annualRevenue: string;
  };
}

interface CreditCalculatorProps {
  customerEmail: string;
  totalQRE?: number;
  onBack?: () => void;
}

const CreditCalculator: React.FC<CreditCalculatorProps> = ({ customerEmail, totalQRE, onBack }) => {
  const { toast } = useToast();
  const [creditData, setCreditData] = useState<CreditData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  useEffect(() => {
    loadCreditData();
  }, [customerEmail, totalQRE]);

  const loadCreditData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/credits/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: customerEmail, totalQRE }),
      });

      if (!response.ok) {
        throw new Error('Failed to calculate credits');
      }

      const data = await response.json();
      setCreditData(data);
    } catch (error) {
      console.error('Credit calculation error:', error);
      toast({
        title: 'Error',
        description: 'Failed to calculate R&D tax credits',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateCreditReport = async () => {
    try {
      setIsGeneratingReport(true);
      const response = await fetch('/api/credits/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: customerEmail }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate credit report');
      }

      toast({
        title: 'Success!',
        description: 'Credit calculation report has been generated and sent to your email',
      });
    } catch (error) {
      console.error('Credit report generation error:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate credit report',
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
          <p className="text-gray-600">Calculating your R&D tax credits...</p>
        </div>
      </div>
    );
  }

  if (!creditData) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Calculate Credits</h3>
          <p className="text-gray-600">Please ensure QRE calculation is completed first.</p>
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
            <h2 className="text-2xl font-bold text-gray-900">R&D Tax Credit Calculation</h2>
            <p className="text-gray-600">Federal and state tax credit breakdown based on your QRE</p>
          </div>
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to QRE Results</span>
            </button>
          )}
        </div>

        {/* Total Summary - Prominent Display */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 mb-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Calculator className="w-6 h-6 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Total QRE</span>
              </div>
              <div className="text-3xl font-bold text-blue-600">
                ${creditData.totalQRE.toLocaleString()}
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="w-6 h-6 text-green-600" />
                <span className="text-sm font-medium text-gray-700">Total Tax Credits</span>
              </div>
              <div className="text-3xl font-bold text-green-600">
                ${creditData.totalCredits.toLocaleString()}
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <DollarSign className="w-6 h-6 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">Net Tax Benefit</span>
              </div>
              <div className="text-3xl font-bold text-purple-600">
                ${creditData.netBenefit.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Company Context */}
        <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            <span>Primary: {creditData.companyInfo.primaryState}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span>{creditData.companyInfo.employeeCount} employees</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            <span>{creditData.companyInfo.annualRevenue} revenue</span>
          </div>
        </div>
      </div>

      {/* Credit Breakdown */}
      <div className="p-6 space-y-6">
        {/* Federal Credit Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Federal R&D Credit
              <span className="ml-auto text-2xl font-bold text-blue-600">
                ${creditData.federalCredit.traditionalMethod.toLocaleString()}
              </span>
            </CardTitle>
            <CardDescription>
              Traditional Method: {creditData.federalCredit.rate}% of qualified research expenses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-medium mb-1">Calculation Method</p>
                  <p>{creditData.federalCredit.explanation}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* State Credits Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-green-600" />
              State R&D Credits
              <span className="ml-auto text-2xl font-bold text-green-600">
                ${creditData.stateCredits.reduce((sum, state) => sum + state.creditAmount, 0).toLocaleString()}
              </span>
            </CardTitle>
            <CardDescription>
              State-specific R&D tax incentives for your business locations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {creditData.stateCredits.length > 0 ? (
              <div className="space-y-4">
                {creditData.stateCredits.map((stateCredit, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{stateCredit.state}</div>
                      <div className="text-sm text-gray-600">
                        {stateCredit.rate}% rate
                        {stateCredit.maxCredit && ` (max: $${stateCredit.maxCredit.toLocaleString()})`}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {stateCredit.description}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">
                        ${stateCredit.creditAmount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No state credits available for your locations</p>
            )}
          </CardContent>
        </Card>

        {/* Payroll Tax Offset Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Payroll Tax Offset Eligibility
              <span className={`ml-auto text-2xl font-bold ${
                creditData.payrollTaxOffset.eligible ? 'text-purple-600' : 'text-gray-400'
              }`}>
                {creditData.payrollTaxOffset.eligible 
                  ? `$${creditData.payrollTaxOffset.effectiveOffset.toLocaleString()}`
                  : 'N/A'
                }
              </span>
            </CardTitle>
            <CardDescription>
              Alternative minimum tax relief for qualifying businesses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`p-4 rounded-lg ${
              creditData.payrollTaxOffset.eligible ? 'bg-purple-50' : 'bg-gray-50'
            }`}>
              <div className="flex items-start gap-2">
                {creditData.payrollTaxOffset.eligible ? (
                  <CheckCircle className="w-5 h-5 text-purple-600 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-gray-500 mt-0.5" />
                )}
                <div className="text-sm">
                  <p className={`font-medium mb-1 ${
                    creditData.payrollTaxOffset.eligible ? 'text-purple-900' : 'text-gray-700'
                  }`}>
                    {creditData.payrollTaxOffset.eligible ? 'Eligible for Payroll Tax Offset' : 'Not Eligible'}
                  </p>
                  <p className={creditData.payrollTaxOffset.eligible ? 'text-purple-800' : 'text-gray-600'}>
                    {creditData.payrollTaxOffset.explanation}
                  </p>
                  {creditData.payrollTaxOffset.eligible && (
                    <p className="text-xs text-purple-600 mt-2">
                      Maximum offset: ${creditData.payrollTaxOffset.maxOffset.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Credit Summary Table */}
        <Card>
          <CardHeader>
            <CardTitle>Credit Summary</CardTitle>
            <CardDescription>Complete breakdown of your R&D tax benefits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="font-medium">Federal R&D Credit</span>
                <span className="font-semibold text-blue-600">
                  ${creditData.federalCredit.traditionalMethod.toLocaleString()}
                </span>
              </div>
              
              {creditData.stateCredits.map((stateCredit, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="font-medium">{stateCredit.state} State Credit</span>
                  <span className="font-semibold text-green-600">
                    ${stateCredit.creditAmount.toLocaleString()}
                  </span>
                </div>
              ))}
              
              {creditData.payrollTaxOffset.eligible && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="font-medium">Payroll Tax Offset</span>
                  <span className="font-semibold text-purple-600">
                    ${creditData.payrollTaxOffset.effectiveOffset.toLocaleString()}
                  </span>
                </div>
              )}
              
              <div className="flex justify-between items-center py-3 border-t-2 border-gray-200">
                <span className="text-lg font-bold">Total Tax Benefits</span>
                <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  ${creditData.netBenefit.toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6 border-t border-gray-200">
          <button
            onClick={generateCreditReport}
            disabled={isGeneratingReport}
            className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGeneratingReport ? (
              <span className="flex items-center justify-center gap-2">
                <Loader className="w-5 h-5 animate-spin" />
                Generating Report...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <FileText className="w-5 h-5" />
                Generate Credit Report
              </span>
            )}
          </button>
          
          <button
            onClick={() => window.print()}
            className="px-6 py-3 border-2 border-green-600 text-green-600 rounded-lg font-semibold hover:bg-green-50 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Print/Save
            </span>
          </button>
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-6">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-1">Important Tax Disclaimer</p>
              <p>
                These credit calculations are estimates based on current tax laws and the information provided. 
                Actual credit amounts may vary based on final IRS and state tax authority determinations. 
                Credits are subject to complex rules, limitations, and carryforward provisions. 
                Please consult with a qualified tax professional for final credit calculations and filing strategy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditCalculator;