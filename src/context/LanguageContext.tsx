'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Locale, t as translateHelper, formatPrice, formatMileage } from '@/lib/i18n';

interface LanguageContextType {
  locale: Locale;
  dir: 'ltr' | 'rtl';
  isAr: boolean;
  toggleLanguage: () => void;
  t: (key: string) => string;
  formatPrice: (amount: number | string) => string;
  formatMileage: (km: number | string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  locale: 'en',
  dir: 'ltr',
  isAr: false,
  toggleLanguage: () => {},
  t: (k) => k,
  formatPrice: (a) => `AED ${a}`,
  formatMileage: (m) => `${m} km`,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>('en');
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem('memycar_lang') as Locale | null;
    if (saved === 'en' || saved === 'ar') {
      setLocale(saved);
      document.documentElement.lang = saved;
      document.documentElement.dir = saved === 'ar' ? 'rtl' : 'ltr';
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    const next: Locale = locale === 'en' ? 'ar' : 'en';
    setLocale(next);
    localStorage.setItem('memycar_lang', next);
    document.documentElement.lang = next;
    document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr';
    
    // Broadcast for immediate child sync
    window.dispatchEvent(new CustomEvent('memycar_locale_change', { detail: next }));
    router.refresh();
  }, [locale, router]);

  return (
    <LanguageContext.Provider
      value={{
        locale,
        dir: locale === 'ar' ? 'rtl' : 'ltr',
        isAr: locale === 'ar',
        toggleLanguage,
        t: (key: string) => translateHelper(key, locale),
        formatPrice: (amt) => formatPrice(amt, locale),
        formatMileage: (km) => formatMileage(km, locale),
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
