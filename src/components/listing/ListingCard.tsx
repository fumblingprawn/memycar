'use client';

import React from 'react';
import Link from 'next/link';
import { Listing, PhotoSlotKey } from '@/types/listing';
import { MapPin, ShieldCheck, Wrench } from 'lucide-react';

interface ListingCardProps {
  listing: Listing;
}

export default function ListingCard({ listing }: ListingCardProps) {
  // Fallback chain for primary image
  const primaryImage =
    (Array.isArray((listing as any).image_urls) && (listing as any).image_urls.length > 0 && (listing as any).image_urls[0]) ||
    (Array.isArray((listing as any).images) && (listing as any).images.length > 0 && (listing as any).images[0]) ||
    ((listing as any).image_url) ||
    ((listing as any).photos?.front_three_quarter) ||
    '/placeholder-car.jpg';

  // Generate a gray SVG placeholder for onError
  const getGrayPlaceholder = () => {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="400" height="225">
        <rect width="400" height="225" fill="#ddd"/>
        <text x="50%" y="50%" fill="#999" dominant-baseline="middle" text-anchor="middle">No Image</text>
      </svg>
    `;
    return `data:image/svg+xml;base64,${window.btoa(svg)}`;
  };

  const isGcc = listing.specs === 'GCC';

  // Price for display
  const price = listing.price_aed ?? (listing as any).price ?? 0;

  // Service indicator text
  let serviceIndicatorText = '';
  if (listing.last_service_date) {
    const date = new Date(listing.last_service_date);
    const options: Intl.DateTimeFormatOptions = { month: 'short', year: 'numeric' };
    serviceIndicatorText = `Serviced: ${date.toLocaleDateString(undefined, options)}`;
  }

  // Call button phone number
  const callPhoneRaw = listing.seller_phone || (listing as any).whatsapp_number || '';
  const callUrl = callPhoneRaw ? `tel:${callPhoneRaw}` : '#';

  return (
    <Link
      href={`/listing/${listing.id}`}
      className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition duration-200 flex flex-col"
    >
      {/* 16:9 Standardized Hero Image Container */}
      <div className="relative aspect-[16/9] w-full bg-slate-900 overflow-hidden">
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={`${listing.year} ${listing.make} ${listing.model}`}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = getGrayPlaceholder();
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
            No cover image
          </div>
        )}

        {/* Badges: Specs, Year, City */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {/* Specs Badge */}
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-sm ${
              isGcc
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-900/80 text-white backdrop-blur-sm'
            }`}
          >
            {isGcc ? '🇦🇪 GCC' : listing.specs}
          </span>
          {/* Year Badge */}
          <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900/20 text-slate-900 backdrop-blur-sm">
            {listing.year}
          </span>
          {/* City Badge */}
          <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900/20 text-slate-900 backdrop-blur-sm">
            {listing.emirate}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-baseline gap-2 mb-1">
            <span className="text-lg font-black text-slate-900 tracking-tight">
              AED {Number(price).toLocaleString()}
            </span>
            {/* Call Seller Button */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (callUrl) {
                  window.location.href = callUrl;
                }
              }}
              className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition-shadow hover:shadow"
            >
              Call Seller
            </button>
            {/* Internal Chat Button (Coming Soon) */}
            <button
              disabled
              className="flex items-center gap-1.5 bg-slate-400 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition-shadow hover:shadow cursor-not-allowed"
            >
              Internal Chat (Coming Soon)
            </button>
          </div>

          <h3 className="font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-blue-600 transition">
            {listing.year} {listing.make} {listing.model}
            {listing.trim ? <span className="font-normal text-slate-500 ml-1">{listing.trim}</span> : ''}
          </h3>

          <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-2">
            {/* Mileage */}
            <span>{Number(listing.mileage_km).toLocaleString()} km</span>
            {/* Body Style */}
            {listing.body_style ? (
              <>
                <span>•</span>
                <span className="flex items-center gap-0.5">
                  <Wrench className="w-3 h-3 text-slate-400" />
                  {listing.body_style}
                </span>
              </>
            ) : null}
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
          {serviceIndicatorText && (
            <span className="mx-2 text-[10px] text-slate-500">
              {serviceIndicatorText}
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