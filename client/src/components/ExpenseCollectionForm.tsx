import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { 
  DollarSign, Users, UserCheck, Package, Cloud, 
  ChevronLeft, Plus, Trash2, Calculator, Save, 
  Loader, CheckCircle, AlertTriangle, Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface WageEntry {
  id: string;
  employeeName: string;
  role: string;
  annualSalary: number;
  rdPercentage: number;
  rdAmount: number;
}

interface ContractorEntry {
  id: string;
  contractorName: string;
  amount: number;
  description: string;
  qualifiedAmount: number; // 65% of total amount
}

interface SupplyEntry {
  id: string;
  supplyType: string;
  amount: number;
  rdPercentage: number;
  rdAmount: number;
}

interface CloudSoftwareEntry {
  id: string;
  serviceName: string;
  monthlyCost: number;
  rdPercentage: number;
  annualRdAmount: number;
}

interface ExpenseCollectionFormProps {
  customerEmail: string;
  onComplete?: () => void;
  onBack?: () => void;
}

const ExpenseCollectionForm: React.FC<ExpenseCollectionFormProps> = ({ 
  customerEmail, 
  onComplete, 
  onBack 
}) => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('wages');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Expense data state
  const [wages, setWages] = useState<WageEntry[]>([]);
  const [contractors, setContractors] = useState<ContractorEntry[]>([]);
  const [supplies, setSupplies] = useState<SupplyEntry[]>([]);
  const [cloudSoftware, setCloudSoftware] = useState<CloudSoftwareEntry[]>([]);

  // Load existing expense data
  useEffect(() => {
    const loadExpenseData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/expenses/load', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: customerEmail }),
        });

        if (response.ok) {
          const data = await response.json();
          setWages(data.wages || []);
          setContractors(data.contractors || []);
          setSupplies(data.supplies || []);
          setCloudSoftware(data.cloudSoftware || []);
        }
      } catch (error) {
        console.error('Failed to load expense data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadExpenseData();
  }, [customerEmail]);

  // Auto-save functionality
  const autoSave = async () => {
    if (!hasUnsavedChanges) return;
    
    try {
      setIsSaving(true);
      await fetch('/api/expenses/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: customerEmail,
          expenses: { wages, contractors, supplies, cloudSoftware }
        }),
      });
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (hasUnsavedChanges) autoSave();
    }, 2000);
    return () => clearTimeout(timer);
  }, [hasUnsavedChanges, wages, contractors, supplies, cloudSoftware]);

  // Helper function to generate unique IDs
  const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

  // Calculate totals
  const calculateTotals = () => {
    const wagesTotalRD = wages.reduce((sum, wage) => sum + (wage.rdAmount || 0), 0);
    const contractorsTotal = contractors.reduce((sum, contractor) => sum + (contractor.qualifiedAmount || 0), 0);
    const suppliesTotalRD = supplies.reduce((sum, supply) => sum + (supply.rdAmount || 0), 0);
    const cloudSoftwareTotal = cloudSoftware.reduce((sum, cloud) => sum + (cloud.annualRdAmount || 0), 0);
    
    return {
      wages: wagesTotalRD,
      contractors: contractorsTotal,
      supplies: suppliesTotalRD,
      cloudSoftware: cloudSoftwareTotal,
      grandTotal: wagesTotalRD + contractorsTotal + suppliesTotalRD + cloudSoftwareTotal
    };
  };

  const totals = calculateTotals();

  // Wage functions
  const addWageEntry = () => {
    const newWage: WageEntry = {
      id: generateId(),
      employeeName: '',
      role: '',
      annualSalary: 0,
      rdPercentage: 0,
      rdAmount: 0
    };
    setWages([...wages, newWage]);
    setHasUnsavedChanges(true);
  };

  const updateWageEntry = (id: string, field: keyof WageEntry, value: any) => {
    setWages(wages.map(wage => {
      if (wage.id === id) {
        const updatedWage = { ...wage, [field]: value };
        // Auto-calculate R&D amount
        if (field === 'annualSalary' || field === 'rdPercentage') {
          updatedWage.rdAmount = (updatedWage.annualSalary * updatedWage.rdPercentage) / 100;
        }
        return updatedWage;
      }
      return wage;
    }));
    setHasUnsavedChanges(true);
  };

  const removeWageEntry = (id: string) => {
    setWages(wages.filter(wage => wage.id !== id));
    setHasUnsavedChanges(true);
  };

  // Contractor functions
  const addContractorEntry = () => {
    const newContractor: ContractorEntry = {
      id: generateId(),
      contractorName: '',
      amount: 0,
      description: '',
      qualifiedAmount: 0
    };
    setContractors([...contractors, newContractor]);
    setHasUnsavedChanges(true);
  };

  const updateContractorEntry = (id: string, field: keyof ContractorEntry, value: any) => {
    setContractors(contractors.map(contractor => {
      if (contractor.id === id) {
        const updatedContractor = { ...contractor, [field]: value };
        // Auto-calculate qualified amount (65% of total)
        if (field === 'amount') {
          updatedContractor.qualifiedAmount = updatedContractor.amount * 0.65;
        }
        return updatedContractor;
      }
      return contractor;
    }));
    setHasUnsavedChanges(true);
  };

  const removeContractorEntry = (id: string) => {
    setContractors(contractors.filter(contractor => contractor.id !== id));
    setHasUnsavedChanges(true);
  };

  // Supply functions
  const addSupplyEntry = () => {
    const newSupply: SupplyEntry = {
      id: generateId(),
      supplyType: '',
      amount: 0,
      rdPercentage: 100,
      rdAmount: 0
    };
    setSupplies([...supplies, newSupply]);
    setHasUnsavedChanges(true);
  };

  const updateSupplyEntry = (id: string, field: keyof SupplyEntry, value: any) => {
    setSupplies(supplies.map(supply => {
      if (supply.id === id) {
        const updatedSupply = { ...supply, [field]: value };
        // Auto-calculate R&D amount
        if (field === 'amount' || field === 'rdPercentage') {
          updatedSupply.rdAmount = (updatedSupply.amount * updatedSupply.rdPercentage) / 100;
        }
        return updatedSupply;
      }
      return supply;
    }));
    setHasUnsavedChanges(true);
  };

  const removeSupplyEntry = (id: string) => {
    setSupplies(supplies.filter(supply => supply.id !== id));
    setHasUnsavedChanges(true);
  };

  // Cloud/Software functions
  const addCloudSoftwareEntry = () => {
    const newCloudSoftware: CloudSoftwareEntry = {
      id: generateId(),
      serviceName: '',
      monthlyCost: 0,
      rdPercentage: 100,
      annualRdAmount: 0
    };
    setCloudSoftware([...cloudSoftware, newCloudSoftware]);
    setHasUnsavedChanges(true);
  };

  const updateCloudSoftwareEntry = (id: string, field: keyof CloudSoftwareEntry, value: any) => {
    setCloudSoftware(cloudSoftware.map(cloud => {
      if (cloud.id === id) {
        const updatedCloud = { ...cloud, [field]: value };
        // Auto-calculate annual R&D amount
        if (field === 'monthlyCost' || field === 'rdPercentage') {
          updatedCloud.annualRdAmount = (updatedCloud.monthlyCost * 12 * updatedCloud.rdPercentage) / 100;
        }
        return updatedCloud;
      }
      return cloud;
    }));
    setHasUnsavedChanges(true);
  };

  const removeCloudSoftwareEntry = (id: string) => {
    setCloudSoftware(cloudSoftware.filter(cloud => cloud.id !== id));
    setHasUnsavedChanges(true);
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/expenses/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: customerEmail,
          expenses: { wages, contractors, supplies, cloudSoftware }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit expenses');
      }

      toast({
        title: 'Success!',
        description: 'Expense information saved successfully',
      });

      onComplete?.();
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: 'Error',
        description: 'Failed to save expense information',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && wages.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        <div className="text-center py-12">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading expense information...</p>
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
            <h2 className="text-2xl font-bold text-gray-900">R&D Expense Collection</h2>
            <p className="text-gray-600">Document your qualifying R&D expenses for maximum tax credit</p>
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

        {/* Running Totals */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4">
          <div className="grid md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">${totals.wages.toLocaleString()}</div>
              <div className="text-xs text-gray-600">Wages</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">${totals.contractors.toLocaleString()}</div>
              <div className="text-xs text-gray-600">Contractors</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">${totals.supplies.toLocaleString()}</div>
              <div className="text-xs text-gray-600">Supplies</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">${totals.cloudSoftware.toLocaleString()}</div>
              <div className="text-xs text-gray-600">Cloud/Software</div>
            </div>
            <div className="text-center border-l border-gray-300">
              <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                ${totals.grandTotal.toLocaleString()}
              </div>
              <div className="text-xs text-gray-600">Total Qualified</div>
            </div>
          </div>
        </div>
      </div>

      {/* Expense Forms */}
      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="wages" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Wages
            </TabsTrigger>
            <TabsTrigger value="contractors" className="flex items-center gap-2">
              <UserCheck className="w-4 h-4" />
              Contractors
            </TabsTrigger>
            <TabsTrigger value="supplies" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Supplies
            </TabsTrigger>
            <TabsTrigger value="cloud" className="flex items-center gap-2">
              <Cloud className="w-4 h-4" />
              Cloud/Software
            </TabsTrigger>
          </TabsList>

          {/* Wages Tab */}
          <TabsContent value="wages" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Employee Wages & Salaries
                </CardTitle>
                <CardDescription>
                  Include employees who spend time on qualifying R&D activities. Only the R&D portion of their salary qualifies.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {wages.map((wage) => (
                  <div key={wage.id} className="p-4 border border-gray-200 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">Employee Entry</h4>
                      <button
                        onClick={() => removeWageEntry(wage.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Employee Name *
                        </label>
                        <input
                          type="text"
                          value={wage.employeeName}
                          onChange={(e) => updateWageEntry(wage.id, 'employeeName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="John Doe"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Role/Title *
                        </label>
                        <input
                          type="text"
                          value={wage.role}
                          onChange={(e) => updateWageEntry(wage.id, 'role', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Software Engineer"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Annual Salary *
                        </label>
                        <input
                          type="number"
                          value={wage.annualSalary || ''}
                          onChange={(e) => updateWageEntry(wage.id, 'annualSalary', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="80000"
                        />
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          R&D Time % *
                        </label>
                        <input
                          type="number"
                          value={wage.rdPercentage || ''}
                          onChange={(e) => updateWageEntry(wage.id, 'rdPercentage', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="50"
                          min="0"
                          max="100"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Qualified R&D Amount
                        </label>
                        <div className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 font-medium">
                          ${wage.rdAmount?.toLocaleString() || '0'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                <button
                  onClick={addWageEntry}
                  className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Add Employee
                </button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contractors Tab */}
          <TabsContent value="contractors" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5" />
                  Contractor Expenses
                </CardTitle>
                <CardDescription>
                  External contractors performing R&D work. Only 65% of contractor costs qualify for the credit.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {contractors.map((contractor) => (
                  <div key={contractor.id} className="p-4 border border-gray-200 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">Contractor Entry</h4>
                      <button
                        onClick={() => removeContractorEntry(contractor.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Contractor Name *
                        </label>
                        <input
                          type="text"
                          value={contractor.contractorName}
                          onChange={(e) => updateContractorEntry(contractor.id, 'contractorName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="ABC Development LLC"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Total Amount Paid *
                        </label>
                        <input
                          type="number"
                          value={contractor.amount || ''}
                          onChange={(e) => updateContractorEntry(contractor.id, 'amount', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="50000"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Work Description *
                      </label>
                      <textarea
                        value={contractor.description}
                        onChange={(e) => updateContractorEntry(contractor.id, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={2}
                        placeholder="Software development for new AI algorithm implementation..."
                      />
                    </div>
                    
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Info className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">Qualified Amount (65% of total)</span>
                      </div>
                      <div className="text-lg font-bold text-blue-600">
                        ${contractor.qualifiedAmount?.toLocaleString() || '0'}
                      </div>
                    </div>
                  </div>
                ))}
                
                <button
                  onClick={addContractorEntry}
                  className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Add Contractor
                </button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Supplies Tab */}
          <TabsContent value="supplies" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Supply & Material Costs
                </CardTitle>
                <CardDescription>
                  Materials and supplies used directly in R&D activities. Only the R&D portion qualifies.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {supplies.map((supply) => (
                  <div key={supply.id} className="p-4 border border-gray-200 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">Supply Entry</h4>
                      <button
                        onClick={() => removeSupplyEntry(supply.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Supply Type *
                        </label>
                        <input
                          type="text"
                          value={supply.supplyType}
                          onChange={(e) => updateSupplyEntry(supply.id, 'supplyType', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Lab equipment, raw materials, etc."
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Total Amount *
                        </label>
                        <input
                          type="number"
                          value={supply.amount || ''}
                          onChange={(e) => updateSupplyEntry(supply.id, 'amount', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="5000"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          R&D Usage % *
                        </label>
                        <input
                          type="number"
                          value={supply.rdPercentage || ''}
                          onChange={(e) => updateSupplyEntry(supply.id, 'rdPercentage', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="100"
                          min="0"
                          max="100"
                        />
                      </div>
                    </div>
                    
                    <div className="bg-purple-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Calculator className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-900">Qualified R&D Amount</span>
                      </div>
                      <div className="text-lg font-bold text-purple-600">
                        ${supply.rdAmount?.toLocaleString() || '0'}
                      </div>
                    </div>
                  </div>
                ))}
                
                <button
                  onClick={addSupplyEntry}
                  className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Add Supply Item
                </button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cloud/Software Tab */}
          <TabsContent value="cloud" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cloud className="w-5 h-5" />
                  Cloud & Software Services
                </CardTitle>
                <CardDescription>
                  Cloud services, software licenses, and SaaS tools used for R&D activities.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {cloudSoftware.map((cloud) => (
                  <div key={cloud.id} className="p-4 border border-gray-200 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">Service Entry</h4>
                      <button
                        onClick={() => removeCloudSoftwareEntry(cloud.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Service Name *
                        </label>
                        <input
                          type="text"
                          value={cloud.serviceName}
                          onChange={(e) => updateCloudSoftwareEntry(cloud.id, 'serviceName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="AWS, GitHub, Adobe Creative Cloud, etc."
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Monthly Cost *
                        </label>
                        <input
                          type="number"
                          value={cloud.monthlyCost || ''}
                          onChange={(e) => updateCloudSoftwareEntry(cloud.id, 'monthlyCost', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          R&D Usage % *
                        </label>
                        <input
                          type="number"
                          value={cloud.rdPercentage || ''}
                          onChange={(e) => updateCloudSoftwareEntry(cloud.id, 'rdPercentage', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="75"
                          min="0"
                          max="100"
                        />
                      </div>
                    </div>
                    
                    <div className="bg-orange-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Calculator className="w-4 h-4 text-orange-600" />
                        <span className="text-sm font-medium text-orange-900">Annual R&D Amount</span>
                      </div>
                      <div className="text-lg font-bold text-orange-600">
                        ${cloud.annualRdAmount?.toLocaleString() || '0'}
                      </div>
                    </div>
                  </div>
                ))}
                
                <button
                  onClick={addCloudSoftwareEntry}
                  className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Add Service
                </button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Auto-save indicator and submit */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
          <div className="flex items-center gap-2">
            {isSaving ? (
              <>
                <Save className="w-4 h-4 animate-pulse text-blue-600" />
                <span className="text-sm text-blue-600">Saving progress...</span>
              </>
            ) : hasUnsavedChanges ? (
              <>
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-yellow-600">Unsaved changes</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-600">All changes saved</span>
              </>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader className="w-5 h-5 animate-spin" />
                Submitting...
              </span>
            ) : (
              'Complete Expense Collection'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpenseCollectionForm;