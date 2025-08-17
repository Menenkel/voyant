'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-gray-900 border-b border-yellow-500/30 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center group-hover:bg-yellow-400 transition-colors duration-200">
                <span className="text-black font-bold text-lg">V</span>
              </div>
              <div className="flex flex-col">
                <span className="text-white font-bold text-xl group-hover:text-yellow-400 transition-colors duration-200">
                  VOYANT
                </span>
                <span className="text-yellow-400 text-xs font-medium">
                  Travel smarter. Stay safer.
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link className="text-white hover:text-yellow-400 px-3 py-2 text-sm font-medium transition-all duration-200 hover-lift" href="/">
              Search
            </Link>
            <Link className="text-white hover:text-yellow-400 px-3 py-2 text-sm font-medium transition-all duration-200 hover-lift" href="/features">
              Features
            </Link>
            <Link className="text-white hover:text-yellow-400 px-3 py-2 text-sm font-medium transition-all duration-200 hover-lift" href="/pricing">
              Pricing
            </Link>
            <Link className="text-white hover:text-yellow-400 px-3 py-2 text-sm font-medium transition-all duration-200 hover-lift" href="/contact">
              Contact
            </Link>
            <button className="bg-yellow-500 text-black px-4 py-2 rounded-md font-medium hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-black transition-all duration-200 hover-lift">
              Login
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white hover:text-yellow-400 p-2"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-gray-800 border-t border-yellow-500/30">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link 
                href="/"
                className="text-white hover:text-yellow-400 block px-3 py-2 text-sm font-medium transition-all duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Search
              </Link>
              <Link 
                href="/features"
                className="text-white hover:text-yellow-400 block px-3 py-2 text-sm font-medium transition-all duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link 
                href="/pricing"
                className="text-white hover:text-yellow-400 block px-3 py-2 text-sm font-medium transition-all duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link 
                href="/contact"
                className="text-white hover:text-yellow-400 block px-3 py-2 text-sm font-medium transition-all duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </Link>
              <button className="w-full text-left bg-yellow-500 text-black px-3 py-2 rounded-md font-medium hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200">
                Login
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
