'use client';

import Link from 'next/link';
import HomeSearchBar from '@/components/search/HomeSearchBar';
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import ListingHorizontalCard from '@/components/listing/ListingHorizontalCard';
import { Listing } from '@/types/listing';

export default function HomePage() {
  const [featuredListings, setFeaturedListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedListings = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('listings')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(6);

        if (error) throw error;
        setFeaturedListings(data || []);
      } catch (err) {
        console.error('Error fetching featured listings:', err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedListings();
  }, []);

  return (
    <div className="min-h-screen bg-[#f4f4f4]">
      {/* Main Content - Clean, centered search */}
      <main className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-[#f4f4f4] py-12">
        <div className="max-w-4xl w-full px-4 sm:px-6 lg:px-8">
          {/* Centered Search Card */}
          <div className="space-y-8">
            <HomeSearchBar />

            {/* Featured & Latest Additions Section */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#e03a14] border-t-transparent mx-auto mb-4"></div>
                <p className="text-slate-600">Loading featured cars...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600">Error loading featured cars. Please try again.</p>
              </div>
            ) : featuredListings.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-500">No featured cars available at the moment.</p>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured & Latest Additions</h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {featuredListings.map((listing) => (
                    <ListingHorizontalCard key={listing.id} listing={listing} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}