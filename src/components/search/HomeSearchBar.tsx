'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { carData, years } from '@/lib/constants/car-data';

export default function HomeSearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize state from URL
  const [make, setMake] = useState(searchParams.get('make') || '');
  const [model, setModel] = useState(searchParams.get('model') || '');
  const [yearFrom, setYearFrom] = useState(searchParams.get('year_from') || '');
  const [yearTo, setYearTo] = useState(searchParams.get('year_to') || '');
  const [mileageFrom, setMileageFrom] = useState(searchParams.get('mileage_from') || '');
  const [mileageTo, setMileageTo] = useState(searchParams.get('mileage_to') || '');
  const [priceFrom, setPriceFrom] = useState(searchParams.get('price_from') || '');
  const [priceTo, setPriceTo] = useState(searchParams.get('price_to') || '');
  const [emirate, setEmirate] = useState(searchParams.get('emirate') || '');
  const [specs, setSpecs] = useState(searchParams.get('specs') || '');

  // Derive models directly from selected make (no state setters during render)
  const availableModels = make
    ? carData.makes.find((m) => m.make.toLowerCase() === make.toLowerCase())?.models || []
    : [];

  const handleMakeChange = (newMake: string) => {
    setMake(newMake);
    setModel(''); // Reset model when make changes
  };

  const handleSearch = () => {
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

    const qs = params.toString();
    router.push(qs ? `/search?${qs}` : '/search');
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
    router.push('/');
  };

  // Mileage options (in km)
  const mileageOptions = [
    { value: '', label: 'from' },
    { value: '0', label: '0' },
    { value: '10000', label: '10k' },
    { value: '25000', label: '25k' },
    { value: '50000', label: '50k' },
    { value: '75000', label: '75k' },
    { value: '100000', label: '100k' },
    { value: '150000', label: '150k' },
    { value: '200000', label: '200k+' }
  ];

  // Price options (in AED)
  const priceOptions = [
    { value: '', label: 'from' },
    { value: '0', label: '0' },
    { value: '50000', label: '50k' },
    { value: '100000', label: '100k' },
    { value: '150000', label: '150k' },
    { value: '200000', label: '200k' },
    { value: '300000', label: '300k' },
    { value: '400000', label: '400k' },
    { value: '500000', label: '500k+' }
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 max-w-2xl mx-auto">
      <div className="space-y-4">
        {/* Line 1: Make & Model */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Make
            </label>
            <select
              value={make}
              onChange={(e) => handleMakeChange(e.target.value)}
              className="w-full px-4 py-3 rounded border border-slate-300 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
            >
              <option value="">Any Make</option>
              {carData.makes.map((item) => (
                <option key={item.make} value={item.make}>
                  {item.make}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Model
            </label>
            <select
              value={model}
              disabled={!make}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-4 py-3 rounded border border-slate-300 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
            >
              <option value="">{
                make ? 'Any Model' : 'Select Make First'
              }</option>
              {availableModels.map((mod) => (
                <option key={mod} value={mod}>
                  {mod}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Line 2: Year from & Year to */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Year from
            </label>
            <select
              value={yearFrom}
              onChange={(e) => setYearFrom(e.target.value)}
              className="w-full px-4 py-3 rounded border border-slate-300 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
            >
              <option value="">from</option>
              {years.map((yr) => (
                <option key={yr} value={yr.toString()}>
                  {yr}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Year to
            </label>
            <select
              value={yearTo}
              onChange={(e) => setYearTo(e.target.value)}
              className="w-full px-4 py-3 rounded border border-slate-300 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
            >
              <option value="">to</option>
              {years.map((yr) => (
                <option key={yr} value={yr.toString()}>
                  {yr}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Line 3: Mileage from & Mileage to */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Mileage from
            </label>
            <select
              value={mileageFrom}
              onChange={(e) => setMileageFrom(e.target.value)}
              className="w-full px-4 py-3 rounded border border-slate-300 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
            >
              {mileageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Mileage to
            </label>
            <select
              value={mileageTo}
              onChange={(e) => setMileageTo(e.target.value)}
              className="w-full px-4 py-3 rounded border border-slate-300 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
            >
              {mileageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Line 4: Price from & Price to */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Price from
            </label>
            <input
              type="number"
              placeholder="from"
              value={priceFrom}
              onChange={(e) => setPriceFrom(e.target.value)}
              className="w-full px-4 py-3 rounded border border-slate-300 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Price to
            </label>
            <input
              type="number"
              placeholder="to"
              value={priceTo}
              onChange={(e) => setPriceTo(e.target.value)}
              className="w-full px-4 py-3 rounded border border-slate-300 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
            />
          </div>
        </div>

        {/* Line 5: Location / Emirate & Regional Specs */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Emirate
            </label>
            <select
              value={emirate}
              onChange={(e) => setEmirate(e.target.value)}
              className="w-full px-4 py-3 rounded border border-slate-300 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
            >
              <option value="">All Emirates</option>
              {['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'].map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Regional Specs
            </label>
            <select
              value={specs}
              onChange={(e) => setSpecs(e.target.value)}
              className="w-full px-4 py-3 rounded border border-slate-300 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
            >
              <option value="">All</option>
              <option value="GCC">GCC Specs</option>
              <option value="Non-GCC">Non-GCC</option>
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            onClick={handleSearch}
            className="w-full bg-[#e03a14] hover:bg-[#c53210] text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 transform hover:-translate-y-1"
          >
            Search Cars
          </button>
        </div>

        {/* Reset Button (optional, smaller) */}
        <div className="pt-2">
          <button
            onClick={handleReset}
            className="w-full text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}