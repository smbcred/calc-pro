import React, { useState } from 'react';
import { Link } from 'wouter';
import { 
  ArrowLeft, Building, User, Phone, Mail, DollarSign, 
  FileText, CheckCircle, AlertCircle, Loader 
} from 'lucide-react';

const IntakePage: React.FC = () => {
  const [formData, setFormData] = useState({
    entityName: '',
    entityType: '',
    taxId: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    businessDescription: '',
    rdActivities: '',
    totalWages: '',
    contractorCosts: '',
    supplyCosts: '',
    otherExpenses: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Get token from URL
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setErrorMessage('Invalid access token. Please use the link from your email.');
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/submitIntake', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          formData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit form');
      }

      setSubmitStatus('success');
    } catch (error) {
      console.error('Submission error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to submit form');
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Access</h1>
          <p className="text-gray-600 mb-6">
            This page requires a valid access token. Please use the secure link from your email.
          </p>
          <Link href="/">
            <button className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors">
              Return to Home
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (submitStatus === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Form Submitted Successfully!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for providing your business information. We'll begin preparing your R&D tax credit documentation and contact you within 48 hours.
          </p>
          <Link href="/">
            <button className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors">
              Return to Home
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                  <span>Back to Home</span>
                </button>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">R&D Credit Intake Form</h1>
                <div className="text-sm text-blue-600 font-medium">Secure Form • 10-15 minutes</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">📋 Complete Your R&D Credit Filing</h2>
          <p className="text-blue-700">
            We need some additional information about your business to prepare your R&D tax credit documentation. 
            All information is secure and will only be used for your filing.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Entity Information */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <Building className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-bold text-gray-900">Entity Information</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Entity Name *
                </label>
                <input
                  type="text"
                  name="entityName"
                  value={formData.entityName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Entity Type *
                </label>
                <select
                  name="entityType"
                  value={formData.entityType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select entity type</option>
                  <option value="C-Corp">C-Corporation</option>
                  <option value="S-Corp">S-Corporation</option>
                  <option value="LLC">LLC</option>
                  <option value="Partnership">Partnership</option>
                  <option value="Sole Proprietorship">Sole Proprietorship</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tax ID (EIN/SSN) *
                </label>
                <input
                  type="text"
                  name="taxId"
                  value={formData.taxId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-bold text-gray-900">Contact Information</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Name *
                </label>
                <input
                  type="text"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Business Information */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-bold text-gray-900">Business & R&D Activities</h3>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Description *
                </label>
                <textarea
                  name="businessDescription"
                  value={formData.businessDescription}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Briefly describe your business and main activities"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  R&D Activities Description *
                </label>
                <textarea
                  name="rdActivities"
                  value={formData.rdActivities}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe your research and development activities, new products/processes developed, technological uncertainties resolved, etc."
                  required
                />
              </div>
            </div>
          </div>

          {/* Expense Information */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <DollarSign className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-bold text-gray-900">R&D Expense Information</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total R&D Wages ($)
                </label>
                <input
                  type="number"
                  name="totalWages"
                  value={formData.totalWages}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contractor Costs ($)
                </label>
                <input
                  type="number"
                  name="contractorCosts"
                  value={formData.contractorCosts}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supply Costs ($)
                </label>
                <input
                  type="number"
                  name="supplyCosts"
                  value={formData.supplyCosts}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Other R&D Expenses ($)
                </label>
                <input
                  type="number"
                  name="otherExpenses"
                  value={formData.otherExpenses}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Error Message */}
          {submitStatus === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-red-700 font-medium">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`bg-gradient-to-r from-blue-600 to-green-600 text-white py-4 px-12 rounded-xl font-bold text-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-3">
                  <Loader className="w-6 h-6 animate-spin" />
                  Submitting...
                </span>
              ) : (
                'Submit Intake Form'
              )}
            </button>
            <p className="text-sm text-gray-600 mt-4">
              After submission, we'll begin preparing your R&D credit documentation
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IntakePage;