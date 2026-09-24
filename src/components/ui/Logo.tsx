'use client';

import React from 'react';
import Link from 'next/link';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showBadge?: boolean;
}

export default function Logo({ className = '', size = 'md', showBadge = true }: LogoProps) {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <Link href="/" className={`inline-flex items-center gap-2.5 group ${className}`}>
      {/* Dynamic Emblem */}
      <div className={`${iconSizes[size]} bg-slate-950 rounded-xl p-1.5 shadow-sm group-hover:scale-105 transition-transform flex items-center justify-center flex-shrink-0 border border-slate-800`}>
        <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
          {/* Aerodynamic Roofline */}
          <path
            d="M 6 25 C 10 16, 17 12, 25 12 C 30 12, 34 14, 36 18"
            stroke="#e03a14"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Bodyline */}
          <path
            d="M 5 27 L 10 27 A 3 3 0 0 1 16 27 L 26 27 A 3 3 0 0 1 32 27 L 36 27"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Subtle M Monogram in center */}
          <path
            d="M 14 23 L 18 17 L 21 22 L 24 17 L 28 23"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Brand Typography */}
      <div className="flex items-center gap-1.5">
        <span className={`font-black tracking-tight text-slate-900 group-hover:text-[#e03a14] transition leading-none ${textSizes[size]}`}>
          memycar<span className="text-[#e03a14]">.com</span>
        </span>

        {showBadge && (
          <span className="bg-slate-100 text-slate-700 text-[10px] font-black px-1.5 py-0.5 rounded border border-slate-200 uppercase tracking-wider">
            UAE
          </span>
        )}
      </div>
    </Link>
  );
}
