'use client';

import React, { useState } from 'react';
import imageCompression from 'browser-image-compression';
import { Camera, Trash2, Loader2, Plus, Car } from 'lucide-react';
import { PhotoSlotKey } from '@/types/listing';

interface PhotoSlotUploaderProps {
  onChange: (slots: Record<PhotoSlotKey, File | null>, extras: File[]) => void;
}

interface SlotDefinition {
  key: PhotoSlotKey;
  label: string;
  hint: string;
}

const REQUIRED_SLOTS: SlotDefinition[] = [
  { key: 'front_three_quarter', label: 'Front 3/4 Angle (Cover)', hint: 'Front + Driver Side' },
  { key: 'rear_three_quarter', label: 'Rear 3/4 Angle', hint: 'Rear + Passenger Side' },
  { key: 'side_profile', label: 'Direct Side Profile', hint: 'Full flat side view' },
  { key: 'interior_dash', label: 'Driver Cockpit & Dash', hint: 'Steering & Center Console' },
  { key: 'odometer', label: 'Odometer / Cluster', hint: 'Clear mileage display' },
];

export default function PhotoSlotUploader({ onChange }: PhotoSlotUploaderProps) {
  const [slots, setSlots] = useState<Record<PhotoSlotKey, File | null>>({
    front_three_quarter: null,
    rear_three_quarter: null,
    side_profile: null,
    interior_dash: null,
    odometer: null,
  });
  const [previews, setPreviews] = useState<Partial<Record<PhotoSlotKey, string>>>({});
  const [extras, setExtras] = useState<File[]>([]);
  const [extraPreviews, setExtraPreviews] = useState<string[]>([]);
  const [compressing, setCompressing] = useState<string | null>(null);

  const compress = async (file: File): Promise<File> => {
    return await imageCompression(file, {
      maxSizeMB: 0.35,
      maxWidthOrHeight: 1600,
      fileType: 'image/webp',
      useWebWorker: true,
    });
  };

  const handleSlotChange = async (key: PhotoSlotKey, file: File | null) => {
    if (!file) {
      const newSlots = { ...slots, [key]: null };
      const newPreviews = { ...previews };
      delete newPreviews[key];
      setSlots(newSlots);
      setPreviews(newPreviews);
      onChange(newSlots, extras);
      return;
    }

    try {
      setCompressing(key);
      const compressed = await compress(file);
      const previewUrl = URL.createObjectURL(compressed);
      const newSlots = { ...slots, [key]: compressed };
      const newPreviews = { ...previews, [key]: previewUrl };

      setSlots(newSlots);
      setPreviews(newPreviews);
      onChange(newSlots, extras);
    } catch (err) {
      console.error('Compression failed', err);
    } finally {
      setCompressing(null);
    }
  };

  const handleExtraAdd = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || extras.length >= 5) return;

    const remaining = 5 - extras.length;
    const filesToProcess = Array.from(files).slice(0, remaining);

    setCompressing('extras');
    try {
      const processed: File[] = [];
      const newUrls: string[] = [];

      for (const file of filesToProcess) {
        const c = await compress(file);
        processed.push(c);
        newUrls.push(URL.createObjectURL(c));
      }

      const updatedExtras = [...extras, ...processed];
      setExtras(updatedExtras);
      setExtraPreviews([...extraPreviews, ...newUrls]);
      onChange(slots, updatedExtras);
    } finally {
      setCompressing(null);
    }
  };

  const removeExtra = (idx: number) => {
    const updatedExtras = extras.filter((_, i) => i !== idx);
    const updatedPreviews = extraPreviews.filter((_, i) => i !== idx);
    setExtras(updatedExtras);
    setExtraPreviews(updatedPreviews);
    onChange(slots, updatedExtras);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-slate-900">Standardized Photo Angles</h3>
        <p className="text-xs text-slate-500 mt-1">
          All 5 required angles ensure every listing on memycar.com meets uniform aesthetic standards.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {REQUIRED_SLOTS.map((slot) => {
          const isCover = slot.key === 'front_three_quarter';
          const preview = previews[slot.key];
          const isLoading = compressing === slot.key;

          return (
            <div
              key={slot.key}
              className={`relative border-2 border-dashed rounded-xl p-3 flex flex-col items-center justify-center min-h-[220px] bg-slate-50/50 ${
                isCover ? 'border-blue-400 bg-blue-50/20' : 'border-slate-300'
              }`}
            >
              {isCover && (
                <span className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                  COVER HERO
                </span>
              )}

              {isLoading ? (
                <div className="flex flex-col items-center gap-2 text-slate-500">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  <span className="text-xs font-medium">Optimizing WebP...</span>
                </div>
              ) : preview ? (
                <div className="relative w-full h-full aspect-[16/9] rounded-lg overflow-hidden group">
                  <img src={preview} alt={slot.label} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleSlotChange(slot.key, null)}
                    className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-md opacity-90 hover:opacity-100 transition shadow"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer py-6">
                  <div className="p-3 bg-white rounded-full shadow-sm border border-slate-200 mb-2">
                    <Car className="w-6 h-6 text-slate-400" />
                  </div>
                  <span className="text-xs font-semibold text-slate-800 text-center">{slot.label}</span>
                  <span className="text-[11px] text-slate-500 text-center mt-0.5">{slot.hint}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleSlotChange(slot.key, e.target.files[0]);
                    }}
                  />
                </label>
              )}
            </div>
          );
        })}
      </div>

      <div className="pt-4 border-t border-slate-200">
        <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider mb-2">
          Extra Photos (Optional, Max 5)
        </h4>
        <div className="flex flex-wrap gap-3 items-center">
          {extraPreviews.map((url, i) => (
            <div key={i} className="relative w-24 h-20 rounded-lg overflow-hidden border border-slate-200">
              <img src={url} alt={`Extra ${i + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeExtra(i)}
                className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full hover:bg-red-600 transition"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}

          {extras.length < 5 && (
            <label className="w-24 h-20 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition">
              <Plus className="w-5 h-5 text-slate-400" />
              <span className="text-[10px] font-medium text-slate-500 mt-1">Add Photo</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                disabled={compressing === 'extras'}
                onChange={handleExtraAdd}
              />
            </label>
          )}
        </div>
      </div>
    </div>
  );
}
