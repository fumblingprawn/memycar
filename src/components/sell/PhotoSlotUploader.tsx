'use client';

import React, { useState } from 'react';
import imageCompression from 'browser-image-compression';
import { Camera, Trash2, Loader2, Plus, Car, Link2 } from 'lucide-react';
import { PhotoSlotKey } from '@/types/listing';
import CameraWireframeModal from './CameraWireframeModal';

interface PhotoSlotUploaderProps {
  onChange: (slots: Record<PhotoSlotKey, File | null>, extras: File[], urls: Record<string, string>) => void;
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
  const [urlSlots, setUrlSlots] = useState<Partial<Record<PhotoSlotKey, string>>>({});
  const [extras, setExtras] = useState<File[]>([]);
  const [extraPreviews, setExtraPreviews] = useState<string[]>([]);
  const [compressing, setCompressing] = useState<string | null>(null);

  const [editingUrlSlot, setEditingUrlSlot] = useState<PhotoSlotKey | null>(null);
  const [urlInput, setUrlInput] = useState('');

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [activeCameraSlot, setActiveCameraSlot] = useState<PhotoSlotKey | null>(null);

  const compress = async (file: File): Promise<File> => {
    return await imageCompression(file, {
      maxSizeMB: 0.4,
      maxWidthOrHeight: 1600,
      fileType: 'image/webp',
      useWebWorker: true,
    });
  };

  const notifyChange = (
    nextSlots: Record<PhotoSlotKey, File | null>,
    nextExtras: File[],
    nextUrls: Partial<Record<PhotoSlotKey, string>>
  ) => {
    const stringUrls: Record<string, string> = {};
    Object.entries(nextUrls).forEach(([k, v]) => {
      if (v) stringUrls[k] = v;
    });
    onChange(nextSlots, nextExtras, stringUrls);
  };

  const handleSlotFile = async (key: PhotoSlotKey, file: File | null) => {
    if (!file) {
      const nextSlots = { ...slots, [key]: null };
      const nextPreviews = { ...previews };
      const nextUrls = { ...urlSlots };
      delete nextPreviews[key];
      delete nextUrls[key];
      setSlots(nextSlots);
      setPreviews(nextPreviews);
      setUrlSlots(nextUrls);
      notifyChange(nextSlots, extras, nextUrls);
      return;
    }

    try {
      setCompressing(key);
      const compressed = await compress(file);
      const previewUrl = URL.createObjectURL(compressed);
      const nextSlots = { ...slots, [key]: compressed };
      const nextPreviews = { ...previews, [key]: previewUrl };
      const nextUrls = { ...urlSlots };
      delete nextUrls[key];

      setSlots(nextSlots);
      setPreviews(nextPreviews);
      setUrlSlots(nextUrls);
      notifyChange(nextSlots, extras, nextUrls);
    } catch (err) {
      console.error('Compression failed', err);
    } finally {
      setCompressing(null);
    }
  };

  const handleSaveUrl = (key: PhotoSlotKey) => {
    const trimmed = urlInput.trim();
    if (!trimmed || !trimmed.startsWith('http')) {
      alert('Please enter a valid image URL starting with http/https');
      return;
    }

    const nextSlots = { ...slots, [key]: null };
    const nextPreviews = { ...previews, [key]: trimmed };
    const nextUrls = { ...urlSlots, [key]: trimmed };

    setSlots(nextSlots);
    setPreviews(nextPreviews);
    setUrlSlots(nextUrls);
    setEditingUrlSlot(null);
    setUrlInput('');
    notifyChange(nextSlots, extras, nextUrls);
  };

  const handleExtraAdd = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || extras.length >= 5) return;

    const remaining = 5 - extras.length;
    const toProcess = Array.from(files).slice(0, remaining);

    setCompressing('extras');
    try {
      const processed: File[] = [];
      const newUrls: string[] = [];

      for (const f of toProcess) {
        const c = await compress(f);
        processed.push(c);
        newUrls.push(URL.createObjectURL(c));
      }

      const nextExtras = [...extras, ...processed];
      setExtras(nextExtras);
      setExtraPreviews([...extraPreviews, ...newUrls]);
      notifyChange(slots, nextExtras, urlSlots);
    } finally {
      setCompressing(null);
    }
  };

  const removeExtra = (idx: number) => {
    const nextExtras = extras.filter((_, i) => i !== idx);
    const nextPreviews = extraPreviews.filter((_, i) => i !== idx);
    setExtras(nextExtras);
    setExtraPreviews(nextPreviews);
    notifyChange(slots, nextExtras, urlSlots);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">Standardized Photo Angles</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          All 5 angles ensure every vehicle listing has a uniform layout.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {REQUIRED_SLOTS.map((slot) => {
          const isCover = slot.key === 'front_three_quarter';
          const preview = previews[slot.key];
          const isLoading = compressing === slot.key;
          const isEditingUrl = editingUrlSlot === slot.key;

          return (
            <div
              key={slot.key}
              className={`relative border-2 border-dashed rounded-2xl p-4 flex flex-col items-center justify-center min-h-[220px] transition ${
                isCover ? 'border-[#e03a14] bg-orange-50/20' : 'border-slate-300 bg-slate-50/60'
              }`}
            >
              {isCover && (
                <span className="absolute top-3 left-3 bg-[#e03a14] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                  COVER HERO
                </span>
              )}

              {isLoading ? (
                <div className="flex flex-col items-center gap-2 text-slate-500">
                  <Loader2 className="w-6 h-6 animate-spin text-[#e03a14]" />
                  <span className="text-xs font-semibold">Processing image...</span>
                </div>
              ) : isEditingUrl ? (
                <div className="w-full space-y-2">
                  <input
                    type="url"
                    placeholder="https://example.com/car.jpg"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-[#e03a14]"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleSaveUrl(slot.key)}
                      className="flex-1 bg-[#e03a14] text-white py-1.5 rounded-lg text-xs font-bold"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingUrlSlot(null);
                        setUrlInput('');
                      }}
                      className="px-3 bg-slate-200 text-slate-700 py-1.5 rounded-lg text-xs font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : preview ? (
                <div className="relative w-full h-full aspect-[16/9] rounded-xl overflow-hidden group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt={slot.label} className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleSlotFile(slot.key, null)}
                      className="p-1.5 bg-black/70 hover:bg-red-600 text-white rounded-lg transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center space-y-2">
                  <div className="p-3 bg-white rounded-full border border-slate-200 shadow-sm">
                    <Car className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">{slot.label}</span>
                    <span className="text-[11px] text-slate-400 block">{slot.hint}</span>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveCameraSlot(slot.key);
                        setIsCameraOpen(true);
                      }}
                      className="flex items-center gap-1 bg-[#e03a14] hover:bg-[#c53210] text-white px-2.5 py-1.5 rounded-lg text-xs font-bold shadow-sm transition"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      Take Photo
                    </button>

                    <label className="flex items-center gap-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition">
                      Upload
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleSlotFile(slot.key, e.target.files[0]);
                          }
                        }}
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingUrlSlot(slot.key);
                        setUrlInput('');
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-700 border border-slate-200 bg-white rounded-lg transition"
                      title="Paste image URL"
                    >
                      <Link2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Extra Photos Tray */}
      <div className="pt-4 border-t border-slate-200">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
          Additional Photos (Optional, Max 5)
        </h4>
        <div className="flex flex-wrap gap-3 items-center">
          {extraPreviews.map((url, i) => (
            <div key={i} className="relative w-24 h-20 rounded-xl overflow-hidden border border-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
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
            <label className="w-24 h-20 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition">
              <Plus className="w-5 h-5 text-slate-400" />
              <span className="text-[10px] font-semibold text-slate-500 mt-0.5">Add Extra</span>
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

      {/* Wireframe Camera Modal */}
      {isCameraOpen && activeCameraSlot && (
        <CameraWireframeModal
          slotKey={activeCameraSlot}
          isOpen={isCameraOpen}
          onClose={() => {
            setIsCameraOpen(false);
            setActiveCameraSlot(null);
          }}
          onImageCapture={(blob) => {
            const capturedFile = new File([blob], `${activeCameraSlot}_${Date.now()}.webp`, {
              type: 'image/webp',
            });
            handleSlotFile(activeCameraSlot, capturedFile);
          }}
        />
      )}
    </div>
  );
}
