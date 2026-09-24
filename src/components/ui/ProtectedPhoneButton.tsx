'use client';

import React, { useState } from 'react';
import { Phone, Eye } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface ProtectedPhoneButtonProps {
  phone: string;
  className?: string;
  variant?: 'card' | 'detail';
}

export default function ProtectedPhoneButton({
  phone,
  className = '',
  variant = 'card',
}: ProtectedPhoneButtonProps) {
  const [revealed, setRevealed] = useState(false);
  const { isAr } = useLanguage();

  if (!phone) return null;

  // Masked format for scrapers: e.g. "+971 50 ••• ••••"
  const getMaskedPhone = (num: string) => {
    const clean = num.replace(/\s+/g, '');
    if (clean.length > 6) {
      return `${clean.slice(0, 7)} ••• ••••`;
    }
    return '••••••••••';
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!revealed) {
      e.preventDefault();
      e.stopPropagation();
      setRevealed(true);
    }
    // If already revealed, default link behavior (tel:) proceeds naturally
  };

  if (variant === 'detail') {
    return (
      <div className={`space-y-2 ${className}`}>
        {revealed ? (
          <a
            href={`tel:${phone}`}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition shadow-sm"
          >
            <Phone className="w-4 h-4" />
            <span dir="ltr">{phone}</span>
          </a>
        ) : (
          <button
            type="button"
            onClick={handleClick}
            className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition shadow-xs"
          >
            <Eye className="w-4 h-4 text-emerald-600" />
            <span dir="ltr" className="font-mono text-xs sm:text-sm">
              {getMaskedPhone(phone)}
            </span>
            <span className="text-xs bg-emerald-600 text-white px-2 py-0.5 rounded-md font-semibold ml-1">
              {isAr ? 'إظهار الرقم' : 'Show Number'}
            </span>
          </button>
        )}
      </div>
    );
  }

  // Card Variant (Compact for ListingCard)
  return (
    <div className={className}>
      {revealed ? (
        <a
          href={`tel:${phone}`}
          onClick={(e) => e.stopPropagation()}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 shadow-2xs transition"
        >
          <Phone className="w-3 h-3" />
          <span dir="ltr" className="truncate">{phone}</span>
        </a>
      ) : (
        <button
          type="button"
          onClick={handleClick}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 shadow-2xs transition"
          title={isAr ? 'انقر لإظهار رقم البائع' : 'Click to reveal phone number'}
        >
          <Phone className="w-3 h-3" />
          <span>{isAr ? 'إظهار الرقم' : 'Call Seller'}</span>
        </button>
      )}
    </div>
  );
}
