import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Listing } from '@/types/listing';
import ListingCard from '@/components/listing/ListingCard';
import HomeSearchBar from '@/components/search/HomeSearchBar';
import { Plus } from 'lucide-react';

interface HomePageProps {
  searchParams: Promise<{
    brand?: string;
    model?: string;
    yearMin?: string;
    yearMax?: string;
    mileageMax?: string;
    priceMin?: string;
    priceMax?: string;
  }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedParams = await searchParams;
  const supabase = await createClient();

  // Start with base query
  let query = supabase.from('listings').select('*');

  // Apply filters from the search bar
  if (resolvedParams.brand) {
    query = query.eq('make', resolvedParams.brand);
  }
  if (resolvedParams.model) {
    query = query.eq('model', resolvedParams.model);
  }
  if (resolvedParams.yearMin) {
    query = query.gte('year', parseInt(resolvedParams.yearMin));
  }
  if (resolvedParams.yearMax) {
    query = query.lte('year', parseInt(resolvedParams.yearMax));
  }
  if (resolvedParams.mileageMax) {
    query = query.lte('mileage_km', parseInt(resolvedParams.mileageMax));
  }
  if (resolvedParams.priceMin) {
    query = query.gte('price_aed', parseInt(resolvedParams.priceMin));
  }
  if (resolvedParams.priceMax) {
    query = query.lte('price_aed', parseInt(resolvedParams.priceMax));
  }

  // Order by newest first
  query = query.order('created_at', { ascending: false });

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
      <HomeSearchBar />

      {/* Latest Listings */}
      <section className="py-8">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="mb-4 text-2xl font-bold text-slate-900">
            Latest Listings
          </h2>
          {typedListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {typedListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-500">
                No listings match your search criteria. Try adjusting your filters.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}