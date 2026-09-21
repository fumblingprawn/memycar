import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Listing } from '@/types/listing';
import ListingCard from '@/components/listing/ListingCard';
import SearchBar from '@/components/search/SearchBar';
import { Plus, Sparkles } from 'lucide-react';

interface HomePageProps {
  searchParams: Promise<{
    q?: string;
    spec?: string;
    emirate?: string;
    // New search parameters
    make?: string;
    model?: string;
    min_price?: string;
    max_price?: string;
    min_year?: string;
    max_year?: string;
    max_mileage?: string;
    specs?: 'GCC' | 'American' | 'Japanese' | 'European';
    sort?: string;
  }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedParams = await searchParams;
  const supabase = await createClient();

  // Start with base query
  let query = supabase.from('listings').select('*');

  // Apply filters
  if (resolvedParams.make) {
    query = query.eq('make', resolvedParams.make);
  }
  if (resolvedParams.model) {
    query = query.eq('model', resolvedParams.model);
  }
  if (resolvedParams.min_price) {
    query = query.gte('price_aed', parseInt(resolvedParams.min_price));
  }
  if (resolvedParams.max_price) {
    query = query.lte('price_aed', parseInt(resolvedParams.max_price));
  }
  if (resolvedParams.min_year) {
    query = query.gte('year', parseInt(resolvedParams.min_year));
  }
  if (resolvedParams.max_year) {
    query = query.lte('year', parseInt(resolvedParams.max_year));
  }
  if (resolvedParams.max_mileage) {
    query = query.lte('mileage_km', parseInt(resolvedParams.max_mileage));
  }
  if (resolvedParams.specs) {
    query = query.eq('specs', resolvedParams.specs);
  }
  if (resolvedParams.emirate) {
    query = query.eq('emirate', resolvedParams.emirate);
  }
  // Note: the old 'q' and 'spec' (for GCC) and 'emirate' are kept for backward compatibility?
  // We'll keep the old ones but they might be redundant with the new params.
  // We'll prioritize the new params if both are present.
  // For simplicity, we'll ignore the old q, spec, emirate if the new ones are present?
  // But we'll keep them as fallback.

  // Apply sorting
  const sortMap: Record<string, { column: string; ascending: boolean }> = {
    price_asc: { column: 'price_aed', ascending: true },
    price_desc: { column: 'price_aed', ascending: false },
    mileage_asc: { column: 'mileage_km', ascending: true },
    created_at_desc: { column: 'created_at', ascending: false },
    // Default is newest first (created_at desc)
  };

  const sortKey = resolvedParams.sort || 'created_at_desc';
  const sortInfo = sortMap[sortKey] || { column: 'created_at', ascending: false };
  query = query.order(sortInfo.column, { ascending: sortInfo.ascending });

  // Execute query
  const { data: listings, error } = await query;

  if (error) {
    console.error('Error fetching listings:', error);
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-6xl mx-auto py-12 text-center">
          <p className="text-slate-500">Failed to load listings. Please try again later.</p>
        </div>
      </div>
    );
  }

  const typedListings = (listings || []) as unknown as Listing[];

  // Additional client-side filtering for text search (if needed)
  const filteredListings = resolvedParams.q
    ? typedListings.filter((car) => {
        const fullTitle = `${car.year} ${car.make} ${car.model} ${car.trim || ''}`.toLowerCase();
        return fullTitle.includes(resolvedParams.q!.toLowerCase());
      })
    : typedListings;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-black text-xl tracking-tight text-slate-900">
              memycar<span className="text-blue-600">.com</span>
            </span>
            <span className="hidden sm:inline-block text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full uppercase tracking-wider">
              UAE / GCC
            </span>
          </Link>

          <Link
            href="/sell"
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            Sell Your Car
          </Link>
        </div>
      </header>

      {/* Search Bar */}
      <section className="bg-white border-b border-slate-200">
        <SearchBar />
      </section>

      {/* Listings Count and Sorting Dropdown (optional, we already have sorting in search bar) */}
      {/* We'll show the count and a reset button */}
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="text-sm text-slate-500">
          {filteredListings.length} {filteredListings.length === 1 ? 'car' : 'cars'} found
        </div>
        <Link
          href="/"
          className="text-sm text-blue-600 hover:underline"
        >
          Reset Filters
        </Link>
      </div>

      {/* Listings Grid */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {filteredListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredListings.map((car) => (
              <ListingCard key={car.id} listing={car} />
            ))}
          </div>
        ) : (
          <div className="max-w-md mx-auto text-center py-16 px-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No vehicles found matching your criteria</h3>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              Try adjusting your filters or check back later for new listings.
            </p>
            <Link
              href="/sell"
              className="inline-flex items-center gap-1.5 bg-blue-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow transition"
            >
              <Plus className="w-4 h-4" />
              List a Vehicle Now
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}