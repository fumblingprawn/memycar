import { useState } from 'react';

// Import types from our listing types
import type { Emirate, ServiceHistory, PaintCondition, WarrantyStatus, VehicleSpec } from '@/types/listing';

interface StructuredSelectorProps {
  className?: string;
  // Values (controlled)
  year: number | null;
  make: string | null;
  model: string | null;
  trim: string | null;
  spec: VehicleSpec | null;
  emirate: Emirate | null;
  serviceHistory: ServiceHistory | null;
  paintCondition: PaintCondition | null;
  warranty: WarrantyStatus | null;
  keysCount: 1 | 2 | null;

  // Change handlers
  onYearChange: (value: number | null) => void;
  onMakeChange: (value: string | null) => void;
  onModelChange: (value: string | null) => void;
  onTrimChange: (value: string | null) => void;
  onSpecChange: (value: VehicleSpec | null) => void;
  onEmirateChange: (value: Emirate | null) => void;
  onServiceHistoryChange: (value: ServiceHistory | null) => void;
  onPaintChange: (value: PaintCondition | null) => void;
  onWarrantyChange: (value: WarrantyStatus | null) => void;
  onKeysChange: (value: 1 | 2 | null) => void;
}

interface SelectorOption<T> {
  value: T;
  label: string;
}

const StructuredSelector: React.FC<StructuredSelectorProps> = ({
  className,
  year,
  make,
  model,
  trim,
  spec,
  emirate,
  serviceHistory,
  paintCondition,
  warranty,
  keysCount,
  onYearChange,
  onMakeChange,
  onModelChange,
  onTrimChange,
  onSpecChange,
  onEmirateChange,
  onServiceHistoryChange,
  onPaintChange,
  onWarrantyChange,
  onKeysChange
}) => {
  // Define options for each selector
  const yearOptions: SelectorOption<number>[] = Array.from({ length: 30 }, (_, i) => ({
    value: new Date().getFullYear() - i,
    label: String(new Date().getFullYear() - i)
  })).slice(0, 25); // Last 25 years

  // Common car makes for UAE market
  const makeOptions: SelectorOption<string>[] = [
    { value: 'Toyota', label: 'Toyota' },
    { value: 'Nissan', label: 'Nissan' },
    { value: 'Honda', label: 'Honda' },
    { value: 'BMW', label: 'BMW' },
    { value: 'Mercedes-Benz', label: 'Mercedes-Benz' },
    { value: 'Hyundai', label: 'Hyundai' },
    { value: 'Kia', label: 'Kia' },
    { value: 'Ford', label: 'Ford' },
    { value: 'Chevrolet', label: 'Chevrolet' },
    { value: 'Lexus', label: 'Lexus' },
    { value: 'Mazda', label: 'Mazda' },
    { value: 'Mitsubishi', label: 'Mitsubishi' },
    { value: 'Volkswagen', label: 'Volkswagen' },
    { value: 'Audi', label: 'Audi' },
    { value: 'Porsche', label: 'Porsche' }
  ];

  // Emirate options
  const emirateOptions: SelectorOption<Emirate>[] = [
    { value: 'Dubai', label: 'Dubai' },
    { value: 'Abu Dhabi', label: 'Abu Dhabi' },
    { value: 'Sharjah', label: 'Sharjah' },
    { value: 'Ajman', label: 'Ajman' },
    { value: 'Ras Al Khaimah', label: 'Ras Al Khaimah' },
    { value: 'Fujairah', label: 'Fujairah' },
    { value: 'Umm Al Quwain', label: 'Umm Al Quwain' }
  ];

  // Spec options
  const specOptions: SelectorOption<VehicleSpec>[] = [
    { value: 'GCC', label: 'GCC Specs' },
    { value: 'American', label: 'American' },
    { value: 'Japanese', label: 'Japanese' },
    { value: 'European', label: 'European' }
  ];

  // Service history options
  const serviceHistoryOptions: SelectorOption<ServiceHistory>[] = [
    { value: 'Full Agency', label: 'Full Agency' },
    { value: 'Regular/Specialist', label: 'Regular/Specialist' },
    { value: 'Partial/None', label: 'Partial/None' }
  ];

  // Paint condition options
  const paintOptions: SelectorOption<PaintCondition>[] = [
    { value: 'Original Paint', label: 'Original Paint' },
    { value: 'Minor Touch-ups', label: 'Minor Touch-ups' },
    { value: 'Repainted', label: 'Repainted' }
  ];

  // Warranty options
  const warrantyOptions: SelectorOption<WarrantyStatus>[] = [
    { value: 'Under Agency Warranty', label: 'Under Warranty' },
    { value: 'Dealer/Third-Party', label: 'Dealer Warranty' },
    { value: 'Expired/None', label: 'Expired/None' }
  ];

  // Keys options
  const keysOptions: SelectorOption<1 | 2>[] = [
    { value: 2, label: '2 Keys' },
    { value: 1, label: '1 Key' }
  ];

  return (
    <div className={`${className} space-y-6`}>
      {/* Basic Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Basic Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Year</label>
            <select
              value={year ?? ''}
              onChange={(e) => onYearChange(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">Select Year</option>
              {yearOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Make</label>
            <select
              value={make ?? ''}
              onChange={(e) => onMakeChange(e.target.value || null)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">Select Make</option>
              {makeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Model</label>
            <input
              type="text"
              placeholder="e.g., Camry, C-Class, F-150"
              value={model ?? ''}
              onChange={(e) => onModelChange(e.target.value || null)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Trim (Optional)</label>
            <input
              type="text"
              placeholder="e.g., LE, XLE, Sport, AMG Line"
              value={trim ?? ''}
              onChange={(e) => onTrimChange(e.target.value || null)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Specifications */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Specifications</h3>
        <div className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Specification</label>
            <div className="flex flex-wrap gap-2">
              {specOptions.map(option => (
                <label
                  key={option.value}
                  className={`inline-flex items-center px-3 py-2 border border-gray-300 rounded-full text-sm font-medium
                           ${spec === option.value ? 'bg-blue-500 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}
                           transition-all cursor-pointer`}
                >
                  <input
                    type="radio"
                    value={option.value}
                    checked={spec === option.value}
                    onChange={() => onSpecChange(option.value)}
                    className="hidden peer"
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Emirate</label>
            <div className="flex flex-wrap gap-2">
              {emirateOptions.map(option => (
                <label
                  key={option.value}
                  className={`inline-flex items-center px-3 py-2 border border-gray-300 rounded-full text-sm font-medium
                           ${emirate === option.value ? 'bg-blue-500 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}
                           transition-all cursor-pointer`}
                >
                  <input
                    type="radio"
                    value={option.value}
                    checked={emirate === option.value}
                    onChange={() => onEmirateChange(option.value)}
                    className="hidden peer"
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Service History</label>
            <div className="flex flex-wrap gap-2">
              {serviceHistoryOptions.map(option => (
                <label
                  key={option.value}
                  className={`inline-flex items-center px-3 py-2 border border-gray-300 rounded-full text-sm font-medium
                           ${serviceHistory === option.value ? 'bg-blue-500 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}
                           transition-all cursor-pointer`}
                >
                  <input
                    type="radio"
                    value={option.value}
                    checked={serviceHistory === option.value}
                    onChange={() => onServiceHistoryChange(option.value)}
                    className="hidden peer"
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Paint Condition</label>
            <div className="flex flex-wrap gap-2">
              {paintOptions.map(option => (
                <label
                  key={option.value}
                  className={`inline-flex items-center px-3 py-2 border border-gray-300 rounded-full text-sm font-medium
                           ${paintCondition === option.value ? 'bg-blue-500 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}
                           transition-all cursor-pointer`}
                >
                  <input
                    type="radio"
                    value={option.value}
                    checked={paintCondition === option.value}
                    onChange={() => onPaintChange(option.value)}
                    className="hidden peer"
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Warranty Status</label>
            <div className="flex flex-wrap gap-2">
              {warrantyOptions.map(option => (
                <label
                  key={option.value}
                  className={`inline-flex items-center px-3 py-2 border border-gray-300 rounded-full text-sm font-medium
                           ${warranty === option.value ? 'bg-blue-500 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}
                           transition-all cursor-pointer`}
                >
                  <input
                    type="radio"
                    value={option.value}
                    checked={warranty === option.value}
                    onChange={() => onWarrantyChange(option.value)}
                    className="hidden peer"
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Keys Available</label>
            <div className="flex flex-wrap gap-2">
              {keysOptions.map(option => (
                <label
                  key={option.value}
                  className={`inline-flex items-center px-3 py-2 border border-gray-300 rounded-full text-sm font-medium
                           ${keysCount === option.value ? 'bg-blue-500 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}
                           transition-all cursor-pointer`}
                >
                  <input
                    type="radio"
                    value={option.value}
                    checked={keysCount === option.value}
                    onChange={() => onKeysChange(option.value)}
                    className="hidden peer"
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StructuredSelector;