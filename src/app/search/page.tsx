'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Listing } from '@/types/listing';
import { carData, years } from '@/lib/constants/car-data';
import ListingHorizontalCard from '@/components/listing/ListingHorizontalCard';
import { Search, ChevronDown, ChevronUp, X } from 'lucide-react';
import Link from 'next/link';

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize state from URL
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
  const [freeText, setFreeText] = useState('');
  const [sort, setSort] = useState(searchParams.get('sort') || 'standard'); // standard, price-low, price-high, newest, mileage-low

  // Derive models directly from selected make (no state setters during render)
  const availableModels = make
    ? carData.makes.find((m) => m.make.toLowerCase() === make.toLowerCase())?.models || []
    : [];

  // Specs options
  const specsOptions = [
    { label: 'GCC Specs', value: 'GCC' },
    { label: 'Non-GCC', value: 'Non-GCC' },
    { label: 'All', value: '' },
  ];

  // Emirate options
  const emirateOptions = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'];

  // Sort options
  const sortOptions = [
    { label: 'Standard', value: 'standard' },
    { label: 'Price: Low to High', value: 'price-low' },
    { label: 'Price: High to Low', value: 'price-high' },
    { label: 'Newest', value: 'newest' },
    { label: 'Lowest Mileage', value: 'mileage-low' },
  ];

  // Handle make change
  const handleMakeChange = (newMake: string) => {
    setMake(newMake);
    setModel(''); // Reset model when make changes
  };

  // Handle reset
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
    router.push('/');
  };

  // Build Supabase query
  useEffect(() => {
    const fetchListings = async () => {
      const supabase = createClient();

      // Start with base query
      let query = supabase.from('listings').select('*', { count: 'exact' });

      // Apply filters from the search bar
      if (make) {
        query = query.eq('make', make);
      }
      if (model) {
        query = query.eq('model', model);
      }
      if (priceFrom) {
        query = query.gte('price_aed', parseInt(priceFrom));
      }
      if (priceTo) {
        query = query.lte('price_aed', parseInt(priceTo));
      }
      if (yearFrom) {
        query = query.gte('year', parseInt(yearFrom));
      }
      if (yearTo) {
        query = query.lte('year', parseInt(yearTo));
      }
      if (mileageFrom) {
        query = query.gte('mileage_km', parseInt(mileageFrom));
      }
      if (mileageTo) {
        query = query.lte('mileage_km', parseInt(mileageTo));
      }
      if (specs) {
        if (specs === 'GCC') {
          query = query.eq('specs', 'GCC');
        } else if (specs === 'Non-GCC') {
          query = query.neq('specs', 'GCC');
        }
        // If specs is empty (All), no filter
      }
      if (emirate) {
        query = query.eq('emirate', emirate);
      }
      if (freeText) {
        // Simple text search across make, model, trim, description
        query = query.or(`make.ilike.%${freeText}%,model.ilike.%${freeText}%,trim.ilike.%${freeText}%,description.ilike.%${freeText}%`);
      }

      // Apply sorting
      switch (sort) {
        case 'price-low':
          query = query.order('price_aed', { ascending: true });
          break;
        case 'price-high':
          query = query.order('price_aed', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'mileage-low':
          query = query.order('mileage_km', { ascending: true });
          break;
        default: // standard
          query = query.order('created_at', { ascending: false });
          break;
      }

      // Execute query
      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching listings:', error);
        return;
      }

      // Update URL with current filters (without triggering a new effect if already in sync)
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
      if (sort) params.set('sort', sort);

      const qs = params.toString();
      if (qs) {
        router.replace(`/?${qs}`, { scroll: false });
      } else {
        router.replace('/', { scroll: false });
      }
    };

    fetchListings();
  }, [make, model, priceFrom, priceTo, yearFrom, yearTo, mileageFrom, mileageTo, specs, emirate, freeText, sort, router]);

  // Fetch listings based on current state (we'll refetch when deps change)
  const [listings, setListings] = useState<Listing[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      setErrorMsg(null);
      const supabase = createClient();

      // Start with base query
      let query = supabase.from('listings').select('*', { count: 'exact' });

      // Apply filters from the search bar
      if (make) {
        query = query.eq('make', make);
      }
      if (model) {
        query = query.eq('model', model);
      }
      if (priceFrom) {
        query = query.gte('price_aed', parseInt(priceFrom));
      }
      if (priceTo) {
        query = query.lte('price_aed', parseInt(priceTo));
      }
      if (yearFrom) {
        query = query.gte('year', parseInt(yearFrom));
      }
      if (yearTo) {
        query = query.lte('year', parseInt(yearTo));
      }
      if (mileageFrom) {
        query = query.gte('mileage_km', parseInt(mileageFrom));
      }
      if (mileageTo) {
        query = query.lte('mileage_km', parseInt(mileageTo));
      }
      if (specs) {
        if (specs === 'GCC') {
          query = query.eq('specs', 'GCC');
        } else if (specs === 'Non-GCC') {
          query = query.neq('specs', 'GCC');
        }
        // If specs is empty (All), no filter
      }
      if (emirate) {
        query = query.eq('emirate', emirate);
      }
      if (freeText) {
        // Simple text search across make, model, trim, description
        query = query.or(`make.ilike.%${freeText}%,model.ilike.%${freeText}%,trim.ilike.%${freeText}%,description.ilike.%${freeText}%`);
      }

      // Apply sorting
      switch (sort) {
        case 'price-low':
          query = query.order('price_aed', { ascending: true });
          break;
        case 'price-high':
          query = query.order('price_aed', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'mileage-low':
          query = query.order('mileage_km', { ascending: true });
          break;
        default: // standard
          query = query.order('created_at', { ascending: false });
          break;
      }

      // Execute query
      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching listings:', error);
        setErrorMsg(error.message);
      } else {
        setListings(data || []);
        setTotalCount(count || 0);
      }
      setLoading(false);
    };

    fetchListings();
  }, [make, model, priceFrom, priceTo, yearFrom, yearTo, mileageFrom, mileageTo, specs, emirate, freeText, sort]);

  // Active filters for display
  const activeFilters = useMemo(() => {
    const filters: { label: string; value: string; remove: () => void }[] = [];

    if (make) {
      filters.push({
        label: make,
        value: 'make',
        remove: () => {
          setMake('');
          setModel('');
        },
      });
    }
    if (model) {
      filters.push({
        label: model,
        value: 'model',
        remove: () => setModel(''),
      });
    }
    if (priceFrom) {
      filters.push({
        label: `Min Price: AED ${priceFrom}`,
        value: 'price_from',
        remove: () => setPriceFrom(''),
      });
    }
    if (priceTo) {
      filters.push({
        label: `Max Price: AED ${priceTo}`,
        value: 'price_to',
        remove: () => setPriceTo(''),
      });
    }
    if (yearFrom) {
      filters.push({
        label: `Min Year: ${yearFrom}`,
        value: 'year_from',
        remove: () => setYearFrom(''),
      });
    }
    if (yearTo) {
      filters.push({
        label: `Max Year: ${yearTo}`,
        value: 'year_to',
        remove: () => setYearTo(''),
      });
    }
    if (mileageFrom) {
      filters.push({
        label: `Min Mileage: ${mileageFrom} km`,
        value: 'mileage_from',
        remove: () => setMileageFrom(''),
      });
    }
    if (mileageTo) {
      filters.push({
        label: `Max Mileage: ${mileageTo} km`,
        value: 'mileage_to',
        remove: () => setMileageTo(''),
      });
    }
    if (specs) {
      const specLabel = specsOptions.find((opt) => opt.value === specs)?.label || specs;
      filters.push({
        label: specLabel,
        value: 'specs',
        remove: () => setSpecs(''),
      });
    }
    if (emirate) {
      filters.push({
        label: emirate,
        value: 'emirate',
        remove: () => setEmirate(''),
      });
    }
    if (freeText) {
      filters.push({
        label: freeText,
        value: 'free_text',
        remove: () => setFreeText(''),
      });
    }
    if (sort && sort !== 'standard') {
      const sortLabel = sortOptions.find((opt) => opt.value === sort)?.label || sort;
      filters.push({
        label: sortLabel,
        value: 'sort',
        remove: () => setSort('standard'),
      });
    }

    return filters;
  }, [make, model, priceFrom, priceTo, yearFrom, yearTo, mileageFrom, mileageTo, specs, emirate, freeText, sort]);

  return (
    <div className="min-h-screen bg-[#f4f4f4]">
      {/* Header with subtle animation */}
      <header className="bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 transition-all duration-300 hover:-translate-y-1">
            <span className="font-black text-xl tracking-tight text-gray-900">
              memycar<span className="text-[#e03a14]">.com</span>
            </span>
            <span className="hidden sm:inline-block text-[10px] font-bold bg-[#f4f4f4] text-slate-600 px-2 py-0.5 rounded-full uppercase tracking-wider">
              UAE
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm font-medium text-gray-600 hover:text-gray-800">
              Search
            </Link>
            <Link
              href="/sell"
              className="flex items-center gap-1.5 bg-[#e03a14] hover:bg-[#c53210] text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all duration-300 hover:-translate-y-1"
            >
              <Search className="w-4 h-4" />
              Sell Your Car
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          {/* Search Results Page Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Sticky Sidebar */}
            <aside className="lg:col-span-1 sticky top-16">
              <div className="space-y-6">
                {/* Brand & Model */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Brand</label>
                  <select
                    value={make}
                    onChange={(e) => handleMakeChange(e.target.value)}
                    className="w-full px-4 py-3 rounded border border-slate-300 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                  >
                    <option value="">Any Brand</option>
                    {carData.makes.map((item) => (
                      <option key={item.make} value={item.make}>
                        {item.make}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Model</label>
                  <select
                    value={model}
                    disabled={!make}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full px-4 py-3 rounded border border-slate-300 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                  >
                    <option value="">{
                      make ? 'Any Model' : 'Select Brand First'
                    }</option>
                    {availableModels.map((mod) => (
                      <option key={mod} value={mod}>
                        {mod}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Regional Specs */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Regional Specs</label>
                  <select
                    value={specs}
                    onChange={(e) => setSpecs(e.target.value)}
                    className="w-full px-4 py-3 rounded border border-slate-300 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                  >
                    {specsOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Price (AED)</label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-1">From</label>
                      <input
                        type="number"
                        placeholder="e.g. 50000"
                        value={priceFrom}
                        onChange={(e) => setPriceFrom(e.target.value)}
                        className="w-full px-4 py-3 rounded border border-slate-300 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-1">To</label>
                      <input
                        type="number"
                        placeholder="e.g. 500000"
                        value={priceTo}
                        onChange={(e) => setPriceTo(e.target.value)}
                        className="w-full px-4 py-3 rounded border border-slate-300 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Year */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Year</label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-1">From</label>
                      <select
                        value={yearFrom}
                        onChange={(e) => setYearFrom(e.target.value)}
                        className="w-full px-4 py-3 rounded border border-slate-300 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                      >
                        <option value="">From</option>
                        {years.map((yr) => (
                          <option key={yr} value={yr}>
                            {yr}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-1">To</label>
                      <select
                        value={yearTo}
                        onChange={(e) => setYearTo(e.target.value)}
                        className="w-full px-4 py-3 rounded border border-slate-300 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                      >
                        <option value="">To</option>
                        {years.map((yr) => (
                          <option key={yr} value={yr}>
                            {yr}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Mileage */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Mileage (km)</label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-1">From</label>
                      <select
                        value={mileageFrom}
                        onChange={(e) => setMileageFrom(e.target.value)}
                        className="w-full px-4 py-3 rounded border border-slate-300 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                      >
                        {[0].map((mileage) => {
                          return <option key={mileage} value={mileage.toString()}>
                            test
                          </option>;
                        })</select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 block mb-1">To</label>
                      <select
                        value={mileageTo}
                        onChange={(e) => setMileageTo(e.target.value)}
                        className="w-full px-4 py-3 rounded border border-slate-300 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                      >
                        <option value="">to</option>
                        <option value="10000">10,000 km</option>
                        <option value="30000">30,000 km</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Emirate / City */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Emirate / City</label>
                  <select
                    value={emirate}
                    onChange={(e) => setEmirate(e.target.value)}
                    className="w-full px-4 py-3 rounded border border-slate-300 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                  >
                    <option value="">All Emirates</option>
                    {emirateOptions.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Free-text Search */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Keywords</label>
                  <input
                    type="text"
                    placeholder="e.g. Porsche 911 GCC Specs"
                    value={freeText}
                    onChange={(e) => setFreeText(e.target.value)}
                    className="w-full px-4 py-3 rounded border border-slate-300 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                  />
                </div>

                {/* Sorting */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Sort By</label>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="w-full px-4 py-3 rounded border border-slate-300 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                  >
                    {sortOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sticky bottom CTA */}
                <div className="mt-8 pt-4 border-t border-slate-100">
                  <div className="flex justify-between items-center">
                    <Link
                      href="/"
                      className="text-sm font-medium text-slate-500 hover:underline"
                      onClick={handleReset}
                    >
                      Reset Filters
                    </Link>
                    <button
                      className="bg-[#e03a14] hover:bg-[#c53210] text-white font-bold py-2 px-4 rounded-xl transition-all duration-300 hover:-translate-y-1"
                    >
                      Show {totalCount} Cars
                    </button>
                  </div>
                </div>
              </div>
            </aside>

            {/* Right Column: Main Results Stream */}
            <section className="lg:col-span-2">
              {/* Results Header */}
              <div className="mb-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between lg:gap-4">
                  <div className="mb-4 lg:mb-0">
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                      {totalCount} {make && model ? `${make} ${model}` : 'Cars'} Available
                    </h1>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {activeFilters.map((filter) => (
                      <div
                        key={filter.value}
                        className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 text-sm font-medium text-gray-700 rounded-full"
                      >
                        <span>{filter.label}</span>
                        <button
                          onClick={filter.remove}
                          className="text-slate-400 hover:text-slate-600"
                          aria-label={`Remove ${filter.label} filter`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    {!activeFilters.length && (
                      <span className="text-sm text-gray-500">No active filters</span>
                    )}
                  </div>
                </div>

                {/* Free-text quick keyword search at top of results */}
                <div className="mt-4 lg:mt-0">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search results..."
                      value={freeText}
                      onChange={(e) => setFreeText(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded border border-slate-300 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Listings Feed */}
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                  <p className="text-slate-600">Loading listings...</p>
                </div>
              ) : errorMsg ? (
                <div className="text-center py-12">
                  <p className="text-red-600">Error loading listings. Please try again.</p>
                </div>
              ) : listings.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-500">
                    No vehicles match your criteria. Try adjusting your filters.
                  </p>
                  <button
                    onClick={handleReset}
                    className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {listings.map((listing) => (
                    <ListingHorizontalCard key={listing.id} listing={listing} />
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}