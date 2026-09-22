'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

type Locale = 'en' | 'ar';
type Direction = 'ltr' | 'rtl';

interface LanguageContextType {
  locale: Locale;
  dir: Direction;
  toggleLanguage: () => void;
  setLocaleDirect: (lang: Locale) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  locale: 'en',
  dir: 'ltr',
  toggleLanguage: () => {},
  setLocaleDirect: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>('en');
  const router = useRouter();

  // Read initial locale on mount
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

    // Broadcast across the window so all components update without reload
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
        toggleLanguage,
        setLocaleDirect,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
