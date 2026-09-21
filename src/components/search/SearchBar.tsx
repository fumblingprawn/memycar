'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { VehicleSpec, Emirate } from '@/types/listing';

interface SearchOptions {
  makes: string[];
  models: Record<string, string[]>; // make -> models[]
  years: number[];
}

interface SearchParams {
  make?: string;
  model?: string;
  min_price?: string;
  max_price?: string;
  min_year?: string;
  max_year?: string;
  max_mileage?: string;
  specs?: VehicleSpec;
  emirate?: Emirate;
  sort?: string;
}

export default function SearchBar() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [options, setOptions] = useState<SearchOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [formValues, setFormValues] = useState<SearchParams>({});

  // Initialize form values from search params
  useEffect(() => {
    const params: SearchParams = {};
    if (searchParams.has('make')) params.make = searchParams.get('make') || undefined;
    if (searchParams.has('model')) params.model = searchParams.get('model') || undefined;
    if (searchParams.has('min_price')) params.min_price = searchParams.get('min_price') || undefined;
    if (searchParams.has('max_price')) params.max_price = searchParams.get('max_price') || undefined;
    if (searchParams.has('min_year')) params.min_year = searchParams.get('min_year') || undefined;
    if (searchParams.has('max_year')) params.max_year = searchParams.get('max_year') || undefined;
    if (searchParams.has('max_mileage')) params.max_mileage = searchParams.get('max_mileage') || undefined;
    if (searchParams.has('specs')) params.specs = (searchParams.get('specs') as VehicleSpec) || undefined;
    if (searchParams.has('emirate')) params.emirate = (searchParams.get('emirate') as Emirate) || undefined;
    if (searchParams.has('sort')) params.sort = searchParams.get('sort') || undefined;
    setFormValues(params);
  }, [searchParams]);

  // Fetch search options (makes, models, years)
  useEffect(() => {
    let cancelled = false;
    const fetchOptions = async () => {
      try {
        const supabase = createClient();

        // Get distinct makes
        const { data: makesData } = await supabase
          .from('listings')
          .select('make')
          .order('make');

        const makes = [...new Set(makesData?.map((m: any) => m.make) || [])].sort();

        // Get distinct models for each make
        const models: Record<string, string[]> = {};
        for (const make of makes) {
          const { data: modelsData } = await supabase
            .from('listings')
            .select('model')
            .eq('make', make)
            .order('model');
          models[make] = [...new Set(modelsData?.map((m: any) => m.model) || [])].sort();
        }

        // Get distinct years (min and max for dropdowns)
        const { data: yearsData } = await supabase
          .from('listings')
          .select('year')
          .order('year');
        const years = [...new Set(yearsData?.map((y: any) => y.year) || [])].sort((a, b) => b - a); // descending

        if (!cancelled) {
          setOptions({ makes, models, years });
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to fetch search options:', error);
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchOptions();
    return () => {
      cancelled = true;
    };
  }, []);

  // Generate filtered models based on selected make
  const filteredModels = useMemo(() => {
    if (!options || !formValues.make) return [];
    return options.models[formValues.make] || [];
  }, [options, formValues.make]);

  // Handle input change
  const handleChange = (key: keyof SearchParams, value: string | undefined) => {
    setFormValues(prev => {
      const newPrev = { ...prev };
      if (value === undefined || value === '') {
        delete newPrev[key];
      } else {
        newPrev[key] = value as any;
      }
      return newPrev;
    });
  };

  // Handle select change
  const handleSelectChange = (key: keyof SearchParams, value: string) => {
    setFormValues(prev => ({ ...prev, [key]: value as any }));
  };

  // Handle specs toggle
  const handleSpecsChange = (checked: boolean) => {
    setFormValues(prev => {
      if (checked) {
        return { ...prev, specs: 'GCC' };
      } else {
        const { specs, ...rest } = prev;
        return rest;
      }
    });
  };

  // Handle emirate change
  const handleEmirateChange = (value: Emirate | undefined) => {
    setFormValues(prev => {
      if (value === undefined) {
        const { emirate, ...rest } = prev;
        return rest;
      } else {
        return { ...prev, emirate: value };
      }
    });
  };

  // Handle sort change
  const handleSortChange = (value: string) => {
    setFormValues(prev => ({ ...prev, sort: value }));
  };

  // Update URL when form values change (debounced)
  useEffect(() => {
    // Debounce to avoid too many URL updates
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

  // Calculate matching count (optional, we can skip for now to avoid extra query)
  // We'll leave the button as "Show Cars" and let the results page show the count.

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2">
            <div className="w-8 h-8 border-2 border-slate-300 rounded-full flex items-center justify-center text-slate-400">
              🔍
            </div>
            <p className="text-slate-500">Loading filters...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Hero Section */}
          <div className="text-center">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Find your next car in UAE / GCC
            </h1>
            <p className="text-slate-600 mt-2 max-w-xl mx-auto">
              Search thousands of verified cars with standardized photography and transparent pricing.
            </p>
          </div>

          {/* Search Form */}
          <form className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {/* Make */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Make</label>
              <select
                value={formValues.make || ''}
                onChange={(e) => handleSelectChange('make', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
              >
                <option value="">All Makes</option>
                {options?.makes.map((make) => (
                  <option key={make} value={make}>
                    {make}
                  </option>
                ))}
              </select>
            </div>

            {/* Model */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Model</label>
              <select
                value={formValues.model || ''}
                onChange={(e) => handleSelectChange('model', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                disabled={!formValues.make}
              >
                <option value="">All Models</option>
                {filteredModels.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Min */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Min Price (AED)</label>
              <input
                type="number"
                value={formValues.min_price || ''}
                onChange={(e) => handleChange('min_price', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                placeholder="e.g. 20000"
              />
            </div>

            {/* Price Max */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Max Price (AED)</label>
              <input
                type="number"
                value={formValues.max_price || ''}
                onChange={(e) => handleChange('max_price', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                placeholder="e.g. 200000"
              />
            </div>

            {/* Year Min */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Min Year</label>
              <select
                value={formValues.min_year || ''}
                onChange={(e) => handleChange('min_year', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
              >
                <option value="">All Years</option>
                {options?.years.map((year) => (
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
                value={formValues.max_year || ''}
                onChange={(e) => handleChange('max_year', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
              >
                <option value="">All Years</option>
                {options?.years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Max Mileage */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Max Mileage (km)</label>
              <input
                type="number"
                value={formValues.max_mileage || ''}
                onChange={(e) => handleChange('max_mileage', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
                placeholder="e.g. 100000"
              />
            </div>

            {/* GCC Specs */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formValues.specs === 'GCC'}
                  onChange={(e) => handleSpecsChange(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <span>GCC Specs</span>
              </label>
            </div>

            {/* Emirate */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Emirate</label>
              <select
                value={formValues.emirate || ''}
                onChange={(e) => handleEmirateChange(e.target.value as Emirate)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
              >
                <option value="">All Emirates</option>
                {[ 'Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain' ].map((emirate) => (
                  <option key={emirate} value={emirate}>
                    {emirate}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Sort By</label>
              <select
                value={formValues.sort || ''}
                onChange={(e) => handleSortChange(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
              >
                <option value="">Default (Newest)</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="mileage_asc">Mileage: Low to High</option>
                <option value="created_at_desc">Newest First</option>
              </select>
            </div>
          </form>

          {/* Action Button */}
          <div className="pt-4">
            <button
              onClick={() => {
                // The form already updates the URL via useEffect, so we can just trigger a search by submitting?
                // Actually we are already updating the URL on change, so we can just let the page reload.
                // We'll add a subtle visual feedback.
                router.refresh();
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow transition duration-200 flex items-center justify-center gap-2"
            >
              <span>Show Cars</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}