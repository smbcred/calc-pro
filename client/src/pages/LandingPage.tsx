import React, { useState } from 'react';
import { Link } from 'wouter';
import { 
  ArrowRight, Check, Star, Shield, Clock, Users, Zap, 
  ChevronRight, Play, FileText, Calculator, TrendingUp,
  DollarSign, AlertCircle, CheckCircle, MousePointer
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [showDemo, setShowDemo] = useState(false);

  const handleActivityToggle = (activity: string) => {
    setSelectedActivities(prev => 
      prev.includes(activity) 
        ? prev.filter(a => a !== activity)
        : [...prev, activity]
    );
  };

  const getQualificationMessage = () => {
    const count = selectedActivities.length;
    if (count === 0) return "";
    if (count <= 2) return "Good start! You likely qualify for credits.";
    if (count <= 4) return "Excellent! You're doing significant R&D work.";
    return "Wow! You might be leaving serious money on the table.";
  };

  const activities = [
    {
      id: 'ai-tools',
      label: '🤖 We use ChatGPT, Claude, or AI tools',
      example: 'Writing content, analyzing data, customer service'
    },
    {
      id: 'automations',
      label: '🛠️ We\'ve built GPTs, automations, or workflows',
      example: 'Zapier flows, custom ChatGPT instructions'
    },
    {
      id: 'prompts',
      label: '💡 We\'ve developed prompts or AI processes',
      example: 'Tested different approaches to get better results'
    },
    {
      id: 'code-automation',
      label: '🔧 We\'ve automated tasks with code/no-code',
      example: 'Airtable, Make.com, custom scripts'
    },
    {
      id: 'testing',
      label: '🧪 We test and improve our AI usage',
      example: 'A/B testing prompts, refining outputs'
    },
    {
      id: 'improvements',
      label: '📈 We\'ve made our processes 10%+ better',
      example: 'Faster, more accurate, or higher quality'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header Navigation */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                <Calculator className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900">SMBTaxCredits.com</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/calculator" className="text-blue-600 font-medium hover:text-blue-700">
                Calculator
              </Link>
              <div className="text-sm text-gray-600">
                <span className="font-medium">🔒 Secure</span> • <span className="font-medium">⚡ Fast</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-50 via-white to-green-50 pt-16 pb-24">
        <div className="max-w-6xl mx-auto px-4">
          {/* Trust Bar */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-6 text-sm text-gray-600 bg-white rounded-full px-6 py-3 shadow-sm">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-600" />
                <span>Bank-level encryption</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>IRS-compliant calculations</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-purple-600" />
                <span>500+ successful claims</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-orange-600" />
                <span>Results in minutes</span>
              </div>
            </div>
          </div>

          {/* Main Hero Content */}
          <div className="text-center max-w-4xl mx-auto">
            <div className="text-sm font-semibold text-purple-600 mb-4">
              💡 New IRS Ruling for 2024
            </div>
            
            <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 leading-tight">
              Get Money Back for Using AI in Your Business
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-6 leading-relaxed">
              Turn your ChatGPT, automation, and AI expenses into <span className="font-bold text-green-600">$15,000-$75,000</span> in tax credits
            </p>
            
            <div className="flex items-center justify-center gap-8 text-sm text-gray-500 mb-8">
              <span>Average client receives <strong className="text-gray-900">$28,500</strong></span>
              <span>•</span>
              <span>5-minute assessment</span>
              <span>•</span>
              <span>No payment unless you qualify</span>
            </div>

            {/* Hero CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link href="/calculator">
                <button className="btn-primary bg-gradient-to-r from-blue-600 to-green-600 text-white py-4 px-8 rounded-xl font-bold text-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                  <span className="flex items-center gap-3">
                    <Calculator className="w-6 h-6" />
                    Calculate My Tax Credit
                    <ArrowRight className="w-6 h-6" />
                  </span>
                </button>
              </Link>
              
              <button 
                onClick={() => setShowDemo(true)}
                className="flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700 transition-colors"
              >
                <Play className="w-5 h-5" />
                See 2-minute demo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* The Hook Section */}
      <div className="py-16 bg-gradient-to-r from-purple-100 to-blue-100">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white text-center shadow-2xl">
            <div className="text-4xl mb-4">🎯</div>
            <h2 className="text-3xl font-bold mb-6">Wait, what? Yes, really.</h2>
            <p className="text-xl leading-relaxed mb-6">
              If you've spent even 10 hours figuring out how to use ChatGPT, Zapier, or any AI tools to improve your business – you've been doing R&D. The government will literally pay you back for that time.
            </p>
            <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
              <p className="text-lg italic">
                "I thought this was too good to be true until I received my $31,000 refund"
              </p>
              <p className="text-purple-200 text-sm mt-2">- Sarah M., E-commerce Owner</p>
            </div>
          </div>
        </div>
      </div>

      {/* Three Value Props */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 - Real Money */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2">
              <div className="text-center">
                <div className="text-5xl font-black text-green-600 mb-2 animate-pulse">$28,500</div>
                <div className="text-xl font-semibold text-gray-900 mb-2">Average credit amount</div>
                <div className="text-sm text-gray-600 mb-6">Based on 523 SMB calculations</div>
                <div className="bg-green-50 rounded-lg p-4 mb-4">
                  <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-sm text-green-700">Real money, real fast</div>
                </div>
                <Link href="/calculator" className="text-blue-600 font-medium hover:text-blue-700">
                  See calculation breakdown →
                </Link>
              </div>
            </div>

            {/* Card 2 - Complete Package */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-xl font-semibold text-gray-900 mb-4">Complete Filing Package</div>
                <div className="space-y-2 text-sm text-gray-600 mb-6">
                  <div className="flex items-center justify-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>Form 6765</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>Documentation</span>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>CPA letter</span>
                  </div>
                </div>
                <button className="text-blue-600 font-medium hover:text-blue-700">
                  View sample package →
                </button>
              </div>
            </div>

            {/* Card 3 - Multiple Years */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2">
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-orange-600" />
                </div>
                <div className="text-xl font-semibold text-gray-900 mb-4">Claim Multiple Years</div>
                <div className="text-sm text-gray-600 mb-4">Most businesses miss 2-3 years of credits</div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                  <div className="text-sm font-semibold text-orange-800">
                    ⏰ 2022 credits expire July 2026
                  </div>
                </div>
                <button className="text-blue-600 font-medium hover:text-blue-700">
                  Check all eligible years →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* The Opportunity: Why This Credit Is Now For You */}
      <div className="py-20 bg-gradient-to-br from-purple-50 via-blue-50 to-green-50">
        <div className="max-w-6xl mx-auto px-4">
          {/* Main Explainer Card */}
          <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 border-2 border-blue-200 rounded-3xl p-8 shadow-lg">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full px-6 py-3 mb-4">
                <span className="text-2xl">🎯</span>
                <span className="font-bold text-lg">The Opportunity: Why This Credit Is Now For You</span>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                The R&D Tax Credit: From Big Business Secret to Small Business Goldmine
              </h3>
              <p className="text-lg text-gray-700 max-w-4xl mx-auto leading-relaxed">
                For decades, the R&D tax credit was corporate America's best-kept secret — claimed almost exclusively by Fortune 500 companies with teams of specialized tax attorneys. Small businesses were left out, thinking R&D meant lab coats and test tubes.
              </p>
            </div>

            {/* Two Major Shifts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* AI Revolution */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-xl">🚀</span>
                  </div>
                  <h4 className="text-xl font-bold text-gray-900">1. The AI Revolution Hit Main Street</h4>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-green-50 rounded-lg p-4 text-center border border-green-200">
                    <div className="text-2xl font-black text-green-600">87%</div>
                    <div className="text-xs text-green-700">SMBs use AI daily</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-200">
                    <div className="text-2xl font-black text-blue-600">3.2x</div>
                    <div className="text-xs text-blue-700">ChatGPT adoption growth</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 text-center border border-purple-200">
                    <div className="text-2xl font-black text-purple-600">62%</div>
                    <div className="text-xs text-purple-700">10+ hours weekly on AI</div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4 text-center border border-orange-200">
                    <div className="text-2xl font-black text-orange-600">4.7</div>
                    <div className="text-xs text-orange-700">AI tools per business</div>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 italic">2024 SMB Tech Report data</p>
              </div>

              {/* Congress Opened Door */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-green-500 rounded-full flex items-center justify-center">
                    <span className="text-xl">🏛️</span>
                  </div>
                  <h4 className="text-xl font-bold text-gray-900">2. Congress Opened the Door Wide</h4>
                </div>
                
                <p className="text-sm text-gray-700 mb-4">The new tax law specifically expanded what qualifies as R&D:</p>
                
                <div className="space-y-3">
                  {[
                    "Process improvements using AI (even 10% efficiency gains count)",
                    "Experimenting with ChatGPT prompts to improve outcomes", 
                    "Building automations to solve business problems",
                    "Testing new software to enhance operations"
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* IRS Surge Preparation */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-2xl p-6 mb-8">
              <div className="text-center mb-4">
                <h4 className="text-xl font-bold text-orange-900 flex items-center justify-center gap-2">
                  <span>📊</span>
                  The IRS is Preparing for a Surge
                </h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <span className="text-orange-600 font-bold">▸</span>
                    <span className="text-sm text-orange-800"><strong>400% increase</strong> in small business R&D claims expected by 2026</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-orange-600 font-bold">▸</span>
                    <span className="text-sm text-orange-800">New guidance specifically mentions <strong>"AI prompt engineering"</strong> as qualifying</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <span className="text-orange-600 font-bold">▸</span>
                    <span className="text-sm text-orange-800"><strong>Simplified documentation</strong> for businesses under $5M revenue</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-orange-600 font-bold">▸</span>
                    <span className="text-sm text-orange-800"><strong>$2.3 billion</strong> in unclaimed credits by small businesses in 2023 alone</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Why Most SMBs Miss Out */}
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-8">
              <h4 className="text-xl font-bold text-red-900 mb-4 text-center">⚠️ Why Most SMBs Miss Out</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { myth: '"My CPA never mentioned it"', reality: "Traditional CPAs focus on standard deductions, not specialized credits" },
                  { myth: '"We\'re too small"', reality: "False! There's no minimum size. Even solopreneurs qualify" },
                  { myth: '"R&D sounds too complex"', reality: "Using ChatGPT to improve your business IS modern R&D" },
                  { myth: '"We just use AI, not build it"', reality: "Perfect! Testing and implementing AI tools is exactly what qualifies" }
                ].map((item, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border border-red-200">
                    <div className="text-sm font-bold text-red-800 mb-1">{item.myth}</div>
                    <div className="text-xs text-red-700">{item.reality}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Line */}
            <div className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 rounded-2xl p-6 text-white text-center">
              <div className="mb-4">
                <span className="text-3xl mb-3 block">💡</span>
                <h4 className="text-2xl font-bold mb-3">The Bottom Line</h4>
              </div>
              <p className="text-lg leading-relaxed max-w-3xl mx-auto">
                If you've spent time figuring out how to use AI to improve your business — whether that's writing better emails with ChatGPT, automating tasks with Zapier, or analyzing data in new ways — <strong>you've been doing R&D.</strong>
              </p>
              <div className="mt-4 p-4 bg-white/20 backdrop-blur-sm rounded-xl">
                <p className="font-bold text-yellow-200">The government wants to reward you for innovation. You just need to claim it.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Social Proof Strip */}
      <div className="py-12 bg-white border-y border-gray-200">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-600 mb-8">Join 500+ businesses that have claimed their credits</p>
          <div className="flex flex-wrap items-center justify-center gap-8 text-gray-400">
            <div className="bg-gray-100 px-6 py-3 rounded-lg">Tech Startup</div>
            <div className="bg-gray-100 px-6 py-3 rounded-lg">E-commerce</div>
            <div className="bg-gray-100 px-6 py-3 rounded-lg">Agency</div>
            <div className="bg-gray-100 px-6 py-3 rounded-lg">SaaS</div>
            <div className="bg-gray-100 px-6 py-3 rounded-lg">Consultant</div>
            <div className="bg-gray-100 px-6 py-3 rounded-lg">Online Education</div>
          </div>
        </div>
      </div>

      {/* Education Section */}
      <div className="py-20 bg-blue-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">The 2-Minute Context You Need</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* What Changed */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="text-4xl mb-4">📈</div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">What Changed</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <p>2022: Congress expanded R&D credits to include software and AI development</p>
                <p>2024: IRS clarified that SMBs using AI qualify</p>
                <div className="bg-blue-50 px-3 py-2 rounded-lg">
                  <span className="font-semibold text-blue-800">413% increase in SMB claims</span>
                </div>
              </div>
            </div>

            {/* Why Now */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="text-4xl mb-4">⏰</div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Why Now</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <p>July 2026 deadline for amending 2022-2024 returns</p>
                <p>IRS is encouraging claims before regulations tighten</p>
                <div className="bg-green-50 px-3 py-2 rounded-lg">
                  <span className="font-semibold text-green-800">$2.3B unclaimed by small businesses</span>
                </div>
              </div>
            </div>

            {/* Why Most Miss Out */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="text-4xl mb-4">🤷</div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Why Most Miss Out</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <p>CPAs focus on big clients ($5K+ fees)</p>
                <p>Most think 'R&D' means lab coats</p>
                <p>No easy way to calculate... until now</p>
              </div>
            </div>
          </div>

          {/* Trust Builder */}
          <div className="bg-blue-100 border border-blue-200 rounded-xl p-6 text-center">
            <p className="text-blue-800">
              🏛️ This is a real IRS program (Section 41), not a loophole
            </p>
            <button className="text-blue-600 font-medium mt-2 hover:text-blue-700">
              Learn more about the R&D tax credit →
            </button>
          </div>
        </div>
      </div>

      {/* Transition to Action */}
      <div className="py-16 bg-gradient-to-r from-green-500 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Find Out How Much You Could Claim</h2>
          <p className="text-xl mb-6">Our calculator uses the same methodology as Big 4 accounting firms, simplified for small businesses</p>
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="flex">
              {[1,2,3,4,5].map(i => (
                <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
              ))}
            </div>
            <span className="ml-2">4.9/5 from 500+ businesses</span>
          </div>
          <Link href="#calculator">
            <button className="bg-white text-blue-600 py-4 px-8 rounded-xl font-bold text-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
              Start Free Calculation →
            </button>
          </Link>
        </div>
      </div>

      {/* Assessment Section */}
      <div id="calculator" className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 text-sm text-gray-600 bg-white rounded-full px-4 py-2 mb-4">
              <span>Step 1 of 4</span>
              <span>•</span>
              <span>Save progress anytime</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Your R&D Tax Credit Assessment</h2>
            <p className="text-xl text-gray-600">Let's find money you're leaving on the table</p>
          </div>

          {/* Qualification Discovery */}
          <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">First, let's see what qualifies ✨</h3>
              <p className="text-gray-600">Check all that apply (even partial use counts!)</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {activities.map((activity) => (
                <div 
                  key={activity.id}
                  className={`border-2 rounded-xl p-4 cursor-pointer transition-all hover:shadow-md ${
                    selectedActivities.includes(activity.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleActivityToggle(activity.id)}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedActivities.includes(activity.id)}
                      onChange={() => handleActivityToggle(activity.id)}
                      className="w-5 h-5 text-blue-600 rounded mt-1"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 mb-1">{activity.label}</div>
                      <div className="text-sm text-gray-600">{activity.example}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Smart Response */}
            {selectedActivities.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <p className="text-green-800 font-medium">{getQualificationMessage()}</p>
              </div>
            )}
          </div>

          {/* Continue to Full Calculator */}
          <div className="text-center">
            <Link href="/calculator">
              <button 
                className="bg-gradient-to-r from-blue-600 to-green-600 text-white py-4 px-8 rounded-xl font-bold text-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50"
                disabled={selectedActivities.length === 0}
              >
                <span className="flex items-center gap-3">
                  <Calculator className="w-6 h-6" />
                  Calculate My Credit
                  <ArrowRight className="w-6 h-6" />
                </span>
              </button>
            </Link>
            
            <div className="flex items-center justify-center gap-4 mt-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-600" />
                <span>Your data is encrypted and never shared</span>
              </div>
            </div>
            
            <div className="mt-4">
              <button className="text-blue-600 font-medium hover:text-blue-700">
                Not sure? Chat with us →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Modal */}
      {showDemo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">2-Minute Demo</h3>
              <div className="bg-gray-100 rounded-lg p-12 mb-6">
                <Play className="w-16 h-16 text-gray-400 mx-auto" />
                <p className="text-gray-600 mt-4">Demo video would be embedded here</p>
              </div>
              <button 
                onClick={() => setShowDemo(false)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-xl flex items-center justify-center">
                <Calculator className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold">SMBTaxCredits.com</span>
            </div>
            <p className="text-gray-400 max-w-2xl mx-auto">
              The trusted platform for small and medium businesses to claim R&D tax credits. 
              We've helped 500+ businesses recover millions in credits they didn't know they were owed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/calculator" className="hover:text-white">R&D Credit Calculator</Link></li>
                <li><a href="#" className="hover:text-white">Document Preparation</a></li>
                <li><a href="#" className="hover:text-white">Multi-Year Claims</a></li>
                <li><a href="#" className="hover:text-white">Amendment Services</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">AI Qualification Guide</a></li>
                <li><a href="#" className="hover:text-white">IRS Requirements</a></li>
                <li><a href="#" className="hover:text-white">Case Studies</a></li>
                <li><a href="#" className="hover:text-white">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Live Chat</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Schedule Consultation</a></li>
                <li><a href="#" className="hover:text-white">Technical Support</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="text-gray-400 text-sm mb-4 md:mb-0">
                © 2024 SMBTaxCredits.com. All rights reserved. We help businesses claim legitimate R&D tax credits.
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>Secure & Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-500" />
                  <span>IRS Approved Methods</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;