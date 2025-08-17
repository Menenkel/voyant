import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing - TravelRisk',
  description: 'Choose your plan and get comprehensive travel safety insights. Free, Pro, and Premium plans available.',
};

const pricingPlans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for occasional travelers',
    features: [
      '20 destination queries per month',
      'Basic risk assessments',
      'Standard weather data',
      'Community support'
    ],
    cta: 'Get Started',
    ctaVariant: 'secondary',
    popular: false
  },
  {
    name: 'Pro',
    price: '$9.99',
    period: 'per month',
    description: 'Ideal for frequent travelers',
    features: [
      'Unlimited destination queries',
      'Advanced risk insights',
      'Historical pattern analysis',
      'Customizable notifications',
      'Priority support',
      'Save destinations for offline use'
    ],
    cta: 'Start Free Trial',
    ctaVariant: 'primary',
    popular: true
  },
  {
    name: 'Premium',
    price: '$19.99',
    period: 'per month',
    description: 'For travel professionals',
    features: [
      'All Pro features',
      'Personalized recommendations',
      'Early access to new features',
      'Exclusive travel alerts',
      'API access',
      'Dedicated account manager'
    ],
    cta: 'Contact Sales',
    ctaVariant: 'secondary',
    popular: false
  }
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4 animate-fade-in">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto animate-fade-in-delay">
            Get the travel safety insights you need, when you need them.
          </p>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <div
              key={plan.name}
              className={`relative bg-gray-800 rounded-2xl p-8 border transition-all duration-300 hover-lift ${
                plan.popular 
                  ? 'border-yellow-500/50 shadow-lg shadow-yellow-500/10' 
                  : 'border-gray-700 hover:border-yellow-500/30'
              } animate-fade-in`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-yellow-500 text-black px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Plan Header */}
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-400 ml-2">{plan.period}</span>
                </div>
                <p className="text-gray-300">{plan.description}</p>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <svg
                      className="w-5 h-5 text-yellow-400 mt-0.5 mr-3 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 ${
                  plan.ctaVariant === 'primary'
                    ? 'bg-yellow-500 text-black hover:bg-yellow-400 focus:ring-yellow-500 hover-glow'
                    : 'bg-gray-700 text-white hover:bg-gray-600 focus:ring-gray-500 hover-lift'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-12 animate-fade-in">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 animate-fade-in-delay">
              <h3 className="text-lg font-semibold text-white mb-2">
                Can I change my plan anytime?
              </h3>
              <p className="text-gray-300">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 animate-fade-in-delay" style={{animationDelay: '0.2s'}}>
              <h3 className="text-lg font-semibold text-white mb-2">
                What happens if I exceed my monthly queries?
              </h3>
              <p className="text-gray-300">
                Free users will be prompted to upgrade to Pro for unlimited access. Pro and Premium users have no limits.
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 animate-fade-in-delay" style={{animationDelay: '0.4s'}}>
              <h3 className="text-lg font-semibold text-white mb-2">
                Is there a free trial?
              </h3>
              <p className="text-gray-300">
                Pro plan includes a 14-day free trial. No credit card required to start exploring.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16 animate-fade-in-delay" style={{animationDelay: '0.6s'}}>
          <p className="text-gray-300 mb-4">
            Still have questions? We're here to help.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center text-yellow-400 hover:text-yellow-300 transition-colors"
          >
            Contact Support
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
