'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface LanguageContextType {
  locale: 'en' | 'ar';
  dir: 'ltr' | 'rtl';
  toggleLocale: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<'en' | 'ar'>(() => {
    // Try to get from localStorage first
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('memycar_lang');
      if (saved === 'ar' || saved === 'en') {
        return saved as 'en' | 'ar';
      }
    }
    // Default to English
    return 'en';
  });

  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    // Save to localStorage when locale changes
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('memycar_lang', locale);
    }
    // Update html tag attributes
    if (typeof window !== 'undefined') {
      document.documentElement.lang = locale;
      document.documentElement.dir = dir;
    }
  }, [locale, dir]);

  const toggleLocale = () => {
    setLocale(prev => (prev === 'en' ? 'ar' : 'en'));
  };

  return (
    <LanguageContext.Provider value={{ locale, dir, toggleLocale }}>
      {children}
    </LanguageContext.Provider>
  );
}