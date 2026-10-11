import React from 'react';

interface UtmeInputProps {
  value: string;
  onChange: (val: string) => void;
  error?: string;
}

export const UtmeInput: React.FC<UtmeInputProps> = ({
  value,
  onChange,
  error
}) => {
  const numericValue = parseInt(value, 10);
  const isBelow200 = !isNaN(numericValue) && numericValue > 0 && numericValue < 200;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor="utme-score-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
          JAMB / UTME Score
        </label>
        <span className="text-xs text-slate-500 font-medium">
          Scale: 0 – 400 (50% Weight)
        </span>
      </div>

      <div className="relative">
        <input
          type="number"
          id="utme-score-input"
          min="0"
          max="400"
          step="1"
          placeholder="e.g. 280"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby="utme-help-text utme-error-text"
          className={`w-full px-3.5 py-2.5 rounded-lg border text-base font-semibold text-slate-900 bg-white transition-all focus-ring ${
            error
              ? 'border-red-400 bg-red-50/30'
              : isBelow200
              ? 'border-amber-400 bg-amber-50/20'
              : 'border-slate-300 hover:border-slate-400'
          }`}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-xs text-slate-400 font-medium">
          / 400
        </div>
      </div>

      {error ? (
        <p id="utme-error-text" className="text-xs font-medium text-red-600 flex items-center gap-1">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      ) : isBelow200 ? (
        <p id="utme-error-text" className="text-xs font-medium text-amber-700 flex items-center gap-1">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          UNILAG requires a minimum UTME score of 200 for screening eligibility.
        </p>
      ) : (
        <p id="utme-help-text" className="text-xs text-slate-500">
          Conversion: Score is divided by 8 (e.g. 280 / 8 = 35.000 points out of 50).
        </p>
      )}
    </div>
  );
};
