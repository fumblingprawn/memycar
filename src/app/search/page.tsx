'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useLanguage } from '@/context/LanguageContext';
import ListingCard from '@/components/listing/ListingCard';
import { Car, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

function SearchContent() {
  const searchParams = useSearchParams();
  const supabase = createClient();
  const { t, isAr } = useLanguage();

  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'price_asc' | 'price_desc'>('newest');

  const make = searchParams.get('make') || '';
  const model = searchParams.get('model') || '';
  const yearFrom = searchParams.get('year_from') || '';
  const yearTo = searchParams.get('year_to') || '';
  const priceFrom = searchParams.get('price_from') || '';
  const priceTo = searchParams.get('price_to') || '';
  const mileageFrom = searchParams.get('mileage_from') || '';
  const mileageTo = searchParams.get('mileage_to') || '';
  const emirate = searchParams.get('emirate') || '';
  const specs = searchParams.get('specs') || '';

  const fetchResults = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('listings').select('*');

    if (make && make !== 'Other') query = query.ilike('make', `%${make}%`);
    if (model && model !== 'Other') query = query.ilike('model', `%${model}%`);
    if (yearFrom) query = query.gte('year', parseInt(yearFrom, 10));
    if (yearTo) query = query.lte('year', parseInt(yearTo, 10));
    if (priceFrom) query = query.gte('price', parseInt(priceFrom, 10));
    if (priceTo) query = query.lte('price', parseInt(priceTo, 10));
    if (mileageFrom) query = query.gte('mileage', parseInt(mileageFrom, 10));
    if (mileageTo) query = query.lte('mileage', parseInt(mileageTo, 10));
    if (emirate) query = query.ilike('city', `%${emirate}%`);
    if (specs) query = query.ilike('specs', `%${specs}%`);

    // Sort order
    if (sortBy === 'newest') {
      query = query.order('created_at', { ascending: false });
    } else if (sortBy === 'oldest') {
      query = query.order('created_at', { ascending: true });
    } else if (sortBy === 'price_asc') {
      query = query.order('price', { ascending: true });
    } else if (sortBy === 'price_desc') {
      query = query.order('price', { ascending: false });
    }

    const { data, error } = await query;
    if (!error && data) {
      setListings(data);
    }
    setLoading(false);
  }, [supabase, make, model, yearFrom, yearTo, priceFrom, priceTo, mileageFrom, mileageTo, emirate, specs, sortBy]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  return (
    <div className="min-h-screen bg-[#f8f9fa] py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Results Header + Sort Controls */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Car className="w-5 h-5 text-[#e03a14]" />
              {make ? `${make} ${model}`.trim() : (isAr ? 'كافة السيارات المعروضة' : 'All Available Cars')}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {listings.length} {isAr ? 'سيارة متوفرة للبيع' : 'verified vehicles found'}
            </p>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-600 flex items-center gap-1 flex-shrink-0">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              {t('sortBy')}:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 bg-white outline-none focus:ring-2 focus:ring-[#e03a14] cursor-pointer flex-1 sm:flex-none"
            >
              <option value="newest">{t('newestFirst')}</option>
              <option value="oldest">{t('oldestFirst')}</option>
              <option value="price_asc">{t('priceLowHigh')}</option>
              <option value="price_desc">{t('priceHighLow')}</option>
            </select>
          </div>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#e03a14] border-t-transparent mx-auto mb-3"></div>
            <p className="text-xs text-slate-500 font-semibold">
              {isAr ? 'جاري جلب نتائج البحث...' : 'Loading verified vehicles...'}
            </p>
          </div>
        ) : listings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <Car className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800 mb-1">
              {isAr ? 'لم نتمكن من العثور على سيارات تطابق بحثك' : 'No cars match your search filters'}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              {isAr ? 'جرب توسيع نطاق البحث أو إلغاء بعض المعايير' : 'Try expanding your price range or clearing some filters.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {listings.map((car) => (
              <ListingCard key={car.id} listing={car} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f8f9fa]" />}>
      <SearchContent />
    </Suspense>
  );
}
