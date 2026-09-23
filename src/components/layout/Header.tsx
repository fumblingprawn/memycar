'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useLanguage } from '@/context/LanguageContext';
import { User, LogIn, LayoutDashboard, Plus } from 'lucide-react';

export default function Header() {
  const router = useRouter();
  const supabase = createClient();
  const { t, toggleLanguage, isAr, locale } = useLanguage();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // 1. Get initial session
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user ?? null);
    });

    // 2. Listen to login/logout events in real-time
    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-black text-slate-900 tracking-tight">
              memycar<span className="text-[#e03a14]">.com</span>
            </span>
          </Link>
          <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
            UAE
          </span>
        </div>

        {/* Right Navigation Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Search Shortcut */}
          <Link
            href="/search"
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-lg hover:bg-slate-50 transition"
          >
            {t('search')}
          </Link>

          {/* Sell Car CTA */}
          <Link
            href="/sell"
            className="bg-[#e03a14] hover:bg-[#c53210] text-white text-xs font-bold py-2 px-3.5 rounded-xl transition flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('sellCar')}</span>
          </Link>

          {/* Auth Button: Login OR Dashboard */}
          {user ? (
            <Link
              href="/dashboard"
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2 px-3 rounded-xl transition flex items-center gap-1.5 border border-slate-200"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-[#e03a14]" />
              <span className="hidden sm:inline">{t('dashboard')}</span>
            </Link>
          ) : (
            <Link
              href="/auth"
              className="border border-slate-300 hover:border-slate-400 text-slate-700 text-xs font-bold py-2 px-3 rounded-xl transition flex items-center gap-1.5 bg-white shadow-2xs"
            >
              <LogIn className="w-3.5 h-3.5 text-slate-500" />
              <span>{t('login')}</span>
            </Link>
          )}

          {/* Language Switcher Pill */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold py-1.5 px-2.5 rounded-xl transition flex items-center gap-1"
          >
            <span>{isAr ? 'English' : 'العربية'}</span>
            <span className="text-[11px]">🌐</span>
          </button>
        </div>
      </div>
    </header>
  );
}
