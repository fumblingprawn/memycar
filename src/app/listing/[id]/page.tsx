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
  MessageCircle 
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

  const orderedPhotos: string[] = [];
  const slotOrder: PhotoSlotKey[] = [
    'front_three_quarter',
    'rear_three_quarter',
    'side_profile',
    'interior_dash',
    'odometer',
  ];

  if (typedListing.photos && typeof typedListing.photos === 'object') {
    slotOrder.forEach((slot) => {
      const url = (typedListing.photos as Record<string, any>)[slot];
      if (url) orderedPhotos.push(url);
    });

    if (Array.isArray((typedListing.photos as any).extra_photos)) {
      (typedListing.photos as any).extra_photos.forEach((url: string) => {
        if (url) orderedPhotos.push(url);
      });
    }
  }

  const rawWhatsapp = typedListing.seller_whatsapp ? typedListing.seller_whatsapp.replace(/\D/g, '') : '';
  const listingUrl = `https://memycar.com/listing/${typedListing.id}`;
  const whatsappMsg = encodeURIComponent(
    `Hi ${typedListing.seller_name || 'there'}, I saw your ${typedListing.year} ${typedListing.make} ${typedListing.model} on memycar.com (${listingUrl}). Is it still available?`
  );

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
                typedListing.specs === 'GCC' 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : 'bg-slate-200 text-slate-800'
              }`}>
                {typedListing.specs === 'GCC' ? '🇦🇪 GCC Specs' : `${typedListing.specs} Specs`}
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {typedListing.emirate}, UAE
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
              AED {Number(typedListing.price_aed).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-2 sm:p-3 shadow-sm border border-slate-200 mb-8">
          <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-slate-950">
            {orderedPhotos.length > 0 ? (
              <img
                src={orderedPhotos[0]}
                alt={`${typedListing.year} ${typedListing.make} ${typedListing.model}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                No preview image available
              </div>
            )}
          </div>

          {orderedPhotos.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
              {orderedPhotos.map((url, idx) => (
                <div
                  key={idx}
                  className="relative flex-shrink-0 w-24 aspect-[16/9] rounded-lg overflow-hidden border border-slate-200"
                >
                  <img src={url} alt={`Angle ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
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
                      {Number(typedListing.mileage_km).toLocaleString()} km
                    </span>
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block font-medium">Regional Specs</span>
                    <span className="text-sm font-bold text-slate-900">{typedListing.specs}</span>
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block font-medium">Service History</span>
                    <span className="text-sm font-bold text-slate-900">{typedListing.service_history}</span>
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                    <Paintbrush className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block font-medium">Paint Condition</span>
                    <span className="text-sm font-bold text-slate-900">{typedListing.paint_condition}</span>
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block font-medium">Warranty</span>
                    <span className="text-sm font-bold text-slate-900">{typedListing.warranty}</span>
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
          </div>

          <div className="hidden lg:block space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-24">
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block mb-1">
                Direct Seller Contact
              </span>
              <h3 className="text-lg font-bold text-slate-900 mb-1">{typedListing.seller_name || 'Vehicle Owner'}</h3>
              <p className="text-xs text-slate-500 mb-6 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {typedListing.emirate}, UAE
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

                {typedListing.seller_phone && (
                  <a
                    href={`tel:${typedListing.seller_phone}`}
                    className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 px-4 rounded-xl transition"
                  >
                    <Phone className="w-4 h-4" />
                    Call {typedListing.seller_phone}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 shadow-lg">
        <div className="max-w-md mx-auto flex items-center gap-3">
          {typedListing.seller_phone && (
            <a
              href={`tel:${typedListing.seller_phone}`}
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
