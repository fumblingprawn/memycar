'use client';

import React, { useEffect, useState, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  Lock,
  MessageSquare,
  Send,
  Paperclip,
  X,
  BellRing,
  ArrowRight,
  FileSpreadsheet,
  Building2
} from 'lucide-react';

interface ToastNotice {
  id: string;
  convId: string;
  carTitle: string;
  carImage: string;
  snippet: string;
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const { t, formatPrice, isAr } = useLanguage();

  const initialTab = (searchParams.get('tab') as any) || 'listings';
  const initialConvId = searchParams.get('conv') || null;

  const [activeTab, setActiveTab] = useState<'listings' | 'saved' | 'messages' | 'account'>(initialTab);
  const [user, setUser] = useState<any>(null);
  const [myListings, setMyListings] = useState<any[]>([]);
  const [savedListings, setSavedListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [accountType, setAccountType] = useState('private'); // 'private' or 'dealer'
  const [isLocked, setIsLocked] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Messaging & Realtime State
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConv, setSelectedConv] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Sliding Notification Toast State
  const [toast, setToast] = useState<ToastNotice | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Account Deletion
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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
    const savedRole = user.user_metadata?.account_type || user.user_metadata?.role || 'private';
    
    setFullName(savedName);
    setPhone(savedPhone);
    setAccountType(savedRole);

    if (savedName && savedPhone) {
      setIsLocked(true);
    }

    // 1. Fetch user listings
    const { data: listings } = await supabase
      .from('listings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (listings) setMyListings(listings);

    // 2. Fetch saved listings
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

    // 3. Fetch conversations
    const { data: convData } = await supabase
      .from('conversations')
      .select(`
        *,
        listings:listing_id (id, make, model, year, price, image_urls, status)
      `)
      .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
      .order('last_message_at', { ascending: false });

    if (convData) {
      setConversations(convData);
      if (initialConvId) {
        const found = convData.find((c: any) => c.id === initialConvId);
        if (found) setSelectedConv(found);
      } else if (convData.length > 0 && !selectedConv) {
        setSelectedConv(convData[0]);
      }
    }

    setLoading(false);
  }, [supabase, router, initialConvId]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Realtime notification listener
  useEffect(() => {
    if (!user) return;

    const globalChannel = supabase
      .channel('global_user_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        async (payload) => {
          if (payload.new.sender_id !== user.id) {
            const targetConv = conversations.find((c) => c.id === payload.new.conversation_id);
            const car = Array.isArray(targetConv?.listings) ? targetConv.listings[0] : targetConv?.listings;
            const carTitle = car ? `${car.year} ${car.make} ${car.model}` : 'Vehicle Inquiry';
            const carImg = car?.image_urls?.[0] || '/placeholder-car.jpg';

            setToast({
              id: payload.new.id,
              convId: payload.new.conversation_id,
              carTitle,
              carImage: carImg,
              snippet: payload.new.content || (isAr ? 'أرسل صورة' : 'Sent an image'),
            });

            setTimeout(() => {
              setToast((curr) => (curr?.id === payload.new.id ? null : curr));
            }, 5500);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(globalChannel);
    };
  }, [user, conversations, supabase, isAr]);

  // Active chat listener
  useEffect(() => {
    if (!selectedConv) return;

    async function loadMessages() {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', selectedConv.id)
        .order('created_at', { ascending: true });

      if (data) {
        setMessages(data);
        setTimeout(scrollToBottom, 80);
      }
    }

    loadMessages();

    const channel = supabase
      .channel(`active_chat_${selectedConv.id}`)
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages', 
          filter: `conversation_id=eq.${selectedConv.id}` 
        },
        (payload) => {
          setMessages((prev) => {
            if (prev.some((m) => m.id === payload.new.id)) return prev;
            return [...prev, payload.new];
          });
          setTimeout(scrollToBottom, 80);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConv, supabase]);

  const handleToggleSold = async (listingId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'sold' ? 'active' : 'sold';
      const rpcName = currentStatus === 'sold' ? 'reactivate_listing' : 'mark_listing_as_sold';

      setMyListings((prev) =>
        prev.map((c) => (c.id === listingId ? { ...c, status: newStatus } : c))
      );

      const { error } = await supabase.rpc(rpcName, { target_listing_id: listingId });
      if (error) {
        await supabase
          .from('listings')
          .update({
            status: newStatus,
            sold_at: newStatus === 'sold' ? new Date().toISOString() : null,
          })
          .eq('id', listingId);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      fetchUserData();
    }
  };

  // Quick Unsave / Remove from Saved Cars
  const handleRemoveSavedListing = async (listingId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;

    setSavedListings((prev) => prev.filter((item) => item.id !== listingId));

    try {
      await supabase
        .from('saved_listings')
        .delete()
        .eq('user_id', user.id)
        .eq('listing_id', listingId);
    } catch (err) {
      console.error('Error removing saved listing:', err);
      fetchUserData();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFilePreview(URL.createObjectURL(file));
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (filePreview) URL.revokeObjectURL(filePreview);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedFile) || !selectedConv || !user) return;

    setSendingMsg(true);
    const text = newMessage.trim();
    setNewMessage('');

    let uploadedImageUrl: string | null = null;

    try {
      if (selectedFile) {
        setUploadingImage(true);
        const fileExt = selectedFile.name.split('.').pop() || 'jpg';
        const fileName = `${selectedConv.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadErr } = await supabase.storage
          .from('chat-attachments')
          .upload(fileName, selectedFile, {
            contentType: selectedFile.type,
            upsert: false
          });

        if (!uploadErr) {
          const { data: publicUrlData } = supabase.storage
            .from('chat-attachments')
            .getPublicUrl(fileName);
          uploadedImageUrl = publicUrlData.publicUrl;
        }
        removeSelectedFile();
        setUploadingImage(false);
      }

      const tempId = `temp_${Date.now()}`;
      const optimisticMsg = {
        id: tempId,
        conversation_id: selectedConv.id,
        sender_id: user.id,
        content: text || (uploadedImageUrl ? (isAr ? '📷 صورة مرفقة' : '📷 Photo attachment') : ''),
        image_url: uploadedImageUrl,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimisticMsg]);
      setTimeout(scrollToBottom, 50);

      const { data: inserted, error: msgErr } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedConv.id,
          sender_id: user.id,
          content: text || (uploadedImageUrl ? (isAr ? '📷 صورة مرفقة' : '📷 Photo attachment') : ''),
          image_url: uploadedImageUrl,
        })
        .select()
        .single();

      if (msgErr) throw msgErr;

      if (inserted) {
        setMessages((prev) => prev.map((m) => (m.id === tempId ? inserted : m)));
      }

      const summaryText = text || (isAr ? '📷 أرسل صورة' : '📷 Sent a photo');
      await supabase
        .from('conversations')
        .update({
          last_message: summaryText,
          last_message_at: new Date().toISOString(),
        })
        .eq('id', selectedConv.id);

      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConv.id
            ? { ...c, last_message: summaryText, last_message_at: new Date().toISOString() }
            : c
        )
      );
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSendingMsg(false);
      setUploadingImage(false);
    }
  };

  const handleSaveAndLock = async (e: React.FormEvent) => {
    e.preventDefault();

    setProfileSaving(true);
    setProfileSuccess(false);
    setProfileError(null);

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
          account_type: accountType,
          role: accountType,
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

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch('/api/account/delete', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) throw new Error('Deletion failed');

      await supabase.auth.signOut();
      alert(t('accountDeletedNotice'));
      router.push('/');
      router.refresh();
    } catch (e: any) {
      alert(e.message || 'Failed to delete account');
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

  const isDealer = accountType === 'dealer';
  const selectedCar = Array.isArray(selectedConv?.listings) ? selectedConv.listings[0] : selectedConv?.listings;
  const targetListingId = selectedConv?.listing_id || selectedCar?.id;

  return (
    <div className="min-h-[85vh] bg-[#f8f9fa] py-8 relative">
      {/* Sliding Notification Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 max-w-sm w-full bg-white rounded-2xl border-2 border-[#e03a14] p-4 shadow-2xl animate-in slide-in-from-top-5 duration-300">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-900 overflow-hidden flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={toast.carImage} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1 mb-0.5">
                <span className="text-[11px] font-black text-[#e03a14] flex items-center gap-1">
                  <BellRing className="w-3 h-3" />
                  {t('newMessageReceived')}
                </span>
                <button
                  type="button"
                  onClick={() => setToast(null)}
                  className="text-slate-400 hover:text-slate-700 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <h5 className="text-xs font-bold text-slate-900 truncate">{toast.carTitle}</h5>
              <p className="text-[11px] text-slate-500 line-clamp-1">{toast.snippet}</p>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('messages');
                  const found = conversations.find((c) => c.id === toast.convId);
                  if (found) setSelectedConv(found);
                  setToast(null);
                }}
                className="mt-1.5 text-[11px] font-bold text-[#e03a14] hover:underline flex items-center gap-1"
              >
                {isAr ? 'فتح المحادثة' : 'Open Chat'}
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* User Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-lg">
              {(fullName || user?.email)?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-slate-900">
                  {fullName || user?.email}
                </h1>
                {isDealer && (
                  <span className="bg-orange-50 text-[#e03a14] border border-orange-200 text-[10px] font-black px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    DEALERSHIP
                  </span>
                )}
              </div>
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
            {/* Dealer Bulk Upload Button ONLY for Dealers */}
            {isDealer && (
              <Link
                href="/dashboard/bulk-upload"
                className="flex-1 sm:flex-none justify-center bg-slate-900 hover:bg-black text-white text-xs font-bold py-2.5 px-3.5 rounded-xl flex items-center gap-1.5 transition shadow-2xs"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-[#e03a14]" />
                {t('bulkUploader')}
              </Link>
            )}

            <Link
              href="/sell"
              className="flex-1 sm:flex-none justify-center bg-[#e03a14] hover:bg-[#c53210] text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition shadow-2xs"
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
        <div className="flex gap-2 border-b border-slate-200 mb-6 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('listings')}
            className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition whitespace-nowrap ${
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
            className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'saved'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            {t('savedCars')} ({savedListings.length})
          </button>

          <button
            onClick={() => setActiveTab('messages')}
            className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'messages'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-[#e03a14]" />
            {t('messages')} ({conversations.length})
          </button>

          <button
            onClick={() => setActiveTab('account')}
            className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'account'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            {t('accountSettings')}
          </button>
        </div>

        {/* TAB 1: MY LISTINGS (With Mark as Sold) */}
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
                {myListings.map((car) => {
                  const carSold = car.status === 'sold';
                  return (
                    <div key={car.id} className={`bg-white rounded-2xl border overflow-hidden shadow-2xs flex flex-col justify-between ${
                      carSold ? 'border-red-200' : 'border-slate-200'
                    }`}>
                      <div>
                        <div className="relative aspect-[16/10] bg-slate-900">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={car.image_urls?.[0] || '/placeholder-car.jpg'}
                            alt={car.model}
                            className={`w-full h-full object-cover ${carSold ? 'brightness-90 grayscale-20' : ''}`}
                          />
                          {carSold ? (
                            <span className="absolute top-2.5 left-2.5 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-2xs tracking-wider">
                              {t('sold')}
                            </span>
                          ) : (
                            <span className="absolute top-2.5 left-2.5 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-2xs">
                              {isAr ? 'إعلان نشط' : 'Active'}
                            </span>
                          )}
                        </div>
                        <div className="p-4 space-y-1">
                          <div className={`text-base font-black ${carSold ? 'text-slate-400 line-through' : 'text-[#e03a14]'}`}>
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
                        <button
                          type="button"
                          onClick={() => handleToggleSold(car.id, car.status)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                            carSold
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                          }`}
                        >
                          {carSold ? t('reactivateListing') : t('markAsSold')}
                        </button>

                        <Link
                          href={`/listing/${car.id}`}
                          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1 transition"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          {isAr ? 'عرض' : 'View'}
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
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SAVED CARS (With Quick Delete/Unsave Button) */}
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
                  <div key={car.id} className="relative group">
                    <ListingCard listing={car} />
                    {/* Quick Delete / Unsave Overlay Button */}
                    <button
                      type="button"
                      onClick={(e) => handleRemoveSavedListing(car.id, e)}
                      className="absolute top-3 left-3 z-20 bg-white/90 hover:bg-red-600 text-slate-600 hover:text-white p-2 rounded-xl backdrop-blur-md shadow-md transition"
                      title={isAr ? 'إزالة من المحفوظات' : 'Remove from saved'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: REALTIME CHAT */}
        {activeTab === 'messages' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden grid grid-cols-1 md:grid-cols-3 min-h-[580px]">
            <div className="border-r border-slate-200 bg-slate-50/50 flex flex-col">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <span className="font-black text-xs uppercase tracking-wider text-slate-500">
                  {t('messages')}
                </span>
                <span className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  {t('onlineNow')}
                </span>
              </div>
              <div className="overflow-y-auto flex-1 divide-y divide-slate-100 max-h-[520px]">
                {conversations.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    {t('noMessagesYet')}
                  </div>
                ) : (
                  conversations.map((conv) => {
                    const car = Array.isArray(conv.listings) ? conv.listings[0] : conv.listings;
                    const isSelected = selectedConv?.id === conv.id;
                    return (
                      <button
                        key={conv.id}
                        type="button"
                        onClick={() => setSelectedConv(conv)}
                        className={`w-full p-4 text-left flex items-start gap-3 transition ${
                          isSelected ? 'bg-white border-l-4 border-[#e03a14] shadow-2xs' : 'hover:bg-slate-100/60'
                        }`}
                      >
                        <div className="w-12 h-12 rounded-xl bg-slate-900 overflow-hidden flex-shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={car?.image_urls?.[0] || '/placeholder-car.jpg'}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {car ? `${car.year} ${car.make} ${car.model}` : 'Vehicle Inquiry'}
                          </h4>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            {conv.last_message || t('noMessagesYet')}
                          </p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            <div className="md:col-span-2 flex flex-col justify-between bg-white h-[580px]">
              {selectedConv ? (
                <>
                  <div className="p-3.5 sm:p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 gap-3">
                    {targetListingId ? (
                      <Link
                        href={`/listing/${targetListingId}`}
                        className="flex items-center gap-3 group hover:opacity-95 transition flex-1 min-w-0"
                      >
                        <div className="w-11 h-11 rounded-xl bg-slate-900 overflow-hidden flex-shrink-0 border border-slate-200 group-hover:ring-2 group-hover:ring-[#e03a14] transition">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={selectedCar?.image_urls?.[0] || '/placeholder-car.jpg'}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-black text-slate-900 truncate group-hover:text-[#e03a14] transition flex items-center gap-1.5">
                            {selectedCar ? `${selectedCar.year} ${selectedCar.make} ${selectedCar.model}` : 'View Vehicle Listing'}
                            <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#e03a14] flex-shrink-0" />
                          </h4>
                          <span className="text-xs font-black text-[#e03a14] block">
                            {formatPrice(selectedCar?.price || 0)}
                          </span>
                        </div>
                      </Link>
                    ) : (
                      <div className="min-w-0">
                        <h4 className="text-xs font-black text-slate-900 truncate">
                          {selectedCar ? `${selectedCar.year} ${selectedCar.make} ${selectedCar.model}` : 'Vehicle Inquiry'}
                        </h4>
                      </div>
                    )}

                    {targetListingId && (
                      <Link
                        href={`/listing/${targetListingId}`}
                        className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold py-2 px-3 rounded-xl transition flex items-center gap-1.5 shadow-2xs flex-shrink-0"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-[#e03a14]" />
                        <span>{t('viewVehicleDetails')}</span>
                      </Link>
                    )}
                  </div>

                  <div className="p-4 overflow-y-auto flex-1 space-y-3">
                    {messages.map((m) => {
                      const isMe = m.sender_id === user?.id;
                      return (
                        <div
                          key={m.id}
                          className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed space-y-2 ${
                              isMe
                                ? 'bg-[#e03a14] text-white rounded-br-xs'
                                : 'bg-slate-100 text-slate-800 rounded-bl-xs'
                            }`}
                          >
                            {m.image_url && (
                              <div className="rounded-xl overflow-hidden max-w-xs border border-white/20 bg-black/10">
                                <a href={m.image_url} target="_blank" rel="noopener noreferrer">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={m.image_url}
                                    alt="attachment"
                                    className="w-full h-auto object-cover max-h-56 hover:opacity-90 transition cursor-zoom-in"
                                  />
                                </a>
                              </div>
                            )}

                            {m.content && (!m.image_url || m.content !== (isAr ? '📷 صورة مرفقة' : '📷 Photo attachment')) && (
                              <p className="whitespace-pre-line">{m.content}</p>
                            )}

                            <span className={`text-[9px] block opacity-70 ${isMe ? 'text-right' : 'text-left'}`}>
                              {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {filePreview && (
                    <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-300">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={filePreview} alt="preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={removeSelectedFile}
                          className="absolute top-0 right-0 bg-black/70 text-white rounded-full p-0.5 hover:bg-red-600 transition"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {selectedFile?.name} (Ready to send)
                      </span>
                    </div>
                  )}

                  <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 flex items-center gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition"
                      title={t('attachImage')}
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>

                    <input
                      type="text"
                      placeholder={uploadingImage ? t('uploadingImage') : t('typeMessage')}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1 px-4 py-2 text-xs rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-[#e03a14]"
                    />

                    <button
                      type="submit"
                      disabled={sendingMsg || (!newMessage.trim() && !selectedFile)}
                      className="bg-[#e03a14] hover:bg-[#c53210] disabled:bg-slate-300 text-white p-2.5 rounded-xl transition flex items-center justify-center shadow-2xs"
                    >
                      {sendingMsg ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-xs text-slate-400 p-8 text-center">
                  {t('startChatPrompt')}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: ACCOUNT SETTINGS (With Account Type / Dealer Switch) */}
        {activeTab === 'account' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-lg shadow-2xs space-y-6">
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

              {/* Account Type Selector (Dealer vs Private) */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  {isAr ? 'نوع الحساب (فردي أو معرض سيارات)' : 'Account Type (Private or Commercial Dealer)'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAccountType('private')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      accountType === 'private'
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <UserIcon className="w-3.5 h-3.5" />
                    <span>{isAr ? 'بائع فردي' : 'Private Seller'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAccountType('dealer')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      accountType === 'dealer'
                        ? 'bg-[#e03a14] text-white border-[#e03a14]'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{isAr ? 'معرض سيارات' : 'Car Dealership'}</span>
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  {accountType === 'dealer'
                    ? (isAr ? 'حساب المعارض يفعل ميزة الرفع الجماعي للسيارات عبر ملف Excel/CSV.' : 'Dealership accounts enable bulk CSV fleet inventory uploads.')
                    : (isAr ? 'حساب بائع فردي عادي.' : 'Standard individual seller profile.')}
                </p>
              </div>

              {!isLocked ? (
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="bg-[#e03a14] hover:bg-[#c53210] disabled:bg-slate-300 text-white text-xs font-bold py-2.5 px-5 rounded-xl transition flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  {profileSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {isAr ? 'حفظ وتثبيت البيانات' : 'Save & Lock Details'}
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="bg-slate-800 hover:bg-black disabled:bg-slate-300 text-white text-xs font-bold py-2 px-4 rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  {profileSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {isAr ? 'تحديث نوع الحساب' : 'Update Account Type'}
                </button>
              )}

              {/* Danger Zone: Delete Account */}
              <div className="pt-6 border-t border-red-100">
                <h4 className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
                  {t('deleteAccount')}
                </h4>
                <p className="text-[11px] text-slate-500 mb-3">
                  {t('deleteAccountConfirm')}
                </p>
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(true)}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2 px-3.5 rounded-xl transition shadow-2xs"
                >
                  {t('deleteAccountBtn')}
                </button>
              </div>

              {deleteModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-sm w-full shadow-2xl">
                    <h3 className="text-sm font-black text-slate-900 mb-2">{t('deleteAccount')}</h3>
                    <p className="text-xs text-slate-600 mb-5 leading-relaxed">{t('deleteAccountConfirm')}</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        disabled={deletingAccount}
                        onClick={() => setDeleteModalOpen(false)}
                        className="py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600"
                      >
                        {t('cancel')}
                      </button>
                      <button
                        type="button"
                        disabled={deletingAccount}
                        onClick={handleDeleteAccount}
                        className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-2 rounded-xl text-xs font-bold"
                      >
                        {deletingAccount ? 'Deleting...' : t('deleteAccountBtn')}
                      </button>
                    </div>
                  </div>
                </div>
              )}
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

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f8f9fa]" />}>
      <DashboardContent />
    </Suspense>
  );
}
