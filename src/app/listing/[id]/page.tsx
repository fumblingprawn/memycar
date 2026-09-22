'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import DynamicTranslate from '@/components/common/DynamicTranslate';
import { 
  Gauge, 
  Globe, 
  Fuel, 
  Cog, 
  Calendar, 
  Wrench, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Share2, 
  Bookmark, 
  Phone 
} from 'lucide-react';

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();

  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function fetchListing() {
      if (!params?.id) return;
      try {
        const { data, error } = await supabase
          .from('listings')
          .select('*')
          .eq('id', params.id)
          .single();

        if (error) throw error;
        setListing(data);
      } catch (err) {
        console.error('Failed to load listing:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchListing();
  }, [params?.id, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f4f4] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#e03a14] border-t-transparent mx-auto mb-3"></div>
          <p className="text-sm font-semibold text-slate-600">Loading car details...</p>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-[#f4f4f4] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center max-w-md">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Listing Not Found</h2>
          <p className="text-sm text-slate-500 mb-6">This vehicle may have been sold or removed.</p>
          <Link
            href="/search"
            className="inline-block bg-[#e03a14] hover:bg-[#c53210] text-white px-6 py-2.5 rounded-xl font-bold text-sm transition"
          >
            Back to Search
          </Link>
        </div>
      </div>
    );
  }

  // Safe data fallbacks
  const price = listing.price ?? listing.price_aed ?? 0;
  const mileage = listing.mileage ?? listing.mileage_km ?? 0;
  const city = listing.city || listing.emirate || 'Dubai';
  const specs = listing.specs || listing.spec || 'GCC Specs';
  const phone = listing.seller_phone || listing.whatsapp_number || '';
  const sellerName = listing.seller_name || 'Vehicle Owner';

  // Gather images
  const images: string[] = [];
  if (Array.isArray(listing.image_urls) && listing.image_urls.length > 0) {
    images.push(...listing.image_urls);
  } else if (Array.isArray(listing.images) && listing.images.length > 0) {
    images.push(...listing.images);
  } else if (listing.photos && typeof listing.photos === 'object') {
    Object.values(listing.photos).forEach((val) => {
      if (typeof val === 'string' && val.startsWith('http')) {
        images.push(val);
      }
    });
  }

  const activeImage = images[activeImageIndex] || null;

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleBookmark = () => {
    setSaved(!saved);
  };

  return (
    <div className="min-h-screen bg-[#f4f4f4] py-6 md:py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-4">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
          >
            ← Back to search
          </button>
        </div>

        {/* Top 2-Column Split: Gallery on Left, Sticky Seller Box on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mb-8">
          {/* Left Column: Visuals & Gallery */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-sm relative group aspect-[16/9] flex items-center justify-center">
              {activeImage ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={activeImage}
                    alt={listing.title || `${listing.make} ${listing.model}`}
                    onClick={() => {
                      setIsLightboxOpen(true);
                      setIsZoomed(false);
                    }}
                    className="w-full h-full object-contain cursor-zoom-in"
                  />

                  {/* Image Counter Badge (1/X) */}
                  {images.length > 0 && (
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white px-2.5 py-1 rounded-md text-xs font-bold tracking-wider">
                      {activeImageIndex + 1} / {images.length}
                    </div>
                  )}

                  {/* Carousel Arrows */}
                  {images.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
                        }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-sm transition"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-sm transition"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}

                  {/* Action overlays on image */}
                  <div className="absolute bottom-3 left-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsLightboxOpen(true)}
                      className="bg-black/60 hover:bg-black/80 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      Inspect & Zoom
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center p-8 text-slate-400">
                  <p className="text-sm">No preview image available</p>
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative flex-shrink-0 w-24 h-16 rounded-xl overflow-hidden border-2 transition ${
                      activeImageIndex === idx ? 'border-[#e03a14]' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Sticky Seller Contact Box */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm sticky top-24 space-y-5">
              {/* Vehicle Title & Trim */}
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
                  {listing.title ? (
                    <DynamicTranslate text={listing.title} as="span" />
                  ) : (
                    `${listing.make} ${listing.model}`
                  )}
                </h1>
                <p className="text-sm font-medium text-slate-500 mt-0.5">
                  {listing.trim ? `${listing.trim} • ` : ''}{listing.year}
                </p>
              </div>

              {/* Price & Rating Meter */}
              <div className="pt-2 border-t border-slate-100">
                <div className="text-3xl font-black text-[#e03a14]">
                  AED {Number(price).toLocaleString()}
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex gap-1">
                    <span className="w-3 h-1.5 rounded-sm bg-emerald-500"></span>
                    <span className="w-3 h-1.5 rounded-sm bg-emerald-500"></span>
                    <span className="w-3 h-1.5 rounded-sm bg-emerald-500"></span>
                    <span className="w-3 h-1.5 rounded-sm bg-emerald-500"></span>
                    <span className="w-3 h-1.5 rounded-sm bg-slate-200"></span>
                  </div>
                  <span className="text-xs font-bold text-emerald-600">Great Market Price</span>
                </div>
              </div>

              {/* Seller Profile & Location */}
              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <Link
                    href={`/search?seller=${encodeURIComponent(sellerName)}`}
                    className="font-bold text-slate-900 hover:text-[#e03a14] transition text-sm"
                  >
                    {sellerName}
                  </Link>
                  <span className="text-amber-500 text-xs font-bold">★★★★★ 4.9</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{city}, UAE</p>
              </div>

              {/* Primary Call Action */}
              {phone ? (
                <a
                  href={`tel:${phone}`}
                  className="w-full bg-[#e03a14] hover:bg-[#c53210] text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow transition"
                >
                  <Phone className="w-4 h-4" />
                  Call {phone}
                </a>
              ) : (
                <button disabled className="w-full bg-slate-200 text-slate-400 py-3.5 px-4 rounded-xl font-bold text-sm">
                  Phone Not Available
                </button>
              )}

              {/* Bookmark & Share Actions */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleBookmark}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                    saved ? 'border-[#e03a14] text-[#e03a14] bg-orange-50' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  {saved ? 'Saved' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  className="py-2 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  {copied ? 'Link Copied!' : 'Share'}
                </button>
              </div>

              <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 leading-normal">
                <span className="font-semibold text-slate-600 block mb-0.5">Direct UAE Seller</span>
                Verify the car chassis and registration (Mulkiya) in person before payment.
              </div>
            </div>
          </div>
        </div>

        {/* Lower Left Column: Specifications & History */}
        <div className="max-w-full lg:max-w-[66.666667%] space-y-6">
          {/* Buyer Disclaimer Box */}
          <div className="bg-blue-50 rounded-2xl border border-blue-200 p-4 text-xs text-blue-900 leading-relaxed">
            <span className="font-bold">Verified UAE Listing:</span> Check service history and inspect registration before transfer.
          </div>

          {/* 6-Item Icon Specs Grid */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-5">Key Vehicle Details</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <Gauge className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <span className="text-xs text-slate-400 block">Mileage</span>
                  <span className="text-sm font-bold text-slate-900">{Number(mileage).toLocaleString()} km</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <span className="text-xs text-slate-400 block">Regional Specs</span>
                  <span className="text-sm font-bold text-slate-900">{specs}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Fuel className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <span className="text-xs text-slate-400 block">Fuel Type</span>
                  <span className="text-sm font-bold text-slate-900">{listing.fuel_type || 'Petrol'}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Cog className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <span className="text-xs text-slate-400 block">Transmission</span>
                  <span className="text-sm font-bold text-slate-900">{listing.transmission || 'Automatic'}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <span className="text-xs text-slate-400 block">Year</span>
                  <span className="text-sm font-bold text-slate-900">{listing.year}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Wrench className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <span className="text-xs text-slate-400 block">Service History</span>
                  <span className="text-sm font-bold text-slate-900">
                    {listing.last_service_date ? 'Documented' : 'Standard'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Maintenance & Service Records */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Service & Maintenance Records</h2>
            {listing.last_service_date ? (
              <div className="mb-3">
                <span className="inline-block bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-md border border-emerald-200">
                  ✓ Last Serviced: {listing.last_service_date}
                </span>
              </div>
            ) : (
              <p className="text-xs text-slate-400 mb-3">No specific service date recorded.</p>
            )}

            {listing.service_notes && (
              <div className="bg-slate-50 p-4 rounded-xl text-xs leading-relaxed text-slate-700 mb-4">
                <p className="font-semibold text-slate-900 mb-1">Maintenance Notes:</p>
                <DynamicTranslate
                  as="p"
                  text={listing.service_notes}
                  className="text-slate-700"
                />
              </div>
            )}

            {Array.isArray(listing.service_record_urls) && listing.service_record_urls.length > 0 && (
              <div>
                <span className="text-xs font-semibold text-slate-600 block mb-2">Verified Documents:</span>
                <div className="flex flex-wrap gap-2">
                  {listing.service_record_urls.map((url: string, i: number) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 transition"
                    >
                      📄 Document #{i + 1}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {listing.description && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Vehicle Description</h2>
              <DynamicTranslate
                as="p"
                text={listing.description}
                className="text-sm text-slate-700 whitespace-pre-line leading-relaxed"
              />
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Zoom Modal */}
      {isLightboxOpen && activeImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div className="absolute top-4 right-4 flex items-center gap-3 z-10">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsZoomed(!isZoomed);
              }}
              className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-semibold backdrop-blur-sm transition"
            >
              {isZoomed ? 'Reset Zoom' : '2x Zoom In'}
            </button>
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="bg-white/10 hover:bg-white/20 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold backdrop-blur-sm transition"
            >
              ✕
            </button>
          </div>

          <div
            className={`max-w-5xl max-h-[85vh] overflow-auto transition-transform duration-200 ${
              isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
            }`}
            onClick={(e) => {
              e.stopPropagation();
              setIsZoomed(!isZoomed);
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeImage}
              alt="Enlarged view"
              className="max-h-[85vh] w-auto mx-auto object-contain select-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}