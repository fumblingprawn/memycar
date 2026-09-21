'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { carData, years } from '@/lib/constants/car-data';
import { PhotoSlotKey, Emirate, VehicleSpec, ServiceHistory, PaintCondition, WarrantyStatus } from '@/types/listing';
import { useRouter } from 'next/navigation';
import PhotoSlotUploader from '@/components/sell/PhotoSlotUploader';

interface VehicleFormValues {
  year: number | null;
  make: string | null;
  model: string | null;
  trim: string | null;
  price: number | null;
  mileage: number | null;
  spec: VehicleSpec | string | null;
  emirate: Emirate | string | null;
  serviceHistory: ServiceHistory | string | null;
  paintCondition: PaintCondition | string | null;
  warranty: WarrantyStatus | string | null;
  keysCount: 1 | 2 | null;
  sellerName: string;
  sellerPhone: string;
  description: string;
  lastServiceDate: string | null;
  serviceNotes: string | null;
}

interface SellPageState {
  photoSlots: Record<PhotoSlotKey, File | null>;
  extraPhotos: File[];
  serviceRecordFiles: File[];
  vehicleForm: VehicleFormValues;
}

const initialVehicleForm: VehicleFormValues = {
  year: null,
  make: null,
  model: null,
  trim: null,
  price: null,
  mileage: null,
  spec: 'GCC',
  emirate: 'Dubai',
  serviceHistory: 'Full Agency',
  paintCondition: 'Original Paint',
  warranty: 'Under Agency Warranty',
  keysCount: 2,
  sellerName: '',
  sellerPhone: '',
  description: '',
  lastServiceDate: null,
  serviceNotes: null,
};

const SellPage: React.FC = () => {
  const router = useRouter();
  const supabase = createClient();

  const [state, setState] = useState<SellPageState>({
    photoSlots: {
      front_three_quarter: null,
      rear_three_quarter: null,
      side_profile: null,
      interior_dash: null,
      odometer: null,
    },
    extraPhotos: [],
    serviceRecordFiles: [],
    vehicleForm: initialVehicleForm,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handlePhotoSlotsChange = useCallback((slots: Record<PhotoSlotKey, File | null>, extras: File[]) => {
    setState(prev => ({
      ...prev,
      photoSlots: slots,
      extraPhotos: extras,
    }));
  }, []);

  const handleServiceRecordFilesChange = useCallback((files: File[]) => {
    setState(prev => ({
      ...prev,
      serviceRecordFiles: files,
    }));
  }, []);

  const handleVehicleFormChange = useCallback((changes: Partial<VehicleFormValues>) => {
    setState(prev => ({
      ...prev,
      vehicleForm: {
        ...prev.vehicleForm,
        ...changes,
      },
    }));
  }, []);

  const handleSubmit = useCallback(async () => {
    const requiredSlots: PhotoSlotKey[] = ['front_three_quarter', 'rear_three_quarter', 'side_profile', 'interior_dash', 'odometer'];
    const missingSlots = requiredSlots.filter(key => !state.photoSlots[key]);

    if (missingSlots.length > 0) {
      setSubmitError('Please upload all 5 primary photos.');
      return;
    }

    const { year, make, model, price, mileage, spec, emirate, sellerName, sellerPhone } = state.vehicleForm;
    if (!year || !make || !model || !price || !mileage || !spec || !emirate || !sellerName || !sellerPhone.trim()) {
      setSubmitError('Please fill in all required fields including Price and Mileage.');
      return;
    }

    setIsSubmitting(true);
    setIsUploadingMedia(true);
    setSubmitError(null);

    try {
      const timestamp = Date.now();
      const uploadedImages: string[] = [];

      // 1. Upload the 5 key vehicle photo slots
      for (const key of requiredSlots) {
        const file = state.photoSlots[key];
        if (file) {
          const filePath = `listings/${timestamp}_${key}.webp`;
          const { error: uploadErr } = await supabase.storage.from('car-photos').upload(filePath, file, {
            contentType: file.type || 'image/webp',
            upsert: false,
          });
          if (uploadErr) throw uploadErr;

          const { data: { publicUrl } } = supabase.storage.from('car-photos').getPublicUrl(filePath);
          uploadedImages.push(publicUrl);
        }
      }

      // 2. Upload any extra vehicle photos
      for (let i = 0; i < state.extraPhotos.length; i++) {
        const file = state.extraPhotos[i];
        const filePath = `listings/${timestamp}_extra_${i}.webp`;
        const { error: uploadErr } = await supabase.storage.from('car-photos').upload(filePath, file, {
          contentType: file.type || 'image/webp',
          upsert: false,
        });
        if (uploadErr) throw uploadErr;

        const { data: { publicUrl } } = supabase.storage.from('car-photos').getPublicUrl(filePath);
        uploadedImages.push(publicUrl);
      }

      // 3. Upload service records (PDF / Images)
      const uploadedServiceRecords: string[] = [];
      for (let i = 0; i < state.serviceRecordFiles.length; i++) {
        const file = state.serviceRecordFiles[i];
        const ext = file.name.substring(file.name.lastIndexOf('.')) || '.pdf';
        const filePath = `records/${timestamp}_${i}${ext}`;
        const { error: uploadErr } = await supabase.storage.from('service-records').upload(filePath, file, {
          upsert: false,
        });
        if (uploadErr) throw uploadErr;

        const { data: { publicUrl } } = supabase.storage.from('service-records').getPublicUrl(filePath);
        uploadedServiceRecords.push(publicUrl);
      }

      // 4. Build database listing payload
      const listingTitle = `${year} ${make} ${model} ${state.vehicleForm.trim || ''}`.trim();
      const insertPayload = {
        title: listingTitle,
        make,
        model,
        year,
        price: Number(price),
        mileage: Number(mileage),
        specs: spec,
        city: emirate,
        transmission: 'Automatic',
        fuel_type: 'Petrol',
        description: state.vehicleForm.description,
        seller_phone: sellerPhone,
        whatsapp_number: sellerPhone,
        image_urls: uploadedImages,
        last_service_date: state.vehicleForm.lastServiceDate || null,
        service_notes: state.vehicleForm.serviceNotes || null,
        service_record_urls: uploadedServiceRecords,
        status: 'active',
      };

      const { data, error: insertError } = await supabase
        .from('listings')
        .insert([insertPayload])
        .select()
        .single();

      if (insertError) throw insertError;

      if (data) {
        router.push(`/listing/${data.id}`);
      }
    } catch (err: any) {
      console.error('Error submitting listing:', err);
      setSubmitError(err.message || 'Failed to publish listing. Please try again.');
    } finally {
      setIsSubmitting(false);
      setIsUploadingMedia(false);
    }
  }, [state, router, supabase]);

  const handleReset = useCallback(() => {
    setState({
      photoSlots: {
        front_three_quarter: null,
        rear_three_quarter: null,
        side_profile: null,
        interior_dash: null,
        odometer: null,
      },
      extraPhotos: [],
      serviceRecordFiles: [],
      vehicleForm: initialVehicleForm,
    });
    setSubmitError(null);
  }, []);

  const models = state.vehicleForm.make
    ? carData.makes.find(m => m.make.toLowerCase() === state.vehicleForm.make?.toLowerCase())?.models || []
    : [];

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
          <div className="mb-8 border-b border-slate-100 pb-6">
            <h1 className="text-3xl font-extrabold text-slate-900">Sell Your Car</h1>
            <p className="mt-1 text-slate-500">List your vehicle across the UAE with verified specs and service records.</p>
          </div>

          {submitError && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
              <p className="text-sm font-semibold text-red-800">{submitError}</p>
            </div>
          )}

          {isUploadingMedia && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-8 text-center shadow-xl max-w-sm mx-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                <h3 className="text-lg font-bold text-slate-900">Uploading Vehicle Details...</h3>
                <p className="text-sm text-slate-500 mt-1">Compressing photos and saving service documents.</p>
              </div>
            </div>
          )}

          <div className="space-y-10">
            {/* Step 1: Photos */}
            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-1">Step 1: Vehicle Photos</h2>
              <p className="text-xs text-slate-500 mb-4">Upload clean, high-resolution photos for the 5 key angles.</p>
              <PhotoSlotUploader onChange={handlePhotoSlotsChange} />
            </section>

            {/* Step 2: Vehicle Specs */}
            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-1">Step 2: Specifications & Pricing</h2>
              <p className="text-xs text-slate-500 mb-4">Select vehicle details matching your official registration card (Mulkiya).</p>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Brand */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Brand *</label>
                  <select
                    value={state.vehicleForm.make ?? ''}
                    onChange={(e) => handleVehicleFormChange({ make: e.target.value || null, model: null })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">Select Brand</option>
                    {carData.makes.map((item) => (
                      <option key={item.make} value={item.make}>{item.make}</option>
                    ))}
                  </select>
                </div>

                {/* Model */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Model *</label>
                  <select
                    value={state.vehicleForm.model ?? ''}
                    onChange={(e) => handleVehicleFormChange({ model: e.target.value || null })}
                    disabled={!state.vehicleForm.make}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-100"
                  >
                    <option value="">{state.vehicleForm.make ? 'Select Model' : 'Select Brand First'}</option>
                    {models.map((model) => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                </div>

                {/* Year */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Year *</label>
                  <select
                    value={state.vehicleForm.year?.toString() ?? ''}
                    onChange={(e) => handleVehicleFormChange({ year: e.target.value ? parseInt(e.target.value, 10) : null })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">Select Year</option>
                    {years.map((yr) => (
                      <option key={yr} value={yr}>{yr}</option>
                    ))}
                  </select>
                </div>

                {/* Price */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Price (AED) *</label>
                  <input
                    type="number"
                    placeholder="e.g. 150000"
                    value={state.vehicleForm.price ?? ''}
                    onChange={(e) => handleVehicleFormChange({ price: e.target.value ? Number(e.target.value) : null })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* Mileage */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Mileage (km) *</label>
                  <input
                    type="number"
                    placeholder="e.g. 45000"
                    value={state.vehicleForm.mileage ?? ''}
                    onChange={(e) => handleVehicleFormChange({ mileage: e.target.value ? Number(e.target.value) : null })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* Trim */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Trim / Edition</label>
                  <input
                    type="text"
                    placeholder="e.g. Carrera S, GTS, VXR"
                    value={state.vehicleForm.trim ?? ''}
                    onChange={(e) => handleVehicleFormChange({ trim: e.target.value || null })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* Regional Specs */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Regional Specs *</label>
                  <select
                    value={state.vehicleForm.spec ?? 'GCC'}
                    onChange={(e) => handleVehicleFormChange({ spec: e.target.value as VehicleSpec })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="GCC">GCC Specs</option>
                    <option value="American">American Specs</option>
                    <option value="European">European Specs</option>
                    <option value="Japanese">Japanese Specs</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* City */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">City / Emirate *</label>
                  <select
                    value={state.vehicleForm.emirate ?? 'Dubai'}
                    onChange={(e) => handleVehicleFormChange({ emirate: e.target.value as Emirate })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'].map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                {/* Seller Phone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Phone Number (Calls) *</label>
                  <input
                    type="tel"
                    placeholder="+971 50 123 4567"
                    value={state.vehicleForm.sellerPhone}
                    onChange={(e) => handleVehicleFormChange({ sellerPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* Seller Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Seller / Dealer Name *</label>
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={state.vehicleForm.sellerName}
                    onChange={(e) => handleVehicleFormChange({ sellerName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-xs font-semibold text-slate-600 mb-1">Vehicle Description</label>
                <textarea
                  rows={3}
                  placeholder="Provide any additional details: packages, options, condition, or warranty..."
                  value={state.vehicleForm.description}
                  onChange={(e) => handleVehicleFormChange({ description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </section>

            {/* Step 3: Service History */}
            <section className="bg-slate-50 border border-slate-200 rounded-xl p-5">
              <h2 className="text-lg font-bold text-slate-900 mb-1">Step 3: Service History & Maintenance</h2>
              <p className="text-xs text-slate-500 mb-4">Adding service records significantly improves buyer trust and speed to sell.</p>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Last Service Date</label>
                  <input
                    type="date"
                    value={state.vehicleForm.lastServiceDate ?? ''}
                    onChange={(e) => handleVehicleFormChange({ lastServiceDate: e.target.value || null })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Upload Invoices / Service History (PDF, Images)</label>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,image/png,image/jpeg"
                    onChange={(e) => handleServiceRecordFilesChange(Array.from(e.target.files || []))}
                    className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {state.serviceRecordFiles.length > 0 && (
                    <p className="text-xs text-blue-600 mt-1">{state.serviceRecordFiles.length} file(s) attached</p>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-xs font-semibold text-slate-600 mb-1">Service & Maintenance Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Recent major 60k service completed at agency, new Michelin tires, brake pads replaced."
                  value={state.vehicleForm.serviceNotes ?? ''}
                  onChange={(e) => handleVehicleFormChange({ serviceNotes: e.target.value || null })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </section>

            {/* Actions */}
            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={handleReset}
                className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition"
              >
                Reset Form
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow transition disabled:opacity-50"
              >
                {isSubmitting ? 'Publishing...' : 'Publish Listing'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellPage;