'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut, loading } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white border-b-2 border-black sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="flex flex-col">
                <span className="text-black font-bold text-xl group-hover:text-gray-600 transition-colors duration-200">
                  VOYANT
                </span>
                <span className="text-gray-600 text-sm font-medium">
                  Travel smarter. Stay safer.
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link className="text-black hover:text-gray-600 px-3 py-2 text-sm font-medium transition-all duration-200 hover-lift border-b-2 border-transparent hover:border-black" href="/">
              Search Destinations
            </Link>
            <Link className="text-black hover:text-gray-600 px-3 py-2 text-sm font-medium transition-all duration-200 hover-lift border-b-2 border-transparent hover:border-black" href="/features">
              Features
            </Link>
            <Link className="text-black hover:text-gray-600 px-3 py-2 text-sm font-medium transition-all duration-200 hover-lift border-b-2 border-transparent hover:border-black" href="/pricing">
              Pricing
            </Link>
            <Link className="text-black hover:text-gray-600 px-3 py-2 text-sm font-medium transition-all duration-200 hover-lift border-b-2 border-transparent hover:border-black" href="/contact">
              Contact
            </Link>
            
            {/* Auth Buttons */}
            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-600 text-sm">
                      Welcome, {user.email?.split('@')[0]}
                    </span>
                    <button 
                      onClick={handleSignOut}
                      className="bg-black text-white px-4 py-2 rounded-md font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-white transition-all duration-200 hover-lift border-2 border-black"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <Link 
                    href="/login"
                    className="bg-black text-white px-4 py-2 rounded-md font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-white transition-all duration-200 hover-lift border-2 border-black"
                  >
                    Login
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-black hover:text-gray-600 p-2"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t-2 border-black">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link 
                href="/"
                className="text-black hover:text-gray-600 block px-3 py-2 text-sm font-medium transition-all duration-200 border-b border-gray-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Search Destinations
              </Link>
              <Link 
                href="/features"
                className="text-black hover:text-gray-600 block px-3 py-2 text-sm font-medium transition-all duration-200 border-b border-gray-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link 
                href="/pricing"
                className="text-black hover:text-gray-600 block px-3 py-2 text-sm font-medium transition-all duration-200 border-b border-gray-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link 
                href="/contact"
                className="text-black hover:text-gray-600 block px-3 py-2 text-sm font-medium transition-all duration-200 border-b border-gray-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </Link>
              
              {/* Mobile Auth Buttons */}
              {!loading && (
                <>
                  {user ? (
                    <div className="px-3 py-2">
                      <div className="text-gray-600 text-sm mb-2">
                        Welcome, {user.email?.split('@')[0]}
                      </div>
                      <button 
                        onClick={handleSignOut}
                        className="w-full bg-black text-white px-3 py-2 rounded-md font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-white transition-all duration-200 border-2 border-black"
                      >
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <Link 
                      href="/login"
                      className="w-full text-left bg-black text-white px-3 py-2 rounded-md font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-white transition-all duration-200 border-2 border-black"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
