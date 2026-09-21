'use client';

import React from 'react';

interface MicroDescriptionProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
}

export default function MicroDescription({
  value,
  onChange,
  maxLength = 350,
}: MicroDescriptionProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <label className="block text-xs font-medium text-slate-600">Quick Highlights / Notes</label>
        <span
          className={`text-[11px] font-mono ${
            value.length >= maxLength ? 'text-red-500 font-bold' : 'text-slate-400'
          }`}
        >
          {value.length}/{maxLength}
        </span>
      </div>
      <textarea
        rows={3}
        maxLength={maxLength}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g., GCC single owner, full agency history with Al Tayer, garage kept, brand new Michelin tires fitted last month."
        className="w-full text-xs rounded-lg border border-slate-300 p-2.5 outline-none focus:border-blue-600"
      />
    </div>
  );
}
