'use client';

import React, { useState, useRef } from 'react';
import { Camera, Upload, Trash2, CheckCircle2, Plus } from 'lucide-react';
import { PhotoSlotKey } from '@/types/listing';
import CameraWireframeModal from './CameraWireframeModal';
import { useLanguage } from '@/context/LanguageContext';

interface PhotoSlotConfig {
  key: PhotoSlotKey;
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
  isCover?: boolean;
}

const SLOTS: PhotoSlotConfig[] = [
  {
    key: 'front_three_quarter',
    titleEn: 'Front 3/4 Angle (Cover)',
    titleAr: 'زاوية أمامية ٣/٤ (الرئيسية)',
    descEn: 'Front + Driver Side',
    descAr: 'من الأمام + جانب السائق',
    isCover: true,
  },
  {
    key: 'rear_three_quarter',
    titleEn: 'Rear 3/4 Angle',
    titleAr: 'زاوية خلفية ٣/٤',
    descEn: 'Rear + Passenger Side',
    descAr: 'من الخلف + جانب الراكب',
  },
  {
    key: 'side_profile',
    titleEn: 'Direct Side Profile',
    titleAr: 'زاوية جانبية كاملة',
    descEn: 'Full flat side view',
    descAr: 'المظهر الجانبي للسيارة',
  },
  {
    key: 'interior_dash',
    titleEn: 'Driver Cockpit & Dash',
    titleAr: 'مقصورة السائق والعدادات',
    descEn: 'Steering & Center Console',
    descAr: 'المقود والكونسول الوسطي',
  },
  {
    key: 'odometer',
    titleEn: 'Odometer / Cluster',
    titleAr: 'عداد المسافة (الكيلومترات)',
    descEn: 'Clear mileage display',
    descAr: 'شاشة واضحة لعداد المسافة',
  },
];

interface PhotoSlotUploaderProps {
  onChange: (
    slots: Record<PhotoSlotKey, File | null>,
    extras: File[],
    directUrls: Record<string, string>
  ) => void;
}

export default function PhotoSlotUploader({ onChange }: PhotoSlotUploaderProps) {
  const { isAr } = useLanguage();

  const [slotFiles, setSlotFiles] = useState<Record<PhotoSlotKey, File | null>>({
    front_three_quarter: null,
    rear_three_quarter: null,
    side_profile: null,
    interior_dash: null,
    odometer: null,
  });

  const [slotPreviews, setSlotPreviews] = useState<Record<PhotoSlotKey, string | null>>({
    front_three_quarter: null,
    rear_three_quarter: null,
    side_profile: null,
    interior_dash: null,
    odometer: null,
  });

  const [extraFiles, setExtraFiles] = useState<File[]>([]);
  const [extraPreviews, setExtraPreviews] = useState<string[]>([]);
  const [activeCameraSlot, setActiveCameraSlot] = useState<PhotoSlotKey | null>(null);

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const notifyChange = (
    newSlots: Record<PhotoSlotKey, File | null>,
    newExtras: File[]
  ) => {
    onChange(newSlots, newExtras, {});
  };

  const handleSlotFileSelected = (slotKey: PhotoSlotKey, file: File) => {
    const updatedFiles = { ...slotFiles, [slotKey]: file };
    const updatedPreviews = { ...slotPreviews, [slotKey]: URL.createObjectURL(file) };
    setSlotFiles(updatedFiles);
    setSlotPreviews(updatedPreviews);
    notifyChange(updatedFiles, extraFiles);
  };

  const removeSlotPhoto = (slotKey: PhotoSlotKey) => {
    const updatedFiles = { ...slotFiles, [slotKey]: null };
    const updatedPreviews = { ...slotPreviews, [slotKey]: null };
    setSlotFiles(updatedFiles);
    setSlotPreviews(updatedPreviews);
    notifyChange(updatedFiles, extraFiles);
  };

  const handleCameraCapture = (blob: Blob) => {
    if (!activeCameraSlot) return;
    const file = new File([blob], `${activeCameraSlot}.webp`, { type: 'image/webp' });
    handleSlotFileSelected(activeCameraSlot, file);
    setActiveCameraSlot(null);
  };

  const handleExtraUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const remaining = 5 - extraFiles.length;
    const toAdd = Array.from(files).slice(0, remaining);
    const newPreviews = toAdd.map((f) => URL.createObjectURL(f));

    const updatedExtras = [...extraFiles, ...toAdd];
    setExtraFiles(updatedExtras);
    setExtraPreviews([...extraPreviews, ...newPreviews]);
    notifyChange(slotFiles, updatedExtras);
  };

  const removeExtraPhoto = (index: number) => {
    const updatedExtras = extraFiles.filter((_, i) => i !== index);
    const updatedPreviews = extraPreviews.filter((_, i) => i !== index);
    setExtraFiles(updatedExtras);
    setExtraPreviews(updatedPreviews);
    notifyChange(slotFiles, updatedExtras);
  };

  return (
    <div className="space-y-6">
      <div className="text-center sm:text-start">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          {isAr ? 'زوايا التصوير القياسية الخمس' : 'STANDARDIZED PHOTO ANGLES'}
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          {isAr
            ? 'تضمن هذه الزوايا الخمس مظهراً متناسقاً واحترافياً يجذب المشترين لإعلانك.'
            : 'All 5 angles ensure every vehicle listing has a uniform, professional layout.'}
        </p>
      </div>

      {/* Standardized 5 Angles Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SLOTS.map((slot) => {
          const preview = slotPreviews[slot.key];

          return (
            <div
              key={slot.key}
              className={`relative bg-slate-50 border-2 rounded-2xl p-4 flex flex-col justify-between transition min-h-[190px] ${
                preview
                  ? 'border-emerald-500 bg-white'
                  : slot.isCover
                  ? 'border-dashed border-[#e03a14] bg-orange-50/20'
                  : 'border-dashed border-slate-200 hover:border-slate-300'
              }`}
            >
              {slot.isCover && !preview && (
                <span className="absolute top-3 left-3 bg-[#e03a14] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                  {isAr ? 'الصورة الرئيسية' : 'COVER HERO'}
                </span>
              )}

              {preview ? (
                <div className="relative w-full h-full flex flex-col justify-between">
                  <div className="relative w-full h-28 rounded-xl overflow-hidden mb-3 border border-slate-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={preview} alt={slot.titleEn} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeSlotPhoto(slot.key)}
                      className="absolute top-1.5 right-1.5 p-1 bg-black/70 text-white rounded-full hover:bg-red-600 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 truncate">
                      {isAr ? slot.titleAr : slot.titleEn}
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col justify-between h-full space-y-3">
                  <div className="text-center pt-3">
                    <h4 className="text-xs font-bold text-slate-800">
                      {isAr ? slot.titleAr : slot.titleEn}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {isAr ? slot.descAr : slot.descEn}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => fileInputRefs.current[slot.key]?.click()}
                      className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                    >
                      <Upload className="w-3.5 h-3.5 text-slate-500" />
                      {isAr ? 'رفع ملف' : 'Upload'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveCameraSlot(slot.key)}
                      className="bg-[#e03a14] hover:bg-[#c53210] text-white py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      {isAr ? 'تصوير' : 'Take Photo'}
                    </button>
                  </div>

                  <input
                    ref={(el) => {
                      fileInputRefs.current[slot.key] = el;
                    }}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleSlotFileSelected(slot.key, file);
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Additional Photos Tray */}
      <div className="pt-4 border-t border-slate-100">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-2">
          {isAr ? 'صور إضافية للسيارة (اختياري، حتى ٥ صور)' : 'ADDITIONAL PHOTOS (OPTIONAL, MAX 5)'}
        </label>
        
        <div className="flex flex-wrap gap-3 items-center">
          {extraPreviews.map((url, i) => (
            <div key={i} className="relative w-24 h-20 rounded-xl overflow-hidden border border-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Extra ${i + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeExtraPhoto(i)}
                className="absolute top-1 right-1 p-1 bg-black/70 text-white rounded-full hover:bg-red-600 transition"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}

          {extraFiles.length < 5 && (
            <label className="w-24 h-20 border-2 border-dashed border-slate-300 hover:border-[#e03a14] rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition">
              <Plus className="w-5 h-5 text-slate-400" />
              <span className="text-[10px] font-semibold text-slate-500 mt-1">
                {isAr ? 'إضافة صورة' : 'Add Extra'}
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleExtraUpload}
              />
            </label>
          )}
        </div>
      </div>

      {/* Camera Viewfinder Modal */}
      {activeCameraSlot && (
        <CameraWireframeModal
          slotKey={activeCameraSlot}
          isOpen={!!activeCameraSlot}
          onClose={() => setActiveCameraSlot(null)}
          onImageCapture={handleCameraCapture}
        />
      )}
    </div>
  );
}
