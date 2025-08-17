'use client';

import { useState, useEffect } from 'react';

export default function ScrollProgressBar() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(progress);
    };

    // Update on mount
    updateScrollProgress();
    
    window.addEventListener('scroll', updateScrollProgress);
    window.addEventListener('resize', updateScrollProgress);
    
    return () => {
      window.removeEventListener('scroll', updateScrollProgress);
      window.removeEventListener('resize', updateScrollProgress);
    };
  }, []);

  return (
    <div className="fixed left-4 top-0 h-full z-50 lg:block">
      <div className="relative h-full flex items-center">
        {/* Progress bar background - full height */}
        <div className="w-1 h-full bg-gray-700 rounded-full">
          {/* Progress bar fill */}
          <div 
            className="w-1 bg-gradient-to-t from-yellow-500 to-yellow-400 rounded-full transition-all duration-300 ease-out"
            style={{ 
              height: `${Math.min(scrollProgress, 100)}%`,
              transform: 'translateY(100%)',
              transformOrigin: 'bottom'
            }}
          />
        </div>
        
        {/* Progress indicator */}
        <div className="absolute -right-2 top-0 transform -translate-y-1/2">
          <div className="w-5 h-5 bg-yellow-500 rounded-full border-2 border-gray-900 shadow-lg flex items-center justify-center">
            <span className="text-xs font-bold text-black">
              {Math.round(scrollProgress)}%
            </span>
          </div>
        </div>
        
        {/* Scroll hint */}
        {scrollProgress < 10 && (
          <div className="absolute -right-8 top-1/2 transform -translate-y-1/2 opacity-60">
            <div className="w-6 h-6 border-l-2 border-b-2 border-yellow-400 transform rotate-45 animate-bounce"></div>
          </div>
        )}
      </div>
    </div>
  );
}
