'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Locale, t as translateHelper, formatPrice as priceHelper, formatMileage as mileageHelper } from '@/lib/i18n';

interface LanguageContextType {
  locale: Locale;
  dir: 'ltr' | 'rtl';
  isAr: boolean;
  toggleLanguage: () => void;
  setLocaleDirect: (lang: Locale) => void;
  t: (path: string) => string;
  formatPrice: (amount: number | string) => string;
  formatMileage: (km: number | string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  locale: 'en',
  dir: 'ltr',
  isAr: false,
  toggleLanguage: () => {},
  setLocaleDirect: () => {},
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
      document.cookie = `NEXT_LOCALE=${saved}; path=/; max-age=31536000`;
    }
  }, []);

  const applyLocale = useCallback((next: Locale) => {
    setLocale(next);
    localStorage.setItem('memycar_lang', next);
    document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000`;
    document.documentElement.lang = next;
    document.documentElement.dir = next === 'ar' ? 'rtl' : 'ltr';

    window.dispatchEvent(new CustomEvent('memycar_locale_change', { detail: next }));
    router.refresh();
  }, [router]);

  const toggleLanguage = useCallback(() => {
    const next: Locale = locale === 'en' ? 'ar' : 'en';
    applyLocale(next);
  }, [locale, applyLocale]);

  const setLocaleDirect = useCallback((next: Locale) => {
    applyLocale(next);
  }, [applyLocale]);

  return (
    <LanguageContext.Provider
      value={{
        locale,
        dir: locale === 'ar' ? 'rtl' : 'ltr',
        isAr: locale === 'ar',
        toggleLanguage,
        setLocaleDirect,
        t: (path: string) => translateHelper(path, locale),
        formatPrice: (amt) => priceHelper(amt, locale),
        formatMileage: (km) => mileageHelper(km, locale),
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
