import Link from 'next/link';

export default function FeaturesPage() {
  const features = [
    {
      id: 1,
      title: "Real-Time Insights",
      description: "Instantly access up-to-date travel, safety, and environmental information for any destination.",
      color: "from-yellow-500 to-yellow-600"
    },
    {
      id: 2,
      title: "Advanced Weather & Climate Data",
      description: "Plan ahead with state-of-the-art forecasts, showing conditions months in advance.",
      color: "from-yellow-500 to-yellow-600"
    },
    {
      id: 3,
      title: "Risk Comparison",
      description: "Compare hazards across cities or countries to make smarter travel and booking decisions.",
      color: "from-yellow-500 to-yellow-600"
    },
    {
      id: 4,
      title: "Subscribe to Updates",
      description: "Receive personalized alerts by email or notifications to stay prepared for both personal and professional trips.",
      color: "from-yellow-500 to-yellow-600"
    },
    {
      id: 5,
      title: "Destination News Feed",
      description: "Follow curated news and developments for your selected city or country in one place.",
      color: "from-yellow-500 to-yellow-600"
    },
    {
      id: 6,
      title: "AI-Powered Contextualization",
      description: "Let our AI engine synthesize data and insights, providing clear guidance tailored to your travel plans.",
      color: "from-yellow-500 to-yellow-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-yellow-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-fade-in">
              VOYANT <span className="text-yellow-400">Features</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto animate-fade-in-delay">
              Discover how VOYANT helps you travel smarter and stay safer with our comprehensive risk assessment platform.
            </p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={feature.id}
              className="bg-gray-800 rounded-lg p-8 border-2 border-yellow-500/30 shadow-lg hover:border-yellow-400/50 transition-all duration-300 hover:shadow-yellow-500/10 hover-lift animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <h3 className="text-xl font-semibold text-yellow-400 mb-4 text-center">
                {feature.title}
              </h3>
              <p className="text-gray-300 text-center leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-800 border-t border-yellow-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4 animate-fade-in">
              Ready to Start Exploring?
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8 animate-fade-in-delay">
              Try our destination comparison feature and see how VOYANT can help you make informed travel decisions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-delay" style={{animationDelay: '0.2s'}}>
              <Link
                href="/"
                className="bg-yellow-500 text-black px-8 py-3 rounded-lg font-medium hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-300 hover-lift hover-glow"
              >
                Start Searching
              </Link>
              <Link
                href="/pricing"
                className="text-yellow-400 hover:text-yellow-300 px-8 py-3 font-medium transition-colors"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}