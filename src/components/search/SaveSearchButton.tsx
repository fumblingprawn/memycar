'use client';

import React, { useState } from 'react';
import { Bookmark, Check, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';

interface SaveSearchButtonProps {
  currentParams: Record<string, string>;
  searchSummaryTitle?: string;
}

export default function SaveSearchButton({
  currentParams,
  searchSummaryTitle = 'Saved Search',
}: SaveSearchButtonProps) {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();
  const { isAr } = useLanguage();
  const supabase = createClient();

  const handleSave = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth');
        return;
      }

      const queryString = new URLSearchParams(currentParams).toString();

      const { error } = await supabase.from('saved_searches').insert({
        user_id: user.id,
        title: searchSummaryTitle,
        filters: currentParams,
        query_string: queryString,
      });

      if (error) throw error;
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Error saving search:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSave}
      disabled={loading || saved}
      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition border ${
        saved
          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-2xs'
      }`}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-500" />
      ) : saved ? (
        <Check className="w-3.5 h-3.5 text-emerald-600" />
      ) : (
        <Bookmark className="w-3.5 h-3.5 text-slate-500" />
      )}
      <span>
        {saved
          ? (isAr ? 'تم حفظ البحث' : 'Search Saved')
          : (isAr ? 'حفظ البحث' : 'Save Search')}
      </span>
    </button>
  );
}
