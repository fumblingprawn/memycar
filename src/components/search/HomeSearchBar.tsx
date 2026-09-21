'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { carData, years, mileageIntervals, getModelsByMake } from '@/lib/constants/car-data';

interface SearchParams {
  brand?: string;
  model?: string;
  yearMin?: string;
  yearMax?: string;
  mileageMax?: string;
  priceMin?: string;
  priceMax?: string;
}

export default function HomeSearchBar() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [formValues, setFormValues] = useState<SearchParams>({});

  // Initialize form values from search params
  useEffect(() => {
    const params: SearchParams = {};
    if (searchParams.has('brand')) params.brand = searchParams.get('brand') || undefined;
    if (searchParams.has('model')) params.model = searchParams.get('model') || undefined;
    if (searchParams.has('yearMin')) params.yearMin = searchParams.get('yearMin') || undefined;
    if (searchParams.has('yearMax')) params.yearMax = searchParams.get('yearMax') || undefined;
    if (searchParams.has('mileageMax')) params.mileageMax = searchParams.get('mileageMax') || undefined;
    if (searchParams.has('priceMin')) params.priceMin = searchParams.get('priceMin') || undefined;
    if (searchParams.has('priceMax')) params.priceMax = searchParams.get('priceMax') || undefined;
    setFormValues(params);
  }, [searchParams]);

  // Get models for the selected brand
  const models = formValues.brand ? getModelsByMake(formValues.brand) : [];

  // Handle input change
  const handleChange = useCallback((key: keyof SearchParams, value: string | undefined) => {
    setFormValues(prev => {
      const newPrev = { ...prev };
      if (value === undefined || value === '') {
        delete newPrev[key];
      } else {
        newPrev[key] = value as any;
      }
      return newPrev;
    });
  }, []);

  // Update URL when form values change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      Object.entries(formValues).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.set(key, String(value));
        }
      });
      const newPath = `${pathname}?${params.toString()}`;
      router.push(newPath);
    }, 300);

    return () => clearTimeout(timer);
  }, [formValues, pathname, router]);

  if (formValues.brand && !models.includes(formValues.model || '')) {
    // Reset model if it's not in the current brand's models
    setFormValues(prev => {
      const newPrev = { ...prev };
      delete newPrev.model;
      return newPrev;
    });
  }

  return (
    <section className="bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Hero Section */}
          <div className="text-center">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              Find your next car in UAE / GCC
            </h1>
            <p className="text-slate-600 mt-2 max-w-xl mx-auto">
              Search thousands of verified cars with standardized photography and transparent pricing.
            </p>
          </div>

          {/* Search Form */}
          <form className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {/* Brand */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Brand</label>
              <select
                value={formValues.brand || ''}
                onChange={(e) => handleChange('brand', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
              >
                <option value="">All Brands</option>
                {carData.makes.map((make) => (
                  <option key={make.make} value={make.make}>
                    {make.make}
                  </option>
                ))}
              </select>
            </div>

            {/* Model */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Model</label>
              <select
                value={formValues.model || ''}
                onChange={(e) => handleChange('model', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                disabled={!formValues.brand}
              >
                <option value="">All Models</option>
                {models.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Min */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Min Year</label>
              <select
                value={formValues.yearMin || ''}
                onChange={(e) => handleChange('yearMin', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
              >
                <option value="">All Years</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Max */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Max Year</label>
              <select
                value={formValues.yearMax || ''}
                onChange={(e) => handleChange('yearMax', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
              >
                <option value="">All Years</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Max Mileage */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Max Mileage (km)</label>
              <select
                value={formValues.mileageMax || ''}
                onChange={(e) => handleChange('mileageMax', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
              >
                <option value="">All Mileage</option>
                {mileageIntervals.map((mileage) => (
                  <option key={mileage} value={mileage.toString()}>
                    {mileage >= 1000 ? `${mileage / 1000}k` : mileage}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Min */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Min Price (AED)</label>
              <input
                type="number"
                value={formValues.priceMin || ''}
                onChange={(e) => handleChange('priceMin', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                placeholder="e.g. 20000"
              />
            </div>

            {/* Price Max */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Max Price (AED)</label>
              <input
                type="number"
                value={formValues.priceMax || ''}
                onChange={(e) => handleChange('priceMax', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                placeholder="e.g. 200000"
              />
            </div>
          </form>

          {/* Action Button */}
          <div className="pt-4 text-right">
            <button
              onClick={() => {
                // The form already updates the URL via useEffect, so we can just trigger a search by submitting?
                // Actually we are already updating the URL on change, so we can just let the page reload.
                // We'll add a subtle visual feedback.
                router.refresh();
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow transition duration-200 flex items-center justify-center gap-2"
            >
              <span>Search Cars</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}