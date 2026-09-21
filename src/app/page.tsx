import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Listing } from '@/types/listing';
import ListingCard from '@/components/listing/ListingCard';
import { Plus, Search, Sparkles } from 'lucide-react';

interface HomePageProps {
  searchParams: Promise<{
    q?: string;
    spec?: string;
    emirate?: string;
  }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedParams = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from('listings')
    .select('*')
    .order('created_at', { ascending: false });

  if (resolvedParams.spec === 'GCC') {
    query = query.eq('specs', 'GCC');
  }

  if (resolvedParams.emirate) {
    query = query.eq('emirate', resolvedParams.emirate);
  }

  const { data: listings } = await query;
  const typedListings = (listings || []) as unknown as Listing[];

  const filteredListings = resolvedParams.q
    ? typedListings.filter((car) => {
        const fullTitle = `${car.year} ${car.make} ${car.model} ${car.trim || ''}`.toLowerCase();
        return fullTitle.includes(resolvedParams.q!.toLowerCase());
      })
    : typedListings;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Brand Bar */}
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

      {/* Hero / Filter Section */}
      <section className="bg-white border-b border-slate-200 py-6 px-4">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="max-w-xl">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Standardized car sales in the UAE.
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Uniform 5-angle photography, verified specs, and direct WhatsApp contact. No clutter.
            </p>
          </div>

          {/* Quick Filter Pills */}
          <div className="flex flex-wrap gap-2 pt-1">
            <Link
              href="/"
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition ${
                !resolvedParams.spec && !resolvedParams.emirate
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              All Listings
            </Link>
            <Link
              href="/?spec=GCC"
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition ${
                resolvedParams.spec === 'GCC'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              🇦🇪 GCC Specs Only
            </Link>
            <Link
              href="/?emirate=Dubai"
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition ${
                resolvedParams.emirate === 'Dubai'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Dubai
            </Link>
            <Link
              href="/?emirate=Abu Dhabi"
              className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition ${
                resolvedParams.emirate === 'Abu Dhabi'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Abu Dhabi
            </Link>
          </div>
        </div>
      </section>

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
            <h3 className="text-base font-bold text-slate-900">No vehicles listed yet</h3>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              Be the first to list a car on memycar.com with standardized angle photos.
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
