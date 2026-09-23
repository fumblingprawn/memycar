'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { carData, years } from '@/lib/constants/car-data';
import PhotoSlotUploader from '@/components/sell/PhotoSlotUploader';
import { PhotoSlotKey } from '@/types/listing';
import { useLanguage } from '@/context/LanguageContext';
import { 
  CheckCircle2, 
  ChevronRight, 
  Car, 
  Camera, 
  FileText, 
  User, 
  Trash2, 
  UploadCloud, 
  ShieldCheck, 
  X,
  AlertCircle
} from 'lucide-react';

export default function SellPage() {
  const router = useRouter();
  const supabase = createClient();
  const { t, isAr } = useLanguage();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Terms Modal State
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [formData, setFormData] = useState({
    make: '',
    custom_make: '',
    model: '',
    custom_model: '',
    year: '',
    trim: '',
    transmission: '',
    specs: '',
    mileage: '',
    price: '',
    city: '',
    accident_history: '',
    warranty: '',
    body_type: '',
    horsepower: '',
    cylinders: '',
    exterior_color: '',
    previous_owners: '',
    fuel_type: 'Petrol',
    description: '',
    last_service_date: '',
    service_notes: '',
    seller_name: '',
    seller_phone: '',
  });

  // Auto-fill logged-in user details
  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setFormData((prev) => ({
          ...prev,
          seller_name: prev.seller_name || user.user_metadata?.full_name || user.email?.split('@')[0] || '',
          seller_phone: prev.seller_phone || user.user_metadata?.phone || user.phone || '',
        }));
      }
    }
    loadUser();
  }, [supabase]);

  const [photoSlots, setPhotoSlots] = useState<Record<PhotoSlotKey, File | null>>({
    front_three_quarter: null,
    rear_three_quarter: null,
    side_profile: null,
    interior_dash: null,
    odometer: null,
  });
  const [extraPhotos, setExtraPhotos] = useState<File[]>([]);
  const [directUrls, setDirectUrls] = useState<Record<string, string>>({});

  const [serviceDocs, setServiceDocs] = useState<File[]>([]);
  const [serviceDocPreviews, setServiceDocPreviews] = useState<string[]>([]);

  const emirateOptions = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'];
  const bodyTypes = ['SUV', 'Sedan', 'Coupe', 'Convertible', 'Hatchback', 'Truck'];
  const cylinderOptions = ['3 Cylinder', '4 Cylinder', '6 Cylinder', '8 Cylinder', '10 Cylinder', '12 Cylinder', 'Electric / None'];
  const accidentOptions = ['Clean (No Accidents)', 'Minor Cosmetic Paint', 'Accident Repaired'];
  const warrantyOptions = ['Under Agency Warranty', 'No Warranty / Expired'];

  const availableModels = formData.make && formData.make !== 'Other'
    ? carData.makes.find((m) => m.make.toLowerCase() === formData.make.toLowerCase())?.models || ['Other']
    : ['Other'];

  const handlePhotosChange = (
    slots: Record<PhotoSlotKey, File | null>,
    extras: File[],
    urls: Record<string, string>
  ) => {
    setPhotoSlots(slots);
    setExtraPhotos(extras);
    setDirectUrls(urls);
  };

  const handleServiceDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const remaining = 5 - serviceDocs.length;
    const toAdd = Array.from(files).slice(0, remaining);
    const newPreviews = toAdd.map((f) => URL.createObjectURL(f));
    setServiceDocs([...serviceDocs, ...toAdd]);
    setServiceDocPreviews([...serviceDocPreviews, ...newPreviews]);
  };

  const removeServiceDoc = (idx: number) => {
    setServiceDocs(serviceDocs.filter((_, i) => i !== idx));
    setServiceDocPreviews(serviceDocPreviews.filter((_, i) => i !== idx));
  };

  const uploadFileToSupabase = async (file: File, bucket = 'car-photos'): Promise<string> => {
    const filename = `${Date.now()}_${Math.random().toString(36).substring(7)}.webp`;
    const { error } = await supabase.storage.from(bucket).upload(filename, file, {
      contentType: file.type || 'image/webp',
      upsert: true,
    });

    if (error) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    }

    const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(filename);
    return publicData.publicUrl;
  };

  // Form submit button triggers the Terms Modal first
  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowTermsModal(true);
  };

  // Final Publish after agreeing to terms
  const handleFinalPublish = async () => {
    if (!agreedToTerms) return;
    setShowTermsModal(false);
    setLoading(true);
    setErrorMsg(null);

    try {
      const { data: authData } = await supabase.auth.getUser();
      const currentUserId = authData?.user?.id || null;

      // 1. Upload Vehicle Photos
      const uploadedImageUrls: string[] = [];
      for (const key of Object.keys(photoSlots) as PhotoSlotKey[]) {
        const file = photoSlots[key];
        if (file) {
          const url = await uploadFileToSupabase(file, 'car-photos');
          uploadedImageUrls.push(url);
        } else if (directUrls[key]) {
          uploadedImageUrls.push(directUrls[key]);
        }
      }
      for (const extra of extraPhotos) {
        const url = await uploadFileToSupabase(extra, 'car-photos');
        uploadedImageUrls.push(url);
      }

      // 2. Upload Service Document Photos
      const uploadedServiceUrls: string[] = [];
      for (const doc of serviceDocs) {
        const url = await uploadFileToSupabase(doc, 'car-photos');
        uploadedServiceUrls.push(url);
      }

      const finalMake = formData.make === 'Other' && formData.custom_make ? formData.custom_make.trim() : formData.make;
      const finalModel = (formData.model === 'Other' || formData.make === 'Other') && formData.custom_model ? formData.custom_model.trim() : formData.model;
      const sellerDisplayName = formData.seller_name || authData?.user?.email?.split('@')[0] || (isAr ? 'مالك السيارة' : 'Vehicle Owner');
      const sellerDisplayPhone = formData.seller_phone || null;

      const payload: any = {
        user_id: currentUserId,
        make: finalMake,
        model: finalModel,
        year: parseInt(formData.year, 10) || new Date().getFullYear(),
        trim: formData.trim || null,
        transmission: formData.transmission || 'Automatic',
        specs: formData.specs || 'GCC Specs',
        mileage: parseInt(formData.mileage, 10) || 0,
        price: parseInt(formData.price, 10) || 0,
        city: formData.city || 'Dubai',
        accident_history: formData.accident_history || 'Clean (No Accidents)',
        warranty: formData.warranty || 'No Warranty / Expired',
        horsepower: formData.horsepower ? `${formData.horsepower.replace(/[^0-9]/g, '')} HP` : null,
        cylinders: formData.cylinders || null,
        body_type: formData.body_type || null,
        exterior_color: formData.exterior_color || null,
        previous_owners: parseInt(formData.previous_owners, 10) || 1,
        fuel_type: formData.fuel_type || 'Petrol',
        description: formData.description,
        last_service_date: formData.last_service_date || null,
        service_notes: formData.service_notes || null,
        service_record_urls: uploadedServiceUrls,
        seller_name: sellerDisplayName,
        seller_phone: sellerDisplayPhone,
        contact_name: sellerDisplayName,
        contact_phone: sellerDisplayPhone,
        image_urls: uploadedImageUrls,
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
          <form onSubmit={handlePreSubmit} className="space-y-6">
            {errorMsg && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* STEP 1: VEHICLE SPECIFICATIONS */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Car className="w-4 h-4 text-[#e03a14]" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  {t('step1')}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Make */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">{t('make')} *</label>
                  <select
                    required
                    value={formData.make}
                    onChange={(e) => setFormData({ ...formData, make: e.target.value, model: '', custom_make: '', custom_model: '' })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="">{t('selectMake')}</option>
                    {carData.makes.map((item) => (
                      <option key={item.make} value={item.make}>
                        {isAr ? t(item.make) : item.make}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.make === 'Other' && (
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      {isAr ? 'اسم الماركة المخصصة' : 'Custom Make Name'} *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Lucid, Rivian"
                      value={formData.custom_make}
                      onChange={(e) => setFormData({ ...formData, custom_make: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                    />
                  </div>
                )}

                {/* Model */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">{t('model')} *</label>
                  <select
                    required
                    disabled={!formData.make}
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value, custom_model: '' })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white disabled:bg-slate-100"
                  >
                    <option value="">{formData.make ? t('selectModel') : t('selectMakeFirst')}</option>
                    {availableModels.map((mod) => (
                      <option key={mod} value={mod}>
                        {isAr ? t(mod) : mod}
                      </option>
                    ))}
                  </select>
                </div>

                {(formData.model === 'Other' || formData.make === 'Other') && (
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      {isAr ? 'اسم الموديل المخصص' : 'Custom Model Name'} *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Air Sapphire, ML500"
                      value={formData.custom_model}
                      onChange={(e) => setFormData({ ...formData, custom_model: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                    />
                  </div>
                )}

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
                  <label className="text-xs font-semibold text-slate-700 block mb-1">{t('trim')}</label>
                  <input
                    type="text"
                    placeholder="e.g. Carrera S, AMG, GTS"
                    value={formData.trim}
                    onChange={(e) => setFormData({ ...formData, trim: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                  />
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

                {/* Mileage */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">{t('mileageKm')} *</label>
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
                  <label className="text-xs font-semibold text-slate-700 block mb-1">{t('priceAed')} *</label>
                  <input
                    required
                    type="number"
                    placeholder="e.g. 175000"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                  />
                </div>

                {/* Location */}
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

                {/* Accident History */}
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

                {/* Warranty */}
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

                {/* Horse Power (HP) */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">{t('horsepower')}</label>
                  <input
                    type="text"
                    placeholder="e.g. 450"
                    value={formData.horsepower}
                    onChange={(e) => setFormData({ ...formData, horsepower: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                  />
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
                      <option key={opt} value={opt}>{opt}</option>
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
                    placeholder="e.g. Chalk White, Nardo Grey"
                    value={formData.exterior_color}
                    onChange={(e) => setFormData({ ...formData, exterior_color: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                  />
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
                  {t('step2')}
                </h2>
              </div>
              <PhotoSlotUploader onChange={handlePhotosChange} />
            </div>

            {/* STEP 3: SERVICE HISTORY */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <FileText className="w-4 h-4 text-[#e03a14]" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  {t('step3')}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    {t('lastServiced')}
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
                    placeholder="e.g. Major agency service, fresh tires"
                    value={formData.service_notes}
                    onChange={(e) => setFormData({ ...formData, service_notes: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              {/* Service Photos */}
              <div className="pt-2 border-t border-slate-100">
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  {isAr ? 'صور فواتير الصيانة وسجل الوكالة (اختياري، حتى ٥ صور)' : 'Upload Service Invoices / Warranty Booklet (Optional, Max 5)'}
                </label>
                
                <div className="flex flex-wrap gap-3 items-center">
                  {serviceDocPreviews.map((url, i) => (
                    <div key={i} className="relative w-24 h-20 rounded-xl overflow-hidden border border-slate-200 group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Service Doc ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeServiceDoc(i)}
                        className="absolute top-1 right-1 p-1 bg-black/70 text-white rounded-full hover:bg-red-600 transition"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {serviceDocs.length < 5 && (
                    <label className="w-24 h-20 border-2 border-dashed border-slate-300 hover:border-[#e03a14] rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition">
                      <UploadCloud className="w-5 h-5 text-slate-400" />
                      <span className="text-[10px] font-semibold text-slate-500 mt-1">
                        {isAr ? 'إضافة صورة' : 'Add Photo'}
                      </span>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        multiple
                        className="hidden"
                        onChange={handleServiceDocUpload}
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* STEP 4: SELLER DETAILS (Auto-Filled from Account) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <User className="w-4 h-4 text-[#e03a14]" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  {t('step4')}
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

        {/* TERMS & CONDITIONS POPUP MODAL */}
        {showTermsModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-lg w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#e03a14]" />
                  <h3 className="text-base font-black text-slate-900">
                    {t('termsModalTitle')}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTermsModal(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-500 mb-5 leading-relaxed">
                {t('termsModalDesc')}
              </p>

              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs text-slate-700 leading-normal mb-5">
                <div className="flex items-start gap-2">
                  <span className="text-[#e03a14] font-black">•</span>
                  <span>{t('term1')}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#e03a14] font-black">•</span>
                  <span>{t('term2')}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#e03a14] font-black">•</span>
                  <span>{t('term3')}</span>
                </div>
              </div>

              {/* Checkbox */}
              <label className="flex items-center gap-2.5 cursor-pointer select-none mb-6">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="w-4 h-4 rounded text-[#e03a14] focus:ring-[#e03a14] border-slate-300"
                />
                <span className="text-xs font-bold text-slate-800">
                  {t('termsAgreeCheckbox')}
                </span>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setShowTermsModal(false)}
                  className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition"
                >
                  {t('cancel')}
                </button>
                <button
                  type="button"
                  disabled={!agreedToTerms}
                  onClick={handleFinalPublish}
                  className="bg-[#e03a14] hover:bg-[#c53210] disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition shadow-sm"
                >
                  {t('confirmAndPublish')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
