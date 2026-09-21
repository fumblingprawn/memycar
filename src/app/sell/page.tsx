'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { carData, years } from '@/lib/constants/car-data';
import { Listing, PhotoSlotKey, Emirate, VehicleSpec, ServiceHistory, PaintCondition, WarrantyStatus } from '@/types/listing';
import { useRouter } from 'next/navigation';
import PhotoSlotUploader from '@/components/sell/PhotoSlotUploader';

// Define the vehicle form values type
interface VehicleFormValues {
  make: string | null;
  model: string | null;
  year: number | null;
  price: number | null;
  mileage: number | null;
  specs: VehicleSpec | null;
  emirate: Emirate | null;
  transmission: string | null; // 'Automatic' | 'Manual'
  fuel: string | null; // 'Petrol' | 'Hybrid' | 'Electric' | 'Diesel'
  sellerPhone: string;
  // Service history fields
  lastServiceDate: string | null; // ISO date string
  serviceNotes: string | null;
}

const SellPage: React.FC = () => {
  const router = useRouter();
  const supabase = createClient();

  // Combined form state
  const [formState, setFormState] = useState({
    // Photo slots state
    photoSlots: {
      front_three_quarter: null as File | null,
      rear_three_quarter: null as File | null,
      side_profile: null as File | null,
      interior_dash: null as File | null,
      odometer: null as File | null
    } as Record<PhotoSlotKey, File | null>,
    extraPhotos: [] as File[],
    // Service record files state
    serviceRecordFiles: [] as File[],

    // Vehicle form values state
    vehicleForm: {
      make: null as string | null,
      model: null as string | null,
      year: null as number | null,
      price: null as number | null,
      mileage: null as number | null,
      specs: null as VehicleSpec | null,
      emirate: null as Emirate | null,
      transmission: null as string | null,
      fuel: null as string | null,
      sellerPhone: '',
      lastServiceDate: null as string | null,
      serviceNotes: null as string | null
    }
  });

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Handler for PhotoSlotUploader
  const handlePhotoSlotsChange = useCallback((slots: Record<PhotoSlotKey, File | null>, extras: File[]) => {
    setFormState(prev => ({
      ...prev,
      photoSlots: slots,
      extraPhotos: extras
    }));
  }, []);

  // Handler for service record files
  const handleServiceRecordFilesChange = useCallback((files: File[]) => {
    setFormState(prev => ({
      ...prev,
      serviceRecordFiles: files
    }));
  }, []);

  // Handler for vehicle form changes
  const handleVehicleFormChange = useCallback((vehicleForm: Partial<VehicleFormValues>) => {
    setFormState(prev => ({
      ...prev,
      vehicleForm: {
        ...prev.vehicleForm,
        ...vehicleForm
      }
    }));
  }, []);

  // Form submission handler
  const handleSubmit = useCallback(async () => {
    // Validate that all 5 required photo slots are uploaded
    const requiredSlots: PhotoSlotKey[] = ['front_three_quarter', 'rear_three_quarter', 'side_profile', 'interior_dash', 'odometer'];
    const missingSlots = requiredSlots.filter(key => !formState.photoSlots[key]);

    if (missingSlots.length > 0) {
      setSubmitError('Please upload photos for all required angles.');
      return;
    }

    // Validate vehicle form data
    const { make, model, year, price, mileage, specs, emirate, transmission, fuel, sellerPhone } = formState.vehicleForm;
    if (!make || !model || !year || year < 1990 || year > 2027 ||
        price === null || price < 0 ||
        mileage === null || mileage < 0 ||
        !specs || !emirate || !transmission || !fuel ||
        !sellerPhone || !sellerPhone.replace(/\s/g, '').length) {
      setSubmitError('Please fill in all required fields correctly.');
      return;
    }

    setIsSubmitting(true);
    setIsUploadingMedia(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      // Upload photos to Supabase Storage
      const photoUrls: Record<PhotoSlotKey, string> = {
        front_three_quarter: '',
        rear_three_quarter: '',
        side_profile: '',
        interior_dash: '',
        odometer: ''
      };
      const uploadPromises: Promise<void>[] = [];

      // Upload required slots with specified path format: listings/{timestamp}_{slot_key}.webp
      const timestamp = Date.now();

      requiredSlots.forEach((key) => {
        const file = formState.photoSlots[key];
        if (file) {
          const filePath = `listings/${timestamp}_${key}.webp`;
          uploadPromises.push(
            supabase.storage
              .from('car-photos')
              .upload(filePath, file, {
                contentType: 'image/webp',
                upsert: false
              })
              .then(({ data, error }) => {
                if (error) throw error;
                if (data) {
                  const { data: { publicUrl } } = supabase.storage
                    .from('car-photos')
                    .getPublicUrl(data.path);
                  photoUrls[key] = publicUrl;
                }
              })
          );
        }
      });

      // Upload extra photos
      const extraPhotoUrls: string[] = [];
      formState.extraPhotos.forEach((file, index) => {
        if (file) {
          const filePath = `listings/${timestamp}_extra_${index}.webp`;
          uploadPromises.push(
            supabase.storage
              .from('car-photos')
              .upload(filePath, file, {
                contentType: 'image/webp',
                upsert: false
              })
              .then(({ data, error }) => {
                if (error) throw error;
                if (data) {
                  const { data: { publicUrl } } = supabase.storage
                    .from('car-photos')
                    .getPublicUrl(data.path);
                  extraPhotoUrls.push(publicUrl);
                }
              })
          );
        }
      });

      // Upload service record files
      const serviceRecordUrls: string[] = [];
      formState.serviceRecordFiles.forEach((file, index) => {
        if (file) {
          const filePath = `service-records/${timestamp}_${index}${file.name.substring(file.name.lastIndexOf('.'))}`;
          uploadPromises.push(
            supabase.storage
              .from('service-records')
              .upload(filePath, file, {
                upsert: false
              })
              .then(({ data, error }) => {
                if (error) throw error;
                if (data) {
                  const { data: { publicUrl } } = supabase.storage
                    .from('service-records')
                    .getPublicUrl(data.path);
                  serviceRecordUrls.push(publicUrl);
                }
              })
          );
        }
      });

      // Wait for all uploads to complete
      await Promise.all(uploadPromises);

      // Prepare listing data matching src/types/listing.ts
      const listingData: Omit<Listing, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'is_featured' | 'is_active'> = {
        title: `${formState.vehicleForm.year} ${formState.vehicleForm.make} ${formState.vehicleForm.model}`,
        make: formState.vehicleForm.make!,
        model: formState.vehicleForm.model!,
        year: formState.vehicleForm.year!,
        price_aed: formState.vehicleForm.price!,
        mileage_km: formState.vehicleForm.mileage!,
        specs: formState.vehicleForm.specs!,
        emirate: formState.vehicleForm.emirate!,
        body_style: `${formState.vehicleForm.transmission || ''} ${formState.vehicleForm.fuel || ''}`.trim(), // Store transmission and fuel in body_style
        service_history: 'Regular/Specialist', // Default - could be made configurable
        paint_condition: 'Original Paint', // Default
        warranty: 'Expired/None', // Default
        keys_count: 2, // Default
        seller_name: '', // TODO: Add seller name field
        seller_phone: formState.vehicleForm.sellerPhone,
        seller_whatsapp: formState.vehicleForm.sellerPhone, // Use same as phone for now
        description: formState.vehicleForm.serviceNotes || '', // Use service notes as description for now
        photos: {
          ...photoUrls,
          extra_photos: extraPhotoUrls
        },
        last_service_date: formState.vehicleForm.lastServiceDate ?? undefined,
        service_notes: formState.vehicleForm.serviceNotes ?? undefined,
        service_record_urls: serviceRecordUrls.length > 0 ? serviceRecordUrls : undefined
      };

      // Insert listing into database
      const { data, error } = await supabase
        .from('listings')
        .insert([listingData])
        .select()
        .single();

      if (error) throw error;

      // Redirect to the listing page
      if (data) {
        router.push(`/listing/${data.id}`);
      } else {
        throw new Error('Failed to create listing');
      }
    } catch (error: any) {
      console.error('Error submitting listing:', error);
      setSubmitError(error.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
      setIsUploadingMedia(false);
    }
  }, [formState, router, supabase]);

  // Reset form handler
  const handleReset = useCallback(() => {
    setFormState({
      photoSlots: {
        front_three_quarter: null,
        rear_three_quarter: null,
        side_profile: null,
        interior_dash: null,
        odometer: null
      },
      extraPhotos: [],
      serviceRecordFiles: [],
      vehicleForm: {
        make: null as string | null,
        model: null as string | null,
        year: null as number | null,
        price: null as number | null,
        mileage: null as number | null,
        specs: null as VehicleSpec | null,
        emirate: null as Emirate | null,
        transmission: null as string | null,
        fuel: null as string | null,
        sellerPhone: '',
        lastServiceDate: null as string | null,
        serviceNotes: null as string | null
      }
    });
    setSubmitError(null);
    setSubmitSuccess(false);
  }, []);

  // Get models for selected make
  const models = formState.vehicleForm.make ? carData.makes.find(m => m.make === formState.vehicleForm.make)?.models || [] : [];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Sell Your Car
            </h1>
            <p className="mt-2 text-gray-600">
              Create a professional listing in minutes with our guided process
            </p>
          </div>

          {/* Success/Error Messages */}
          {submitSuccess && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l3-3a1 1 0 10-1.414-1.414l-1.293 1.293zm-1.293 2.707a1 1 0 001.414 0l3-3a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414-1.414l-.707-.707z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Listing Created!</h3>
                  <div className="mt-2 text-sm text-green-600">
                    Your car listing has been successfully created and is now live.
                  </div>
                </div>
              </div>
            </div>
          )}

          {submitError && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l3-3a1 1 0 10-1.414-1.414l-1.293 1.293zm-1.293 2.707a1 1 0 001.414 0l3-3a1 1 0 001.414 0l3-3a1 1 0 001.414 0l3-3a1 1 0 001.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-600">
                    {submitError}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Loading Overlay */}
          {isUploadingMedia && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-lg font-medium text-gray-900">
                  Compressing and uploading media...
                </p>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* Photo Upload Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Step 1: Upload Photos
              </h2>
              <p className="text-gray-600 mb-4">
                Upload photos from the specified angles to create a professional listing.
                All photos are automatically optimized for fast loading.
              </p>
              <PhotoSlotUploader
                onChange={handlePhotoSlotsChange}
              />
            </div>

            {/* Vehicle Details Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Step 2: Vehicle Details
              </h2>
              <p className="text-gray-600 mb-4">
                Fill in your vehicle's specifications and contact information.
              </p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Make */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Brand</label>
                  <select
                    value={formState.vehicleForm.make ?? ''}
                    onChange={(e) => handleVehicleFormChange({ make: e.target.value || null })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                  >
                    <option value="">All Brands</option>
                    {carData.makes.map((make) => (
                      <option key={make.make} value={make.make}>
                        {make.make}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Model */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Model</label>
                  <select
                    value={formState.vehicleForm.model ?? ''}
                    onChange={(e) => handleVehicleFormChange({ model: e.target.value || null })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                    disabled={!formState.vehicleForm.make}
                  >
                    <option value="">All Models</option>
                    {models.map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Year */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Year</label>
                  <select
                    value={formState.vehicleForm.year?.toString() ?? ''}
                    onChange={(e) => handleVehicleFormChange({ year: e.target.value ? parseInt(e.target.value, 10) : null })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                  >
                    <option value="">All Years</option>
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Price (AED)</label>
                  <input
                    type="number"
                    value={formState.vehicleForm.price?.toString() ?? ''}
                    onChange={(e) => handleVehicleFormChange({ price: e.target.value ? parseFloat(e.target.value) : null })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                    placeholder="e.g. 50000"
                  />
                </div>

                {/* Mileage */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Mileage (km)</label>
                  <input
                    type="number"
                    value={formState.vehicleForm.mileage?.toString() ?? ''}
                    onChange={(e) => handleVehicleFormChange({ mileage: e.target.value ? parseFloat(e.target.value) : null })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                    placeholder="e.g. 50000"
                  />
                </div>

                {/* Specs */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Specs</label>
                  <select
                    value={formState.vehicleForm.specs ?? ''}
                    onChange={(e) => handleVehicleFormChange({ specs: e.target.value as VehicleSpec || null })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                  >
                    <option value="">All Specs</option>
                    <option value="GCC">GCC Specs</option>
                    <option value="American">American Specs</option>
                    <option value="European">European Specs</option>
                    <option value="Japanese">Japanese Specs</option>
                  </select>
                </div>

                {/* City (Emirate) */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">City</label>
                  <select
                    value={formState.vehicleForm.emirate ?? ''}
                    onChange={(e) => handleVehicleFormChange({ emirate: e.target.value as Emirate || null })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                  >
                    <option value="">All Cities</option>
                    {['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'].map((emirate) => (
                      <option key={emirate} value={emirate}>
                        {emirate}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Transmission */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Transmission</label>
                  <select
                    value={formState.vehicleForm.transmission ?? ''}
                    onChange={(e) => handleVehicleFormChange({ transmission: e.target.value || null })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                  >
                    <option value="">All Transmissions</option>
                    <option value="Automatic">Automatic</option>
                    <option value="Manual">Manual</option>
                  </select>
                </div>

                {/* Fuel */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Fuel Type</label>
                  <select
                    value={formState.vehicleForm.fuel ?? ''}
                    onChange={(e) => handleVehicleFormChange({ fuel: e.target.value || null })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                  >
                    <option value="">All Fuel Types</option>
                    <option value="Petrol">Petrol</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Electric">Electric</option>
                    <option value="Diesel">Diesel</option>
                  </select>
                </div>

                {/* Seller Phone */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Seller Phone</label>
                  <input
                    type="tel"
                    value={formState.vehicleForm.sellerPhone}
                    onChange={(e) => handleVehicleFormChange({ sellerPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                    placeholder="+971 5x xxx xxx"
                  />
                </div>
              </div>
            </div>

            {/* Service History Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Step 3: Service History & Maintenance
              </h2>
              <p className="text-gray-600 mb-4">
                Add service records to increase buyer confidence.
              </p>
              <div className="space-y-4">
                {/* Last Service Date */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Last Service Date</label>
                  <input
                    type="date"
                    value={formState.vehicleForm.lastServiceDate ?? ''}
                    onChange={(e) => handleVehicleFormChange({ lastServiceDate: e.target.value || null })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                  />
                </div>

                {/* Service Notes */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Service Notes</label>
                  <textarea
                    value={formState.vehicleForm.serviceNotes ?? ''}
                    onChange={(e) => handleVehicleFormChange({ serviceNotes: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                    placeholder="Detail recent services, brake jobs, major maintenance, warranty status..."
                    rows={4}
                  />
                </div>

                {/* Service Record Uploader */}
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Service Records (PDF, PNG, JPG)</label>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      handleServiceRecordFilesChange(files);
                    }}
                    className="block w-full text-sm text-slate-500
                       file:border-0 file:bg-transparent file:text-sm file:font-medium"
                  />
                  {formState.serviceRecordFiles.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-slate-500">
                        {formState.serviceRecordFiles.length} file{formState.serviceRecordFiles.length !== 1 ? 's' : ''} selected
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`w-full flex justify-center py-4 px-6 border border-transparent rounded-lg shadow-sm
                         font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2
                         focus:ring-offset-2 focus:ring-blue-500 transition-colors
                         ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                    Creating your listing...
                  </>
                ) : (
                  'Create Listing'
                )}
              </button>
            </div>

            {/* Reset Button */}
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={handleReset}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Start Over
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellPage;