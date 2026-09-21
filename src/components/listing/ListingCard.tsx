'use client';

import React from 'react';
import Link from 'next/link';
import { Listing, PhotoSlotKey } from '@/types/listing';
import { MapPin, ShieldCheck, Wrench, Globe } from 'lucide-react';

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

  // Pre-compute boolean values to avoid TypeScript narrowing issues
  const isFullAgency = listing.service_history === 'Full Agency';
  const isUnderWarranty = listing.warranty === 'Under Agency Warranty';

  return (
    <Link
      href={`/listing/${listing.id}`}
      className="group block rounded-3xl border border-slate-100 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white"
    >
      {/* 16:9 Standardized Hero Image Container */}
      <div className="relative aspect-[16/9] w-full bg-slate-50 overflow-hidden">
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={`${listing.year} ${listing.make} ${listing.model}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
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
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {/* Specs Badge */}
          <span
            className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-sm ${
              isGcc
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-900/80 text-white backdrop-blur-sm'
            }`}
          >
            {isGcc ? '🇦🇪 GCC' : listing.specs}
          </span>
          {/* Year Badge */}
          <span className="text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm bg-slate-900/20 text-slate-900 backdrop-blur-sm">
            {listing.year}
          </span>
          {/* City Badge */}
          <span className="text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm bg-slate-900/20 text-slate-900 backdrop-blur-sm">
            {listing.emirate}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-6 pt-0">
        <div className="mb-4">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <h3 className="mb-1 text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                {listing.year} {listing.make} {listing.model}
                {listing.trim ? <span className="ml-2 text-xs font-medium text-gray-500">{listing.trim}</span> : ''}
              </h3>
              <p className="text-sm text-gray-500 truncate">
                {listing.body_style || ''}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-2xl font-bold text-blue-600">
                AED {Number(price).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-sm text-gray-600 flex flex-wrap gap-4">
            {/* Mileage */}
            <div className="flex items-center gap-1">
              <Wrench className="h-3 w-3 text-gray-400" />
              <span>{Number(listing.mileage_km).toLocaleString()} km</span>
            </div>
            
            {/* Body Style */}
            {listing.body_style && (
              <>
                <span className="w-0.5 bg-gray-300"></span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-gray-400" />
                  <span>{listing.body_style}</span>
                </span>
              </>
            )}
          </div>
          
          <div className="text-sm text-gray-600 flex flex-wrap gap-4">
            {/* Specs */}
            <div className="flex items-center gap-1">
              <Globe className="h-3 w-3 text-gray-400" />
              <span>{listing.specs}</span>
            </div>
            
            {/* Service History */}
            {isFullAgency && (
              <>
                <span className="w-0.5 bg-gray-300"></span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-blue-600" />
                  <span>{listing.service_history}</span>
                </span>
              </>
            )}
          </div>
        </div>
        
        {isFullAgency || isUnderWarranty && (
          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-3 text-sm">
              {isFullAgency && (
                <span className="px-3 py-1 bg-blue-50 text-blue-800 text-xs rounded">
                  <ShieldCheck className="h-3 w-3 mr-1" /> Full Agency Service
                </span>
              )}
              {isUnderWarranty && (
                <span className="px-3 py-1 bg-green-50 text-green-800 text-xs rounded">
                  <Wrench className="h-3 w-3 mr-1" /> Under Warranty
                </span>
              )}
            </div>
          </div>
        )}
        
        {listing.description && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 line-clamp-2">{listing.description}</p>
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="pt-5 pb-4">
        <div className="flex justify-between items-center">
          {/* Call Seller Button */}
          {callUrl && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (callUrl) {
                  window.location.href = callUrl;
                }
              }}
              className="flex-1 flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-all hover:shadow-lg transform hover:-translate-y-1"
            >
              Call Seller
            </button>
          )}
          
          {/* Internal Chat Button (Coming Soon) */}
          <button
            disabled
            className="flex-1 flex items-center justify-center bg-slate-200 hover:bg-slate-300 text-gray-500 font-medium py-2 px-4 rounded-lg transition-all"
          >
            Internal Chat (Coming Soon)
          </button>
        </div>
      </div>
    </Link>
  );
}
