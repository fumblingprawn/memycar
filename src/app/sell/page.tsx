'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useLanguage } from '@/context/LanguageContext';
import { carData, years } from '@/lib/constants/car-data';
import { 
  Car, 
  Upload, 
  X, 
  AlertCircle, 
  Loader2, 
  ArrowLeft,
  MapPin,
  Camera,
  Image as ImageIcon,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';

interface AngleSlot {
  key: 'front' | 'rear' | 'side' | 'interior';
  titleEn: string;
  titleAr: string;
  subEn: string;
  subAr: string;
}

const ANGLE_SLOTS: AngleSlot[] = [
  { key: 'front', titleEn: 'Front 3/4 Angle', titleAr: 'زاوية أمامية ٣/٤', subEn: 'Driver or passenger front', subAr: 'الأمامية يمين أو يسار' },
  { key: 'rear', titleEn: 'Rear 3/4 Angle', titleAr: 'زاوية خلفية ٣/٤', subEn: 'Exhaust & taillights', subAr: 'الجهة الخلفية والمصابيح' },
  { key: 'side', titleEn: 'Full Side Profile', titleAr: 'الجانب بالكامل', subEn: 'Full wheel & body line', subAr: 'المظهر الجانبي والعجلات' },
  { key: 'interior', titleEn: 'Dashboard & Cockpit', titleAr: 'المقصورة والعدادات', subEn: 'Steering wheel & console', subAr: 'عجلة القيادة والكونسول' },
];

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
  const [year, setYear] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [mileage, setMileage] = useState<string>('');
  const [specs, setSpecs] = useState('');
  const [fuelType, setFuelType] = useState('');
  const [transmission, setTransmission] = useState('');
  const [warranty, setWarranty] = useState('');
  const [serviceContract, setServiceContract] = useState('');
  const [city, setCity] = useState('');
  const [description, setDescription] = useState('');

  // Structured Wireframe Photos
  const [wireframeFiles, setWireframeFiles] = useState<{ [key: string]: File | null }>({
    front: null,
    rear: null,
    side: null,
    interior: null,
  });
  const [wireframePreviews, setWireframePreviews] = useState<{ [key: string]: string | null }>({
    front: null,
    rear: null,
    side: null,
    interior: null,
  });

  // Additional freeform photos
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);
  const [additionalPreviews, setAdditionalPreviews] = useState<string[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Separate refs for Camera (capture="environment") vs File Gallery
  const cameraInputRefs = {
    front: useRef<HTMLInputElement>(null),
    rear: useRef<HTMLInputElement>(null),
    side: useRef<HTMLInputElement>(null),
    interior: useRef<HTMLInputElement>(null),
    additional: useRef<HTMLInputElement>(null),
  };

  const fileInputRefs = {
    front: useRef<HTMLInputElement>(null),
    rear: useRef<HTMLInputElement>(null),
    side: useRef<HTMLInputElement>(null),
    interior: useRef<HTMLInputElement>(null),
    additional: useRef<HTMLInputElement>(null),
  };

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

  const handleAngleFileSelect = (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (wireframePreviews[key]) {
        URL.revokeObjectURL(wireframePreviews[key]!);
      }
      setWireframeFiles((prev) => ({ ...prev, [key]: file }));
      setWireframePreviews((prev) => ({ ...prev, [key]: URL.createObjectURL(file) }));
    }
  };

  const handleRemoveAnglePhoto = (key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (wireframePreviews[key]) {
      URL.revokeObjectURL(wireframePreviews[key]!);
    }
    setWireframeFiles((prev) => ({ ...prev, [key]: null }));
    setWireframePreviews((prev) => ({ ...prev, [key]: null }));
    if (fileInputRefs[key as keyof typeof fileInputRefs].current) {
      fileInputRefs[key as keyof typeof fileInputRefs].current!.value = '';
    }
    if (cameraInputRefs[key as keyof typeof cameraInputRefs].current) {
      cameraInputRefs[key as keyof typeof cameraInputRefs].current!.value = '';
    }
  };

  const handleAdditionalSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const currentWireCount = Object.values(wireframeFiles).filter(Boolean).length;
    const totalCount = currentWireCount + additionalFiles.length + files.length;

    if (totalCount > 15) {
      setErrorMsg(isAr ? 'الحد الأقصى المسموح به هو ١٥ صورة شاملة' : 'Maximum 15 photos in total allowed');
      return;
    }

    setAdditionalFiles((prev) => [...prev, ...files]);
    const newPreviews = files.map((f) => URL.createObjectURL(f));
    setAdditionalPreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleRemoveAdditional = (index: number) => {
    URL.revokeObjectURL(additionalPreviews[index]);
    setAdditionalFiles((prev) => prev.filter((_, i) => i !== index));
    setAdditionalPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setErrorMsg(null);

    if (!make || !model || !year || !price || !mileage || !specs || !city || !fuelType || !transmission || !warranty || !serviceContract) {
      setErrorMsg(isAr ? 'يرجى ملء كافة الحقول المطلوبة' : 'Please complete all required fields');
      return;
    }

    const allFilesToUpload: File[] = [];
    ['front', 'rear', 'side', 'interior'].forEach((k) => {
      if (wireframeFiles[k]) allFilesToUpload.push(wireframeFiles[k]!);
    });
    allFilesToUpload.push(...additionalFiles);

    if (allFilesToUpload.length === 0) {
      setErrorMsg(isAr ? 'يرجى التقاط أو رفع صورة واحدة على الأقل للسيارة' : 'Please take or upload at least one photo (Front 3/4 recommended)');
      return;
    }

    setSubmitting(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of allFilesToUpload) {
        const fileExt = file.name.split('.').pop() || 'jpg';
        const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadErr } = await supabase.storage
          .from('listing-images')
          .upload(fileName, file, { contentType: file.type });

        if (!uploadErr) {
          const { data: publicData } = supabase.storage
            .from('listing-images')
            .getPublicUrl(fileName);
          uploadedUrls.push(publicData.publicUrl);
        }
      }

      const sellerName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Member';
      const sellerPhone = user.user_metadata?.phone || '';

      const { data: inserted, error: insertErr } = await supabase
        .from('listings')
        .insert({
          user_id: user.id,
          make,
          model,
          trim: trim.trim() || null,
          year: parseInt(year, 10),
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

  const AngleIllustration = ({ type }: { type: string }) => {
    switch (type) {
      case 'front':
        return (
          <svg className="w-12 h-8 text-slate-400 group-hover:text-[#e03a14] transition" viewBox="0 0 100 60" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M 12 36 L 22 22 L 48 20 L 75 25 L 88 35 L 94 40 L 92 48 L 12 48 Z" />
            <path d="M 28 22 L 35 34 L 70 34 L 75 25" />
            <circle cx="28" cy="48" r="7" strokeWidth="2.5" fill="#f8f9fa" />
            <circle cx="78" cy="48" r="7" strokeWidth="2.5" fill="#f8f9fa" />
            <path d="M 40 37 L 65 37" />
          </svg>
        );
      case 'rear':
        return (
          <svg className="w-12 h-8 text-slate-400 group-hover:text-[#e03a14] transition" viewBox="0 0 100 60" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M 88 36 L 78 22 L 52 20 L 25 25 L 12 35 L 6 40 L 8 48 L 88 48 Z" />
            <path d="M 72 22 L 65 34 L 30 34 L 25 25" />
            <circle cx="72" cy="48" r="7" strokeWidth="2.5" fill="#f8f9fa" />
            <circle cx="22" cy="48" r="7" strokeWidth="2.5" fill="#f8f9fa" />
            <path d="M 60 37 L 35 37" />
          </svg>
        );
      case 'side':
        return (
          <svg className="w-12 h-8 text-slate-400 group-hover:text-[#e03a14] transition" viewBox="0 0 100 60" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M 8 42 L 14 36 L 25 36 L 38 24 L 68 24 L 84 34 L 95 38 L 95 44 L 8 44 Z" />
            <circle cx="26" cy="44" r="8" strokeWidth="2.5" fill="#f8f9fa" />
            <circle cx="76" cy="44" r="8" strokeWidth="2.5" fill="#f8f9fa" />
            <path d="M 39 26 L 53 26 L 53 36 L 28 36 Z" />
          </svg>
        );
      case 'interior':
      default:
        return (
          <svg className="w-12 h-8 text-slate-400 group-hover:text-[#e03a14] transition" viewBox="0 0 100 60" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M 10 46 L 20 28 L 80 28 L 90 46 Z" />
            <circle cx="34" cy="40" r="10" strokeWidth="2.5" />
            <rect x="52" y="32" width="22" height="12" rx="2" strokeWidth="2" />
          </svg>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
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
                  ? 'أدخل مواصفات سيارتك بدقة لعرضها على المشترين في كافة أنحاء الإمارات'
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
                    {availableModels.map((item, idx) => {
                      if (typeof item === "string") {
                        return (
                          <option key={idx} value={item}>
                            {isAr ? t(item) : item}
                          </option>
                        );
                      }
                      return (
                        <optgroup key={item.groupName} label={`— ${item.groupName} —`}>
                          {item.models.map((m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          ))}
                        </optgroup>
                      );
                    })}
                  </select>
                </div>
              </div>

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
                <div>
                  <label className="text-xs font-bold text-slate-900 block mb-1.5">
                    {t('year')} *
                  </label>
                  <select
                    required
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 outline-none focus:ring-2 focus:ring-[#e03a14]"
                  >
                    <option value="">{t('selectYear')}</option>
                    {years.map((y) => (
                      <option key={y} value={y.toString()}>{y}</option>
                    ))}
                  </select>
                </div>

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

            {/* 2. TECHNICAL SPECIFICATIONS */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {isAr ? 'المواصفات الفنية للسيارة' : 'Car Specifications'}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                    <option value="">{t('selectSpecs')}</option>
                    {specsList.map((sp) => (
                      <option key={sp} value={sp}>
                        {sp === 'Other' ? (isAr ? 'أخرى' : 'Other') : t(sp)}
                      </option>
                    ))}
                  </select>
                </div>

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
                    <option value="">{t('selectFuelPlaceholder')}</option>
                    {fuelList.map((f) => (
                      <option key={f} value={f}>{t(f)}</option>
                    ))}
                  </select>
                </div>

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
                    <option value="">{t('selectTransmission')}</option>
                    {transList.map((tr) => (
                      <option key={tr} value={tr}>{t(tr)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
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
                    <option value="">{t('selectWarranty')}</option>
                    <option value="Yes">{isAr ? 'نعم (يوجد ضمان)' : 'Yes'}</option>
                    <option value="No">{isAr ? 'لا (بدون ضمان)' : 'No'}</option>
                  </select>
                </div>

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
                    <option value="">{t('selectServiceContractPlaceholder')}</option>
                    <option value="Yes">{isAr ? 'نعم (يوجد عقد صيانة)' : 'Yes'}</option>
                    <option value="No">{isAr ? 'لا (بدون عقد صيانة)' : 'No'}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 3. LOCATION */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#e03a14]" />
                {t('locationHeading')}
              </h2>
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
                  <option value="">{t('selectEmirate')}</option>
                  {emirates.map((em) => (
                    <option key={em} value={em}>{t(em)}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 4. DESCRIPTION */}
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

            {/* 5. WIREFRAME ANGLE UPLOAD SLOTS WITH BOTH CAMERA & GALLERY BUTTONS */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div>
                <label className="text-xs font-bold text-slate-900 block">
                  {isAr ? 'صور زوايا السيارة الرئيسية (التقاط بالكاميرا أو اختيار ملف) *' : 'Capture Key Vehicle Angles (Camera or File) *'}
                </label>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {isAr ? 'يمكنك التقاط الصورة مباشرة بالكاميرا أو اختيار صورة من المعرض' : 'Snap a fresh photo with your camera or select an existing photo'}
                </p>
              </div>

              {/* 4 Angle Slots */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {ANGLE_SLOTS.map((slot) => {
                  const preview = wireframePreviews[slot.key];
                  return (
                    <div
                      key={slot.key}
                      className={`relative rounded-2xl border-2 transition flex flex-col justify-between p-3 text-center group overflow-hidden ${
                        preview
                          ? 'border-emerald-500 bg-slate-900 aspect-[4/3]'
                          : 'border-dashed border-slate-300 bg-slate-50 min-h-[175px]'
                      }`}
                    >
                      {/* Hidden Camera Input (launches camera directly) */}
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        ref={cameraInputRefs[slot.key]}
                        onChange={(e) => handleAngleFileSelect(slot.key, e)}
                        className="hidden"
                      />

                      {/* Hidden File Picker Input (opens gallery/files) */}
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRefs[slot.key]}
                        onChange={(e) => handleAngleFileSelect(slot.key, e)}
                        className="hidden"
                      />

                      {preview ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={preview}
                            alt={slot.titleEn}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1.5 p-2">
                            <button
                              type="button"
                              onClick={() => cameraInputRefs[slot.key].current?.click()}
                              className="bg-white/95 text-slate-900 text-[10px] font-bold p-1.5 rounded-lg flex items-center gap-1 shadow-sm hover:bg-white"
                              title="Retake with camera"
                            >
                              <Camera className="w-3.5 h-3.5 text-[#e03a14]" />
                            </button>
                            <button
                              type="button"
                              onClick={() => fileInputRefs[slot.key].current?.click()}
                              className="bg-white/95 text-slate-900 text-[10px] font-bold p-1.5 rounded-lg flex items-center gap-1 shadow-sm hover:bg-white"
                              title="Replace from file"
                            >
                              <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleRemoveAnglePhoto(slot.key, e)}
                              className="bg-red-600 text-white p-1.5 rounded-lg hover:bg-red-700 transition shadow-sm"
                              title="Remove"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="absolute top-2 left-2 bg-emerald-500 text-white rounded-full p-0.5 shadow-sm">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </div>
                          <span className="absolute bottom-2 left-2 right-2 bg-black/70 backdrop-blur-xs text-white text-[9px] font-bold py-0.5 rounded truncate px-1">
                            {isAr ? slot.titleAr : slot.titleEn}
                          </span>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-between h-full">
                          <AngleIllustration type={slot.key} />

                          <div className="my-1.5">
                            <span className="text-[11px] font-black text-slate-800 block leading-tight">
                              {isAr ? slot.titleAr : slot.titleEn}
                            </span>
                            <span className="text-[9px] text-slate-400 block mt-0.5">
                              {isAr ? slot.subAr : slot.subEn}
                            </span>
                          </div>

                          {/* Dual Action Buttons: Camera + File */}
                          <div className="grid grid-cols-2 gap-1.5 w-full pt-1">
                            <button
                              type="button"
                              onClick={() => cameraInputRefs[slot.key].current?.click()}
                              className="bg-[#e03a14] hover:bg-[#c53210] active:scale-95 text-white py-1.5 px-1 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 shadow-2xs transition"
                            >
                              <Camera className="w-3 h-3 flex-shrink-0" />
                              <span>{isAr ? 'كاميرا' : 'Camera'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => fileInputRefs[slot.key].current?.click()}
                              className="bg-white hover:bg-slate-100 border border-slate-200 active:scale-95 text-slate-700 py-1.5 px-1 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1 shadow-2xs transition"
                            >
                              <ImageIcon className="w-3 h-3 flex-shrink-0 text-slate-500" />
                              <span>{isAr ? 'ملف' : 'File'}</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Additional Photos Section */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700">
                    {isAr ? 'صور إضافية (اختياري - حتى ١٥ صورة)' : 'Additional Photos (Optional - Wheels, Engine, Details)'}
                  </span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                  {additionalPreviews.map((src, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveAdditional(idx)}
                        className="absolute top-1 right-1 bg-black/70 hover:bg-red-600 text-white rounded-full p-1 transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {/* Additional Photo Camera & Gallery Uploaders */}
                  <div className="aspect-square rounded-xl border-2 border-dashed border-slate-300 p-1 flex flex-col justify-center gap-1 bg-slate-50">
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      ref={cameraInputRefs.additional}
                      onChange={handleAdditionalSelect}
                      className="hidden"
                    />
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      ref={fileInputRefs.additional}
                      onChange={handleAdditionalSelect}
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() => cameraInputRefs.additional.current?.click()}
                      className="flex-1 bg-[#e03a14] hover:bg-[#c53210] active:scale-95 text-white rounded-lg flex items-center justify-center gap-1 text-[9px] font-bold transition"
                    >
                      <Camera className="w-3 h-3" />
                      <span>{isAr ? 'كاميرا' : 'Camera'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRefs.additional.current?.click()}
                      className="flex-1 bg-white hover:bg-slate-100 border border-slate-200 active:scale-95 text-slate-700 rounded-lg flex items-center justify-center gap-1 text-[9px] font-bold transition"
                    >
                      <Upload className="w-3 h-3 text-slate-400" />
                      <span>{isAr ? 'ملف' : 'File'}</span>
                    </button>
                  </div>
                </div>
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
