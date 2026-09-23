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
  Loader2,
  Lock
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
  const [isLocked, setIsLocked] = useState(false);
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
    const savedName = user.user_metadata?.full_name || '';
    const savedPhone = user.user_metadata?.phone || '';
    setFullName(savedName);
    setPhone(savedPhone);

    // If both name and phone are already set, lock them
    if (savedName && savedPhone) {
      setIsLocked(true);
    }

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

  const handleSaveAndLock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;

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
        setIsLocked(true);
        setProfileSuccess(true);
      }
    } catch (err: any) {
      setProfileError(err?.message || 'Failed to save profile details.');
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

  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + session.access_token,
          "Content-Type": "application/json"
        }
      });

      if (!res.ok) throw new Error("Deletion failed");

      await supabase.auth.signOut();
      alert(t("accountDeletedNotice"));
      router.push("/");
      router.refresh();
    } catch (e: any) {
      alert(e.message || "Failed to delete account");
      setDeletingAccount(false);
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

        {/* TAB 3: ACCOUNT & CONTACT SETTINGS (LOCKED / UNLOCKED) */}
        {activeTab === 'account' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-lg shadow-sm space-y-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  {isAr ? 'بيانات البائع والحساب' : 'Seller Profile & Contact'}
                  {isLocked && <Lock className="w-4 h-4 text-emerald-600" />}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {isLocked 
                    ? (isAr 
                        ? 'تم تثبيت وتوثيق بياناتك لحماية مصداقية الإعلانات ومنع التغييرات العشوائية.'
                        : 'Your seller profile is locked and verified to maintain transparency across all your listings.')
                    : (isAr
                        ? 'أدخل اسمك ورقم هاتفك. سيتم تثبيت البيانات تلقائياً بعد الحفظ.'
                        : 'Enter your seller name and phone number. These will be permanently locked once saved.')}
                </p>
              </div>
              {isLocked && (
                <span className="bg-emerald-50 text-emerald-700 text-[11px] font-bold px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1 flex-shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {isAr ? 'بيانات مقفلة وموثقة' : 'Verified & Locked'}
                </span>
              )}
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
                <span>{isAr ? 'تم حفظ وتثبيت بياناتك بنجاح!' : 'Profile details saved and locked successfully!'}</span>
              </div>
            )}

            <form onSubmit={handleSaveAndLock} className="space-y-4">
              {/* Email (Always Disabled) */}
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">
                  {t('email')}
                </label>
                <input
                  disabled
                  type="email"
                  value={user?.email || ''}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                />
              </div>

              {/* Full Name / Dealer Name */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    {isAr ? 'اسم البائع / المعرض *' : 'Seller / Display Name *'}
                  </label>
                  {isLocked && (
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-slate-400" />
                      {isAr ? 'مغلق' : 'Locked'}
                    </span>
                  )}
                </div>
                <input
                  required
                  disabled={isLocked}
                  type="text"
                  placeholder="e.g. DXB01 / Apex Motors"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={`w-full px-3 py-2 text-sm rounded-xl border transition ${
                    isLocked
                      ? 'border-slate-200 bg-slate-100 text-slate-600 cursor-not-allowed font-semibold'
                      : 'border-slate-300 bg-white text-slate-900 outline-none focus:ring-2 focus:ring-[#e03a14]'
                  }`}
                />
              </div>

              {/* UAE Phone Number */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    {isAr ? 'رقم الهاتف / الواتساب في الإمارات *' : 'UAE Phone / WhatsApp *'}
                  </label>
                  {isLocked && (
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-slate-400" />
                      {isAr ? 'مغلق' : 'Locked'}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    required
                    disabled={isLocked}
                    type="tel"
                    dir="ltr"
                    placeholder="+971 55 838 8386 or 0558388386"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`w-full pl-9 pr-3 py-2 text-sm rounded-xl border transition ${
                      isLocked
                        ? 'border-slate-200 bg-slate-100 text-slate-600 cursor-not-allowed font-semibold'
                        : 'border-slate-300 bg-white text-slate-900 outline-none focus:ring-2 focus:ring-[#e03a14]'
                    }`}
                  />
                </div>
              </div>

              {/* Action Button: Locked vs Save */}
              {isLocked ? (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500 leading-relaxed">
                  <span className="font-semibold text-slate-700 block mb-0.5">
                    {isAr ? 'هل تحتاج إلى تغيير رقم هاتفك أو اسمك؟' : 'Need to update your verified credentials?'}
                  </span>
                  {isAr 
                    ? 'لحماية المشترين ومصداقية الإعلانات، يرجى التواصل مع فريق الدعم على ' 
                    : 'To protect buyers and listings integrity, please contact support at '}
                  <a href="mailto:support@memycar.com" className="text-[#e03a14] font-bold underline">
                    support@memycar.com
                  </a>
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="bg-[#e03a14] hover:bg-[#c53210] disabled:bg-slate-300 text-white text-xs font-bold py-2.5 px-5 rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  {profileSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {isAr ? 'حفظ وتثبيت البيانات' : 'Save & Lock Details'}
                </button>
              )}
            </form>

            {/* Danger Zone: Delete Account */}
            <div className="pt-6 border-t border-red-100">
              <h4 className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
                {t("deleteAccount")}
              </h4>
              <p className="text-[11px] text-slate-500 mb-3">
                {t("deleteAccountConfirm")}
              </p>
              <button
                type="button"
                onClick={() => setDeleteModalOpen(true)}
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2 px-3.5 rounded-xl transition shadow-2xs"
              >
                {t("deleteAccountBtn")}
              </button>
            </div>

            {/* Confirm Modal */}
            {deleteModalOpen && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-sm w-full shadow-2xl">
                  <h3 className="text-sm font-black text-slate-900 mb-2">{t("deleteAccount")}</h3>
                  <p className="text-xs text-slate-600 mb-5 leading-relaxed">{t("deleteAccountConfirm")}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={deletingAccount}
                      onClick={() => setDeleteModalOpen(false)}
                      className="py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600"
                    >
                      {t("cancel")}
                    </button>
                    <button
                      type="button"
                      disabled={deletingAccount}
                      onClick={handleDeleteAccount}
                      className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-2 rounded-xl text-xs font-bold"
                    >
                      {deletingAccount ? "Deleting..." : t("deleteAccountBtn")}
                    </button>
                  </div>
                </div>
              </div>
            )}
  

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
