'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { carData, years } from '@/lib/constants/car-data';
import PhotoSlotUploader from '@/components/sell/PhotoSlotUploader';
import { PhotoSlotKey } from '@/types/listing';
import { useLanguage } from '@/context/LanguageContext';
import { CheckCircle2, ChevronRight, Car, Camera, FileText, User } from 'lucide-react';

export default function SellPage() {
  const router = useRouter();
  const supabase = createClient();
  const { t, isAr } = useLanguage();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State: Initialized with empty strings for clean default select placeholders
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    trim: '',
    previous_owners: '',
    specs: '',
    body_type: '',
    horsepower: '',
    cylinders: '',
    accident_history: '',
    warranty: '',
    exterior_color: '',
    mileage: '',
    price: '',
    city: '',
    transmission: '',
    fuel_type: '',
    description: '',
    last_service_date: '',
    service_notes: '',
    seller_name: '',
    seller_phone: '',
  });

  const [photoSlots, setPhotoSlots] = useState<Record<PhotoSlotKey, File | null>>({
    front_three_quarter: null,
    rear_three_quarter: null,
    side_profile: null,
    interior_dash: null,
    odometer: null,
  });
  const [extraPhotos, setExtraPhotos] = useState<File[]>([]);
  const [directUrls, setDirectUrls] = useState<Record<string, string>>({});

  const emirateOptions = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'];
  const bodyTypes = ['SUV', 'Sedan', 'Coupe', 'Convertible', 'Hatchback', 'Truck'];
  const horsepowerOptions = ['Under 200 HP', '200 - 300 HP', '300 - 400 HP', '400 - 500 HP', '500+ HP'];
  const cylinderOptions = ['4 Cylinder', '6 Cylinder', '8 Cylinder', '10+ Cylinder'];
  const accidentOptions = ['Clean (No Accidents)', 'Minor Cosmetic Paint', 'Accident Repaired'];
  const warrantyOptions = ['Under Agency Warranty', 'No Warranty / Expired'];

  const availableModels = formData.make
    ? carData.makes.find((m) => m.make.toLowerCase() === formData.make.toLowerCase())?.models || []
    : [];

  const handlePhotosChange = (
    slots: Record<PhotoSlotKey, File | null>,
    extras: File[],
    urls: Record<string, string>
  ) => {
    setPhotoSlots(slots);
    setExtraPhotos(extras);
    setDirectUrls(urls);
  };

  const uploadFileToSupabase = async (file: File): Promise<string> => {
    const filename = `${Date.now()}_${Math.random().toString(36).substring(7)}.webp`;
    const { error } = await supabase.storage.from('car-photos').upload(filename, file, {
      contentType: 'image/webp',
      upsert: true,
    });

    if (error) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    }

    const { data: publicData } = supabase.storage.from('car-photos').getPublicUrl(filename);
    return publicData.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const uploadedUrls: string[] = [];

      for (const key of Object.keys(photoSlots) as PhotoSlotKey[]) {
        const file = photoSlots[key];
        if (file) {
          const url = await uploadFileToSupabase(file);
          uploadedUrls.push(url);
        } else if (directUrls[key]) {
          uploadedUrls.push(directUrls[key]);
        }
      }

      for (const extra of extraPhotos) {
        const url = await uploadFileToSupabase(extra);
        uploadedUrls.push(url);
      }

      const payload = {
        make: formData.make,
        model: formData.model,
        year: parseInt(formData.year, 10) || new Date().getFullYear(),
        trim: formData.trim || null,
        specs: formData.specs || 'GCC Specs',
        body_type: formData.body_type || null,
        horsepower: formData.horsepower || null,
        cylinders: formData.cylinders || null,
        accident_history: formData.accident_history || 'Clean (No Accidents)',
        warranty: formData.warranty || 'No Warranty / Expired',
        exterior_color: formData.exterior_color || null,
        mileage: parseInt(formData.mileage, 10) || 0,
        price: parseInt(formData.price, 10) || 0,
        city: formData.city || 'Dubai',
        transmission: formData.transmission || 'Automatic',
        fuel_type: formData.fuel_type || 'Petrol',
        previous_owners: parseInt(formData.previous_owners, 10) || 1,
        description: formData.description,
        last_service_date: formData.last_service_date || null,
        service_notes: formData.service_notes || null,
        seller_name: formData.seller_name || (isAr ? 'مالك السيارة' : 'Vehicle Owner'),
        seller_phone: formData.seller_phone || null,
        image_urls: uploadedUrls,
      };

      const { data, error } = await supabase.from('listings').insert([payload]).select();

      if (error) throw error;
      setSuccess(true);
      if (data && data[0]?.id) {
        setTimeout(() => router.push(`/listing/${data[0].id}`), 1200);
      }
    } catch (err: any) {
      console.error('Submission error:', err);
      setErrorMsg(err.message || 'Failed to submit vehicle listing.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f4f4] py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-6">
          <h1 className="text-2xl font-black text-slate-900">
            {isAr ? 'بيع سيارتك في الإمارات' : 'List Your Vehicle'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isAr ? 'انشر مواصفات سيارتك مباشرة للمشترين في كافة الإمارات.' : 'Publish verified UAE specs directly to buyers across all Emirates.'}
          </p>
        </div>

        {success ? (
          <div className="bg-white rounded-2xl border border-emerald-200 p-8 shadow-sm text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-slate-900 mb-1">
              {isAr ? 'تم نشر الإعلان بنجاح!' : 'Vehicle Listed Successfully!'}
            </h2>
            <p className="text-xs text-slate-500">
              {isAr ? 'جاري تحويلك إلى صفحة السيارة...' : 'Redirecting to your vehicle page...'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {errorMsg && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-semibold">
                {errorMsg}
              </div>
            )}

            {/* STEP 1: VEHICLE SPECIFICATIONS */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Car className="w-4 h-4 text-[#e03a14]" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  {isAr ? 'الخطوة ١: معلومات ومواصفات السيارة' : 'Step 1: Vehicle Information'}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Make */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">{t('make')} *</label>
                  <select
                    required
                    value={formData.make}
                    onChange={(e) => setFormData({ ...formData, make: e.target.value, model: '' })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="">{t('selectMake')}</option>
                    {carData.makes.map((item) => (
                      <option key={item.make} value={item.make}>{t(item.make)}</option>
                    ))}
                  </select>
                </div>

                {/* Model */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">{t('model')} *</label>
                  <select
                    required
                    disabled={!formData.make}
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white disabled:bg-slate-100"
                  >
                    <option value="">{formData.make ? t('selectModel') : (isAr ? 'اختر الماركة أولاً' : 'Select Make First')}</option>
                    {availableModels.map((mod) => (
                      <option key={mod} value={mod}>{mod}</option>
                    ))}
                  </select>
                </div>

                {/* Year */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">{t('year')} *</label>
                  <select
                    required
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="">{t('selectYear')}</option>
                    {years.map((y) => (
                      <option key={y} value={y.toString()}>{y}</option>
                    ))}
                  </select>
                </div>

                {/* Trim */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    {isAr ? 'الفئة / الإصدار' : 'Trim / Edition'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Carrera S, AMG, GTS, Turbo"
                    value={formData.trim}
                    onChange={(e) => setFormData({ ...formData, trim: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                  />
                </div>

                {/* Regional Specs */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">{t('specs')} *</label>
                  <select
                    required
                    value={formData.specs}
                    onChange={(e) => setFormData({ ...formData, specs: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="">{t('selectSpecs')}</option>
                    <option value="GCC Specs">{t('GCC Specs')}</option>
                    <option value="Non-GCC / American">{t('Non-GCC / American')}</option>
                    <option value="Non-GCC / Japanese">{t('Non-GCC / Japanese')}</option>
                    <option value="Non-GCC / European">{t('Non-GCC / European')}</option>
                  </select>
                </div>

                {/* Accident History (Dubizzle Spec) */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">{t('accidentHistory')} *</label>
                  <select
                    required
                    value={formData.accident_history}
                    onChange={(e) => setFormData({ ...formData, accident_history: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="">{t('selectAccident')}</option>
                    {accidentOptions.map((opt) => (
                      <option key={opt} value={opt}>{t(opt)}</option>
                    ))}
                  </select>
                </div>

                {/* Warranty Status (Dubizzle Spec) */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">{t('warranty')} *</label>
                  <select
                    required
                    value={formData.warranty}
                    onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="">{t('selectWarranty')}</option>
                    {warrantyOptions.map((opt) => (
                      <option key={opt} value={opt}>{t(opt)}</option>
                    ))}
                  </select>
                </div>

                {/* Body Type */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">{t('bodyType')}</label>
                  <select
                    value={formData.body_type}
                    onChange={(e) => setFormData({ ...formData, body_type: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="">{t('selectBodyType')}</option>
                    {bodyTypes.map((opt) => (
                      <option key={opt} value={opt}>{t(opt)}</option>
                    ))}
                  </select>
                </div>

                {/* Horsepower */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">{t('horsepower')}</label>
                  <select
                    value={formData.horsepower}
                    onChange={(e) => setFormData({ ...formData, horsepower: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="">{t('selectHorsepower')}</option>
                    {horsepowerOptions.map((opt) => (
                      <option key={opt} value={opt}>{t(opt)}</option>
                    ))}
                  </select>
                </div>

                {/* Cylinders */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">{t('cylinders')}</label>
                  <select
                    value={formData.cylinders}
                    onChange={(e) => setFormData({ ...formData, cylinders: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="">{t('selectCylinders')}</option>
                    {cylinderOptions.map((opt) => (
                      <option key={opt} value={opt}>{t(opt)}</option>
                    ))}
                  </select>
                </div>

                {/* Previous Owners */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">{t('previousOwners')} *</label>
                  <select
                    required
                    value={formData.previous_owners}
                    onChange={(e) => setFormData({ ...formData, previous_owners: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="">{t('selectOwners')}</option>
                    <option value="1">{isAr ? '١ (مالك أول)' : '1 (Single Owner)'}</option>
                    <option value="2">{isAr ? '٢ مالكين' : '2 Owners'}</option>
                    <option value="3">{isAr ? '٣ مالكين' : '3 Owners'}</option>
                    <option value="4">{isAr ? '٤+ مالكين' : '4+ Owners'}</option>
                  </select>
                </div>

                {/* Exterior Color */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">{t('exteriorColor')}</label>
                  <input
                    type="text"
                    placeholder="e.g. Black, Chalk White, Nardo Grey"
                    value={formData.exterior_color}
                    onChange={(e) => setFormData({ ...formData, exterior_color: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                  />
                </div>

                {/* Mileage */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">{t('mileage')} (km) *</label>
                  <input
                    required
                    type="number"
                    placeholder="e.g. 45000"
                    value={formData.mileage}
                    onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">{t('price')} (AED) *</label>
                  <input
                    required
                    type="number"
                    placeholder="e.g. 175000"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                  />
                </div>

                {/* Emirate */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">{t('emirate')} *</label>
                  <select
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="">{t('selectEmirate')}</option>
                    {emirateOptions.map((em) => (
                      <option key={em} value={em}>{t(em)}</option>
                    ))}
                  </select>
                </div>

                {/* Transmission */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">{t('transmission')} *</label>
                  <select
                    required
                    value={formData.transmission}
                    onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="">{t('selectTransmission')}</option>
                    <option value="Automatic">{t('Automatic')}</option>
                    <option value="Manual">{t('Manual')}</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">{t('vehicleDescription')}</label>
                <textarea
                  rows={4}
                  placeholder={isAr ? 'اذكر تفاصيل إضافية مثل الضمان، الصيانة، وحالة الإطارات...' : 'Detail options, condition, and warranties...'}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                />
              </div>
            </div>

            {/* STEP 2: PHOTOS */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Camera className="w-4 h-4 text-[#e03a14]" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  {isAr ? 'الخطوة ٢: صور السيارة' : 'Step 2: Vehicle Photos'}
                </h2>
              </div>
              <PhotoSlotUploader onChange={handlePhotosChange} />
            </div>

            {/* STEP 3: SERVICE HISTORY */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <FileText className="w-4 h-4 text-[#e03a14]" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  {isAr ? 'الخطوة ٣: سجل الصيانة' : 'Step 3: Service History'}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    {isAr ? 'تاريخ آخر صيانة' : 'Last Service Date'}
                  </label>
                  <input
                    type="date"
                    value={formData.last_service_date}
                    onChange={(e) => setFormData({ ...formData, last_service_date: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    {t('maintenanceNotes')}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Major agency service, fresh Michelin tires"
                    value={formData.service_notes}
                    onChange={(e) => setFormData({ ...formData, service_notes: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                  />
                </div>
              </div>
            </div>

            {/* STEP 4: SELLER DETAILS */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <User className="w-4 h-4 text-[#e03a14]" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  {isAr ? 'الخطوة ٤: معلومات البائع' : 'Step 4: Seller Details'}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    {isAr ? 'اسم البائع / المعرض *' : 'Seller Name *'}
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Private Owner / Al Futtaim Motors"
                    value={formData.seller_name}
                    onChange={(e) => setFormData({ ...formData, seller_name: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    {isAr ? 'رقم الهاتف / الواتساب *' : 'Contact Phone / WhatsApp *'}
                  </label>
                  <input
                    required
                    type="tel"
                    placeholder="+971 50 123 4567"
                    value={formData.seller_phone}
                    onChange={(e) => setFormData({ ...formData, seller_phone: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#e03a14] hover:bg-[#c53210] disabled:bg-slate-400 text-white font-bold py-3.5 px-6 rounded-xl transition text-sm flex items-center justify-center gap-2 shadow-sm"
            >
              {loading ? (isAr ? 'جاري التحقق ونشر الإعلان...' : 'Processing & Publishing...') : (isAr ? 'نشر الإعلان الآن' : 'Publish Listing')}
              <ChevronRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
