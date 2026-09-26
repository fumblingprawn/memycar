'use client';

import React, { useEffect, useState } from 'react';
import { Bookmark, ArrowRight, Trash2, Loader2, Search } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useLanguage } from '@/context/LanguageContext';

export default function SavedSearchesList() {
  const [searches, setSearches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAr } = useLanguage();
  const supabase = createClient();

  const fetchSearches = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('saved_searches')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) setSearches(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSearches();
  }, []);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('saved_searches').delete().eq('id', id);
    if (!error) {
      setSearches((prev) => prev.filter((s) => s.id !== id));
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center text-slate-400">
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
    );
  }

  if (searches.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
        <Bookmark className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="text-sm font-medium text-slate-600">
          {isAr ? 'لا توجد عمليات بحث محفوظة حتى الآن' : 'No saved searches yet'}
        </p>
        <Link
          href="/search"
          className="inline-flex items-center gap-1.5 text-xs text-[#e03a14] font-semibold mt-3 hover:underline"
        >
          <Search className="w-3.5 h-3.5" />
          {isAr ? 'تصفح السيارات واحفظ بحثك' : 'Browse listings & save a search'}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {searches.map((item) => (
        <div
          key={item.id}
          className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-4 hover:border-slate-300 transition"
        >
          <div>
            <h4 className="text-sm font-bold text-slate-900">{item.title || 'Saved Filter'}</h4>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {Object.entries(item.filters || {}).map(([k, v]) => (
                <span
                  key={k}
                  className="bg-slate-100 text-slate-600 text-[11px] font-medium px-2 py-0.5 rounded-md"
                >
                  {k}: {String(v)}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={`/search?${item.query_string || ''}`}
              className="inline-flex items-center gap-1 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg transition"
            >
              <span>{isAr ? 'عرض' : 'View'}</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
            <button
              onClick={() => handleDelete(item.id)}
              className="p-1.5 text-slate-400 hover:text-red-600 transition"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
