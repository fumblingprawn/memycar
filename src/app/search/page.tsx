'use client';

import SaveSearchButton from '@/components/search/SaveSearchButton';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useLanguage } from '@/context/LanguageContext';
import { carData, years, SubModelGroup } from '@/lib/constants/car-data';
import ListingCard from '@/components/listing/ListingCard';
import { 
  Car, 
  SlidersHorizontal, 
  ArrowUpDown, 
  RotateCcw, 
  X, 
  Filter,
  CheckCircle2
} from 'lucide-react';

type SortOption = 
  | 'default'
  | 'newest'
  | 'oldest'
  | 'price_desc'
  | 'price_asc'
  | 'km_desc'
  | 'km_asc'
  | 'year_desc'
  | 'year_asc';

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const { t, isAr } = useLanguage();

  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('default');

  // Filter state
  const [make, setMake] = useState(searchParams.get('make') || '');
  const [model, setModel] = useState(searchParams.get('model') || '');
  const [yearFrom, setYearFrom] = useState(searchParams.get('year_from') || '');
  const [yearTo, setYearTo] = useState(searchParams.get('year_to') || '');
  const [priceFrom, setPriceFrom] = useState(searchParams.get('price_from') || '');
  const [priceTo, setPriceTo] = useState(searchParams.get('price_to') || '');
  const [maxMileage, setMaxMileage] = useState(searchParams.get('mileage_to') || '');
  const [emirate, setEmirate] = useState(searchParams.get('emirate') || '');
  const [specs, setSpecs] = useState(searchParams.get('specs') || '');
  const [fuelType, setFuelType] = useState(searchParams.get('fuel') || '');
  const [transmission, setTransmission] = useState(searchParams.get('trans') || '');
  const [warrantyOnly, setWarrantyOnly] = useState(searchParams.get('warranty') === 'yes');
  const [serviceContractOnly, setServiceContractOnly] = useState(searchParams.get('service_contract') === 'yes');
  const [showSold, setShowSold] = useState(false);

  // Active filter payload for SaveSearchButton
  const activeFilterParams: Record<string, string> = {};
  if (make) activeFilterParams['make'] = make;
  if (model) activeFilterParams['model'] = model;
  if (yearFrom) activeFilterParams['year_from'] = yearFrom;
  if (yearTo) activeFilterParams['year_to'] = yearTo;
  if (priceFrom) activeFilterParams['price_from'] = priceFrom;
  if (priceTo) activeFilterParams['price_to'] = priceTo;
  if (maxMileage) activeFilterParams['mileage_to'] = maxMileage;
  if (emirate) activeFilterParams['emirate'] = emirate;
  if (specs) activeFilterParams['specs'] = specs;
  if (fuelType) activeFilterParams['fuel'] = fuelType;
  if (transmission) activeFilterParams['trans'] = transmission;
  if (warrantyOnly) activeFilterParams['warranty'] = 'yes';
  if (serviceContractOnly) activeFilterParams['service_contract'] = 'yes';

  const searchSummaryTitle = [make, model].filter(Boolean).join(' ') || (isAr ? 'بحث مخصص' : 'Custom Search');

  const emirateOptions = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'];
  const specsOptions = ['GCC Specs', 'Non-GCC / American', 'Non-GCC / Japanese', 'Non-GCC / European', 'Other'];
  const fuelOptions = ['Petrol', 'Diesel', 'Hybrid', 'Electric'];
  const transOptions = ['Automatic', 'Manual'];

  const selectedMakeObj = make && make !== 'Other'
    ? carData.makes.find((m) => m.make.toLowerCase() === make.toLowerCase())
    : null;

  const handleMakeChange = (selectedMake: string) => {
    setMake(selectedMake);
    setModel('');
  };

  const handleResetFilters = () => {
    setMake('');
    setModel('');
    setYearFrom('');
    setYearTo('');
    setPriceFrom('');
    setPriceTo('');
    setMaxMileage('');
    setEmirate('');
    setSpecs('');
    setFuelType('');
    setTransmission('');
    setWarrantyOnly(false);
    setServiceContractOnly(false);
    setShowSold(false);
    setSortBy('default');
    router.push('/search');
  };

  const fetchResults = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('listings').select('*');

    // Filter out archived listings
    query = query.neq('status', 'archived');

    // If user does not want to see sold listings, only show active
    if (!showSold) {
      query = query.neq('status', 'sold');
    }

    if (make && make !== 'Other') query = query.ilike('make', `%${make}%`);
    
    // Model search: if user selected a series like "7 Series (All)", match "7 Series" or "7"
    if (model && model !== 'Other') {
      const cleanModel = model.replace(/\s*\(All\)|\s*\(الكل\)/i, '').trim();
      query = query.ilike('model', `%${cleanModel}%`);
    }

    if (yearFrom) query = query.gte('year', parseInt(yearFrom, 10));
    if (yearTo) query = query.lte('year', parseInt(yearTo, 10));
    if (priceFrom) query = query.gte('price', parseInt(priceFrom, 10));
    if (priceTo) query = query.lte('price', parseInt(priceTo, 10));
    if (maxMileage) query = query.lte('mileage', parseInt(maxMileage, 10));
    if (emirate) query = query.ilike('city', `%${emirate}%`);
    if (specs) query = query.ilike('specs', `%${specs}%`);
    if (fuelType) query = query.ilike('fuel_type', `%${fuelType}%`);
    if (transmission) query = query.ilike('transmission', `%${transmission}%`);
    if (warrantyOnly) query = query.eq('warranty', 'Yes');
    if (serviceContractOnly) query = query.eq('service_contract', 'Yes');

    // Dubizzle sorting
    switch (sortBy) {
      case 'newest':
        query = query.order('created_at', { ascending: false });
        break;
      case 'oldest':
        query = query.order('created_at', { ascending: true });
        break;
      case 'price_desc':
        query = query.order('price', { ascending: false });
        break;
      case 'price_asc':
        query = query.order('price', { ascending: true });
        break;
      case 'km_desc':
        query = query.order('mileage', { ascending: false });
        break;
      case 'km_asc':
        query = query.order('mileage', { ascending: true });
        break;
      case 'year_desc':
        query = query.order('year', { ascending: false });
        break;
      case 'year_asc':
        query = query.order('year', { ascending: true });
        break;
      case 'default':
      default:
        query = query.order('created_at', { ascending: false });
        break;
    }

    const { data, error } = await query;
    if (!error && data) {
      setListings(data);
    }
    setLoading(false);
  }, [
    supabase, 
    make, 
    model, 
    yearFrom, 
    yearTo, 
    priceFrom, 
    priceTo, 
    maxMileage, 
    emirate, 
    specs, 
    fuelType, 
    transmission, 
    warrantyOnly, 
    serviceContractOnly, 
    showSold, 
    sortBy
  ]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const FilterControls = () => (
    <div className="space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-[#e03a14]" />
          {isAr ? 'تصفية النتائج' : 'Filter Search'}
        </h2>
        {(make || model || yearFrom || yearTo || priceFrom || priceTo || maxMileage || emirate || specs || fuelType || transmission || warrantyOnly || serviceContractOnly || showSold) && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-[11px] font-bold text-[#e03a14] hover:underline flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            {t('reset')}
          </button>
        )}
      </div>

      {/* Make */}
      <div>
        <label className="text-xs font-bold text-slate-900 block mb-1.5">{t('make')}</label>
        <select
          value={make}
          onChange={(e) => handleMakeChange(e.target.value)}
          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 outline-none focus:ring-2 focus:ring-[#e03a14]"
        >
          <option value="">{t('allMakes')}</option>
          {carData.makes.map((item) => (
            <option key={item.make} value={item.make}>
              {isAr ? t(item.make) : item.make}
            </option>
          ))}
        </select>
      </div>

      {/* Model: Mobile.de / Dubizzle-style Grouped Dropdown */}
      <div>
        <label className="text-xs font-bold text-slate-900 block mb-1.5">{t('model')}</label>
        <select
          disabled={!make || !selectedMakeObj}
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 outline-none focus:ring-2 focus:ring-[#e03a14] disabled:bg-slate-100 disabled:text-slate-400"
        >
          <option value="">{make ? (isAr ? 'كافة الموديلات' : 'All Models') : t('selectMakeFirst')}</option>
          {selectedMakeObj?.models.map((item, idx) => {
            if (typeof item === 'string') {

  return (
                <option key={idx} value={item}>
                  {item}
                </option>
              );
            } else {
              // Grouped Series like mobile.de
              const group = item as SubModelGroup;
              return (
                <optgroup key={group.groupName} label={`— ${group.groupName} —`}>
                  {/* "All" Option for the entire series */}
                  <option value={`${group.groupName} (All)`}>
                    {isAr ? `${group.groupName} (كافة الفئات)` : `${group.groupName} (All)`}
                  </option>
                  {/* Individual submodels */}
                  {group.models.map((sub) => (
                    <option key={sub} value={sub}>
                      &nbsp;&nbsp;&nbsp;{sub}
                    </option>
                  ))}
                </optgroup>
              );
            }
          })}
        </select>
      </div>

      {/* Year Range */}
      <div>
        <label className="text-xs font-bold text-slate-900 block mb-1.5">{t('year')}</label>
        <div className="grid grid-cols-2 gap-2">
          <select
            value={yearFrom}
            onChange={(e) => setYearFrom(e.target.value)}
            className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 outline-none focus:ring-2 focus:ring-[#e03a14]"
          >
            <option value="">{isAr ? 'من سنة' : 'From'}</option>
            {years.map((y) => (
              <option key={y} value={y.toString()}>{y}</option>
            ))}
          </select>
          <select
            value={yearTo}
            onChange={(e) => setYearTo(e.target.value)}
            className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 outline-none focus:ring-2 focus:ring-[#e03a14]"
          >
            <option value="">{isAr ? 'إلى سنة' : 'To'}</option>
            {years.map((y) => (
              <option key={y} value={y.toString()}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Price Range */}
      <div>
        <label className="text-xs font-bold text-slate-900 block mb-1.5">{t('priceAed')}</label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder={isAr ? 'الحد الأدنى' : 'Min AED'}
            value={priceFrom}
            onChange={(e) => setPriceFrom(e.target.value)}
            className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-300 text-slate-900 outline-none focus:ring-2 focus:ring-[#e03a14]"
          />
          <input
            type="number"
            placeholder={isAr ? 'الحد الأقصى' : 'Max AED'}
            value={priceTo}
            onChange={(e) => setPriceTo(e.target.value)}
            className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-300 text-slate-900 outline-none focus:ring-2 focus:ring-[#e03a14]"
          />
        </div>
      </div>

      {/* Max Mileage */}
      <div>
        <label className="text-xs font-bold text-slate-900 block mb-1.5">{t('mileageKm')}</label>
        <input
          type="number"
          placeholder={isAr ? 'أقصى مسافة (كم)' : 'Max KM (e.g. 100000)'}
          value={maxMileage}
          onChange={(e) => setMaxMileage(e.target.value)}
          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 text-slate-900 outline-none focus:ring-2 focus:ring-[#e03a14]"
        />
      </div>

      {/* Regional Specs */}
      <div>
        <label className="text-xs font-bold text-slate-900 block mb-1.5">{t('specs')}</label>
        <select
          value={specs}
          onChange={(e) => setSpecs(e.target.value)}
          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 outline-none focus:ring-2 focus:ring-[#e03a14]"
        >
          <option value="">{t('allSpecs')}</option>
          {specsOptions.map((opt) => (
            <option key={opt} value={opt}>{opt === 'Other' ? (isAr ? 'أخرى' : 'Other') : t(opt)}</option>
          ))}
        </select>
      </div>

      {/* Emirate */}
      <div>
        <label className="text-xs font-bold text-slate-900 block mb-1.5">{t('emirate')}</label>
        <select
          value={emirate}
          onChange={(e) => setEmirate(e.target.value)}
          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 outline-none focus:ring-2 focus:ring-[#e03a14]"
        >
          <option value="">{t('allEmirates')}</option>
          {emirateOptions.map((em) => (
            <option key={em} value={em}>{t(em)}</option>
          ))}
        </select>
      </div>

      {/* Technical: Fuel Type */}
      <div>
        <label className="text-xs font-bold text-slate-900 block mb-1.5">{t('fuelType')}</label>
        <select
          value={fuelType}
          onChange={(e) => setFuelType(e.target.value)}
          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 outline-none focus:ring-2 focus:ring-[#e03a14]"
        >
          <option value="">{isAr ? 'كافة أنواع الوقود' : 'All Fuel Types'}</option>
          {fuelOptions.map((f) => (
            <option key={f} value={f}>{t(f)}</option>
          ))}
        </select>
      </div>

      {/* Technical: Transmission */}
      <div>
        <label className="text-xs font-bold text-slate-900 block mb-1.5">{t('transmission')}</label>
        <select
          value={transmission}
          onChange={(e) => setTransmission(e.target.value)}
          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 outline-none focus:ring-2 focus:ring-[#e03a14]"
        >
          <option value="">{isAr ? 'كافة نواقل الحركة' : 'All Transmissions'}</option>
          {transOptions.map((tr) => (
            <option key={tr} value={tr}>{t(tr)}</option>
          ))}
        </select>
      </div>

      {/* Checkboxes: Under Warranty & Service Contract */}
      <div className="pt-2 border-t border-slate-100 space-y-2">
        <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
          <input
            type="checkbox"
            checked={warrantyOnly}
            onChange={(e) => setWarrantyOnly(e.target.checked)}
            className="w-4 h-4 rounded text-[#e03a14] focus:ring-[#e03a14] border-slate-300"
          />
          <span>{isAr ? 'سيارات تحت الضمان فقط' : 'Under Warranty only'}</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
          <input
            type="checkbox"
            checked={serviceContractOnly}
            onChange={(e) => setServiceContractOnly(e.target.checked)}
            className="w-4 h-4 rounded text-[#e03a14] focus:ring-[#e03a14] border-slate-300"
          />
          <span>{isAr ? 'يوجد عقد صيانة ساري' : 'With Service Contract'}</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800 pt-1">
          <input
            type="checkbox"
            checked={showSold}
            onChange={(e) => setShowSold(e.target.checked)}
            className="w-4 h-4 rounded text-[#e03a14] focus:ring-[#e03a14] border-slate-300"
          />
          <span>{isAr ? 'عرض السيارات المباعة أيضاً' : 'Include Sold Vehicles'}</span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 mb-6 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#e03a14] flex items-center justify-center font-bold">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                {make ? `${isAr ? t(make) : make} ${model ? (isAr ? t(model) : model) : ''}`.trim() : (isAr ? 'كافة السيارات المعروضة' : 'All Available Cars')}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {listings.length} {isAr ? 'سيارة متوفرة وموثقة' : 'verified vehicles available'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <button
              type="button"
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2 px-3 rounded-xl flex items-center gap-1.5 transition"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#e03a14]" />
              <span>{isAr ? 'تصفية' : 'Filters'}</span>
            </button>
            <SaveSearchButton
              currentParams={activeFilterParams}
              searchSummaryTitle={searchSummaryTitle}
            />

            {/* Dubizzle-Style Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 hidden sm:flex items-center gap-1 flex-shrink-0">
                <ArrowUpDown className="w-3 h-3 text-slate-400" />
                {t('sortBy')}:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 bg-white text-slate-900 outline-none focus:ring-2 focus:ring-[#e03a14] cursor-pointer"
              >
                <option value="default">{t('sortDefault')}</option>
                <option value="newest">{t('sortNewest')}</option>
                <option value="oldest">{t('sortOldest')}</option>
                <option value="price_desc">{t('sortPriceHighLow')}</option>
                <option value="price_asc">{t('sortPriceLowHigh')}</option>
                <option value="km_desc">{t('sortKmHighLow')}</option>
                <option value="km_asc">{t('sortKmLowHigh')}</option>
                <option value="year_desc">{t('sortYearHighLow')}</option>
                <option value="year_asc">{t('sortYearLowHigh')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Grid: Left Filter Sidebar + Right Listings */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          <div className="hidden lg:block lg:col-span-1 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs sticky top-24">
            <FilterControls />
          </div>

          <div className="lg:col-span-3">
            {loading ? (
              <div className="py-24 text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#e03a14] border-t-transparent mx-auto mb-3"></div>
                <p className="text-xs text-slate-500 font-semibold">
                  {isAr ? 'جاري تحديث نتائج البحث...' : 'Loading verified vehicles...'}
                </p>
              </div>
            ) : listings.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-2xs">
                <Car className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-800 mb-1">
                  {isAr ? 'لا توجد سيارات تطابق معايير البحث' : 'No cars match your search filters'}
                </h3>
                <p className="text-xs text-slate-400 mb-4 max-w-sm mx-auto">
                  {isAr 
                    ? 'جرب توسيع نطاق السعر أو سنة الصنع أو إعادة تعيين عوامل التصفية.' 
                    : 'Try clearing some filters or widening your price/year range.'}
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1.5 bg-[#e03a14] hover:bg-[#c53210] text-white text-xs font-bold py-2.5 px-4 rounded-xl transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  {t('reset')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {listings.map((car) => (
                  <ListingCard key={car.id} listing={car} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Filter Modal */}
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-white rounded-t-3xl sm:rounded-3xl border border-slate-200 p-6 w-full max-w-md max-h-[85vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-4 h-4 text-[#e03a14]" />
                  {isAr ? 'عوامل التصفية' : 'Search Filters'}
                </h3>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <FilterControls />

              <div className="pt-5 border-t border-slate-100 mt-6 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="py-2.5 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  {t('reset')}
                </button>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="py-2.5 px-3 rounded-xl bg-[#e03a14] hover:bg-[#c53210] text-xs font-bold text-white shadow-2xs"
                >
                  {isAr ? 'عرض النتائج' : 'Apply Filters'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f8f9fa]" />}>
      <SearchContent />
    </Suspense>
  );
}