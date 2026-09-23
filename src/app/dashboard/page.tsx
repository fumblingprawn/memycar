'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useLanguage } from '@/context/LanguageContext';
import ListingCard from '@/components/listing/ListingCard';
import { 
  Car, 
  Bookmark, 
  User as UserIcon, 
  LogOut, 
  PlusCircle, 
  Trash2, 
  ExternalLink,
  ShieldCheck,
  Phone,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const { t, formatPrice, isAr } = useLanguage();

  const [activeTab, setActiveTab] = useState<'listings' | 'saved' | 'account'>('listings');
  const [user, setUser] = useState<any>(null);
  const [myListings, setMyListings] = useState<any[]>([]);
  const [savedListings, setSavedListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const fetchUserData = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push('/auth');
      return;
    }

    setUser(user);
    setFullName(user.user_metadata?.full_name || '');
    setPhone(user.user_metadata?.phone || '');

    // 1. Fetch user's listings
    const { data: listings } = await supabase
      .from('listings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (listings) setMyListings(listings);

    // 2. Fetch user's saved listings
    const { data: savedRows } = await supabase
      .from('saved_listings')
      .select('listing_id')
      .eq('user_id', user.id);

    if (savedRows && savedRows.length > 0) {
      const ids = savedRows.map((r: any) => r.listing_id);
      const { data: cars } = await supabase
        .from('listings')
        .select('*')
        .in('id', ids);

      if (cars) setSavedListings(cars);
    } else {
      setSavedListings([]);
    }

    setLoading(false);
  }, [supabase, router]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileSuccess(false);
    setProfileError(null);

    // Validate UAE phone number pattern: +971 5X XXX XXXX or 05X XXX XXXX
    const cleanPhone = phone.replace(/[\s-]/g, '');
    const uaePhoneRegex = /^(?:\+971|00971|0)?5[024568]\d{7}$/;

    if (!uaePhoneRegex.test(cleanPhone)) {
      setProfileError(
        isAr 
          ? 'يرجى إدخال رقم هاتف إماراتي متحرك صحيح (مثال: 0501234567 أو +971501234567)' 
          : 'Please enter a valid UAE mobile number (e.g., +971 50 123 4567 or 050 123 4567)'
      );
      setProfileSaving(false);
      return;
    }

    try {
      // Format number to international UAE standard
      let formattedPhone = cleanPhone;
      if (formattedPhone.startsWith('05')) {
        formattedPhone = '+971' + formattedPhone.slice(1);
      } else if (!formattedPhone.startsWith('+')) {
        formattedPhone = '+' + formattedPhone;
      }

      const { data, error } = await supabase.auth.updateUser({
        data: {
          full_name: fullName.trim(),
          phone: formattedPhone,
        }
      });

      if (error) throw error;

      if (data.user) {
        setUser(data.user);
        setPhone(formattedPhone);
        setProfileSuccess(true);
        setTimeout(() => setProfileSuccess(false), 3000);
      }
    } catch (err: any) {
      setProfileError(err?.message || 'Failed to update profile details.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleDeleteListing = async (listingId: string) => {
    if (!confirm(t('confirmDelete'))) return;
    try {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', listingId);

      if (error) throw error;
      setMyListings((prev) => prev.filter((item) => item.id !== listingId));
    } catch (err) {
      console.error('Failed to delete listing:', err);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-[#f8f9fa] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#e03a14] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] bg-[#f8f9fa] py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* User Top Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-lg">
              {(fullName || user?.email)?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900">
                {fullName || user?.email}
              </h1>
              <div className="flex items-center gap-3 mt-0.5 text-xs">
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {isAr ? 'عضو موثق في ميميكار' : 'Verified memycar Member'}
                </span>
                {user?.user_metadata?.phone && (
                  <span className="text-slate-500 font-medium flex items-center gap-1" dir="ltr">
                    <Phone className="w-3 h-3 text-slate-400" />
                    {user.user_metadata.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Link
              href="/sell"
              className="flex-1 sm:flex-none justify-center bg-[#e03a14] hover:bg-[#c53210] text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              {t('sellCar')}
            </Link>
            <button
              onClick={handleSignOut}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-2.5 px-3.5 rounded-xl flex items-center gap-1.5 transition"
            >
              <LogOut className="w-4 h-4" />
              {t('logout')}
            </button>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex gap-2 border-b border-slate-200 mb-6 pb-2">
          <button
            onClick={() => setActiveTab('listings')}
            className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition ${
              activeTab === 'listings'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Car className="w-4 h-4" />
            {t('myListings')} ({myListings.length})
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition ${
              activeTab === 'saved'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            {t('savedCars')} ({savedListings.length})
          </button>

          <button
            onClick={() => setActiveTab('account')}
            className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition ${
              activeTab === 'account'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            {t('accountSettings')}
          </button>
        </div>

        {/* TAB 1: MY CARS FOR SALE */}
        {activeTab === 'listings' && (
          <div>
            {myListings.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <Car className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-800 mb-1">{t('noListingsYet')}</h3>
                <p className="text-xs text-slate-500 mb-4">
                  {isAr ? 'اعرض سيارتك للبيع في الإمارات خلال دقيقتين فقط' : 'List your vehicle in under 2 minutes'}
                </p>
                <Link
                  href="/sell"
                  className="inline-block bg-[#e03a14] hover:bg-[#c53210] text-white text-xs font-bold py-2.5 px-5 rounded-xl transition"
                >
                  {t('sellCar')}
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myListings.map((car) => (
                  <div key={car.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="relative aspect-[16/10] bg-slate-900">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={car.image_urls?.[0] || '/placeholder-car.jpg'}
                          alt={car.model}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-2.5 left-2.5 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                          {isAr ? 'إعلان نشط' : 'Active'}
                        </span>
                      </div>
                      <div className="p-4 space-y-1">
                        <div className="text-base font-black text-[#e03a14]">
                          {formatPrice(car.price)}
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm">
                          {car.year} {isAr ? t(car.make) : car.make} {isAr ? t(car.model) : car.model}
                        </h4>
                        <p className="text-xs text-slate-400">
                          {t(car.city || 'Dubai')} • {car.specs}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 pt-0 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
                      <Link
                        href={`/listing/${car.id}`}
                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1 transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        {isAr ? 'عرض الإعلان' : 'View'}
                      </Link>
                      <button
                        onClick={() => handleDeleteListing(car.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition"
                        title={t('deleteCar')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SAVED CARS */}
        {activeTab === 'saved' && (
          <div>
            {savedListings.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <Bookmark className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-800 mb-1">{t('noSavedCars')}</h3>
                <Link
                  href="/search"
                  className="inline-block mt-3 bg-slate-900 hover:bg-black text-white text-xs font-bold py-2 px-4 rounded-xl transition"
                >
                  {t('searchCars')}
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {savedListings.map((car) => (
                  <ListingCard key={car.id} listing={car} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ACCOUNT & CONTACT SETTINGS */}
        {activeTab === 'account' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-lg shadow-sm space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                {isAr ? 'بيانات البائع والحساب' : 'Seller Profile & Contact'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {isAr 
                  ? 'سيتم استخدام هذا الاسم ورقم الهاتف تلقائياً في كافة إعلانات سياراتك المعروضة للبيع.'
                  : 'This name and phone number will be used automatically on all your vehicle listings.'}
              </p>
            </div>

            {profileError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{profileError}</span>
              </div>
            )}

            {profileSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{isAr ? 'تم تحديث بياناتك بنجاح!' : 'Profile updated successfully!'}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              {/* Email (Read-only) */}
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">
                  {t('email')}
                </label>
                <input
                  disabled
                  type="email"
                  value={user?.email || ''}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-500"
                />
              </div>

              {/* Full Name / Dealer Name */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  {isAr ? 'اسم البائع / المعرض *' : 'Seller / Display Name *'}
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Salim Al Nuaimi / Apex Motors"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-[#e03a14]"
                />
              </div>

              {/* Phone Number with UAE Validation */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  {isAr ? 'رقم الهاتف / الواتساب في الإمارات *' : 'UAE Phone / WhatsApp *'}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    required
                    type="tel"
                    dir="ltr"
                    placeholder="+971 50 123 4567 or 0501234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-[#e03a14]"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {isAr ? 'أرقام الهواتف المحمولة المعتمدة: 050، 052، 054، 055، 056، 058' : 'Valid UAE carriers: 050, 052, 054, 055, 056, 058'}
                </span>
              </div>

              <button
                type="submit"
                disabled={profileSaving}
                className="bg-[#e03a14] hover:bg-[#c53210] disabled:bg-slate-300 text-white text-xs font-bold py-2.5 px-5 rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                {profileSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {isAr ? 'حفظ التعديلات' : 'Save Changes'}
              </button>
            </form>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">User ID</span>
                <span className="text-[10px] font-mono text-slate-400 break-all">{user?.id}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold py-2 px-3 rounded-xl transition"
              >
                {t('logout')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
