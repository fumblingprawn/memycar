'use client';

import React, { useState } from 'react';
import { Phone } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface ProtectedPhoneButtonProps {
  phone: string;
  className?: string;
  variant?: 'card' | 'detail';
}

export default function ProtectedPhoneButton({
  phone,
  className = '',
  variant = 'detail',
}: ProtectedPhoneButtonProps) {
  const [revealed, setRevealed] = useState(false);
  const { isAr } = useLanguage();

  if (!phone) return null;

  // Clean single-line UAE masking (e.g., "+971 5• ••• ••••")
  const getMaskedDisplay = (raw: string) => {
    const clean = raw.trim();
    if (clean.startsWith('+971')) {
      return '+971 5• ••• ••••';
    }
    if (clean.startsWith('05')) {
      return '05• ••• ••••';
    }
    if (clean.length > 5) {
      return `${clean.slice(0, 4)} ••• ••••`;
    }
    return '+971 •• ••• ••••';
  };

  const handleReveal = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setRevealed(true);
  };

  // Detail Page Variant: Bold, full-width action button
  if (variant === 'detail') {
    if (revealed) {
      return (
        <a
          href={`tel:${phone}`}
          className={`w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2.5 transition shadow-xs text-sm ${className}`}
        >
          <Phone className="w-4 h-4 text-white shrink-0" />
          <span dir="ltr" className="tracking-wide font-mono font-semibold">{phone}</span>
        </a>
      );
    }

    return (
      <button
        type="button"
        onClick={handleReveal}
        className={`w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-between transition shadow-xs text-sm group ${className}`}
        title={isAr ? 'انقر لإظهار رقم الهاتف' : 'Click to show phone number'}
      >
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-emerald-100 group-hover:scale-105 transition-transform shrink-0" />
          <span>{isAr ? 'الاتصال بالبائع' : 'Call Seller'}</span>
        </div>
        <span
          dir="ltr"
          className="text-xs bg-emerald-700/80 group-hover:bg-emerald-700 text-emerald-100 px-2 py-0.5 rounded-md font-mono tracking-wider transition"
        >
          {getMaskedDisplay(phone)}
        </span>
      </button>
    );
  }

  // Card Variant: Compact for listing feeds
  if (revealed) {
    return (
      <a
        href={`tel:${phone}`}
        onClick={(e) => e.stopPropagation()}
        className={`w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 shadow-2xs transition ${className}`}
      >
        <Phone className="w-3 h-3 shrink-0" />
        <span dir="ltr" className="truncate font-mono">{phone}</span>
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={handleReveal}
      className={`w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 shadow-2xs transition ${className}`}
      title={isAr ? 'إظهار الرقم' : 'Show Number'}
    >
      <Phone className="w-3 h-3 shrink-0" />
      <span>{isAr ? 'اتصال بالبائع' : 'Call Seller'}</span>
    </button>
  );
}
