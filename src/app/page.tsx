import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Listing } from '@/types/listing';
import ListingCard from '@/components/listing/ListingCard';
import HomeSearchBar from '@/components/search/HomeSearchBar';
import { Plus } from 'lucide-react';

interface HomePageProps {
  searchParams: Promise<{
    make?: string;
    model?: string;
    year_from?: string;
    year_to?: string;
    mileage_from?: string;
    mileage_to?: string;
    price_from?: string;
    price_to?: string;
    emirate?: Emirate;
    specs?: VehicleSpec;
  }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedParams = await searchParams;
  const supabase = await createClient();

  // Start with base query
  let query = supabase.from('listings').select('*');

  // Apply filters from the search bar (adjust parameter names to match new HomeSearchBar)
  if (resolvedParams.make) {
    query = query.eq('make', resolvedParams.make);
  }
  if (resolvedParams.model) {
    query = query.eq('model', resolvedParams.model);
  }
  if (resolvedParams.year_from) {
    query = query.gte('year', parseInt(resolvedParams.year_from));
  }
  if (resolvedParams.year_to) {
    query = query.lte('year', parseInt(resolvedParams.year_to));
  }
  if (resolvedParams.mileage_from) {
    query = query.gte('mileage_km', parseInt(resolvedParams.mileage_from));
  }
  if (resolvedParams.mileage_to) {
    query = query.lte('mileage_km', parseInt(resolvedParams.mileage_to));
  }
  if (resolvedParams.price_from) {
    query = query.gte('price_aed', parseInt(resolvedParams.price_from));
  }
  if (resolvedParams.price_to) {
    query = query.lte('price_aed', parseInt(resolvedParams.price_to));
  }
  if (resolvedParams.emirate) {
    query = query.eq('emirate', resolvedParams.emirate);
  }
  if (resolvedParams.specs) {
    query = query.eq('specs', resolvedParams.specs);
  }

  // Order by newest first
  query = query.order('created_at', { ascending: false });

  // Execute query
  const { data: listings, error } = await query;

  if (error) {
    console.error('Error fetching listings:', error);
    return (
      <div className="min-h-screen bg-[#f4f4f4]">
        <div className="max-w-6xl mx-auto py-12 text-center">
          <p className="text-slate-500">Failed to load listings. Please try again later.</p>
        </div>
      </div>
    );
  }

  const typedListings = (listings || []) as unknown as Listing[];

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
            <Link
              href="/"
              className="text-sm font-medium text-gray-600 hover:text-gray-800"
            >
              Search
            </Link>
            <Link
              href="/sell"
              className="flex items-center gap-1.5 bg-[#e03a14] hover:bg-[#c53210] text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all duration-300 hover:-translate-y-1"
            >
              <Plus className="w-4 h-4" />
              Sell Your Car
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content - Clean, centered search */}
      <main className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-[#f4f4f4]">
        <div className="max-w-4xl w-full px-4 sm:px-6 lg:px-8">
          {/* Centered Search Card */}
          <div className="space-y-8">
            <HomeSearchBar />

            {/* Optional: Show recent listings below search */}
            {typedListings.length > 0 && (
              <>
                <h2 className="mb-4 text-2xl font-bold text-gray-900">
                  Featured Listings
                </h2>
                <div className="grid gap-6">
                  {/* Responsive grid: 1 column on mobile, 2 on tablet, 3 on desktop */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {typedListings.slice(0, 6).map((listing) => (
                      <ListingCard key={listing.id} listing={listing} />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}