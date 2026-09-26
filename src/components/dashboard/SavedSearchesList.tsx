'use client';

import React, { useEffect, useState } from 'react';
import { Bookmark, ArrowRight, Trash2, Loader2, Search, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useLanguage } from '@/context/LanguageContext';

interface SavedSearch {
  id: string;
  title: string;
  filters: Record<string, any>;
  query_string: string;
  last_viewed_at?: string;
  created_at: string;
}

export default function SavedSearchesList() {
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [newCounts, setNewCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { isAr } = useLanguage();
  const supabase = createClient();

  // Calculate new listings uploaded since the search was last checked
  const checkNewListings = async (searchList: SavedSearch[]) => {
    const counts: Record<string, number> = {};

    await Promise.all(
      searchList.map(async (item) => {
        try {
          const baselineDate = item.last_viewed_at || item.created_at;
          const f = item.filters || {};

          let query = supabase
            .from('listings')
            .select('id', { count: 'exact', head: true })
            .gt('created_at', baselineDate);

          if (f.make) query = query.ilike('make', f.make);
          if (f.model) query = query.ilike('model', f.model);
          if (f.year_from) query = query.gte('year', Number(f.year_from));
          if (f.year_to) query = query.lte('year', Number(f.year_to));
          if (f.price_from) query = query.gte('price', Number(f.price_from));
          if (f.price_to) query = query.lte('price', Number(f.price_to));
          if (f.mileage_to) query = query.lte('mileage', Number(f.mileage_to));
          if (f.emirate) query = query.eq('emirate', f.emirate);
          if (f.specs) query = query.eq('specs', f.specs);

          const { count, error } = await query;
          counts[item.id] = (!error && count) ? count : 0;
        } catch {
          counts[item.id] = 0;
        }
      })
    );

    setNewCounts(counts);
  };

  const fetchSearches = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('saved_searches')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setSearches(data);
        await checkNewListings(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSearches();
  }, []);

  const handleOpenSearch = async (item: SavedSearch) => {
    // 1. Mark as viewed now so badge clears
    const now = new Date().toISOString();
    await supabase
      .from('saved_searches')
      .update({ last_viewed_at: now })
      .eq('id', item.id);

    // 2. Navigate directly to results
    router.push(`/search?${item.query_string || ''}`);
  };

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
      {searches.map((item) => {
        const newCount = newCounts[item.id] || 0;

        return (
          <div
            key={item.id}
            className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-slate-300 transition shadow-2xs"
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm font-bold text-slate-900">{item.title || 'Saved Filter'}</h4>
                
                {/* Notification Badge for New Uploads */}
                {newCount > 0 ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 animate-pulse">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    {isAr ? `${newCount} سيارات جديدة` : `+${newCount} new listings`}
                  </span>
                ) : (
                  <span className="inline-flex items-center text-[10px] text-slate-400 font-medium">
                    {isAr ? 'محدث' : 'Up to date'}
                  </span>
                )}
              </div>

              {/* Filter parameter chips */}
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(item.filters || {}).map(([k, v]) => (
                  <span
                    key={k}
                    className="bg-slate-100 text-slate-600 text-[11px] font-medium px-2 py-0.5 rounded-md"
                  >
                    {k.replace('_', ' ')}: {String(v)}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
              <button
                type="button"
                onClick={() => handleOpenSearch(item)}
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl transition ${
                  newCount > 0
                    ? 'bg-[#e03a14] hover:bg-[#c93310] text-white shadow-xs'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                <span>{isAr ? 'عرض النتائج' : 'View Results'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              
              <button
                type="button"
                onClick={() => handleDelete(item.id)}
                className="p-2 text-slate-400 hover:text-red-600 transition rounded-xl hover:bg-slate-50"
                title={isAr ? 'حذف' : 'Delete'}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
