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
  const { locale } = useLanguage();
  const rawText = (text || '').trim();
  const [displayText, setDisplayText] = useState(rawText);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!rawText) {
      setDisplayText('');
      return;
    }

    // When English is selected, revert immediately to raw text
    if (locale === 'en') {
      setDisplayText(rawText);
      return;
    }

    const cacheKey = `${locale}:${rawText}`;
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
          body: JSON.stringify({ text: rawText, targetLang: locale }),
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
  }, [rawText, locale]);

  return (
    <Component className={`${className} ${loading ? 'opacity-60 animate-pulse' : 'transition-opacity duration-200'}`}>
      {displayText}
    </Component>
  );
}
