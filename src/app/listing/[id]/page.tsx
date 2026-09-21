import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Listing, PhotoSlotKey } from '@/types/listing';
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

export default async function ListingDetailPage({ params }: ListingDetailPageProps) {
  const resolvedParams = await params;
  const supabase = await createClient();

  const { data: listing, error } = await supabase
    .from('listings')
    .select('*')
    .eq('id', resolvedParams.id)
    .single();

  if (error || !listing) {
    notFound();
  }

  const typedListing = listing as unknown as Listing;

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
    });
  }

  // Service records
  const serviceRecords = Array.isArray((listing as any).service_record_urls)
    ? ((listing as any).service_record_urls).filter((url: any): url is string => typeof url === 'string' && url.length > 0)
    : [];

  const rawWhatsapp = ((listing as any).seller_whatsapp ? (listing as any).seller_whatsapp.replace(/\D/g, '') : '') as string;
  const listingUrl = `https://memycar.com/listing/${typedListing.id}`;
  const whatsappMsg = encodeURIComponent(
    `Hi ${typedListing.seller_name || 'there'}, I saw your ${typedListing.year} ${typedListing.make} ${typedListing.model} on memycar.com (${listingUrl}). Is it still available?`
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
              {typedListing.year} {typedListing.make} {typedListing.model}
              {typedListing.trim ? <span className="text-slate-500 font-medium ml-2 text-xl">{typedListing.trim}</span> : null}
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
                    alt={`${typedListing.year} ${typedListing.make} ${typedListing.model}}`}
                    className="w-full h-full object-cover"
                    onClick={() => setIsLightboxOpen(true)}
                  />
                  {/* Zoom Overlay Icon */}
                  <button
                    className="absolute top-2 right-2 p-1 rounded-full bg-white/50 hover:bg-white/700 transition-all"
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
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-start gap-3">
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

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block font-medium">Regional Specs</span>
                    <span className="text-sm font-bold text-slate-900">{specs}</span>
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block font-medium">Service History</span>
                    <span className="text-sm font-bold text-slate-900">{typedListing.service_history ?? 'Not specified'}</span>
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                    <Paintbrush className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block font-medium">Paint Condition</span>
                    <span className="text-sm font-bold text-slate-900">{typedListing.paint_condition ?? 'Not specified'}</span>
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block font-medium">Warranty</span>
                    <span className="text-sm font-bold text-slate-900">{typedListing.warranty ?? 'Not specified'}</span>
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-slate-100 text-slate-700">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block font-medium">Original Keys</span>
                    <span className="text-sm font-bold text-slate-900">
                      {typedListing.keys_count === 2 ? '2 Keys' : '1 Key Only'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {typedListing.description && (
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-2">
                  Seller Notes & Details
                </h2>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {typedListing.description}
                </p>
              </div>
            )}

            {/* Service Records & Maintenance */}
            <div className="mt-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-3">
                Service History & Maintenance
              </h2>
              {((listing as any).last_service_date) && (
                <div className="mb-2">
                  <span className="text-[11px] text-slate-500 block font-medium">Last Service Date:</span>
                  <span className="text-sm font-bold text-slate-900">{new Date((listing as any).last_service_date).toLocaleDateString()}</span>
                </div>
              )}
              {((listing as any).service_notes) && (
                <div className="mb-2">
                  <span className="text-[11px] text-slate-500 block font-medium">Service Notes:</span>
                  <span className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{(listing as any).service_notes}</span>
                </div>
              )}
              {serviceRecords.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900 mb-2">Service Records</h3>
                  <div className="space-y-2">
                    {serviceRecords.map((url: string, index: number) => (
                      <div key={index} className="flex items-center">
                        <Wrench className="mr-2 h-4 w-4 text-slate-500" />
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-slate-600 hover:underline"
                        >
                          Record {index + 1}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="hidden lg:block space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-24">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                Direct Seller Contact
              </span>
              <h3 className="text-lg font-bold text-slate-900 mb-1">{typedListing.seller_name || 'Vehicle Owner'}</h3>
              <p className="text-xs text-slate-500 mb-6 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {city}, UAE
              </p>

              <div className="space-y-3">
                <a
                  href={`https://wa.me/${rawWhatsapp}?text=${whatsappMsg}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow-sm transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp Seller
                </a>

                {phone && (
                  <a
                    href={`tel:${phone}`}
                    className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 px-4 rounded-xl transition"
                  >
                    <Phone className="w-4 h-4" />
                    Call {phone}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-[90vw] max-h-[90vh]">
            {/* Lightbox Close Button */}
            <button
              className="absolute top-2 right-2 z-10 p-2 rounded-full bg-white/20 hover:bg-white/300 transition-all"
              onClick={() => setIsLightboxOpen(false)}
              aria-label="Close lightbox"
            >
              <X className="h-5 w-5 text-white" />
            </button>

            {/* Lightbox Navigation Arrows */}
            <button
              className={`absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/20 hover:bg-white/300 transition-all disabled:opacity-20`}
              onClick={() => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)}
              disabled={images.length <= 1}
              aria-label="Previous image"
            >
              <ChevronsLeft className="h-5 w-5 text-white" />
            </button>
            <button
              className={`absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/20 hover:bg-white/300 transition-all disabled:opacity-20`}
              onClick={() => setCurrentIndex((prev) => (prev + 1) % images.length)}
              disabled={images.length <= 1}
              aria-label="Next image"
            >
              <ChevronsRight className="h-5 w-5 text-white" />
            </button>

            {/* Lightbox Image with Zoom Toggle */}
            <div
              className={`relative w-full h-full flex items-center justify-center ${isZoomed ? 'overflow-auto' : 'overflow-hidden'}`}
              onDoubleClick={() => setIsZoomed((prev) => !prev)}
            >
              <img
                src={images[currentIndex]}
                alt={`${typedListing.year} ${typedListing.make} ${typedListing.model}}`}
                className={`${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'} transition-transform
                ${isZoomed ? 'max-none' : 'max-w-full max-h-full'} object-contain`}
                onClick={() => setIsZoomed((prev) => !prev)}
              />
            </div>

            {/* Zoom Toggle Button */}
            <button
              className="absolute bottom-2 right-2 z-10 p-2 rounded-full bg-white/20 hover:bg-white/300 transition-all"
              onClick={(e) => {
                e.stopPropagation();
                setIsZoomed((prev) => !prev);
              }}
              aria-label={isZoomed ? 'Zoom out' : 'Zoom in'}
            >
              {isZoomed ? (
                <ZoomOut className="h-5 w-5 text-white" />
              ) : (
                <ZoomIn className="h-5 w-5 text-white" />
              )}
            </button>
          </div>
        </div>
      )}

      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 shadow-lg">
        <div className="max-w-md mx-auto flex items-center gap-3">
          {phone && (
            <a
              href={`tel:${phone}`}
              className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl transition flex items-center justify-center"
              aria-label="Call seller"
            >
              <Phone className="w-5 h-5" />
            </a>
          )}
          <a
            href={`https://wa.me/${rawWhatsapp}?text=${whatsappMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 active:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow-sm transition"
          >
            <MessageCircle className="w-5 h-5" />
            WhatsApp Seller
          </a>
        </div>
      </div>
    </div>
  );
}