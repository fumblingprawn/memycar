'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface DynamicTranslateProps {
  text: string;
  as?: 'p' | 'span' | 'h1' | 'h2' | 'div';
  className?: string;
}

// In-memory client cache to prevent redundant API calls during a browsing session
const translationCache = new Map<string, string>();

export default function DynamicTranslate({
  text,
  as: Component = 'span',
  className = '',
}: DynamicTranslateProps) {
  const { locale } = useLanguage();
  const [displayText, setDisplayText] = useState(text);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!text || !text.trim()) {
      setDisplayText('');
      return;
    }

    // Detect if text is mostly Arabic
    const isArabicText = /[\u0600-\u06FF]/.test(text);
    const textLang = isArabicText ? 'ar' : 'en';

    // If active locale matches the text language, render directly
    if (locale === textLang) {
      setDisplayText(text);
      return;
    }

    // Check client session cache
    const cacheKey = `${locale}:${text}`;
    if (translationCache.has(cacheKey)) {
      setDisplayText(translationCache.get(cacheKey)!);
      return;
    }

    // Fetch dynamic translation from OpenAI
    let isMounted = true;
    async function translate() {
      setLoading(true);
      try {
        const res = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, targetLang: locale }),
        });
        const data = await res.json();
        if (isMounted && data.translatedText) {
          translationCache.set(cacheKey, data.translatedText);
          setDisplayText(data.translatedText);
        }
      } catch (err) {
        console.error('Dynamic translation failed:', err);
        if (isMounted) setDisplayText(text);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    translate();

    return () => {
      isMounted = false;
    };
  }, [text, locale]);

  return (
    <Component className={`${className} ${loading ? 'opacity-60 animate-pulse' : 'transition-opacity duration-200'}`}>
      {displayText}
    </Component>
  );
}
