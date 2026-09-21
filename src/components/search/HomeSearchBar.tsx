'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { carData, years } from '@/lib/constants/car-data';
import { Search, ChevronDown } from 'lucide-react';

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
    <div className="bg-white rounded-3xl shadow-lg border border-slate-100">
      <div className="px-6 py-8">
        <h2 className="mb-6 text-2xl font-bold text-gray-900 text-center">
          Find Your Perfect Car
        </h2>
        <div className="grid gap-6">
          {/* Row 1: Make and Model */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Search className="h-4 w-4 text-blue-500" />
                Make
              </label>
              <select
                value={make}
                onChange={(e) => handleMakeChange(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all hover:border-slate-300"
              >
                <option value="">All Makes</option>
                {carData.makes.map((item) => (
                  <option key={item.make} value={item.make}>
                    {item.make}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Search className="h-4 w-4 text-blue-500" />
                Model
              </label>
              <select
                value={model}
                disabled={!make}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all hover:border-slate-300"
              >
                <option value="">{make ? 'All Models' : 'Select Make First'}</option>
                {availableModels.map((mod) => (
                  <option key={mod} value={mod}>
                    {mod}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Row 2: Year and Price */}
          <div className="gap-4 sm:grid-cols-2">
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Search className="h-4 w-4 text-blue-500" />
                Min Year
              </label>
              <select
                value={minYear}
                onChange={(e) => setMinYear(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all hover:border-slate-300"
              >
                <option value="">Any Year</option>
                {years.map((yr) => (
                  <option key={yr} value={yr.toString()}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Search className="h-4 w-4 text-blue-500" />
                Max Price (AED)
              </label>
              <input
                type="number"
                placeholder="e.g. 200000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all hover:border-slate-300"
              />
            </div>
          </div>
          
          {/* Search Button */}
          <div className="flex justify-center">
            <button
              onClick={handleSearch}
              className="flex-1 sm:w-48 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-all hover:shadow-lg transform hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              <Search className="h-4 w-4" />
              Search Cars
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
