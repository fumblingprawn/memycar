'use client';

import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function Header() {
  const { locale, dir } = useLanguage();

  return (
    <header className="bg-white border-b border-slate-100">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo and Brand */}
        <Link href="/" className="flex items-center gap-2 transition-all duration-300 hover:-translate-y-1">
          <span className="font-black text-xl tracking-tight text-gray-900">
            memycar<span className="text-[#e03a14]">.com</span>
          </span>
          <span className="hidden sm:inline-block text-[10px] font-bold bg-[#f4f4f4] text-slate-600 px-2 py-0.5 rounded-full uppercase tracking-wider">
            UAE
          </span>
        </Link>

        {/* Navigation and Actions */}
        <div className="flex items-center gap-4">
          {/* Search Links */}
          <Link
            href="/"
            className="text-sm font-medium text-gray-600 hover:text-gray-800"
          >
            Search
          </Link>
          <Link
            href="/sell"
            className="flex items-center gap-1.5 bg-[#e03a14] hover:bg-[#c53210] text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all duration-300 hover:-translate-y-1"
          >
            <Plus className="w-4 h-4" />
            Sell Your Car
          </Link>

          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => {
                // Language toggle would be handled by context
                // For now, we'll just show a placeholder
                alert('Language switching would be implemented here');
              }}
              className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-800"
            >
              {locale === 'en' ? 'EN' : 'AR'}
              <span className="text-xs">▼</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}