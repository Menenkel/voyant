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
    <div className="relative bg-white overflow-hidden min-h-[25vh] flex items-center justify-center">

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8">
        <div className="text-center">
          {/* Centered Logo */}
          <div className="mb-6 animate-fade-in flex justify-center">
            <Logo className="text-4xl md:text-6xl logo-gentle-float" />
          </div>
          
          {/* Tagline */}
          <p className="text-lg md:text-xl text-gray-600 mb-6 animate-fade-in-delay tagline-shimmer">
            Discover, compare, and prepare — get travel risk ratings and live updates before you go.
          </p>
          
          {/* Cycling Questions */}
          <div className="text-base md:text-lg text-black max-w-4xl mx-auto animate-fade-in-delay-2 min-h-[1.5rem] flex items-center justify-center">
            <span className="transition-all duration-500 ease-in-out question-smooth-transition">
              {questions[currentQuestionIndex]}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
