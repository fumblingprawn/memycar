import Logo from "@/components/ui/Logo";
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { createClient } from '@/lib/supabase/client';
import { 
  PlusCircle, 
  Search, 
  LayoutDashboard, 
  LogIn, 
  Menu, 
  X, 
  Globe
} from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const supabase = createClient();
  const { t, locale, toggleLanguage, isAr } = useLanguage();

  const [user, setUser] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    }
    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Brand Logo */}
          <div className="flex items-center gap-2">
            <Logo size="md" />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4">
            <Link
              href="/search"
              className="text-xs font-bold text-slate-700 hover:text-[#e03a14] transition flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-50"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              {t('search')}
            </Link>

            <Link
              href="/sell"
              className="bg-[#e03a14] hover:bg-[#c53210] text-white text-xs font-bold py-2 px-3.5 rounded-xl transition flex items-center gap-1.5 shadow-2xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              {t('sellCar')}
            </Link>

            {user ? (
              <Link
                href="/dashboard"
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2 px-3.5 rounded-xl transition flex items-center gap-1.5"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-slate-500" />
                {t('myDashboard')}
              </Link>
            ) : (
              <Link
                href="/auth"
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2 px-3.5 rounded-xl transition flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5 text-slate-500" />
                {t('login')}
              </Link>
            )}

            <button
              type="button"
              onClick={toggleLanguage}
              className="text-xs font-bold text-slate-700 hover:text-[#e03a14] py-1.5 px-2.5 rounded-lg border border-slate-200 hover:border-slate-300 transition flex items-center gap-1"
            >
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>{locale === 'en' ? 'العربية' : 'English'}</span>
            </button>
          </nav>

          {/* Mobile Right Controls: Compact Language Pill + Sell + Hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/sell"
              className="bg-[#e03a14] text-white text-[11px] font-bold py-1.5 px-2.5 rounded-lg flex items-center gap-1 shadow-2xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{isAr ? 'بيع' : 'Sell'}</span>
            </Link>

            <button
              type="button"
              onClick={toggleLanguage}
              className="bg-slate-100 active:bg-slate-200 text-slate-800 text-[11px] font-bold py-1.5 px-2 rounded-lg border border-slate-200 flex items-center gap-1"
            >
              <Globe className="w-3 h-3 text-[#e03a14]" />
              <span>{locale === 'en' ? 'عربي' : 'EN'}</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-slate-700 hover:bg-slate-100 rounded-lg transition"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-3 shadow-xl animate-in slide-in-from-top-2 duration-150">
          <Link
            href="/search"
            className="flex items-center gap-2.5 py-2.5 px-3 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            <Search className="w-4 h-4 text-[#e03a14]" />
            {t('search')}
          </Link>

          <Link
            href="/sell"
            className="flex items-center gap-2.5 py-2.5 px-3 rounded-xl text-xs font-bold text-[#e03a14] bg-orange-50 border border-orange-100 transition"
          >
            <PlusCircle className="w-4 h-4" />
            {t('sellCar')}
          </Link>

          {user ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 py-2.5 px-3 rounded-xl text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 transition"
            >
              <LayoutDashboard className="w-4 h-4 text-slate-500" />
              {t('myDashboard')}
            </Link>
          ) : (
            <Link
              href="/auth"
              className="flex items-center gap-2.5 py-2.5 px-3 rounded-xl text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 transition"
            >
              <LogIn className="w-4 h-4 text-slate-500" />
              {t('login')}
            </Link>
          )}

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold">{isAr ? 'اللغة' : 'Language'}</span>
            <button
              type="button"
              onClick={toggleLanguage}
              className="font-bold text-[#e03a14] hover:underline flex items-center gap-1"
            >
              <Globe className="w-3.5 h-3.5" />
              {locale === 'en' ? 'العربية (AR)' : 'English (EN)'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
