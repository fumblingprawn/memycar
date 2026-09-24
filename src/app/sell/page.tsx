'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useLanguage } from '@/context/LanguageContext';
import { carData, years } from '@/lib/constants/car-data';
import { 
  Car, 
  Upload, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ArrowLeft,
  ShieldCheck,
  Fuel,
  Cog,
  FileText
} from 'lucide-react';
import Link from 'next/link';

export default function SellPage() {
  const router = useRouter();
  const supabase = createClient();
  const { t, isAr } = useLanguage();

  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Form Fields
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [trim, setTrim] = useState('');
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [price, setPrice] = useState<string>('');
  const [mileage, setMileage] = useState<string>('');
  const [specs, setSpecs] = useState('GCC Specs');
  const [fuelType, setFuelType] = useState('Petrol');
  const [transmission, setTransmission] = useState('Automatic');
  const [warranty, setWarranty] = useState('No');
  const [serviceContract, setServiceContract] = useState('No');
  const [city, setCity] = useState('Dubai');
  const [description, setDescription] = useState('');

  // Media & Submission State
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const emirates = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'];
  const specsList = ['GCC Specs', 'Non-GCC / American', 'Non-GCC / Japanese', 'Non-GCC / European', 'Other'];
  const fuelList = ['Petrol', 'Diesel', 'Hybrid', 'Electric'];
  const transList = ['Automatic', 'Manual'];

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth');
        return;
      }
      setUser(user);
      setLoadingUser(false);
    }
    checkUser();
  }, [supabase, router]);

  const availableModels = make && make !== 'Other'
    ? carData.makes.find((m) => m.make.toLowerCase() === make.toLowerCase())?.models || []
    : [];

  const handleMakeChange = (selectedMake: string) => {
    setMake(selectedMake);
    setModel('');
    setTrim('');
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + imageFiles.length > 15) {
      setErrorMsg(isAr ? 'الحد الأقصى المسموح به هو ١٥ صورة' : 'Maximum 15 photos allowed');
      return;
    }

    const newFiles = [...imageFiles, ...files];
    setImageFiles(newFiles);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleRemoveImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setErrorMsg(null);

    if (imageFiles.length === 0) {
      setErrorMsg(isAr ? 'يرجى تحميل صورة واحدة على الأقل للسيارة' : 'Please upload at least one photo of the vehicle');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Upload Images to Supabase Storage
      const uploadedUrls: string[] = [];
      for (const file of imageFiles) {
        const fileExt = file.name.split('.').pop() || 'jpg';
        const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadErr } = await supabase.storage
          .from('listing-images')
          .upload(fileName, file, { contentType: file.type });

        if (uploadErr) {
          // If storage bucket fails, fallback to general storage or placeholder
          console.warn('Storage upload error:', uploadErr);
        } else {
          const { data: publicData } = supabase.storage
            .from('listing-images')
            .getPublicUrl(fileName);
          uploadedUrls.push(publicData.publicUrl);
        }
      }

      // 2. Insert Listing
      const sellerName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Member';
      const sellerPhone = user.user_metadata?.phone || '';

      const { data: inserted, error: insertErr } = await supabase
        .from('listings')
        .insert({
          user_id: user.id,
          make,
          model,
          trim: trim.trim() || null,
          year: parseInt(year.toString(), 10),
          price: parseFloat(price),
          mileage: parseInt(mileage, 10),
          specs,
          fuel_type: fuelType,
          transmission,
          warranty,
          service_contract: serviceContract,
          city,
          description: description.trim(),
          image_urls: uploadedUrls.length > 0 ? uploadedUrls : ['/placeholder-car.jpg'],
          seller_name: sellerName,
          seller_phone: sellerPhone,
        })
        .select()
        .single();

      if (insertErr) throw insertErr;

      router.push(`/listing/${inserted.id}`);
      router.refresh();
    } catch (err: any) {
      console.error('Error creating listing:', err);
      setErrorMsg(err?.message || 'Failed to publish listing');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingUser) {
    return (
      <div className="min-h-[70vh] bg-[#f8f9fa] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#e03a14] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Back Link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-6 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          {isAr ? 'العودة إلى لوحة التحكم' : 'Back to Dashboard'}
        </Link>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xs">
          <div className="mb-6 pb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                {t('sellCar')}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                {isAr
                  ? 'أدخل بيانات سيارتك بدقة لعرضها على المشترين في كافة أنحاء الإمارات'
                  : 'Enter your car specifications to reach verified buyers across the UAE'}
              </p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-[#e03a14] flex items-center justify-center font-bold">
              <Car className="w-5 h-5" />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2 mb-6 font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. VEHICLE IDENTITY */}
            <div className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {isAr ? 'بيانات ومواصفات المركبة' : 'Vehicle Information'}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Make */}
                <div>
                  <label className="text-xs font-bold text-slate-900 block mb-1.5">
                    {t('make')} *
                  </label>
                  <select
                    required
                    value={make}
                    onChange={(e) => handleMakeChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 outline-none focus:ring-2 focus:ring-[#e03a14]"
                  >
                    <option value="">{t('allMakes')}</option>
                    {carData.makes.map((item) => (
                      <option key={item.make} value={item.make}>
                        {isAr ? t(item.make) : item.make}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Model */}
                <div>
                  <label className="text-xs font-bold text-slate-900 block mb-1.5">
                    {t('model')} *
                  </label>
                  <select
                    required
                    disabled={!make || availableModels.length === 0}
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 outline-none focus:ring-2 focus:ring-[#e03a14] disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    <option value="">{make ? t('allModels') : t('selectMakeFirst')}</option>
                    {availableModels.map((mod) => (
                      <option key={mod} value={mod}>
                        {isAr ? t(mod) : mod}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Trim / Edition directly under Model */}
              <div>
                <label className="text-xs font-bold text-slate-900 block mb-1.5">
                  {isAr ? 'الفئة / الإصدار (Trim / Edition)' : 'Trim / Edition (Optional)'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Designo Package / Carrera S / AMG Line / Sport"
                  value={trim}
                  onChange={(e) => setTrim(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 text-slate-900 outline-none focus:ring-2 focus:ring-[#e03a14]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Year */}
                <div>
                  <label className="text-xs font-bold text-slate-900 block mb-1.5">
                    {t('year')} *
                  </label>
                  <select
                    required
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value, 10))}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 outline-none focus:ring-2 focus:ring-[#e03a14]"
                  >
                    {years.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                {/* Price */}
                <div>
                  <label className="text-xs font-bold text-slate-900 block mb-1.5">
                    {t('priceAed')} *
                  </label>
                  <input
                    required
                    type="number"
                    min="1000"
                    placeholder="e.g. 85000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 text-slate-900 outline-none focus:ring-2 focus:ring-[#e03a14]"
                  />
                </div>

                {/* Mileage */}
                <div>
                  <label className="text-xs font-bold text-slate-900 block mb-1.5">
                    {t('mileageKm')} *
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    placeholder="e.g. 45000"
                    value={mileage}
                    onChange={(e) => setMileage(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 text-slate-900 outline-none focus:ring-2 focus:ring-[#e03a14]"
                  />
                </div>
              </div>
            </div>

            {/* 2. REGIONAL SPECS & TECHNICAL SPECS */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {isAr ? 'المواصفات الفنية والإقليمية' : 'Specs & Details'}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Regional Specs (with Other added) */}
                <div>
                  <label className="text-xs font-bold text-slate-900 block mb-1.5">
                    {t('specs')} *
                  </label>
                  <select
                    required
                    value={specs}
                    onChange={(e) => setSpecs(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 outline-none focus:ring-2 focus:ring-[#e03a14]"
                  >
                    {specsList.map((sp) => (
                      <option key={sp} value={sp}>
                        {sp === 'Other' ? (isAr ? 'أخرى' : 'Other') : t(sp)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Emirate / City */}
                <div>
                  <label className="text-xs font-bold text-slate-900 block mb-1.5">
                    {t('emirate')} *
                  </label>
                  <select
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 outline-none focus:ring-2 focus:ring-[#e03a14]"
                  >
                    {emirates.map((em) => (
                      <option key={em} value={em}>{t(em)}</option>
                    ))}
                  </select>
                </div>

                {/* Fuel Type */}
                <div>
                  <label className="text-xs font-bold text-slate-900 block mb-1.5">
                    {t('fuelType')} *
                  </label>
                  <select
                    required
                    value={fuelType}
                    onChange={(e) => setFuelType(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 outline-none focus:ring-2 focus:ring-[#e03a14]"
                  >
                    {fuelList.map((f) => (
                      <option key={f} value={f}>{t(f)}</option>
                    ))}
                  </select>
                </div>

                {/* Transmission */}
                <div>
                  <label className="text-xs font-bold text-slate-900 block mb-1.5">
                    {t('transmission')} *
                  </label>
                  <select
                    required
                    value={transmission}
                    onChange={(e) => setTransmission(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 outline-none focus:ring-2 focus:ring-[#e03a14]"
                  >
                    {transList.map((tr) => (
                      <option key={tr} value={tr}>{t(tr)}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Warranty & Service Contract (Yes / No) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Warranty: Yes / No */}
                <div>
                  <label className="text-xs font-bold text-slate-900 block mb-1.5">
                    {t('warranty')} *
                  </label>
                  <select
                    required
                    value={warranty}
                    onChange={(e) => setWarranty(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 outline-none focus:ring-2 focus:ring-[#e03a14]"
                  >
                    <option value="Yes">{isAr ? 'نعم (يوجد ضمان)' : 'Yes (Under Warranty)'}</option>
                    <option value="No">{isAr ? 'لا (بدون ضمان)' : 'No (No Warranty)'}</option>
                  </select>
                </div>

                {/* Service Contract: Yes / No (Under Warranty) */}
                <div>
                  <label className="text-xs font-bold text-slate-900 block mb-1.5">
                    {isAr ? 'عقد صيانة (Service Contract) *' : 'Service Contract *'}
                  </label>
                  <select
                    required
                    value={serviceContract}
                    onChange={(e) => setServiceContract(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 outline-none focus:ring-2 focus:ring-[#e03a14]"
                  >
                    <option value="Yes">{isAr ? 'نعم (يوجد عقد صيانة)' : 'Yes'}</option>
                    <option value="No">{isAr ? 'لا (بدون عقد صيانة)' : 'No'}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 3. DESCRIPTION */}
            <div className="space-y-2 pt-4 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-900 block">
                {t('vehicleDescription')}
              </label>
              <textarea
                rows={4}
                placeholder={isAr ? 'اكتب وصفاً تفصيلياً لحالة السيارة، الصيانات الأخيرة، وأي ميزات إضافية...' : 'Describe the condition, service records, recent upgrades, or tire status...'}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 text-slate-900 outline-none focus:ring-2 focus:ring-[#e03a14] resize-none"
              />
            </div>

            {/* 4. PHOTO UPLOADS */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-900 block">
                {isAr ? 'صور السيارة (حتى ١٥ صورة) *' : 'Vehicle Photos (Max 15) *'}
              </label>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {imagePreviews.map((src, idx) => (
                  <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 group bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="thumb" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 bg-black/70 hover:bg-red-600 text-white rounded-full p-1 transition"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    {idx === 0 && (
                      <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                        Cover
                      </span>
                    )}
                  </div>
                ))}

                {imagePreviews.length < 15 && (
                  <label className="aspect-video rounded-xl border-2 border-dashed border-slate-300 hover:border-[#e03a14] flex flex-col items-center justify-center cursor-pointer transition bg-slate-50 hover:bg-orange-50/30">
                    <Upload className="w-5 h-5 text-slate-400 group-hover:text-[#e03a14]" />
                    <span className="text-[10px] text-slate-500 font-semibold mt-1">
                      {isAr ? 'أضف صور' : 'Add Photo'}
                    </span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <div className="pt-6 border-t border-slate-100">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#e03a14] hover:bg-[#c53210] disabled:bg-slate-300 text-white font-bold py-3.5 px-4 rounded-xl text-sm transition shadow-sm flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitting ? (isAr ? 'جاري نشر الإعلان...' : 'Publishing Listing...') : (isAr ? 'نشر إعلان السيارة الآن' : 'Publish Car Listing')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
