'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Plus, Globe } from 'lucide-react';

export default function Header() {
  const [locale, setLocale] = useState<'en' | 'ar'>('en');

  useEffect(() => {
    const saved = localStorage.getItem('memycar_lang') as 'en' | 'ar' | null;
    if (saved && (saved === 'en' || saved === 'ar')) {
      setLocale(saved);
      document.documentElement.lang = saved;
      document.documentElement.dir = saved === 'ar' ? 'rtl' : 'ltr';
    }
  }, []);

  const toggleLanguage = () => {
    const next = locale === 'en' ? 'ar' : 'en';
    setLocale(next);
    localStorage.setItem('memycar_lang', next);
    document.documentElement.lang = next;
    document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr';
  };

  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2">
          <span className="font-black text-xl tracking-tight text-slate-900">
            memycar<span className="text-[#e03a14]">.com</span>
          </span>
          <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full uppercase tracking-wider">
            UAE
          </span>
        </Link>

        {/* Navigation & Actions */}
        <div className="flex items-center gap-4">
          <Link
            href="/search"
            className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            <Search className="w-4 h-4 text-slate-400" />
            <span>{locale === 'ar' ? 'بحث' : 'Search'}</span>
          </Link>

          <Link
            href="/sell"
            className="flex items-center gap-1.5 bg-[#e03a14] hover:bg-[#c53210] text-white font-bold text-xs px-4 py-2 rounded-xl transition"
          >
            <Plus className="w-4 h-4" />
            <span>{locale === 'ar' ? 'بيع سيارتك' : 'Sell Your Car'}</span>
          </Link>

          {/* Functional Language Toggle */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="flex items-center gap-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition"
          >
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>{locale === 'en' ? 'العربية' : 'English'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
