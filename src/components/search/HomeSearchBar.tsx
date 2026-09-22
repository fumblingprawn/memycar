'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { carData, years } from '@/lib/constants/car-data';
import { Search, ChevronDown, ChevronUp, Filter } from 'lucide-react';

export default function HomeSearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize state from URL
  const [make, setMake] = useState(searchParams.get('make') || '');
  const [model, setModel] = useState(searchParams.get('model') || '');
  const [yearFrom, setYearFrom] = useState(searchParams.get('year_from') || '');
  const [maxMileage, setMaxMileage] = useState(searchParams.get('max_mileage') || '');
  const [specs, setSpecs] = useState(searchParams.get('specs') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');
  const [emirate, setEmirate] = useState(searchParams.get('emirate') || '');
  const [freeText, setFreeText] = useState('');
  const [gccSpecsOnly, setGccSpecsOnly] = useState(searchParams.get('gcc_specs_only') === 'true');
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [transmission, setTransmission] = useState(searchParams.get('transmission') || '');
  const [fuelType, setFuelType] = useState(searchParams.get('fuel_type') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
  const [mileageFrom, setMileageFrom] = useState(searchParams.get('mileage_from') || '');
  const [yearTo, setYearTo] = useState(searchParams.get('year_to') || '');

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
    if (maxMileage) params.set('max_mileage', maxMileage);
    if (specs) params.set('specs', specs);
    if (maxPrice) params.set('max_price', maxPrice);
    if (emirate) params.set('emirate', emirate);
    if (freeText) params.set('free_text', freeText);
    if (gccSpecsOnly) params.set('gcc_specs_only', 'true');
    if (transmission) params.set('transmission', transmission);
    if (fuelType) params.set('fuel_type', fuelType);
    if (minPrice) params.set('min_price', minPrice);
    if (mileageFrom) params.set('mileage_from', mileageFrom);
    if (yearTo) params.set('year_to', yearTo);

    const qs = params.toString();
    router.push(qs ? `/?${qs}` : '/');
  };

  const handleReset = () => {
    setMake('');
    setModel('');
    setYearFrom('');
    setMaxMileage('');
    setSpecs('');
    setMaxPrice('');
    setEmirate('');
    setFreeText('');
    setGccSpecsOnly(false);
    setTransmission('');
    setFuelType('');
    setMinPrice('');
    setMileageFrom('');
    setYearTo('');
    router.push('/');
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200">
      <div className="px-6 py-5">
        {/* Top Pill/Card */}
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-2">
            Thousands of cars. One simple search.
          </p>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="e.g. Porsche 911 GCC Specs, Land Cruiser VXR..."
              value={freeText}
              onChange={(e) => setFreeText(e.target.value)}
              className="flex-1 px-4 py-3 rounded border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
            />
            <button
              onClick={handleSearch}
              className="bg-[#e03a14] text-white font-bold px-5 py-3 rounded hover:bg-[#c53210] transition-colors flex items-center gap-2"
            >
              <Search className="w-5 h-5" />
              Search
            </button>
          </div>
        </div>

        {/* Main Structured Search Card */}
        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {/* Make */}
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

            {/* Model */}
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

            {/* Year from */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Year from
              </label>
              <select
                value={yearFrom}
                onChange={(e) => setYearFrom(e.target.value)}
                className="w-full px-4 py-3 rounded border border-slate-300 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
              >
                <option value="">From</option>
                {years.map((yr) => (
                  <option key={yr} value={yr.toString()}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>

            {/* Max Mileage */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Max Mileage
              </label>
              <select
                value={maxMileage}
                onChange={(e) => setMaxMileage(e.target.value)}
                className="w-full px-4 py-3 rounded border border-slate-300 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
              >
                <option value="">Max km</option>
                {[10000, 30000, 50000, 100000, 150000, 200000, 250000].map((mileage) => (
                  <option key={mileage} value={mileage.toString()}>
                    {mileage.toLocaleString()} km
                  </option>
                ))}
              </select>
            </div>

            {/* Specs */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Specs
              </label>
              <select
                value={specs}
                onChange={(e) => setSpecs(e.target.value)}
                className="w-full px-4 py-3 rounded border border-slate-300 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
              >
                <option value="">All Specs</option>
                <option value="GCC">GCC Specs</option>
                <option value="American">American Specs</option>
                <option value="European">European Specs</option>
                <option value="Japanese">Japanese Specs</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Max Price */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Max Price (AED)
              </label>
              <input
                type="number"
                placeholder="e.g. 200000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full px-4 py-3 rounded border border-slate-300 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
              />
            </div>

            {/* Emirate */}
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
          </div>

          <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100">
            <div className="flex items-center gap-3 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={gccSpecsOnly}
                  onChange={(e) => setGccSpecsOnly(e.target.checked)}
                  className="h-4 w-4 text-orange-500"
                />
                GCC Specs Only
              </label>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleReset}
                className="text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                Reset
              </button>
              <button
                onClick={handleSearch}
                className="bg-[#e03a14] text-white font-bold px-5 py-3 rounded hover:bg-[#c53210] transition-colors"
              >
                Show <span className="font-semibold ml-2">Cars</span>
              </button>
            </div>
          </div>
        </div>

        {/* Advanced Filters Toggle */}
        <div className="mt-5 pt-4 border-t border-slate-50">
          <button
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            className="w-full flex items-center justify-between text-sm font-medium text-gray-600 hover:text-gray-500"
          >
            {isAdvancedOpen ? 'Show Less Filters' : 'Show More Filters'}
            {isAdvancedOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          {isAdvancedOpen && (
            <div className="mt-4 grid gap-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Transmission
                  </label>
                  <select
                    value={transmission}
                    onChange={(e) => setTransmission(e.target.value)}
                    className="w-full px-4 py-3 rounded border border-slate-300 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                  >
                    <option value="">All Transmissions</option>
                    <option value="Automatic">Automatic</option>
                    <option value="Manual">Manual</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Fuel Type
                  </label>
                  <select
                    value={fuelType}
                    onChange={(e) => setFuelType(e.target.value)}
                    className="w-full px-4 py-3 rounded border border-slate-300 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                  >
                    <option value="">All Fuel Types</option>
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Electric">Electric</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Min Price (AED)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 50000"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full px-4 py-3 rounded border border-slate-300 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Min Mileage
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 0"
                    value={mileageFrom}
                    onChange={(e) => setMileageFrom(e.target.value)}
                    className="w-full px-4 py-3 rounded border border-slate-300 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Year To
                  </label>
                  <select
                    value={yearTo}
                    onChange={(e) => setYearTo(e.target.value)}
                    className="w-full px-4 py-3 rounded border border-slate-300 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                  >
                    <option value="">To</option>
                    {years.map((yr) => (
                      <option key={yr} value={yr.toString()}>
                        {yr}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}