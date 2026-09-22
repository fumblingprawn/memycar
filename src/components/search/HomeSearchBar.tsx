'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { carData, years } from '@/lib/constants/car-data';
import { useLanguage } from '@/context/LanguageContext';

export default function HomeSearchBar() {
  const router = useRouter();
  const { t } = useLanguage();

  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');
  const [mileageFrom, setMileageFrom] = useState('');
  const [mileageTo, setMileageTo] = useState('');
  const [priceFrom, setPriceFrom] = useState('');
  const [priceTo, setPriceTo] = useState('');
  const [emirate, setEmirate] = useState('');
  const [specs, setSpecs] = useState('');

  const availableModels = make
    ? carData.makes.find((m) => m.make.toLowerCase() === make.toLowerCase())?.models || []
    : [];

  const emiratesList = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (make) params.set('make', make);
    if (model) params.set('model', model);
    if (yearFrom) params.set('year_from', yearFrom);
    if (yearTo) params.set('year_to', yearTo);
    if (mileageFrom) params.set('mileage_from', mileageFrom);
    if (mileageTo) params.set('mileage_to', mileageTo);
    if (priceFrom) params.set('price_from', priceFrom);
    if (priceTo) params.set('price_to', priceTo);
    if (emirate) params.set('emirate', emirate);
    if (specs) params.set('specs', specs);

    router.push(`/search?${params.toString()}`);
  };

  const handleReset = () => {
    setMake('');
    setModel('');
    setYearFrom('');
    setYearTo('');
    setMileageFrom('');
    setMileageTo('');
    setPriceFrom('');
    setPriceTo('');
    setEmirate('');
    setSpecs('');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm max-w-2xl mx-auto">
      <form onSubmit={handleSearch} className="space-y-4">
        {/* Line 1: Make & Model */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">{t('make')}</label>
            <select
              value={make}
              onChange={(e) => {
                setMake(e.target.value);
                setModel('');
              }}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white outline-none focus:ring-2 focus:ring-[#e03a14]"
            >
              <option value="">{t('allMakes')}</option>
              {carData.makes.map((item) => (
                <option key={item.make} value={item.make}>
                  {t(item.make)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">{t('model')}</label>
            <select
              disabled={!make}
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white disabled:bg-slate-100 outline-none focus:ring-2 focus:ring-[#e03a14]"
            >
              <option value="">{t('allModels')}</option>
              {availableModels.map((mod) => (
                <option key={mod} value={mod}>{mod}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Line 2: Year */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">{t('yearFrom')}</label>
            <select
              value={yearFrom}
              onChange={(e) => setYearFrom(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white"
            >
              <option value="">-</option>
              {years.map((y) => (
                <option key={y} value={y.toString()}>{y}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">{t('yearTo')}</label>
            <select
              value={yearTo}
              onChange={(e) => setYearTo(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white"
            >
              <option value="">-</option>
              {years.map((y) => (
                <option key={y} value={y.toString()}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Line 3: Mileage */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">{t('mileageFrom')}</label>
            <input
              type="number"
              placeholder="0"
              value={mileageFrom}
              onChange={(e) => setMileageFrom(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">{t('mileageTo')}</label>
            <input
              type="number"
              placeholder="200,000"
              value={mileageTo}
              onChange={(e) => setMileageTo(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
            />
          </div>
        </div>

        {/* Line 4: Price */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">{t('priceFrom')}</label>
            <input
              type="number"
              placeholder="0"
              value={priceFrom}
              onChange={(e) => setPriceFrom(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">{t('priceTo')}</label>
            <input
              type="number"
              placeholder="500,000"
              value={priceTo}
              onChange={(e) => setPriceTo(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300"
            />
          </div>
        </div>

        {/* Line 5: Emirate & Specs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">{t('emirate')}</label>
            <select
              value={emirate}
              onChange={(e) => setEmirate(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white"
            >
              <option value="">{t('allEmirates')}</option>
              {emiratesList.map((em) => (
                <option key={em} value={em}>{t(em)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">{t('specs')}</label>
            <select
              value={specs}
              onChange={(e) => setSpecs(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 bg-white"
            >
              <option value="">{t('allSpecs')}</option>
              <option value="GCC Specs">{t('GCC Specs')}</option>
              <option value="American Specs">{t('American Specs')}</option>
              <option value="Japanese Specs">{t('Japanese Specs')}</option>
              <option value="European Specs">{t('European Specs')}</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
          >
            {t('reset')}
          </button>

          <button
            type="submit"
            className="bg-[#e03a14] hover:bg-[#c53210] text-white font-bold py-3 px-6 rounded-xl text-sm transition flex-1 sm:flex-none shadow-sm"
          >
            {t('searchCars')}
          </button>
        </div>
      </form>
    </div>
  );
}
