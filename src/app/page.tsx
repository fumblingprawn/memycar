'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
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
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col justify-between">
      <div>
        {/* Hero Section */}
        <section className="pt-8 pb-10 px-4">
          <div className="max-w-4xl mx-auto">
            <HomeSearchBar />
          </div>
        </section>

        {/* Featured Listings Section */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

      {/* Fully Localized Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16 pt-12 pb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8 text-xs">
            {/* Col 1 */}
            <div>
              <h3 className="font-bold text-slate-900 mb-3">{t('aboutTitle')}</h3>
              <p className="text-slate-500 leading-relaxed">
                {t('aboutText')}
              </p>
            </div>

            {/* Col 2 */}
            <div>
              <h3 className="font-bold text-slate-900 mb-3">{t('quickLinks')}</h3>
              <ul className="space-y-2 text-slate-600">
                <li><Link href="/" className="hover:text-[#e03a14]">{t('home')}</Link></li>
                <li><Link href="/sell" className="hover:text-[#e03a14]">{t('sellCar')}</Link></li>
                <li><Link href="/search" className="hover:text-[#e03a14]">{t('searchCars')}</Link></li>
              </ul>
            </div>

            {/* Col 3 */}
            <div>
              <h3 className="font-bold text-slate-900 mb-3">{t('resources')}</h3>
              <ul className="space-y-2 text-slate-600">
                <li><span className="hover:text-[#e03a14] cursor-pointer">{t('helpCenter')}</span></li>
                <li><span className="hover:text-[#e03a14] cursor-pointer">{t('safetyTips')}</span></li>
                <li><span className="hover:text-[#e03a14] cursor-pointer">{t('termsOfUse')}</span></li>
                <li><span className="hover:text-[#e03a14] cursor-pointer">{t('privacyPolicy')}</span></li>
              </ul>
            </div>

            {/* Col 4 */}
            <div>
              <h3 className="font-bold text-slate-900 mb-3">{t('contact')}</h3>
              <p className="text-slate-500 mb-2">{t('dubaiUae')}</p>
              <p className="text-slate-700 font-semibold">support@memycar.com</p>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
            <span>© {new Date().getFullYear()} memycar.com. {t('allRightsReserved')}</span>
            <span className="font-semibold text-slate-500">UAE Automotive Marketplace</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
