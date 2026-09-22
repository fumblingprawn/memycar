'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface DynamicTranslateProps {
  text?: string | null;
  as?: 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'div';
  className?: string;
}

const translationCache = new Map<string, string>();

export default function DynamicTranslate({
  text,
  as: Component = 'span',
  className = '',
}: DynamicTranslateProps) {
  const { locale: contextLocale } = useLanguage();
  const rawText = (text || '').trim();
  const [currentLocale, setCurrentLocale] = useState(contextLocale);
  const [displayText, setDisplayText] = useState(rawText);
  const [loading, setLoading] = useState(false);

  // Sync with context changes and custom window broadcast
  useEffect(() => {
    setCurrentLocale(contextLocale);
  }, [contextLocale]);

  useEffect(() => {
    const handleLocaleChange = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) {
        setCurrentLocale(customEvent.detail as 'en' | 'ar');
      }
    };

    window.addEventListener('memycar_locale_change', handleLocaleChange);
    return () => {
      window.removeEventListener('memycar_locale_change', handleLocaleChange);
    };
  }, []);

  useEffect(() => {
    if (!rawText) {
      setDisplayText('');
      return;
    }

    // Revert immediately to English when switched back
    if (currentLocale === 'en') {
      setDisplayText(rawText);
      return;
    }

    const cacheKey = `${currentLocale}:${rawText}`;
    if (translationCache.has(cacheKey)) {
      setDisplayText(translationCache.get(cacheKey)!);
      return;
    }

    let isMounted = true;

    async function fetchTranslation() {
      setLoading(true);
      try {
        const res = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: rawText, targetLang: currentLocale }),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        if (isMounted && data.translatedText) {
          translationCache.set(cacheKey, data.translatedText);
          setDisplayText(data.translatedText);
        }
      } catch (err) {
        console.error('Dynamic translate error:', err);
        if (isMounted) setDisplayText(rawText);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchTranslation();

    return () => {
      isMounted = false;
    };
  }, [rawText, currentLocale]);

  return (
    <Component className={`${className} ${loading ? 'opacity-60 animate-pulse' : 'transition-opacity duration-200'}`}>
      {displayText}
    </Component>
  );
}
