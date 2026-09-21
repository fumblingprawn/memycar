'use client';

import React from 'react';
import Link from 'next/link';
import { Listing, PhotoSlotKey } from '@/types/listing';
import { MapPin, ShieldCheck, Wrench } from 'lucide-react';

interface ListingCardProps {
  listing: Listing;
}

export default function ListingCard({ listing }: ListingCardProps) {
  let heroImage = '';

  if (listing.photos && typeof listing.photos === 'object') {
    heroImage = (listing.photos as Record<string, any>).front_three_quarter;
    if (!heroImage && Array.isArray((listing.photos as any).extra_photos)) {
      heroImage = (listing.photos as any).extra_photos[0] || '';
    }
  }

  const isGcc = listing.specs === 'GCC';

  return (
    <Link
      href={`/listing/${listing.id}`}
      className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition duration-200 flex flex-col"
    >
      {/* 16:9 Standardized Hero Image Container */}
      <div className="relative aspect-[16/9] w-full bg-slate-900 overflow-hidden">
        {heroImage ? (
          <img
            src={heroImage}
            alt={`${listing.year} ${listing.make} ${listing.model}`}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
            No cover image
          </div>
        )}

        {/* Highlight Spec Badge */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-sm ${
              isGcc
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-900/80 text-white backdrop-blur-sm'
            }`}
          >
            {isGcc ? '🇦🇪 GCC' : listing.specs}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-baseline gap-2 mb-1">
            <span className="text-lg font-black text-slate-900 tracking-tight">
              AED {Number(listing.price_aed).toLocaleString()}
            </span>
          </div>

          <h3 className="font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-blue-600 transition">
            {listing.year} {listing.make} {listing.model}
            {listing.trim ? <span className="font-normal text-slate-500 ml-1">{listing.trim}</span> : ''}
          </h3>

          <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
            <span>{Number(listing.mileage_km).toLocaleString()} km</span>
            <span>•</span>
            <span className="flex items-center gap-0.5">
              <MapPin className="w-3 h-3 text-slate-400" />
              {listing.emirate}
            </span>
          </div>
        </div>

        {/* Micro Badges Footer */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-600">
          {listing.service_history === 'Full Agency' && (
            <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded font-medium">
              <Wrench className="w-3 h-3" />
              Agency
            </span>
          )}
          {listing.warranty === 'Under Agency Warranty' && (
            <span className="inline-flex items-center gap-1 text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded font-medium">
              <ShieldCheck className="w-3 h-3" />
              Warranty
            </span>
          )}
          <span className="ml-auto text-[10px] text-slate-400">
            {listing.keys_count === 2 ? '2 Keys' : '1 Key'}
          </span>
        </div>
      </div>
    </Link>
  );
}
