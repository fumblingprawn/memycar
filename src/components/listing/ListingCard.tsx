'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Listing } from '@/types/listing';
import { useLanguage } from '@/context/LanguageContext';
import { createClient } from '@/lib/supabase/client';
import { Phone, MessageSquare, Gauge, Eye, Clock, Loader2 } from 'lucide-react';

export default function ListingCard({ listing }: { listing: Listing }) {
  const router = useRouter();
  const supabase = createClient();
  const { t, formatPrice, formatMileage, isAr } = useLanguage();
  const [chatStarting, setChatStarting] = useState(false);

  const price = (listing as any).price ?? (listing as any).price_aed ?? 0;
  const mileage = (listing as any).mileage ?? (listing as any).mileage_km ?? 0;
  const specs = (listing as any).specs || 'GCC Specs';
  const make = listing.make || '';
  const model = listing.model || '';
  const phone = (listing as any).seller_phone || (listing as any).whatsapp_number || '';
  const viewCount = (listing as any).view_count ?? 0;
  const createdAt = (listing as any).created_at;

  let coverImage = '/placeholder-car.jpg';
  if (Array.isArray((listing as any).image_urls) && (listing as any).image_urls.length > 0) {
    coverImage = (listing as any).image_urls[0];
  } else if (Array.isArray((listing as any).images) && (listing as any).images.length > 0) {
    coverImage = (listing as any).images[0];
  }

  const formatTimeAgo = (dateStr?: string) => {
    if (!dateStr) return isAr ? 'حديثاً' : 'Recent';
    const diffSec = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diffSec < 3600) return isAr ? 'الآن' : 'Just now';
    if (diffSec < 86400) {
      const hours = Math.floor(diffSec / 3600);
      return isAr ? `منذ ${hours} س` : `${hours}h ago`;
    }
    const days = Math.floor(diffSec / 86400);
    return isAr ? `منذ ${days} ي` : `${days}d ago`;
  };

  const handleMessageSeller = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth');
      return;
    }

    const sellerId = (listing as any).user_id;
    if (sellerId && sellerId === user.id) {
      alert(t('cantMessageOwnListing'));
      return;
    }

    setChatStarting(true);
    try {
      if (!sellerId) {
        // If listing has no user_id, route to car page
        router.push(`/listing/${listing.id}`);
        return;
      }

      // 1. Look for existing conversation
      const { data: existing } = await supabase
        .from('conversations')
        .select('id')
        .eq('listing_id', listing.id)
        .eq('buyer_id', user.id)
        .maybeSingle();

      let conversationId = existing?.id;

      // 2. Create conversation if it doesn't exist
      if (!conversationId) {
        const greeting = isAr ? 'مرحبا، هل هذه السيارة ما زالت متوفرة؟' : 'Hi, is this vehicle still available?';
        const { data: created, error: createErr } = await supabase
          .from('conversations')
          .insert({
            listing_id: listing.id,
            buyer_id: user.id,
            seller_id: sellerId,
            last_message: greeting,
          })
          .select()
          .single();

        if (createErr) throw createErr;
        conversationId = created.id;

        await supabase.from('messages').insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: greeting,
        });
      }

      router.push(`/dashboard?tab=messages&conv=${conversationId}`);
    } catch (err: any) {
      console.error('Failed to open chat:', err);
      router.push(`/listing/${listing.id}`);
    } finally {
      setChatStarting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between group">
      <div>
        {/* Cover Photo */}
        <Link href={`/listing/${listing.id}`} className="block relative aspect-[16/10] bg-slate-900 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coverImage}
            alt={`${make} ${model}`}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
          <span className="absolute top-2.5 left-2.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded">
            {t(specs)}
          </span>
          <span className="absolute top-2.5 right-2.5 bg-white/90 text-slate-800 text-[10px] font-extrabold px-2 py-0.5 rounded">
            {listing.year}
          </span>

          {/* View Count & Upload Date Badge */}
          <div className="absolute bottom-2 right-2 flex items-center gap-1.5 bg-black/65 backdrop-blur-md text-white text-[10px] font-semibold px-2 py-0.5 rounded-md">
            <span className="flex items-center gap-0.5">
              <Eye className="w-3 h-3 text-slate-300" />
              {viewCount}
            </span>
            <span className="text-white/40">•</span>
            <span className="flex items-center gap-0.5">
              <Clock className="w-2.5 h-2.5 text-slate-300" />
              {formatTimeAgo(createdAt)}
            </span>
          </div>
        </Link>

        {/* Info */}
        <div className="p-4 space-y-2">
          {/* Price */}
          <div className="text-lg font-black text-[#e03a14]">
            {formatPrice(price)}
          </div>

          {/* Title */}
          <Link href={`/listing/${listing.id}`}>
            <h3 className="font-extrabold text-slate-900 text-sm hover:text-[#e03a14] transition line-clamp-1">
              {listing.year} {isAr ? t(make) : make} {isAr ? t(model) : model}
            </h3>
          </Link>

          {/* Specs Snippet */}
          <div className="flex items-center gap-3 text-xs text-slate-500 pt-0.5">
            <div className="flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5 text-slate-400" />
              <span>{formatMileage(mileage)}</span>
            </div>
            <span>•</span>
            <span className="truncate">{t(specs)}</span>
          </div>

          {/* Description snippet */}
          {(listing as any).description && (
            <p className="text-[11px] text-slate-400 line-clamp-2 pt-0.5">
              {(listing as any).description}
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 pt-0 grid grid-cols-2 gap-2 mt-2">
        <button
          type="button"
          disabled={chatStarting}
          onClick={handleMessageSeller}
          className="bg-slate-900 hover:bg-black text-white py-2 px-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 shadow-2xs transition"
        >
          {chatStarting ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <MessageSquare className="w-3 h-3 text-[#e03a14]" />
          )}
          {t('messageSeller')}
        </button>

        {phone ? (
          <a
            href={`tel:${phone}`}
            className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 shadow-2xs transition"
          >
            <Phone className="w-3 h-3" />
            {isAr ? 'اتصال بالبائع' : 'Call Seller'}
          </a>
        ) : (
          <Link
            href={`/listing/${listing.id}`}
            className="bg-[#e03a14] hover:bg-[#c53210] text-white py-2 px-2 rounded-xl text-[11px] font-bold text-center transition"
          >
            {isAr ? 'عرض التفاصيل' : 'View Details'}
          </Link>
        )}
      </div>
    </div>
  );
}
