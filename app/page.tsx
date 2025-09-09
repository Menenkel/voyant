import Hero from "@/components/Hero";
import DestinationSearch from "@/components/DestinationSearch";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <Hero />
      
      {/* Search Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24">
        <DestinationSearch />
      </div>
      
      {/* Pricing CTA Section */}
      <div className="bg-white border-t-2 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-black mb-4 animate-fade-in">
              Ready to Travel Smarter?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8 animate-fade-in-delay">
              Unlock unlimited destination insights, advanced risk analysis, and personalized travel recommendations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-delay" style={{animationDelay: '0.2s'}}>
              <Link
                href="/pricing"
                className="bg-black text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-white transition-all duration-300 hover-lift hover-glow border-2 border-black"
              >
                View Pricing Plans
              </Link>
              <Link
                href="/features"
                className="text-black hover:text-gray-600 px-8 py-3 font-medium transition-colors"
              >
                Learn More →
              </Link>
            </div>
          </div>
        </div>
      </div>
      

    </div>
  );
}
