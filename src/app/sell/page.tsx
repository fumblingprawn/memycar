'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { carData, years } from '@/lib/constants/car-data';
import { UploadCloud, CheckCircle2, ChevronRight, Car, Camera, FileText, User } from 'lucide-react';

export default function SellPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '2023',
    trim: '',
    previous_owners: '1',
    specs: 'GCC Specs',
    mileage: '',
    price: '',
    city: 'Dubai',
    transmission: 'Automatic',
    fuel_type: 'Petrol',
    description: '',
    has_agency_history: true,
    last_service_date: '',
    service_notes: '',
    seller_name: '',
    seller_phone: '',
  });

  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  const emirateOptions = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'];
  const availableModels = formData.make
    ? carData.makes.find((m) => m.make.toLowerCase() === formData.make.toLowerCase())?.models || []
    : [];

  const handleAddImage = () => {
    if (newImageUrl.trim() && newImageUrl.startsWith('http')) {
      setImageUrls((prev) => [...prev, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const payload = {
        make: formData.make,
        model: formData.model,
        year: parseInt(formData.year, 10),
        trim: formData.trim || null,
        specs: formData.specs,
        mileage: parseInt(formData.mileage, 10) || 0,
        price: parseInt(formData.price, 10) || 0,
        city: formData.city,
        transmission: formData.transmission,
        fuel_type: formData.fuel_type,
        previous_owners: parseInt(formData.previous_owners, 10) || 1,
        description: formData.description,
        last_service_date: formData.last_service_date || null,
        service_notes: formData.service_notes || null,
        seller_name: formData.seller_name || 'Vehicle Owner',
        seller_phone: formData.seller_phone || null,
        image_urls: imageUrls,
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
    <div className="min-h-screen bg-[#f4f4f4] py-10">
      <div className="max-w-3xl mx-auto px-4">
        {/* Title Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-6">
          <h1 className="text-2xl font-black text-slate-900">List Your Vehicle</h1>
          <p className="text-xs text-slate-500 mt-1">
            Publish verified UAE specs directly to buyers across all Emirates.
          </p>
        </div>

        {success ? (
          <div className="bg-white rounded-2xl border border-emerald-200 p-8 shadow-sm text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-slate-900 mb-1">Vehicle Listed Successfully!</h2>
            <p className="text-xs text-slate-500">Redirecting to your live vehicle page...</p>
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
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Step 1: Vehicle Information</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Make *</label>
                  <select
                    required
                    value={formData.make}
                    onChange={(e) => setFormData({ ...formData, make: e.target.value, model: '' })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="">Select Make</option>
                    {carData.makes.map((item) => (
                      <option key={item.make} value={item.make}>{item.make}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Model *</label>
                  <select
                    required
                    disabled={!formData.make}
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white disabled:bg-slate-100"
                  >
                    <option value="">{formData.make ? 'Select Model' : 'Select Make First'}</option>
                    {availableModels.map((mod) => (
                      <option key={mod} value={mod}>{mod}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Year *</label>
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white"
                  >
                    {years.map((y) => (
                      <option key={y} value={y.toString()}>{y}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Trim / Edition</label>
                  <input
                    type="text"
                    placeholder="e.g. AMG Line, Turbo, GT"
                    value={formData.trim}
                    onChange={(e) => setFormData({ ...formData, trim: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Previous Owners *</label>
                  <select
                    value={formData.previous_owners}
                    onChange={(e) => setFormData({ ...formData, previous_owners: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="1">1 (Single Owner)</option>
                    <option value="2">2 Owners</option>
                    <option value="3">3 Owners</option>
                    <option value="4">4+ Owners</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Regional Specs *</label>
                  <select
                    value={formData.specs}
                    onChange={(e) => setFormData({ ...formData, specs: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="GCC Specs">GCC Specs</option>
                    <option value="Non-GCC / American">American Specs</option>
                    <option value="Non-GCC / Japanese">Japanese Specs</option>
                    <option value="Non-GCC / European">European Specs</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Mileage (km) *</label>
                  <input
                    required
                    type="number"
                    placeholder="e.g. 45000"
                    value={formData.mileage}
                    onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Price (AED) *</label>
                  <input
                    required
                    type="number"
                    placeholder="e.g. 175000"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Location / Emirate *</label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white"
                  >
                    {emirateOptions.map((em) => (
                      <option key={em} value={em}>{em}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Transmission</label>
                  <select
                    value={formData.transmission}
                    onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="Automatic">Automatic</option>
                    <option value="Manual">Manual</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Vehicle Description</label>
                <textarea
                  rows={4}
                  placeholder="Detail options, condition, service history, and warranties..."
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
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Step 2: Photos</h2>
              </div>

              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="Paste image URL (https://...)"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm rounded-xl border border-slate-300"
                />
                <button
                  type="button"
                  onClick={handleAddImage}
                  className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-xl text-xs font-bold transition"
                >
                  Add Image
                </button>
              </div>

              {imageUrls.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 pt-2">
                  {imageUrls.map((url, idx) => (
                    <div key={idx} className="relative group rounded-xl overflow-hidden aspect-[4/3] border border-slate-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Car ${idx}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* STEP 3: SERVICE HISTORY */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <FileText className="w-4 h-4 text-[#e03a14]" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Step 3: Service History</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Last Service Date</label>
                  <input
                    type="date"
                    value={formData.last_service_date}
                    onChange={(e) => setFormData({ ...formData, last_service_date: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Maintenance Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. Major service completed at 40k km"
                    value={formData.service_notes}
                    onChange={(e) => setFormData({ ...formData, service_notes: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                  />
                </div>
              </div>
            </div>

            {/* STEP 4: SELLER CONTACT */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <User className="w-4 h-4 text-[#e03a14]" />
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Step 4: Seller Details</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Seller Name *</label>
                  <input
                    required
                    type="text"
                    placeholder="Your Name or Dealership"
                    value={formData.seller_name}
                    onChange={(e) => setFormData({ ...formData, seller_name: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Contact Phone / WhatsApp *</label>
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
              className="w-full bg-[#e03a14] hover:bg-[#c53210] disabled:bg-slate-400 text-white font-bold py-3.5 px-6 rounded-xl transition text-sm flex items-center justify-center gap-2"
            >
              {loading ? 'Publishing Vehicle...' : 'Publish Listing'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
