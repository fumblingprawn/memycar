'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();

  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#e03a14] border-t-transparent mx-auto mb-3"></div>
          <p className="text-sm font-semibold text-slate-600">Loading car details...</p>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center max-w-md">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Listing Not Found</h2>
          <p className="text-sm text-slate-500 mb-6">This vehicle may have been sold or removed.</p>
          <Link
            href="/"
            className="inline-block bg-[#e03a14] hover:bg-[#c53210] text-white px-6 py-2.5 rounded-xl font-bold text-sm transition"
          >
            Back to Search
          </Link>
        </div>
      </div>
    );
  }

  // Safe field fallbacks
  const price = listing.price ?? listing.price_aed ?? 0;
  const mileage = listing.mileage ?? listing.mileage_km ?? 0;
  const city = listing.city || listing.emirate || 'Dubai';
  const specs = listing.specs || listing.spec || 'GCC Specs';
  const phone = listing.seller_phone || listing.whatsapp_number || '';

  // Safe image gathering
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

  return (
    <div className="min-h-screen bg-slate-50 py-6 md:py-10">
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

        {/* Title Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-slate-200 text-slate-700 text-xs font-bold px-2.5 py-0.5 rounded-md uppercase">
                {specs}
              </span>
              <span className="text-xs font-medium text-slate-500">{city}, UAE</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              {listing.year} {listing.make} {listing.model} {listing.trim || ''}
            </h1>
          </div>

          <div className="text-left md:text-right">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Asking Price</span>
            <span className="text-2xl md:text-3xl font-black text-[#e03a14]">
              AED {Number(price).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Photos & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Featured Photo Box */}
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
                    className="w-full h-full object-contain cursor-zoom-in group-hover:scale-[1.01] transition duration-200"
                  />
                  <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 pointer-events-none">
                    <span>🔍 Click to inspect & zoom</span>
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
                    className={`relative flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition ${
                      activeImageIndex === idx ? 'border-[#e03a14]' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Key Vehicle Facts */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">Key Vehicle Facts</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-3 rounded-xl">
                  <span className="text-xs text-slate-400 block mb-0.5">Year</span>
                  <span className="text-sm font-bold text-slate-900">{listing.year}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <span className="text-xs text-slate-400 block mb-0.5">Mileage</span>
                  <span className="text-sm font-bold text-slate-900">{Number(mileage).toLocaleString()} km</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <span className="text-xs text-slate-400 block mb-0.5">Regional Specs</span>
                  <span className="text-sm font-bold text-slate-900">{specs}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <span className="text-xs text-slate-400 block mb-0.5">City</span>
                  <span className="text-sm font-bold text-slate-900">{city}</span>
                </div>
              </div>
            </div>

            {/* Service & Maintenance History */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">Service & Maintenance History</h2>
              {listing.last_service_date ? (
                <div className="mb-3">
                  <span className="inline-block bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-md border border-emerald-200">
                    ✓ Last Serviced: {listing.last_service_date}
                  </span>
                </div>
              ) : (
                <p className="text-xs text-slate-400 mb-3">No specific service date recorded.</p>
              )}

              {listing.service_notes && (
                <div className="bg-slate-50 p-4 rounded-xl text-xs leading-relaxed text-slate-700 mb-4">
                  <p className="font-semibold text-slate-900 mb-1">Maintenance Notes:</p>
                  {listing.service_notes}
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
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">Seller Description</h2>
                <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">{listing.description}</p>
              </div>
            )}
          </div>

          {/* Right Column: Contact & Safety */}
          <div>
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm sticky top-24 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Direct Seller Contact</span>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{listing.seller_name || 'Vehicle Owner'}</h3>
                <p className="text-xs text-slate-500">{city}, UAE</p>
              </div>

              {phone ? (
                <a
                  href={`tel:${phone}`}
                  className="w-full bg-[#e03a14] hover:bg-[#c53210] text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Call {phone}
                </a>
              ) : (
                <button disabled className="w-full bg-slate-200 text-slate-400 py-3.5 px-4 rounded-xl font-bold text-sm">
                  Phone Not Available
                </button>
              )}

              <button
                disabled
                className="w-full bg-slate-100 text-slate-400 font-bold py-3 px-4 rounded-xl text-xs cursor-not-allowed border border-slate-200"
              >
                Internal Chat (Coming Soon)
              </button>

              <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 space-y-1">
                <p className="font-semibold text-slate-600">Buyer Safety Reminder:</p>
                <p>Always inspect the car and verify the Mulkiya (registration) in person before transferring any funds.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox High-Resolution Zoom Modal */}
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