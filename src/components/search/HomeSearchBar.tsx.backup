'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { carData, years } from '@/lib/constants/car-data';

export default function HomeSearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize state from URL
  const [make, setMake] = useState(searchParams.get('make') || '');
  const [model, setModel] = useState(searchParams.get('model') || '');
  const [minYear, setMinYear] = useState(searchParams.get('min_year') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');

  // Update state when URL parameters change
  useEffect(() => {
    setMake(searchParams.get('make') || '');
    setModel(searchParams.get('model') || '');
    setMinYear(searchParams.get('min_year') || '');
    setMaxPrice(searchParams.get('max_price') || '');
  }, [searchParams]);

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
    if (minYear) params.set('min_year', minYear);
    if (maxPrice) params.set('max_price', maxPrice);

    const qs = params.toString();
    router.push(qs ? `/?${qs}` : '/');
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6 border border-slate-200">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Make */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Make</label>
          <select
            value={make}
            onChange={(e) => handleMakeChange(e.target.value)}
            className="w-full border border-slate-300 rounded-lg p-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">All Makes</option>
            {carData.makes.map((item) => (
              <option key={item.make} value={item.make}>
                {item.make}
              </option>
            ))}
          </select>
        </div>

        {/* Model */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Model</label>
          <select
            value={model}
            disabled={!make}
            onChange={(e) => setModel(e.target.value)}
            className="w-full border border-slate-300 rounded-lg p-2 text-sm bg-white disabled:bg-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">{make ? 'All Models' : 'Select Make First'}</option>
            {availableModels.map((mod) => (
              <option key={mod} value={mod}>
                {mod}
              </option>
            ))}
          </select>
        </div>

        {/* Min Year */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Min Year</label>
          <select
            value={minYear}
            onChange={(e) => setMinYear(e.target.value)}
            className="w-full border border-slate-300 rounded-lg p-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">Any Year</option>
            {years.map((yr) => (
              <option key={yr} value={yr.toString()}>{yr}</option>
            ))}
          </select>
        </div>

        {/* Search CTA */}
        <div className="flex items-end">
          <button
            type="button"
            onClick={handleSearch}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-lg transition"
          >
            Search Cars
          </button>
        </div>
      </div>
    </div>
  );
}