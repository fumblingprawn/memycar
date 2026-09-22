'use client';

import React from 'react';
import Link from 'next/link';
import { Listing } from '@/types/listing';
import { MapPin, ShieldCheck, Wrench, Globe, Heart } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface ListingHorizontalCardProps {
  listing: Listing;
}

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

export default function ListingHorizontalCard({ listing }: ListingHorizontalCardProps) {
  const { locale, dir } = useLanguage();

  // Fallback chain for primary image
  const primaryImage =
    (Array.isArray((listing as any).image_urls) && (listing as any).image_urls.length > 0 && (listing as any).image_urls[0]) ||
    (Array.isArray((listing as any).images) && (listing as any).images.length > 0 && (listing as any).images[0]) ||
    ((listing as any).image_url) ||
    ((listing as any).photos?.front_three_quarter) ||
    '/placeholder-car.jpg';

  const isGcc = listing.specs === 'GCC';

  // Price for display with proper fallback chain
  const price = listing.price ?? listing.price_aed ?? 0;

  // Service indicator text
  let serviceIndicatorText = '';
  if (listing.last_service_date) {
    const date = new Date(listing.last_service_date);
    const options: Intl.DateTimeFormatOptions = { month: 'short', year: 'numeric' };
    serviceIndicatorText = `Serviced: ${date.toLocaleDateString(locale === 'ar' ? 'ar-US' : undefined, options)}`;
  }

  // Call button phone number
  const callPhoneRaw = listing.seller_phone || (listing as any).whatsapp_number || '';
  const callUrl = callPhoneRaw ? `tel:${callPhoneRaw}` : '#';

  // Pre-compute boolean values to avoid TypeScript narrowing issues
  const isFullAgency = listing.service_history === 'Full Agency';
  const isUnderWarranty = listing.warranty === 'Under Agency Warranty';

  // Get description based on UI language
  const getDescription = () => {
    if (locale === 'ar') {
      return listing.description_ar || listing.description || '';
    }
    return listing.description_en || listing.description || '';
  };

  return (
    <Link
      href={`/listing/${listing.id}`}
      className="group block rounded-3xl border border-slate-100 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white"
      dir={dir}
      lang={locale}
    >
      {/* Horizontal Layout */}
      <div className="flex">
        {/* Left side: Image */}
        <div className="w-64 relative aspect-[16/9] bg-slate-50 overflow-hidden shrink-0">
          {primaryImage ? (
            <>
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
              {/* Thumbnail strip underneath (up to 3 extra photos) */}
              <div className="absolute bottom-0 left-0 right-0 flex gap-1 p-1">
                {[
                  (listing as any).image_urls?.slice(1, 4),
                  (listing as any).images?.slice(0, 3),
                ]
                  .flat()
                  .filter(Boolean)
                  .map((url: string, index: number) => (
                    <div
                      key={index}
                      className="relative w-10 h-10 rounded overflow-hidden border border-slate-200"
                    >
                      <img
                        src={url}
                        alt={`Angle ${index + 2}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = getGrayPlaceholder();
                        }}
                      />
                    </div>
                  ))}
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
              No cover image
            </div>
          )}
        </div>

        {/* Right side: Content */}
        <div className="flex-1 p-5">
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
                <span>
                  {listing.mileage_km ? Number(listing.mileage_km).toLocaleString() : '0'} km
                </span>
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

              {/* Transmission */}
              {listing.transmission && (
                <>
                  <span className="w-0.5 bg-gray-300"></span>
                  <span className="flex items-center gap-1">
                    <Wrench className="h-3 w-3 text-gray-400" />
                    <span>{listing.transmission}</span>
                  </span>
                </>
              )}

              {/* Fuel Type */}
              {listing.fuel_type && (
                <>
                  <span className="w-0.5 bg-gray-300"></span>
                  <span className="flex items-center gap-1">
                    <Wrench className="h-3 w-3 text-gray-400" />
                    <span>{listing.fuel_type}</span>
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-3 text-sm">
              {isGcc && (
                <span className="px-3 py-1 bg-emerald-50 text-emerald-800 text-xs rounded">
                  🇦🇪 GCC Specs
                </span>
              )}
              {isFullAgency && (
                <span className="px-3 py-1 bg-blue-50 text-blue-800 text-xs rounded">
                  <ShieldCheck className="h-3 w-3 mr-1" /> Full Service History
                </span>
              )}
            </div>
          </div>

          {listing.description && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 line-clamp-2">{getDescription()}</p>
            </div>
          )}

          <div className="mt-6 flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3 text-gray-400" />
              <span>{listing.emirate}, UAE</span>
            </div>
          </div>
        </div>
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
              className="bg-[#e03a14] hover:bg-[#c53210] text-white font-semibold py-1.5 px-4 rounded-lg transition-all hover:-translate-y-1 text-xs"
            >
              Call Seller
            </button>
          )}

          {/* Save / Bookmark Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const saved = JSON.parse(localStorage.getItem('memycar_saved') || '[]');
              const isSaved = saved.includes(listing.id);
              if (isSaved) {
                localStorage.setItem('memycar_saved', JSON.stringify(saved.filter(id => id !== listing.id)));
              } else {
                localStorage.setItem('memycar_saved', JSON.stringify([...saved, listing.id]));
              }
              // Optionally show a toast or feedback
            }}
            className="flex-1 flex items-center justify-center bg-slate-200 hover:bg-slate-300 text-gray-500 font-medium py-1.5 px-4 rounded-lg transition-all hover:-translate-y-1 text-xs"
          >
            <Heart className="h-3 w-3" />
            Bookmark
          </button>
        </div>
      </div>
    </Link>
  );
}