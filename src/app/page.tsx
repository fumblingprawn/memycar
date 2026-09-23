'use client';

import React, { useEffect, useState } from 'react';
import HomeSearchBar from '@/components/search/HomeSearchBar';
import ListingCard from '@/components/listing/ListingCard';
import { createClient } from '@/lib/supabase/client';
import { useLanguage } from '@/context/LanguageContext';

export default function HomePage() {
  const supabase = createClient();
  const { t } = useLanguage();
  const [featuredListings, setFeaturedListings] = useState<any[]>([]);

  useEffect(() => {
    async function loadFeatured() {
      try {
        const { data } = await supabase
          .from('listings')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(8);

        if (data) setFeaturedListings(data);
      } catch (e) {
        console.error('Featured cars fetch error:', e);
      }
    }
    loadFeatured();
  }, [supabase]);

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-16">
      {/* Search Hero */}
      <section className="pt-8 pb-10 px-4">
        <div className="max-w-4xl mx-auto">
          <HomeSearchBar />
        </div>
      </section>

      {/* Featured Listings */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            {t('featuredTitle')}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {t('featuredSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {featuredListings.map((car) => (
            <ListingCard key={car.id} listing={car} />
          ))}
        </div>
      </section>
    </div>
  );
}
