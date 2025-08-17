import React from 'react';

export default function Logo({ className = "text-5xl md:text-7xl" }: { className?: string }) {
  return (
    <div className={`${className}`}>
      <img 
        src="/voyant-logo.png" 
        alt="VOYANT Logo" 
        className="h-16 md:h-20 w-auto"
      />
    </div>
  );
}
