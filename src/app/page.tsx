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
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-slate-50 to-white/50">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center opacity-10"></div>
        <div className="relative py-20 sm:py-28">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h1 className="mb-4 text-4xl font-bold text-gray-900 sm:text-5xl">
              Find Your Perfect Car in the UAE
            </h1>
            <p className="mb-6 text-lg text-gray-600 max-w-2xl mx-auto">
              Browse thousands of verified cars with full service history, transparent pricing, and direct seller contact.
            </p>
            <div className="flex flex-col sm:flex-row sm:justify-center gap-4">
              <Link
                href="/sell"
                className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-all hover:shadow-lg transform hover:-translate-y-1"
              >
                <Plus className="mr-3 h-4 w-4" />
                Sell Your Car
              </Link>
              <Link
                href="/"
                className="flex-1 sm:flex-none border border-gray-300 bg-white hover:bg-gray-50 text-gray-800 font-medium py-3 px-6 rounded-lg transition-all hover:shadow-lg transform hover:-translate-y-1"
              >
                Browse Cars
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Search Bar */}
      <div className="mt-16">
        <HomeSearchBar />
      </div>

      {/* Latest Listings */}
      <section className="mt-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">
            Recently Listed
          </h2>
          {typedListings.length > 0 ? (
            <div className="grid gap-6">
              {/* Responsive grid: 1 column on mobile, 2 on tablet, 3 on desktop */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {typedListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-slate-500">
                No listings match your search criteria. Try adjusting your filters.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="mt-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">
            Ready to Find Your Next Car?
          </h2>
          <p className="mb-8 text-lg text-gray-600 max-w-2xl mx-auto">
            With verified listings, transparent pricing, and direct seller contact, 
            memycar makes buying and selling cars in the UAE simple and trustworthy.
          </p>
          <Link
            href="/sell"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition-all hover:shadow-lg transform hover:-translate-y-1"
          >
            <Plus className="mr-3 h-4 w-4" />
            List Your Car Today
          </Link>
        </div>
      </section>
    </div>
  );
}
