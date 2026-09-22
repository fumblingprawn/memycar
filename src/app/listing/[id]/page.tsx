'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Listing, PhotoSlotKey } from '@/types/listing';
import { createClient } from '@/lib/supabase/client';
import {
  ArrowLeft,
  MapPin,
  ShieldCheck,
  Wrench,
  Paintbrush,
  KeyRound,
  Gauge,
  Globe,
  Phone,
  MessageCircle,
  ChevronsLeft,
  ChevronsRight,
  X,
  ZoomIn,
  ZoomOut
} from 'lucide-react';

interface ListingDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ListingDetailPage({ params }: ListingDetailPageProps) {
  const router = useRouter();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchListing = async () => {
      try {
        const resolvedParams = await params;
        const id = resolvedParams.id;
        const supabase = createClient();

        const { data, error: supabaseError } = await supabase
          .from('listings')
          .select('*')
          .eq('id', id)
          .single();

        if (isMounted) {
          if (supabaseError) {
            throw supabaseError;
          }
          if (!data) {
            // Listing not found - redirect to not found page
            router.replace('/not-found');
            return;
          }
          setListing(data as Listing);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Failed to load listing');
          setListing(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchListing();

    return () => {
      isMounted = false;
    };
  }, [params, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-4"></div>
          <p className="text-slate-600">Loading listing...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error: {error}</p>
          <Link href="/" className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700">
            ← Back to home
          </Link>
        </div>
      </div>
    );
  }

  if (!listing) {
    // This should not happen because of the redirect above, but just in case
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">Listing not found</p>
          <Link href="/" className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700">
            ← Back to home
          </Link>
        </div>
      </div>
    );
  }

  // Field fallbacks as per user request
  const price = ((listing as any).price ?? (listing as any).price_aed ?? 0) as number;
  const mileage = ((listing as any).mileage ?? (listing as any).mileage_km ?? 0) as number;
  const city = ((listing as any).city || (listing as any).emirate || 'Dubai') as string;
  const specs = ((listing as any).specs || (listing as any).spec || 'GCC Specs') as string;
  const phone = ((listing as any).seller_phone || (listing as any).whatsapp_number || '') as string;

  // Image array handling as per user request
  let images: string[] = [];
  const image_urls = (listing as any).image_urls;
  const imagesArr = (listing as any).images;
  const photosObj = (listing as any).photos;
  if (Array.isArray(image_urls) && image_urls.length > 0) {
    images = image_urls.filter((url: any): url is string => typeof url === 'string' && url.length > 0);
  } else if (Array.isArray(imagesArr)) {
    images = imagesArr.filter((url: any): url is string => typeof url === 'string' && url.length > 0);
  } else if (photosObj && typeof photosObj === 'object') {
    const photosObjCast = photosObj as Record<string, any>;
    Object.values(photosObjCast).forEach((val) => {
      if (Array.isArray(val)) {
        val.forEach((url: any) => {
          if (typeof url === 'string' && url.length > 0) {
            images.push(url);
          }
        });
      } else if (typeof val === 'string' && val.length > 0) {
        images.push(val);
      }
    );
  }

  // Service records
  const serviceRecords = Array.isArray((listing as any).service_record_urls)
    ? ((listing as any).service_record_urls).filter((url: any): url is string => typeof url === 'string' && url.length > 0)
    : [];

  const rawWhatsapp = ((listing as any).seller_whatsapp ? (listing as any).seller_whatsapp.replace(/\D/g, '') : '') as string;
  const listingUrl = `https://memycar.com/listing/${listing.id}`;
  const whatsappMsg = encodeURIComponent(
    `Hi ${listing.seller_name || 'there'}, I saw your ${listing.year} ${listing.make} ${listing.model} on memycar.com (${listingUrl}). Is it still available?`
  );

  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = React.useState(false);
  const [isZoomed, setIsZoomed] = React.useState(false);

  // Lightbox keyboard navigation
  React.useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsLightboxOpen(false);
      } else if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, images.length, currentIndex]);

  return (
    <div className="min-h-screen bg-slate-50 pb-28 sm:pb-16">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to search
          </Link>
          <span className="font-bold text-sm tracking-tight text-slate-900">
            memycar<span className="text-blue-600">.com</span>
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                specs === 'GCC'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-200 text-slate-800'
              }`}>
                {specs === 'GCC' ? '🇦🇪 GCC Specs' : `${specs} Specs`}
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {city}, UAE
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {listing.year} {listing.make} {listing.model}
              {listing.trim ? <span className="text-slate-500 font-medium ml-2 text-xl">{listing.trim}</span> : null}
            </h1>
          </div>

          <div className="text-left md:text-right">
            <span className="text-xs text-slate-500 uppercase tracking-wider block font-medium">Asking Price</span>
            <span className="text-2xl sm:text-3xl font-black text-blue-600 tracking-tight">
              AED {price.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-2 sm:p-3 shadow-sm border border-slate-200 mb-8">
          {/* Image Gallery with Lightbox */}
          <div className="relative">
            {/* Main Image */}
            <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-slate-950">
              {images.length > 0 ? (
                <>
                  <img
                    src={images[currentIndex]}
                    alt={`${listing.year} ${listing.make} ${listing.model}`}
                    className="w-full h-full object-cover"
                    onClick={() => setIsLightboxOpen(true)}
                  />
                  {/* Zoom Overlay Icon */}
                  <button
                    className="absolute top-2 right-2 p-1 rounded-full bg-white/50 hover:bg-white/700 transaction-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsLightboxOpen(true);
                    }}
                  >
                    <ZoomIn className="h-4 w-4 text-slate-900" />
                  </button>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                  No preview image available
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {images.map((url, index) => (
                  <div
                    key={index}
                    className={`relative flex-shrink-0 w-24 aspect-[16/9] rounded-lg overflow-hidden border border-slate-200 ${
                      currentIndex === index ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    <img
                      src={url}
                      alt={`Angle ${index + 1}`}
                      className="w-full h-full object-cover"
                      onClick={() => setCurrentIndex(index)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-3">
                Key Vehicle Facts
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                    <Gauge className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block font-medium">Mileage</span>
                    <span className="text-sm font-bold text-slate-900">
                      {mileage.toLocaleString()} km
                    </span>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                    <Globe className="w-4 h-4" />
                  </div>
                </div>