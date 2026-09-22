import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Listing } from '@/types/listing';
import ListingCard from '@/components/listing/ListingCard';
import HomeSearchBar from '@/components/search/HomeSearchBar';
import { Plus, ShieldCheck, Wrench, Phone } from 'lucide-react';

interface HomePageProps {
  searchParams: Promise<{
    brand?: string;
    model?: string;
    yearMin?: string;
    yearMax?: string;
    mileageMin?: string;
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
  if (resolvedParams.mileageMin) {
    query = query.gte('mileage_km', parseInt(resolvedParams.mileageMin));
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
      <div className="min-h-screen bg-white">
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

      {/* Main Content */}
      <main className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          {/* Hero Section - mobile.de style */}
          <section className="relative mb-16">
            <div className="absolute inset-0">
              <img
                src="/hero-car.jpg"
                alt="Hero car image"
                className="w-full h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </div>
            <div className="relative z-10 pt-[300px] pb-12 text-center text-white">
              <h1 className="mb-6 text-4xl font-bold">
                Drive what fits you.
              </h1>
              <p className="mb-8 text-lg max-w-2xl mx-auto">
                Find the verified car for your lifestyle across Dubai, Abu Dhabi, and the GCC.
              </p>
            </div>
          </section>

          {/* Floating Search Widget - Dual-Card mobile.de layout */}
          <div className="relative -mb-16">
            <div className="max-w-6xl mx-auto px-4">
              <HomeSearchBar />
            </div>
          </div>

          {/* Listings Section */}
          <section className="mb-16">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">
              Latest Listings
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
              <div className="text-center py-12">
                <p className="text-slate-500">
                  No listings match your search criteria. Try adjusting your filters.
                </p>
              </div>
            )}
          </section>

          {/* Trust Section - Added warmth and personality */}
          <section className="text-center py-12 bg-white">
            <div className="max-w-4xl mx-auto px-6">
              <h2 className="mb-6 text-xl font-bold text-gray-900">
                Why Thousands Trust memycar
              </h2>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="bg-white p-6 rounded-lg border border-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                  <div className="flex items-center gap-3 mb-4">
                    <ShieldCheck className="h-5 w-5 text-[#e03a14]" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Peace of Mind</h3>
                      <p className="text-sm text-gray-600">
                        Every listing undergoes basic verification to ensure authenticity
                        and transparency in pricing.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                  <div className="flex items-center gap-3 mb-4">
                    <Wrench className="h-5 w-5 text-green-600" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Service History</h3>
                      <p className="text-sm text-gray-600">
                        Access complete maintenance records when available - know exactly
                        what you're buying.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                  <div className="flex items-center gap-3 mb-4">
                    <Phone className="h-5 w-5 text-purple-600" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Direct Connection</h3>
                      <p className="text-sm text-gray-600">
                        Connect with sellers instantly through phone or WhatsApp - no middlemen.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Adding a touch of personality/soul */}
              <div className="mt-8 flex items-center justify-center gap-4 text-sm text-gray-500">
                <div className="w-0.5 h-0.5 bg-gray-300 rounded-full"></div>
                <span>Serving the UAE automotive community since 2023</span>
                <div className="w-0.5 h-0.5 bg-gray-300 rounded-full"></div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}