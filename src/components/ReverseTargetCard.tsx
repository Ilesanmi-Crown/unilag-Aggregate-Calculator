import React from 'react';
import { TargetCalculationResult } from '../core/types';

interface ReverseTargetCardProps {
  targetResult: TargetCalculationResult | null;
  error?: string;
}

export const ReverseTargetCard: React.FC<ReverseTargetCardProps> = ({
  targetResult,
  error
}) => {
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
    >
      <div className="bg-[#0F2942] px-4 py-3 text-white flex items-center justify-between">
        <h3 className="font-bold text-sm tracking-wide uppercase">
          Target Mode Analysis (Reverse)
        </h3>
        {targetResult && (
          <span
            className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
              targetResult.status === 'ACHIEVABLE'
                ? 'bg-emerald-400 text-emerald-950'
                : targetResult.status === 'ALREADY_SURPASSED'
                ? 'bg-sky-400 text-sky-950'
                : 'bg-red-400 text-red-950'
            }`}
          >
            {targetResult.status.replace(/_/g, ' ')}
          </span>
        )}
      </div>

      <div className="p-4 sm:p-6 space-y-4">
        {error ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-900 text-sm flex items-start gap-2.5">
            <svg className="w-5 h-5 text-red-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <strong className="font-semibold block mb-0.5">Target Analysis Paused</strong>
              {error}
            </div>
          </div>
        ) : !targetResult ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            Enter your target aggregate, UTME score, and O&apos;Level grades above to calculate your required Post-UTME score.
          </div>
        ) : (
          <>
            {/* Required Score Highlight */}
            <div className={`text-center rounded-xl p-5 border ${
              targetResult.status === 'ACHIEVABLE'
                ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                : targetResult.status === 'ALREADY_SURPASSED'
                ? 'bg-sky-50/60 border-sky-200 text-sky-950'
                : 'bg-red-50/60 border-red-200 text-red-950'
            }`}>
              <span className="text-xs font-semibold uppercase tracking-wider block opacity-75">
                Required Post-UTME Aptitude Test Score
              </span>
              <div className="text-4xl sm:text-5xl font-black tracking-tight my-1.5">
                {targetResult.status === 'ALREADY_SURPASSED'
                  ? '0.000'
                  : targetResult.status === 'MATHEMATICALLY_IMPOSSIBLE'
                  ? 'N/A'
                  : targetResult.requiredPutmeScoreFormatted}
                <span className="text-lg sm:text-xl font-normal opacity-60 ml-1">/ 30.000</span>
              </div>
              <p className="text-xs sm:text-sm font-medium mt-2 leading-relaxed">
                {targetResult.message}
              </p>
            </div>

            {/* Score Composition Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <span className="text-slate-500 block">Target Aggregate:</span>
                <strong className="text-sm text-slate-900 font-bold block mt-0.5">
                  {targetResult.targetAggregate.toFixed(3)}
                </strong>
              </div>
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <span className="text-slate-500 block">UTME + O&apos;Level Points:</span>
                <strong className="text-sm text-slate-900 font-bold block mt-0.5">
                  {targetResult.currentPointsFromUtmeAndOlevel.toFixed(3)} / 70.000
                </strong>
              </div>
            </div>

            {/* Warning if below historical pass mark */}
            {targetResult.warning && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-950 flex items-start gap-2" role="alert">
                <span className="text-amber-700 font-bold text-base leading-none">!</span>
                <span>{targetResult.warning}</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
