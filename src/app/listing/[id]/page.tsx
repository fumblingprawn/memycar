'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useLanguage } from '@/context/LanguageContext';
import { 
  Gauge, 
  Globe, 
  Fuel, 
  Cog, 
  Calendar, 
  Wrench, 
  ShieldAlert, 
  ShieldCheck, 
  Zap, 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Share2, 
  Bookmark, 
  Phone,
  Eye,
  Clock,
  MessageSquare,
  Loader2,
  CheckCircle,
  Lock
} from 'lucide-react';

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const { t, formatPrice, formatMileage, isAr, locale } = useLanguage();

  const [listing, setListing] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [chatStarting, setChatStarting] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  // Description translation
  const [isTranslating, setIsTranslating] = useState(false);
  const [showTranslated, setShowTranslated] = useState(false);
  const [translatedDescription, setTranslatedDescription] = useState<string | null>(null);

  const listingId = params?.id as string;

  const checkSavedStatus = useCallback(async () => {
    if (!listingId) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setCurrentUser(user);

    const { data } = await supabase
      .from('saved_listings')
      .select('id')
      .eq('user_id', user.id)
      .eq('listing_id', listingId)
      .maybeSingle();

    if (data) setSaved(true);
  }, [listingId, supabase]);

  useEffect(() => {
    async function fetchListing() {
      if (!listingId) return;
      try {
        const { data, error } = await supabase
          .from('listings')
          .select('*')
          .eq('id', listingId)
          .single();

        if (error) throw error;
        setListing(data);

        // Increment view count in Supabase
        supabase.rpc('increment_listing_view', { target_listing_id: listingId }).then(() => {});
      } catch (err) {
        console.error('Failed to load listing:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchListing();
    checkSavedStatus();
  }, [listingId, supabase, checkSavedStatus]);

  const handleToggleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth');
      return;
    }

    setSaveLoading(true);
    try {
      if (saved) {
        setSaved(false);
        await supabase
          .from('saved_listings')
          .delete()
          .eq('user_id', user.id)
          .eq('listing_id', listingId);
      } else {
        setSaved(true);
        await supabase
          .from('saved_listings')
          .insert({ user_id: user.id, listing_id: listingId });
      }
    } catch (err) {
      console.error('Error toggling save:', err);
      setSaved(!saved);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleStartChat = async () => {
    setChatError(null);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth');
      return;
    }

    if (listing?.user_id && listing.user_id === user.id) {
      setChatError(t('cantMessageOwnListing'));
      return;
    }

    setChatStarting(true);
    try {
      const sellerId = listing.user_id;
      if (!sellerId) {
        setChatError(isAr ? 'بيانات البائع غير متوفرة للمراسلة' : 'Seller is not available for internal messaging');
        setChatStarting(false);
        return;
      }

      const { data: existing } = await supabase
        .from('conversations')
        .select('id')
        .eq('listing_id', listingId)
        .eq('buyer_id', user.id)
        .maybeSingle();

      let conversationId = existing?.id;

      if (!conversationId) {
        const { data: created, error: createErr } = await supabase
          .from('conversations')
          .insert({
            listing_id: listingId,
            buyer_id: user.id,
            seller_id: sellerId,
            last_message: isAr ? 'مرحبا، هل هذه السيارة ما زالت متوفرة؟' : 'Hi, is this vehicle still available?',
          })
          .select()
          .single();

        if (createErr) throw createErr;
        conversationId = created.id;

        await supabase.from('messages').insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: isAr ? 'مرحبا، هل هذه السيارة ما زالت متوفرة؟' : 'Hi, is this vehicle still available?',
        });
      }

      router.push(`/dashboard?tab=messages&conv=${conversationId}`);
    } catch (err: any) {
      console.error('Chat error:', err);
      setChatError(err.message || 'Could not open conversation');
    } finally {
      setChatStarting(false);
    }
  };

  const handleToggleTranslate = async () => {
    if (showTranslated) {
      setShowTranslated(false);
      return;
    }
    if (translatedDescription) {
      setShowTranslated(true);
      return;
    }
    if (!listing?.description) return;

    setIsTranslating(true);
    try {
      const targetLang = locale === 'ar' ? 'ar' : 'en';
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: listing.description,
          targetLang,
        }),
      });

      if (!res.ok) throw new Error('Translation failed');
      const data = await res.json();
      if (data.translatedText) {
        setTranslatedDescription(data.translatedText);
        setShowTranslated(true);
      }
    } catch (err) {
      console.error('Failed to translate description:', err);
    } finally {
      setIsTranslating(false);
    }
  };

  const formatFullTimeAgo = (dateStr?: string) => {
    if (!dateStr) return isAr ? 'حديثاً' : 'Recent';
    const diffSec = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diffSec < 3600) return isAr ? 'الآن' : 'Just now';
    if (diffSec < 86400) {
      const hours = Math.floor(diffSec / 3600);
      return isAr ? `منذ ${hours} ساعة` : `${hours} hours ago`;
    }
    const days = Math.floor(diffSec / 86400);
    return isAr ? `منذ ${days} يوم` : `${days} days ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f4f4] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#e03a14] border-t-transparent mx-auto mb-3"></div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-[#f4f4f4] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center max-w-md">
          <h2 className="text-xl font-bold text-slate-900 mb-2">{t('listingNotFound')}</h2>
          <p className="text-sm text-slate-500 mb-6">{t('listingRemovedMsg')}</p>
          <Link
            href="/search"
            className="inline-block bg-[#e03a14] hover:bg-[#c53210] text-white px-6 py-2.5 rounded-xl font-bold text-sm transition"
          >
            {t('backToSearch')}
          </Link>
        </div>
      </div>
    );
  }

  const isSold = listing.status === 'sold';
  const price = listing.price ?? listing.price_aed ?? 0;
  const mileage = listing.mileage ?? listing.mileage_km ?? 0;
  const city = listing.city || listing.emirate || 'Dubai';
  const specs = listing.specs || listing.spec || 'GCC Specs';
  const fuelType = listing.fuel_type || 'Petrol';
  const transmission = listing.transmission || 'Automatic';
  const accidentHistory = listing.accident_history || 'Clean (No Accidents)';
  const warranty = listing.warranty || 'No';
  const serviceContract = listing.service_contract || 'No';
  const horsepower = listing.horsepower || null;
  const serviceHistory = listing.last_service_date ? 'Documented' : 'Standard';
  const phone = listing.seller_phone || listing.whatsapp_number || '';
  const sellerName = listing.seller_name || (isAr ? 'عضو موثق' : 'Verified Member');
  const viewCount = (listing.view_count ?? 0) + 1;

  const images: string[] = [];
  if (Array.isArray(listing.image_urls) && listing.image_urls.length > 0) {
    images.push(...listing.image_urls);
  } else if (Array.isArray(listing.images) && listing.images.length > 0) {
    images.push(...listing.images);
  }

  const activeImage = images[activeImageIndex] || null;

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f4f4] py-6 md:py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-4">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
          >
            {isAr ? '→ العودة للبحث' : '← Back to search'}
          </button>
        </div>

        {/* Prominent SOLD Banner */}
        {isSold && (
          <div className="mb-6 p-4 bg-red-600 text-white rounded-2xl font-black text-sm text-center tracking-wide shadow-md flex items-center justify-center gap-2">
            <CheckCircle className="w-5 h-5 text-white" />
            <span>{t('sold')} — {t('listingSoldNotice')}</span>
          </div>
        )}

        {/* Gallery & Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mb-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-sm relative group aspect-[16/9] flex items-center justify-center">
              {activeImage ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={activeImage}
                    alt={listing.title || `${listing.make} ${listing.model}`}
                    onClick={() => setIsLightboxOpen(true)}
                    className="w-full h-full object-contain cursor-zoom-in"
                  />

                  {/* Watermark / Badge if SOLD */}
                  {isSold && (
                    <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-black tracking-widest shadow-md">
                      {t('sold')}
                    </div>
                  )}

                  {images.length > 0 && (
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white px-2.5 py-1 rounded-md text-xs font-bold tracking-wider">
                      {activeImageIndex + 1} / {images.length}
                    </div>
                  )}

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

                  <div className="absolute bottom-3 left-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsLightboxOpen(true)}
                      className="bg-black/60 hover:bg-black/80 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      {t('inspectZoom')}
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center p-8 text-slate-400">
                  <p className="text-sm">{isAr ? 'لا توجد صور متوفرة' : 'No preview image available'}</p>
                </div>
              )}
            </div>

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

          {/* Sticky Box */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm sticky top-24 space-y-4">
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
                  {listing.year} {isAr ? t(listing.make) : listing.make} {isAr ? t(listing.model) : listing.model}
                </h1>
                <p className="text-sm font-medium text-slate-500 mt-0.5">
                  {listing.trim ? `${listing.trim} • ` : ''}{listing.year}
                </p>

                {/* View Counter & Date Added Row */}
                <div className="flex items-center gap-3 text-xs text-slate-500 pt-2 border-t border-slate-100 mt-3">
                  <span className="flex items-center gap-1 font-bold text-slate-700">
                    <Eye className="w-3.5 h-3.5 text-[#e03a14]" />
                    {viewCount} {isAr ? 'مشاهدة' : 'views'}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {formatFullTimeAgo(listing.created_at)}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <div className="text-3xl font-black text-[#e03a14]">
                  {formatPrice(price)}
                </div>
                {!isSold && (
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="flex gap-1">
                      <span className="w-3 h-1.5 rounded-sm bg-emerald-500"></span>
                      <span className="w-3 h-1.5 rounded-sm bg-emerald-500"></span>
                      <span className="w-3 h-1.5 rounded-sm bg-emerald-500"></span>
                      <span className="w-3 h-1.5 rounded-sm bg-emerald-500"></span>
                      <span className="w-3 h-1.5 rounded-sm bg-slate-200"></span>
                    </div>
                    <span className="text-xs font-bold text-emerald-600">{t('greatPrice')}</span>
                  </div>
                )}
              </div>

              {/* SELLER & CONTACT AREA */}
              {isSold ? (
                /* Hide seller identity and contact if SOLD */
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-1">
                    <div className="flex items-center justify-center gap-1.5 text-slate-700 font-bold text-xs">
                      <Lock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{isAr ? 'معلومات الاتصال مغلقة' : 'Contact Details Hidden'}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {isAr
                        ? 'تم حجب بيانات البائع بعد إتمام بيع المركبة لحماية الخصوصية ومنع الاتصالات.'
                        : 'Seller contact information has been secured and removed following the sale.'}
                    </p>
                  </div>

                  <div className="w-full bg-slate-100 border border-slate-300 text-slate-500 font-black py-3 px-4 rounded-xl text-center text-xs uppercase tracking-wider flex items-center justify-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>{t('sold')}</span>
                  </div>
                </div>
              ) : (
                /* Normal Active Seller & Actions */
                <>
                  <div className="pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">
                        {sellerName}
                      </span>
                      <span className="text-amber-500 text-xs font-bold">★★★★★ 4.9</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{t(city)}, UAE</p>
                  </div>

                  {phone ? (
                    <a
                      href={`tel:${phone}`}
                      className="w-full bg-[#e03a14] hover:bg-[#c53210] text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow transition text-sm"
                    >
                      <Phone className="w-4 h-4" />
                      {t('call')} {phone}
                    </a>
                  ) : (
                    <button disabled className="w-full bg-slate-200 text-slate-400 py-3 px-4 rounded-xl font-bold text-sm">
                      {t('phoneNotAvailable')}
                    </button>
                  )}

                  <button
                    type="button"
                    disabled={chatStarting}
                    onClick={handleStartChat}
                    className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-xs transition text-sm"
                  >
                    {chatStarting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <MessageSquare className="w-4 h-4 text-[#e03a14]" />
                    )}
                    {t('messageSeller')}
                  </button>

                  {chatError && (
                    <p className="text-[11px] text-red-600 text-center font-medium bg-red-50 p-2 rounded-lg">
                      {chatError}
                    </p>
                  )}
                </>
              )}

              {/* Save & Share Always Visible */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  disabled={saveLoading}
                  onClick={handleToggleSave}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                    saved
                      ? 'border-[#e03a14] text-[#e03a14] bg-orange-50 font-black'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-[#e03a14]' : ''}`} />
                  {saved ? (isAr ? 'تم الحفظ' : 'Saved') : (isAr ? 'حفظ' : 'Save')}
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  className="py-2 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  {copied ? t('linkCopied') : t('share')}
                </button>
              </div>

              {!isSold && (
                <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 leading-normal">
                  <span className="font-semibold text-slate-600 block mb-0.5">{t('directSeller')}</span>
                  {t('inspectNotice')}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lower Left Details */}
        <div className="max-w-full lg:max-w-[66.666667%] space-y-6">
          <div className="bg-blue-50 rounded-2xl border border-blue-200 p-4 text-xs text-blue-900 leading-relaxed">
            <span className="font-bold">{t('verifiedListing')}: </span>
            {t('inspectNotice')}
          </div>

          {/* KEY VEHICLE DETAILS */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-5">
              {t('keyDetails')}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <Gauge className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <span className="text-xs text-slate-400 block">{t('mileage')}</span>
                  <span className="text-sm font-bold text-slate-900">{formatMileage(mileage)}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <span className="text-xs text-slate-400 block">{t('specs')}</span>
                  <span className="text-sm font-bold text-slate-900">{specs === 'Other' ? (isAr ? 'أخرى' : 'Other') : t(specs)}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Fuel className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <span className="text-xs text-slate-400 block">{t('fuelType')}</span>
                  <span className="text-sm font-bold text-slate-900">{t(fuelType)}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Cog className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <span className="text-xs text-slate-400 block">{t('transmission')}</span>
                  <span className="text-sm font-bold text-slate-900">{t(transmission)}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <span className="text-xs text-slate-400 block">{t('year')}</span>
                  <span className="text-sm font-bold text-slate-900">{listing.year}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <span className="text-xs text-slate-400 block">{t('accidentHistory')}</span>
                  <span className="text-sm font-bold text-emerald-600">{t(accidentHistory)}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <span className="text-xs text-slate-400 block">{t('warranty')}</span>
                  <span className="text-sm font-bold text-slate-900">{warranty === 'Yes' ? t('yes') : t('no')}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <span className="text-xs text-slate-400 block">{t('serviceContract')}</span>
                  <span className="text-sm font-bold text-slate-900">{serviceContract === 'Yes' ? t('yes') : t('no')}</span>
                </div>
              </div>

              {horsepower && (
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-slate-400 mt-0.5" />
                  <div>
                    <span className="text-xs text-slate-400 block">{t('horsepower')}</span>
                    <span className="text-sm font-bold text-slate-900">{horsepower}</span>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Wrench className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <span className="text-xs text-slate-400 block">{t('serviceHistory')}</span>
                  <span className="text-sm font-bold text-slate-900">{t(serviceHistory)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {listing.description && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {t('vehicleDescription')}
                </h2>

                <button
                  type="button"
                  disabled={isTranslating}
                  onClick={handleToggleTranslate}
                  className="text-xs font-bold text-[#e03a14] hover:text-[#c53210] disabled:opacity-50 transition flex items-center gap-1.5"
                >
                  {isTranslating ? (
                    <span className="animate-pulse">
                      {isAr ? 'جاري الترجمة...' : 'Translating...'}
                    </span>
                  ) : showTranslated ? (
                    isAr ? 'عرض النص الأصلي' : 'Show original'
                  ) : (
                    `🌐 ${isAr ? 'ترجمة الوصف' : 'Translate description'}`
                  )}
                </button>
              </div>

              <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                {showTranslated && translatedDescription ? translatedDescription : listing.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
