import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Mail, Lock, AlertCircle, CheckCircle, Loader } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      if (data.hasAccess) {
        // Store auth state in session storage
        sessionStorage.setItem('authEmail', email);
        setLocation('/dashboard');
      } else {
        setStatus('error');
        setErrorMessage('You need to complete payment first. Please go through the calculator and checkout process.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-green-600 rounded-2xl mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Access Your Dashboard</h1>
          <p className="text-gray-600">
            Enter the email address you used during checkout
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Error Message */}
            {status === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-red-700 font-medium">{errorMessage}</p>
                </div>
                {errorMessage.includes('payment first') && (
                  <div className="mt-3">
                    <Link href="/calculator">
                      <button 
                        type="button"
                        className="text-sm text-red-600 hover:text-red-700 underline"
                      >
                        Go to Calculator & Checkout →
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-3 px-6 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader className="w-5 h-5 animate-spin" />
                  Verifying...
                </span>
              ) : (
                'Access Dashboard'
              )}
            </button>
          </form>
        </div>

        {/* Footer Links */}
        <div className="text-center mt-6">
          <p className="text-gray-600 mb-4">
            Don't have access yet?
          </p>
          <Link href="/calculator">
            <button className="text-blue-600 hover:text-blue-700 font-medium">
              Complete Calculator & Payment →
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;