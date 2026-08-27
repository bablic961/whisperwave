// components/shared/AnimatedLogo.tsx
'use client';

import { useEffect, useRef } from 'react';

interface AnimatedLogoProps {
  className?: string;
  size?: number;
}

export function AnimatedLogo({ className = '', size = 40 }: AnimatedLogoProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const path = svgRef.current.querySelector('.wave-path');
    if (path && path instanceof HTMLElement) {
      path.style.animation = 'wave 3s ease-in-out infinite';
    }
  }, []);

  return (
    <svg
      ref={svgRef}
      className={`animate-pulse-glow ${className}`}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Wave animation path */}
      <path
        className="wave-path"
        d="M20 50 Q35 20, 50 50 T80 50"
        stroke="url(#waveGradient)"
        strokeWidth="8"
        fill="none"
        strokeLinecap="round"
      />

      {/* Ripple effect circles */}
      <circle cx="50" cy="50" r="20" stroke="#00D4FF" strokeWidth="2" opacity="0.5">
        <animate attributeName="r" from="20" to="40" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" from="0.5" to="0" dur="2s" repeatCount="indefinite" />
      </circle>

      <circle cx="50" cy="50" r="10" stroke="#7C3AED" strokeWidth="2" opacity="0.7">
        <animate attributeName="r" from="10" to="30" dur="1.5s" repeatCount="indefinite" />
        <animate attributeName="opacity" from="0.7" to="0" dur="1.5s" repeatCount="indefinite" />
      </circle>

      <defs>
        <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00D4FF" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
      </defs>
    </svg>
  );
}
