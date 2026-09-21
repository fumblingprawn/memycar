'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Listing, PhotoSlotKey } from '@/types/listing';
import PhotoSlotUploader from '@/components/sell/PhotoSlotUploader';
import StructuredSelector from '@/components/sell/StructuredSelector';
import { useRouter } from 'next/navigation';

// Define the vehicle form values type based on StructuredSelector props
interface VehicleFormValues {
  year: number | null;
  make: string | null;
  model: string | null;
  trim: string | null;
  spec: 'GCC' | 'American' | 'Japanese' | 'European' | null;
  emirate: 'Dubai' | 'Abu Dhabi' | 'Sharjah' | 'Ajman' | 'Ras Al Khaimah' | 'Fujairah' | 'Umm Al Quwain' | null;
  serviceHistory: 'Full Agency' | 'Regular/Specialist' | 'Partial/None' | null;
  paintCondition: 'Original Paint' | 'Minor Touch-ups' | 'Repainted' | null;
  warranty: 'Under Agency Warranty' | 'Dealer/Third-Party' | 'Expired/None' | null;
  keysCount: 1 | 2 | null;
  sellerName: string;
  sellerPhone: string;
  sellerWhatsApp: string;
  description: string;
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

    // Vehicle form values state
    vehicleForm: {
      year: null,
      make: null,
      model: null,
      trim: null,
      spec: null,
      emirate: null,
      serviceHistory: null,
      paintCondition: null,
      warranty: null,
      keysCount: null,
      sellerName: '',
      sellerPhone: '',
      sellerWhatsApp: '+971 ',
      description: ''
    } as VehicleFormValues
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

  // Handler for StructuredSelector
  const handleVehicleFormChange = useCallback((vehicleForm: VehicleFormValues) => {
    setFormState((prev) => ({
      ...prev,
      vehicleForm
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
    const { year, make, model, sellerName, sellerPhone } = formState.vehicleForm;
    if (!year || year < 1990 || year > 2027 ||
        !make || !model ||
        !sellerName || !sellerPhone.replace(/\s/g, '').length) {
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
              .from('car-media')
              .upload(filePath, file, {
                contentType: 'image/webp',
                upsert: false
              })
              .then(({ data, error }) => {
                if (error) throw error;
                if (data) {
                  const { data: { publicUrl } } = supabase.storage
                    .from('car-media')
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
              .from('car-media')
              .upload(filePath, file, {
                contentType: 'image/webp',
                upsert: false
              })
              .then(({ data, error }) => {
                if (error) throw error;
                if (data) {
                  const { data: { publicUrl } } = supabase.storage
                    .from('car-media')
                    .getPublicUrl(data.path);
                  extraPhotoUrls.push(publicUrl);
                }
              })
          );
        }
      });

      // Wait for all uploads to complete
      await Promise.all(uploadPromises);

      // Prepare listing data matching src/types/listing.ts
      const listingData: Omit<Listing, 'id' | 'created_at'> = {
        title: `${formState.vehicleForm.year} ${formState.vehicleForm.make} ${formState.vehicleForm.model}${formState.vehicleForm.trim ? ` ${formState.vehicleForm.trim}` : ''}`,
        make: formState.vehicleForm.make!,
        model: formState.vehicleForm.model!,
        year: formState.vehicleForm.year!,
        price_aed: 0, // TODO: Add price field to form
        mileage_km: 0, // TODO: Add mileage field to form
        specs: formState.vehicleForm.spec!,
        emirate: formState.vehicleForm.emirate!,
        body_style: 'Sedan', // Default - could be made configurable
        service_history: formState.vehicleForm.serviceHistory!,
        paint_condition: formState.vehicleForm.paintCondition!,
        warranty: formState.vehicleForm.warranty!,
        keys_count: formState.vehicleForm.keysCount!,
        seller_name: formState.vehicleForm.sellerName,
        seller_phone: formState.vehicleForm.sellerPhone,
        seller_whatsapp: formState.vehicleForm.sellerWhatsApp,
        description: formState.vehicleForm.description,
        photos: {
          ...photoUrls,
          extra_photos: extraPhotoUrls
        }
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
      vehicleForm: {
        year: null,
        make: null,
        model: null,
        trim: null,
        spec: null,
        emirate: null,
        serviceHistory: null,
        paintCondition: null,
        warranty: null,
        keysCount: null,
        sellerName: '',
        sellerPhone: '',
        sellerWhatsApp: '+971 ',
        description: ''
      }
    });
    setSubmitError(null);
    setSubmitSuccess(false);
  }, []);

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
              <StructuredSelector
                year={formState.vehicleForm.year}
                make={formState.vehicleForm.make}
                model={formState.vehicleForm.model}
                trim={formState.vehicleForm.trim}
                spec={formState.vehicleForm.spec}
                emirate={formState.vehicleForm.emirate}
                serviceHistory={formState.vehicleForm.serviceHistory}
                paintCondition={formState.vehicleForm.paintCondition}
                warranty={formState.vehicleForm.warranty}
                keysCount={formState.vehicleForm.keysCount}
                onYearChange={(value) => setFormState((prev) => ({
  ...prev,
  vehicleForm: {
    ...prev.vehicleForm,
    year: value
  }
}))}
                onMakeChange={(value) => setFormState((prev) => ({
  ...prev,
  vehicleForm: {
    ...prev.vehicleForm,
    make: value
  }
}))}
                onModelChange={(value) => setFormState((prev) => ({
  ...prev,
  vehicleForm: {
    ...prev.vehicleForm,
    model: value
  }
}))}
                onTrimChange={(value) => setFormState((prev) => ({
  ...prev,
  vehicleForm: {
    ...prev.vehicleForm,
    trim: value
  }
}))}
                onSpecChange={(value) => setFormState((prev) => ({
  ...prev,
  vehicleForm: {
    ...prev.vehicleForm,
    spec: value
  }
}))}
                onEmirateChange={(value) => setFormState((prev) => ({
  ...prev,
  vehicleForm: {
    ...prev.vehicleForm,
    emirate: value
  }
}))}
                onServiceHistoryChange={(value) => setFormState((prev) => ({
  ...prev,
  vehicleForm: {
    ...prev.vehicleForm,
    serviceHistory: value
  }
}))}
                onPaintChange={(value) => setFormState((prev) => ({
  ...prev,
  vehicleForm: {
    ...prev.vehicleForm,
    paintCondition: value
  }
}))}
                onWarrantyChange={(value) => setFormState((prev) => ({
  ...prev,
  vehicleForm: {
    ...prev.vehicleForm,
    warranty: value
  }
}))}
                onKeysChange={(value) => setFormState((prev) => ({
  ...prev,
  vehicleForm: {
    ...prev.vehicleForm,
    keysCount: value
  }
}))}
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
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
  );
};

export default SellPage;