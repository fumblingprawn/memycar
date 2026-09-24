'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useLanguage } from '@/context/LanguageContext';
import { 
  Upload, 
  FileSpreadsheet, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Download 
} from 'lucide-react';

export default function BulkUploadPage() {
  const router = useRouter();
  const supabase = createClient();
  const { t, isAr } = useLanguage();

  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [successCount, setSuccessCount] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Generate downloadable sample CSV template
  const handleDownloadTemplate = () => {
    const headers = [
      'make',
      'model',
      'trim',
      'year',
      'price',
      'mileage',
      'specs',
      'fuel_type',
      'transmission',
      'warranty',
      'service_contract',
      'city',
      'description',
      'image_urls'
    ];

    const sampleRow = [
      'Mercedes-Benz',
      'G-Class',
      'G63 AMG',
      '2022',
      '685000',
      '34000',
      'GCC Specs',
      'Petrol',
      'Automatic',
      'Yes',
      'Yes',
      'Dubai',
      'Single owner pristine dealer maintained with complete history.',
      'https://images.unsplash.com/photo-1520050206274-a1ae44613e6d'
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), sampleRow.join(',')].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'memycar_dealer_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseCSV = (text: string) => {
    const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
      // Regex to handle comma separation with quoted strings
      const values = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map((v) => v.replace(/^"|"$/g, '').trim());
      if (values.length === headers.length) {
        const obj: any = {};
        headers.forEach((header, index) => {
          obj[header] = values[index];
        });
        rows.push(obj);
      }
    }
    return rows;
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setParsing(true);
    setErrorMsg(null);
    setSuccessCount(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth');
        return;
      }

      const text = await file.text();
      const records = parseCSV(text);

      if (records.length === 0) {
        throw new Error(isAr ? 'الملف فارغ أو تنسيقه غير صالح' : 'CSV file is empty or has an invalid format');
      }

      const sellerName = user.user_metadata?.full_name || 'Dealer';
      const sellerPhone = user.user_metadata?.phone || '';

      const batch = records.map((r: any) => ({
        user_id: user.id,
        make: r.make || 'Other',
        model: r.model || 'Other',
        trim: r.trim || null,
        year: parseInt(r.year, 10) || 2020,
        price: parseFloat(r.price) || 0,
        mileage: parseInt(r.mileage, 10) || 0,
        specs: r.specs || 'GCC Specs',
        fuel_type: r.fuel_type || 'Petrol',
        transmission: r.transmission || 'Automatic',
        warranty: r.warranty || 'No',
        service_contract: r.service_contract || 'No',
        city: r.city || 'Dubai',
        description: r.description || '',
        image_urls: r.image_urls ? r.image_urls.split(';').map((u: string) => u.trim()) : ['/placeholder-car.jpg'],
        seller_name: sellerName,
        seller_phone: sellerPhone,
        status: 'active',
      }));

      const { data, error } = await supabase.from('listings').insert(batch).select();
      if (error) throw error;

      setSuccessCount(data?.length || batch.length);
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 1500);
    } catch (err: any) {
      console.error('Bulk upload error:', err);
      setErrorMsg(err.message || 'Failed to process bulk upload');
    } finally {
      setParsing(false);
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
          <div className="flex items-center justify-between pb-6 border-b border-slate-100 mb-6">
            <div>
              <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-6 h-6 text-[#e03a14]" />
                {t('bulkUploader')}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                {isAr
                  ? 'ارفع أسطول سيارات المعرض دفعة واحدة عبر ملف Excel أو CSV'
                  : 'Import entire dealer inventory at once using an Excel/CSV spreadsheet'}
              </p>
            </div>

            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2.5 px-3.5 rounded-xl transition flex items-center gap-1.5 shadow-2xs"
            >
              <Download className="w-4 h-4 text-[#e03a14]" />
              {t('downloadTemplate')}
            </button>
          </div>

          {errorMsg && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2 mb-6 font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successCount !== null && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 mb-6 font-bold">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>{successCount} {t('bulkUploadSuccess')}</span>
            </div>
          )}

          <form onSubmit={handleUpload} className="space-y-6">
            <div className="border-2 border-dashed border-slate-300 hover:border-[#e03a14] rounded-2xl p-8 text-center bg-slate-50 hover:bg-orange-50/20 transition cursor-pointer">
              <input
                type="file"
                accept=".csv"
                id="csvInput"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              <label htmlFor="csvInput" className="cursor-pointer flex flex-col items-center">
                <Upload className="w-10 h-10 text-slate-400 mb-2" />
                <span className="text-sm font-bold text-slate-800">
                  {file ? file.name : (isAr ? 'اضغط لاختيار ملف CSV' : 'Click to select CSV file')}
                </span>
                <span className="text-xs text-slate-400 mt-1">
                  {isAr ? 'ملفات CSV متوافقة مع نموذج ميميكار' : 'UTF-8 encoded CSV files matching the template columns'}
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={!file || parsing}
              className="w-full bg-[#e03a14] hover:bg-[#c53210] disabled:bg-slate-300 text-white font-bold py-3.5 px-4 rounded-xl text-sm transition shadow-sm flex items-center justify-center gap-2"
            >
              {parsing && <Loader2 className="w-4 h-4 animate-spin" />}
              {parsing ? t('processingRows') : t('uploadCsvFile')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
