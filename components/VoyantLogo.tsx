import React from 'react';

interface VoyantLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function VoyantLogo({ size = 'md', className = '' }: VoyantLogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
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
          <rect x="12" y="35" width="6" height="18" fill="#F59E0B" rx="1"/>
          {/* Lighthouse tower */}
          <rect x="10" y="20" width="10" height="15" fill="#F59E0B" rx="1"/>
          {/* Lighthouse top cone */}
          <path d="M10 20 L15 8 L20 20 Z" fill="#F59E0B"/>
          {/* Light beams */}
          <path d="M15 12 L6 8 L15 4" fill="#FBBF24" opacity="0.8"/>
          <path d="M15 12 L24 8 L15 4" fill="#FBBF24" opacity="0.8"/>
          {/* Lighthouse windows */}
          <circle cx="15" cy="28" r="0.8" fill="#1F2937"/>
          <circle cx="15" cy="32" r="0.8" fill="#1F2937"/>
        </g>
        
        {/* VOYANT text */}
        <text x="35" y="38" fill="#F59E0B" fontSize="24" fontWeight="bold" fontFamily="Arial, sans-serif">
          VOYANT
        </text>
      </svg>
    </div>
  );
}
