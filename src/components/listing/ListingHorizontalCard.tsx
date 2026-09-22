'use client';

import React from 'react';
import Link from 'next/link';
import { Listing } from '@/types/listing';
import DynamicTranslate from '@/components/common/DynamicTranslate';
import { useLanguage } from '@/context/LanguageContext';
import { Gauge, MapPin, Calendar, ShieldCheck } from 'lucide-react';

export default function ListingHorizontalCard({ listing }: { listing: Listing }) {
  const { locale } = useLanguage();

  const price = (listing as any).price ?? (listing as any).price_aed ?? 0;
  const mileage = (listing as any).mileage ?? (listing as any).mileage_km ?? 0;
  const city = (listing as any).city || (listing as any).emirate || 'Dubai';
  const specs = (listing as any).specs || 'GCC Specs';

  let coverImage = '/placeholder-car.jpg';
  if (Array.isArray((listing as any).image_urls) && (listing as any).image_urls.length > 0) {
    coverImage = (listing as any).image_urls[0];
  } else if (Array.isArray((listing as any).images) && (listing as any).images.length > 0) {
    coverImage = (listing as any).images[0];
  }

  return (
    <Link
      href={`/listing/${listing.id}`}
      className="block bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md transition group"
    >
      <div className="flex flex-col sm:flex-row">
        {/* Vehicle Thumbnail */}
        <div className="sm:w-64 h-48 sm:h-auto relative bg-slate-900 flex-shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coverImage}
            alt={`${listing.make} ${listing.model}`}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
          <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded">
            <DynamicTranslate text={specs} />
          </span>
        </div>

        {/* Vehicle Details */}
        <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-extrabold text-slate-900 text-lg group-hover:text-[#e03a14] transition">
                <DynamicTranslate text={`${listing.year} ${listing.make} ${listing.model}`} />
                {(listing as any).trim && (
                  <span className="text-slate-500 text-sm font-normal ml-1">
                    • <DynamicTranslate text={(listing as any).trim} />
                  </span>
                )}
              </h3>
              <div className="text-xl font-black text-[#e03a14] whitespace-nowrap">
                {locale === 'ar' ? 'درهم' : 'AED'} {Number(price).toLocaleString()}
              </div>
            </div>

            {/* Description / Summary */}
            {(listing as any).description && (
              <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                <DynamicTranslate text={(listing as any).description} />
              </p>
            )}
          </div>

          {/* Key Specs Pills */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5 text-slate-400" />
              <span>{Number(mileage).toLocaleString()} {locale === 'ar' ? 'كم' : 'km'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{listing.year}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <DynamicTranslate text={city} />
            </div>
            {(listing as any).last_service_date && (
              <div className="flex items-center gap-1 text-emerald-600 font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{locale === 'ar' ? 'سعر مميز' : 'Great Price'}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
