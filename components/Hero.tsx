import Link from 'next/link';

export default function Hero() {
  return (
    <div className="relative bg-gray-900 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-yellow-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-500/8 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-in">
            <span className="text-yellow-400">VOYANT</span>
          </h1>
          <p className="text-xl md:text-2xl text-yellow-400 mb-8 animate-fade-in-delay">
            Discover, compare, and prepare — get travel risk ratings and live updates before you go.
          </p>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-8 animate-fade-in-delay-2">
            New York's water quality? Mexico City's next heat wave? Demonstrations in Kenya? We've got you covered.
          </p>
          
          <div className="flex justify-center animate-fade-in-delay-3">
            <Link 
              href="/features"
              className="border-2 border-yellow-500 text-yellow-400 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-yellow-500 hover:text-black focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-200 hover-lift"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
