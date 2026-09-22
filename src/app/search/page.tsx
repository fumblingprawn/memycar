'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Listing } from '@/types/listing';
import { carData, years } from '@/lib/constants/car-data';
import ListingHorizontalCard from '@/components/listing/ListingHorizontalCard';
import { Search, X } from 'lucide-react';
import Link from 'next/link';

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize filter state from URL params
  const [make, setMake] = useState(searchParams.get('make') || '');
  const [model, setModel] = useState(searchParams.get('model') || '');
  const [priceFrom, setPriceFrom] = useState(searchParams.get('price_from') || '');
  const [priceTo, setPriceTo] = useState(searchParams.get('price_to') || '');
  const [yearFrom, setYearFrom] = useState(searchParams.get('year_from') || '');
  const [yearTo, setYearTo] = useState(searchParams.get('year_to') || '');
  const [mileageFrom, setMileageFrom] = useState(searchParams.get('mileage_from') || '');
  const [mileageTo, setMileageTo] = useState(searchParams.get('mileage_to') || '');
  const [specs, setSpecs] = useState(searchParams.get('specs') || '');
  const [emirate, setEmirate] = useState(searchParams.get('emirate') || '');
  const [freeText, setFreeText] = useState(searchParams.get('free_text') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'standard');

  const [listings, setListings] = useState<Listing[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const availableModels = useMemo(() => {
    if (!make) return [];
    return carData.makes.find((m) => m.make.toLowerCase() === make.toLowerCase())?.models || [];
  }, [make]);

  const specsOptions = [
    { label: 'All Specs', value: '' },
    { label: 'GCC Specs', value: 'GCC' },
    { label: 'Non-GCC', value: 'Non-GCC' },
  ];

  const emirateOptions = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'];

  const mileageOptions = [
    { value: '', label: 'Any' },
    { value: '10000', label: '10,000 km' },
    { value: '25000', label: '25,000 km' },
    { value: '50000', label: '50,000 km' },
    { value: '75000', label: '75,000 km' },
    { value: '100000', label: '100,000 km' },
    { value: '150000', label: '150,000 km' },
    { value: '200000', label: '200,000+ km' },
  ];

  const sortOptions = [
    { label: 'Standard Sorting', value: 'standard' },
    { label: 'Price: Low to High', value: 'price-low' },
    { label: 'Price: High to Low', value: 'price-high' },
    { label: 'Newest Year', value: 'newest' },
    { label: 'Lowest Mileage', value: 'mileage-low' },
  ];

  const handleMakeChange = (newMake: string) => {
    setMake(newMake);
    setModel('');
  };

  const handleReset = () => {
    setMake('');
    setModel('');
    setPriceFrom('');
    setPriceTo('');
    setYearFrom('');
    setYearTo('');
    setMileageFrom('');
    setMileageTo('');
    setSpecs('');
    setEmirate('');
    setFreeText('');
    setSort('standard');
    router.push('/search');
  };

  // Synchronize URL and fetch listings
  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      setErrorMsg(null);
      const supabase = createClient();

      let query = supabase.from('listings').select('*', { count: 'exact' });

      if (make) query = query.ilike('make', `%${make}%`);
      if (model) query = query.ilike('model', `%${model}%`);
      if (priceFrom) query = query.gte('price', parseInt(priceFrom, 10));
      if (priceTo) query = query.lte('price', parseInt(priceTo, 10));
      if (yearFrom) query = query.gte('year', parseInt(yearFrom, 10));
      if (yearTo) query = query.lte('year', parseInt(yearTo, 10));
      if (mileageFrom) query = query.gte('mileage', parseInt(mileageFrom, 10));
      if (mileageTo) query = query.lte('mileage', parseInt(mileageTo, 10));

      if (specs) {
        if (specs === 'GCC') {
          query = query.ilike('specs', '%GCC%');
        } else if (specs === 'Non-GCC') {
          query = query.not('specs', 'ilike', '%GCC%');
        }
      }

      if (emirate) query = query.ilike('city', `%${emirate}%`);

      if (freeText) {
        query = query.or(`make.ilike.%${freeText}%,model.ilike.%${freeText}%,description.ilike.%${freeText}%`);
      }

      switch (sort) {
        case 'price-low':
          query = query.order('price', { ascending: true });
          break;
        case 'price-high':
          query = query.order('price', { ascending: false });
          break;
        case 'mileage-low':
          query = query.order('mileage', { ascending: true });
          break;
        case 'newest':
        default:
          query = query.order('year', { ascending: false });
          break;
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching listings:', error);
        setErrorMsg(error.message);
      } else {
        setListings((data as Listing[]) || []);
        setTotalCount(count || 0);
      }
      setLoading(false);

      // Keep search params synced
      const params = new URLSearchParams();
      if (make) params.set('make', make);
      if (model) params.set('model', model);
      if (priceFrom) params.set('price_from', priceFrom);
      if (priceTo) params.set('price_to', priceTo);
      if (yearFrom) params.set('year_from', yearFrom);
      if (yearTo) params.set('year_to', yearTo);
      if (mileageFrom) params.set('mileage_from', mileageFrom);
      if (mileageTo) params.set('mileage_to', mileageTo);
      if (specs) params.set('specs', specs);
      if (emirate) params.set('emirate', emirate);
      if (freeText) params.set('free_text', freeText);
      if (sort !== 'standard') params.set('sort', sort);

      const qs = params.toString();
      router.replace(qs ? `/search?${qs}` : '/search', { scroll: false });
    };

    fetchListings();
  }, [make, model, priceFrom, priceTo, yearFrom, yearTo, mileageFrom, mileageTo, specs, emirate, freeText, sort, router]);

  const activeFilters = useMemo(() => {
    const filters: { label: string; value: string; remove: () => void }[] = [];

    if (make) filters.push({ label: make, value: 'make', remove: () => { setMake(''); setModel(''); } });
    if (model) filters.push({ label: model, value: 'model', remove: () => setModel('') });
    if (priceFrom) filters.push({ label: `Min AED ${Number(priceFrom).toLocaleString()}`, value: 'price_from', remove: () => setPriceFrom('') });
    if (priceTo) filters.push({ label: `Max AED ${Number(priceTo).toLocaleString()}`, value: 'price_to', remove: () => setPriceTo('') });
    if (yearFrom) filters.push({ label: `From ${yearFrom}`, value: 'year_from', remove: () => setYearFrom('') });
    if (yearTo) filters.push({ label: `Up to ${yearTo}`, value: 'year_to', remove: () => setYearTo('') });
    if (mileageFrom) filters.push({ label: `From ${Number(mileageFrom).toLocaleString()} km`, value: 'mileage_from', remove: () => setMileageFrom('') });
    if (mileageTo) filters.push({ label: `Up to ${Number(mileageTo).toLocaleString()} km`, value: 'mileage_to', remove: () => setMileageTo('') });
    if (specs) filters.push({ label: specs, value: 'specs', remove: () => setSpecs('') });
    if (emirate) filters.push({ label: emirate, value: 'emirate', remove: () => setEmirate('') });
    if (freeText) filters.push({ label: `"${freeText}"`, value: 'free_text', remove: () => setFreeText('') });

    return filters;
  }, [make, model, priceFrom, priceTo, yearFrom, yearTo, mileageFrom, mileageTo, specs, emirate, freeText]);

  return (
    <div className="min-h-screen bg-[#f4f4f4] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column: Sticky Filters Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-5 sticky top-24">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="font-bold text-sm text-slate-900">Filters</span>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-slate-500 hover:text-[#e03a14] transition"
                >
                  Reset All
                </button>
              </div>

              {/* Brand & Model */}
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">Make</label>
                <select
                  value={make}
                  onChange={(e) => handleMakeChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm focus:ring-2 focus:ring-[#e03a14] outline-none"
                >
                  <option value="">All Makes</option>
                  {carData.makes.map((item) => (
                    <option key={item.make} value={item.make}>
                      {item.make}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">Model</label>
                <select
                  value={model}
                  disabled={!make}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm disabled:bg-slate-100 focus:ring-2 focus:ring-[#e03a14] outline-none"
                >
                  <option value="">{make ? 'All Models' : 'Select Make First'}</option>
                  {availableModels.map((mod) => (
                    <option key={mod} value={mod}>
                      {mod}
                    </option>
                  ))}
                </select>
              </div>

              {/* Regional Specs */}
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">Regional Specs</label>
                <select
                  value={specs}
                  onChange={(e) => setSpecs(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm focus:ring-2 focus:ring-[#e03a14] outline-none"
                >
                  {specsOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Year Min / Max */}
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">Year</label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={yearFrom}
                    onChange={(e) => setYearFrom(e.target.value)}
                    className="w-full px-2 py-2 rounded-lg border border-slate-300 bg-white text-xs"
                  >
                    <option value="">From</option>
                    {years.map((yr) => (
                      <option key={yr} value={yr.toString()}>{yr}</option>
                    ))}
                  </select>
                  <select
                    value={yearTo}
                    onChange={(e) => setYearTo(e.target.value)}
                    className="w-full px-2 py-2 rounded-lg border border-slate-300 bg-white text-xs"
                  >
                    <option value="">To</option>
                    {years.map((yr) => (
                      <option key={yr} value={yr.toString()}>{yr}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Mileage */}
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">Max Mileage</label>
                <select
                  value={mileageTo}
                  onChange={(e) => setMileageTo(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm"
                >
                  {mileageOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">Price (AED)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceFrom}
                    onChange={(e) => setPriceFrom(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceTo}
                    onChange={(e) => setPriceTo(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
              </div>

              {/* Emirate */}
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">Emirate</label>
                <select
                  value={emirate}
                  onChange={(e) => setEmirate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm"
                >
                  <option value="">All Emirates</option>
                  {emirateOptions.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => router.replace(`/search?${new URLSearchParams({ make, model, price_from: priceFrom, price_to: priceTo, year_from: yearFrom, year_to: yearTo, mileage_to: mileageTo, specs, emirate, free_text: freeText }).toString()}`)}
                className="w-full bg-[#e03a14] hover:bg-[#c53210] text-white font-bold py-2.5 rounded-xl text-sm transition"
              >
                Show {totalCount} Cars
              </button>
            </div>
          </aside>

          {/* Right Column: Results Stream */}
          <main className="lg:col-span-3 space-y-4">
            {/* Results Header: Count & Sort Dropdown */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-black text-slate-900">
                  {totalCount} {make ? `${make} ${model}` : 'Vehicles'} Available
                </h1>
                <p className="text-xs text-slate-500">Verified UAE & GCC Stock</p>
              </div>

              {/* Sorting Top-Right */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Sort by:</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-700 focus:ring-2 focus:ring-[#e03a14] outline-none"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Keyword Search & Active Filters */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter by keywords (e.g. Turbo, Carbon, Nappa Leather)..."
                  value={freeText}
                  onChange={(e) => setFreeText(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-[#e03a14] outline-none"
                />
              </div>

              {activeFilters.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-xs font-semibold text-slate-400">Active:</span>
                  {activeFilters.map((filter) => (
                    <span
                      key={filter.value}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-full"
                    >
                      {filter.label}
                      <button
                        type="button"
                        onClick={filter.remove}
                        className="text-slate-400 hover:text-slate-700 transition"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Listings Feed */}
            {loading ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#e03a14] border-t-transparent mx-auto mb-3"></div>
                <p className="text-sm font-semibold text-slate-600">Loading cars...</p>
              </div>
            ) : errorMsg ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
                <p className="text-sm text-red-600 font-semibold mb-2">Failed to load listings</p>
                <p className="text-xs text-slate-500">{errorMsg}</p>
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-6">
                <h3 className="text-base font-bold text-slate-800 mb-1">No vehicles match your criteria</h3>
                <p className="text-xs text-slate-500 mb-4">Try broadening your search or resetting filters.</p>
                <button
                  type="button"
                  onClick={handleReset}
                  className="bg-[#e03a14] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#c53210] transition"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {listings.map((listing) => (
                  <ListingHorizontalCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f4f4f4] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#e03a14] border-t-transparent"></div>
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}