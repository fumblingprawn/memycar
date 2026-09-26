'use client';

import React, { useState } from 'react';
import { Building2, MapPin, BadgeCheck, Upload, Save, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useLanguage } from '@/context/LanguageContext';

interface DealerProfile {
  id: string;
  user_type?: string;
  dealer_name?: string;
  dealer_logo_url?: string;
  dealer_address?: string;
  dealer_city?: string;
  is_verified_dealer?: boolean;
}

export default function DealerDashboardHeader({
  profile,
  onRefresh,
}: {
  profile: DealerProfile;
  onRefresh?: () => void;
}) {
  const { isAr } = useLanguage();
  const supabase = createClient();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dealerName, setDealerName] = useState(profile.dealer_name || '');
  const [dealerAddress, setDealerAddress] = useState(profile.dealer_address || '');
  const [dealerCity, setDealerCity] = useState(profile.dealer_city || 'Dubai');
  const [logoUrl, setLogoUrl] = useState(profile.dealer_logo_url || '');

  if (profile.user_type !== 'dealer') return null;

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const ext = file.name.split('.').pop();
      const fileName = `dealer-${profile.id}-${Date.now()}.${ext}`;
      const filePath = `dealers/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setLogoUrl(publicData.publicUrl);
    } catch (err) {
      console.error('Logo upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('profiles')
        .update({
          dealer_name: dealerName,
          dealer_address: dealerAddress,
          dealer_city: dealerCity,
          dealer_logo_url: logoUrl,
        })
        .eq('id', profile.id);

      if (error) throw error;
      setEditing(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-8 shadow-xs">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative group w-20 h-20 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
            {logoUrl ? (
              <img src={logoUrl} alt={dealerName || 'Dealer'} className="w-full h-full object-contain p-1" />
            ) : (
              <Building2 className="w-8 h-8 text-slate-400" />
            )}
            {editing && (
              <label className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer text-white opacity-0 group-hover:opacity-100 transition">
                <Upload className="w-5 h-5" />
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              </label>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">
                {dealerName || (isAr ? 'معرض سيارات معتمد' : 'Showroom Name')}
              </h2>
              {profile.is_verified_dealer && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                  {isAr ? 'معتمد' : 'Verified Dealer'}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {dealerAddress ? `${dealerAddress}, ${dealerCity}` : (isAr ? 'لم يتم تحديد العنوان' : 'No address specified')}
            </p>
          </div>
        </div>

        <button
          onClick={() => (editing ? handleSave() : setEditing(true))}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition self-end sm:self-center"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : editing ? <Save className="w-3.5 h-3.5" /> : null}
          <span>{editing ? (isAr ? 'حفظ البيانات' : 'Save Details') : (isAr ? 'تعديل المعرض' : 'Edit Showroom')}</span>
        </button>
      </div>

      {editing && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              {isAr ? 'اسم المعرض / الشركة' : 'Showroom / Trade Name'}
            </label>
            <input
              type="text"
              value={dealerName}
              onChange={(e) => setDealerName(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#e03a14]"
              placeholder="e.g. Al Futtaim Motors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              {isAr ? 'العنوان الفعلي' : 'Showroom Address'}
            </label>
            <input
              type="text"
              value={dealerAddress}
              onChange={(e) => setDealerAddress(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#e03a14]"
              placeholder="e.g. Ras Al Khor Auto Market, Block 4"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              {isAr ? 'الإمارة' : 'City / Emirate'}
            </label>
            <input
              type="text"
              value={dealerCity}
              onChange={(e) => setDealerCity(e.target.value)}
              className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#e03a14]"
              placeholder="Dubai"
            />
          </div>
        </div>
      )}
    </div>
  );
}
