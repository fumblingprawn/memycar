'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useLanguage } from '@/context/LanguageContext';

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const { locale, dir } = useLanguage();

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

  // Get the appropriate description and service notes based on UI language
  const getDescription = () => {
    if (locale === 'ar') {
      return listing.description_ar || listing.description || '';
    }
    return listing.description_en || listing.description || '';
  };

  const getServiceNotes = () => {
    if (locale === 'ar') {
      return listing.service_notes_ar || listing.service_notes || '';
    }
    return listing.service_notes_en || listing.service_notes || '';
  };

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

  // Determine price rating (simplified logic)
  const getPriceRating = (price: number) => {
    // This is a simplified version - in reality you'd compare to market average
    if (price < 100000) return { text: 'Sehr guter Preis', color: 'bg-green-50 text-green-600' };
    if (price < 200000) return { text: 'Guter Preis', color: 'bg-green-50 text-green-600' };
    if (price < 300000) return { text: 'Fairer Preis', color: 'bg-yellow-50 text-yellow-600' };
    return { text: 'Über průměr', color: 'bg-red-50 text-red-600' };
  };

  const priceRating = getPriceRating(price);

  return (
    <div
      className="min-h-screen bg-slate-50 py-6 md:py-10"
      dir={dir}
      lang={locale}
    >
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

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Photos & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Featured Photo Box */}
            <div className="relative group aspect-[16/9] bg-slate-900 rounded-2xl overflow-hidden shadow-sm">
              {activeImage ? (
                <>
                  {/* Image Counter Badge */}
                  <div className="absolute top-3 left-3 bg-black/50 text-white text-xs font-medium px-2 py-1 rounded">
                    {activeImageIndex + 1} / {images.length}
                  </div>

                  {/* Main Image */}
                  <img
                    src={activeImage}
                    alt={listing.title || `${listing.make} ${listing.model}`}
                    className="w-full h-full object-contain cursor-zoom-in group-hover:scale-[1.01] transition duration-200"
                    onClick={() => {
                      setIsLightboxOpen(true);
                      setIsZoomed(false);
                    }}
                  />

                  {/* Navigation Arrows */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 text-slate-900 w-8 h-8 rounded-full flex items-center justify-center z-10"
                  >
                    <svg className="w-4 h-4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex((prev) => (prev + 1) % images.length);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 text-slate-900 w-8 h-8 rounded-full flex items-center justify-center z-10"
                  >
                    <svg className="w-4 h-4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                  </button>

                  {/* Bottom Overlay Buttons */}
                  <div className="absolute bottom-3 left-3 flex gap-2">
                    <button
                      onClick={() => {
                        // Show all photos modal
                        setIsLightboxOpen(true);
                        setIsZoomed(false);
                      }}
                      className="bg-black/50 text-white text-xs font-medium px-3 py-1.5 rounded hover:bg-black/60 transition"
                    >
                      Alle Bilder ({images.length})
                    </button>
                    <button
                      onClick={() => {
                        setIsZoomed(!isZoomed);
                      }}
                      className="bg-black/50 text-white text-xs font-medium px-3 py-1.5 rounded hover:bg-black/60 transition"
                    >
                      Vergrößern
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex h-full items-center justify-center text-slate-400">
                  <p>No preview image available</p>
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-4">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition ${
                      activeImageIndex === idx ? 'border-[#e03a14]' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Vehicle Title & Price Section */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="space-y-4">
                {/* Vehicle Title */}
                <div className="flex flex-col">
                  <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                    {listing.year} {listing.make} {listing.model} {listing.trim || ''}
                  </h1>
                  {listing.trim && (
                    <p className="text-sm font-medium text-slate-500 mt-1">
                      {listing.trim}
                    </p>
                  )}
                </div>

                {/* Price Block */}
                <div className="flex items-start gap-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                      Asking Price
                    </span>
                    <span className="text-2xl md:text-3xl font-black text-[#e03a14]">
                      AED {Number(price).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className={`${priceRating.color} rounded px-3 py-1 text-xs font-medium`}>
                      {priceRating.text}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Seller Card & Action Bar */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              {/* Seller Card */}
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="flex items-center space-x-2">
                    {/* 5-Star Rating (placeholder) */}
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className="text-yellow-400 text-xs">
                          ⭐
                        </span>
                      ))}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        {listing.seller_name || 'Vehicle Owner'}
                      </h3>
                      <p className="text-xs text-slate-500">{city}, UAE</p>
                    </div>
                  </div>
                </div>

                {/* Phone Contact */}
                {phone ? (
                  <a
                    href={`tel:${phone}`}
                    className="w-full bg-[#e03a14] hover:bg-[#c53210] text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Call {phone}
                  </a>
                ) : (
                  <button disabled className="w-full bg-slate-200 text-slate-400 py-3 px-4 rounded-xl font-bold text-sm">
                    Phone Not Available
                  </button>
                )}
              </div>

              {/* Action Bar */}
              <div className="flex gap-3">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    // Save to favorites (using localStorage for demo)
                    const saved = JSON.parse(localStorage.getItem('memycar_saved') || '[]');
                    const isSaved = saved.includes(listing.id);
                    if (isSaved) {
                      localStorage.setItem('memycar_saved', JSON.stringify(saved.filter((id: number) => id !== listing.id)));
                    } else {
                      localStorage.setItem('memycar_saved', JSON.stringify([...saved, listing.id]));
                    }
                  }}
                  className="flex-1 flex items-center justify-center border border-slate-200 hover:border-[#e03a14] hover:text-[#e03a14] py-2 px-4 rounded-xl text-sm font-medium transition-colors"
                >
                  <span className="mr-2">♡</span> Parken (Save)
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    // Share functionality
                    const shareData = {
                      title: `${listing.year} ${listing.make} ${listing.model}`,
                      text: `Check out this ${listing.year} ${listing.make} ${listing.model} on memycar.com`,
                      url: `${window.location.origin}/listing/${listing.id}`
                    };
                    // Fallback for browsers without Share API
                    alert('Sharing not implemented in this demo');
                  }}
                  className="flex-1 flex items-center justify-center border border-slate-200 hover:border-[#e03a14] hover:text-[#e03a14] py-2 px-4 rounded-xl text-sm font-medium transition-colors"
                >
                  <span className="mr-2">🔗</span> Teilen (Share)
                </button>
              </div>
            </div>

            {/* Buyer Notice / Disclaimer Box */}
            <div className="bg-blue-50 rounded-2xl border border-blue-200 p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <span className="text-blue-600">ℹ️</span>
                </div>
                <div>
                  <p className="text-sm text-blue-800">
                    Verified UAE Vehicle. Check service history and inspect registration before transfer.
                  </p>
                </div>
              </div>
            </div>

            {/* 6-Item Icon Specs Grid (2 rows x 3 columns) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
                Key Vehicle Facts
              </h2>
              <div className="grid grid-cols-3 gap-4">
                {/* Mileage */}
                <div className="bg-slate-50 p-3 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Kilometerstand</span>
                    <span className="text-sm font-bold text-slate-900">{Number(mileage).toLocaleString()} km</span>
                  </div>
                </div>

                {/* Regional Specs */}
                <div className="bg-slate-50 p-3 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Regional Specs</span>
                    <span className="text-sm font-bold text-slate-900">{specs}</span>
                  </div>
                </div>

                {/* Fuel Type */}
                <div className="bg-slate-50 p-3 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Kraftstoffart</span>
                    <span className="text-sm font-bold text-slate-900">
                      {listing.fuel_type || '-'}
                    </span>
                  </div>
                </div>

                {/* Transmission */}
                <div className="bg-slate-50 p-3 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Getriebe</span>
                    <span className="text-sm font-bold text-slate-900">
                      {listing.transmission || '-'}
                    </span>
                  </div>
                </div>

                {/* Year (formatted as MM/YYYY) */}
                <div className="bg-slate-50 p-3 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Erstzulassung</span>
                    <span className="text-sm font-bold text-slate-900">
                      {listing.year ? `01/${listing.year}` : '-'}
                    </span>
                  </div>
                </div>

                {/* Service Status */}
                <div className="bg-slate-50 p-3 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Service Status</span>
                    <span className="text-sm font-bold text-slate-900">
                      {listing.last_service_date ? 'Full Agency History' : 'No Service Record'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Maintenance & Service Records */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">
                Maintenance & Service Records
              </h2>

              {listing.last_service_date ? (
                <div className="mb-3">
                  <span className="inline-block bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-md border border-emerald-200">
                    ✓ Last Serviced: {new Date(listing.last_service_date).toLocaleDateString('en-US', {
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              ) : (
                <p className="text-xs text-slate-400 mb-3">No specific service date recorded.</p>
              )}

              {listing.service_notes && (
                <div className="bg-slate-50 p-4 rounded-xl text-xs leading-relaxed text-slate-700 mb-4">
                  <p className="font-semibold text-slate-900 mb-1">Maintenance Notes:</p>
                  {getServiceNotes()}
                </div>
              )}

              {Array.isArray(listing.service_record_urls) && listing.service_record_urls.length > 0 && (
                <div>
                  <span className="text-xs font-semibold text-slate-600 block mb-2">Verified Documents:</span>
                  <div className="mt-2 flex flex-wrap gap-2">
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

            {/* Seller Description */}
            {listing.description && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Seller Description
                </h2>
                <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">{getDescription()}</p>
              </div>
            )}
          </div>

          {/* Right Column: Contact & Safety (Sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Direct Seller Contact
                </span>

                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-slate-900">
                    {listing.seller_name || 'Vehicle Owner'}
                  </h3>
                  <p className="text-xs text-slate-500">{city}, UAE</p>
                </div>

                {phone ? (
                  <a
                    href={`tel:${phone}`}
                    className="w-full bg-[#e03a14] hover:bg-[#c53210] text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Call {phone}
                  </a>
                ) : (
                  <button disabled className="w-full bg-slate-200 text-slate-400 py-3 px-4 rounded-xl font-bold text-sm">
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