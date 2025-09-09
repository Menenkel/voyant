import React from 'react';

interface VoyantLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function VoyantLogo({ size = 'md', className = '' }: VoyantLogoProps) {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'h-16 md:h-20 w-auto'
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <svg 
        viewBox="0 0 200 60" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Lighthouse (replaces the L in VOYANT) */}
        <g>
          {/* Lighthouse base */}
          <rect x="12" y="35" width="6" height="18" fill="#000000" rx="1"/>
          {/* Lighthouse tower */}
          <rect x="10" y="20" width="10" height="15" fill="#000000" rx="1"/>
          {/* Lighthouse top cone */}
          <path d="M10 20 L15 8 L20 20 Z" fill="#000000"/>
          {/* Light beams */}
          <path d="M15 12 L6 8 L15 4" fill="#000000" opacity="0.6"/>
          <path d="M15 12 L24 8 L15 4" fill="#000000" opacity="0.6"/>
          {/* Lighthouse windows */}
          <circle cx="15" cy="28" r="0.8" fill="#FFFFFF"/>
          <circle cx="15" cy="32" r="0.8" fill="#FFFFFF"/>
        </g>
        
        {/* VOYANT text */}
        <text x="35" y="38" fill="#000000" fontSize="24" fontWeight="bold" fontFamily="Arial, sans-serif">
          VOYANT
        </text>
      </svg>
    </div>
  );
}
