'use client';

// import Link from 'next/link';
import Logo from './Logo';
import { useState, useEffect } from 'react';

export default function Hero() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  const questions = [
    "Is New York's tap water safe to drink?",
    "When's the next heat wave in Mexico City?",
    "Are election protests expected in Nairobi?",
    "What's the air quality in Beijing?",
    "Do I need malaria pills for Mozambique?",
    "What’s the tsunami risk in Fiji?"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuestionIndex((prevIndex) => 
        prevIndex === questions.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000); // Change question every 3 seconds

    return () => clearInterval(interval);
  }, [questions.length]);

  return (
    <div className="relative bg-gray-900 overflow-hidden min-h-[40vh] flex items-center justify-center">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-yellow-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-500/8 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center">
          {/* Centered Logo */}
          <div className="mb-6 animate-fade-in flex justify-center">
            <Logo className="text-4xl md:text-6xl" />
          </div>
          
          {/* Tagline */}
          <p className="text-lg md:text-xl text-yellow-400 mb-6 animate-fade-in-delay">
            Discover, compare, and prepare — get travel risk ratings and live updates before you go.
          </p>
          
          {/* Cycling Questions */}
          <div className="text-base md:text-lg text-gray-300 max-w-4xl mx-auto animate-fade-in-delay-2 min-h-[1.5rem] flex items-center justify-center">
            <span className="transition-all duration-500 ease-in-out">
              {questions[currentQuestionIndex]}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
