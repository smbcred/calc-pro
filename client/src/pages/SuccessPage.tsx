import React from 'react';
import { Link } from 'wouter';
import { CheckCircle, Mail, FileText, Calendar, ArrowRight } from 'lucide-react';

const SuccessPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
          <p className="text-xl text-gray-600 mb-2">Your R&D Tax Credit filing package is confirmed</p>
          <p className="text-lg text-blue-600">Order #: {new URLSearchParams(window.location.search).get('session_id')?.slice(-8) || 'CONFIRMED'}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">What Happens Next?</h2>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-semibold">1</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Confirmation Email</h3>
                <p className="text-gray-600">You'll receive a confirmation email within the next few minutes with your order details.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-semibold">2</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Document Preparation</h3>
                <p className="text-gray-600">Our team will prepare your personalized R&D credit documentation package.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-green-600 font-semibold">3</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Delivery (48 Hours)</h3>
                <p className="text-gray-600">Complete filing package delivered via email within 48 hours.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-8 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Your Package Includes:</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-blue-600" />
              <span className="text-gray-700">Completed Form 6765</span>
            </div>
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-blue-600" />
              <span className="text-gray-700">Supporting Documentation</span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span className="text-gray-700">Multi-Year Calculations</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-blue-600" />
              <span className="text-gray-700">Filing Instructions</span>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link href="/">
            <button className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-3 px-8 rounded-lg font-semibold hover:shadow-lg transition-all inline-flex items-center gap-2">
              Return to Calculator
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-2">Questions about your order?</p>
          <p className="text-blue-600 font-medium">Contact support@rdcreditcalc.com</p>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;