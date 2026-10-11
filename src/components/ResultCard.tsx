import React from 'react';
import { AggregateResult } from '../core/types';

interface ResultCardProps {
  result: AggregateResult | null;
  error?: string;
}

export const ResultCard: React.FC<ResultCardProps> = ({ result, error }) => {
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
    >
      <div className="bg-[#0F2942] px-4 py-3 text-white flex items-center justify-between">
        <h3 className="font-bold text-sm tracking-wide uppercase">
          Aggregate Score Assessment
        </h3>
        {result && (
          <span
            className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
              result.isPreliminary
                ? 'bg-amber-400 text-amber-950'
                : 'bg-emerald-400 text-emerald-950'
            }`}
          >
            {result.verificationStatus}
          </span>
        )}
      </div>

      <div className="p-4 sm:p-6 space-y-5">
        {error ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-900 text-sm flex items-start gap-2.5">
            <svg className="w-5 h-5 text-red-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <strong className="font-semibold block mb-0.5">Calculation Paused</strong>
              {error}
            </div>
          </div>
        ) : !result ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            Enter your UTME, Post-UTME, and O&apos;Level grades above to compute your aggregate score.
          </div>
        ) : (
          <>
            {/* Aggregate Hero Number */}
            <div className="text-center bg-slate-50 rounded-xl p-4 border border-slate-100">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Total UNILAG Aggregate Score
              </span>
              <div className="text-4xl sm:text-5xl font-black text-[#0F2942] tracking-tight my-1">
                {result.breakdown.formatted.totalAggregate}
                <span className="text-lg sm:text-xl font-medium text-slate-400 ml-1">/ 100.000</span>
              </div>
              <span className="text-xs text-slate-600 font-medium">
                Academic Session: <strong>{result.session}</strong>
              </span>
            </div>

            {/* Component Breakdown Grid */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Scoring Breakdown by Component
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* UTME */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <span className="text-xs text-slate-500 block font-medium">UTME (50%)</span>
                  <div className="text-lg font-bold text-[#0F2942]">
                    {result.breakdown.formatted.utmePoints}
                    <span className="text-xs font-normal text-slate-400"> / 50</span>
                  </div>
                  <span className="text-[11px] text-slate-500 block mt-0.5">UTME Score / 8</span>
                </div>

                {/* Post-UTME */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <span className="text-xs text-slate-500 block font-medium">Post-UTME (30%)</span>
                  <div className="text-lg font-bold text-[#0F2942]">
                    {result.breakdown.formatted.putmePoints}
                    <span className="text-xs font-normal text-slate-400"> / 30</span>
                  </div>
                  <span className="text-[11px] text-slate-500 block mt-0.5">Online Screening Score</span>
                </div>

                {/* O'Level */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <span className="text-xs text-slate-500 block font-medium">O&apos;Level (20%)</span>
                  <div className="text-lg font-bold text-[#0F2942]">
                    {result.breakdown.formatted.olevelPoints}
                    <span className="text-xs font-normal text-slate-400"> / 20</span>
                  </div>
                  <span className="text-[11px] text-slate-500 block mt-0.5">Best 5 / 6 Relevant Credits</span>
                </div>
              </div>
            </div>

            {/* Screening Eligibility Checklist */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Screening Eligibility Status
              </h4>
              <ul className="space-y-1.5 text-xs">
                <li className="flex items-center gap-2 text-slate-700">
                  <span className={result.eligibility.meetsUtmeMinimum ? 'text-emerald-600 font-bold' : 'text-red-600 font-bold'}>
                    {result.eligibility.meetsUtmeMinimum ? '✓' : '✗'}
                  </span>
                  <span>Minimum UTME Score: <strong>200 Points</strong></span>
                </li>
                <li className="flex items-center gap-2 text-slate-700">
                  <span className={result.eligibility.meetsSittingsRequirement ? 'text-emerald-600 font-bold' : 'text-red-600 font-bold'}>
                    {result.eligibility.meetsSittingsRequirement ? '✓' : '✗'}
                  </span>
                  <span>Single Sitting Requirement: <strong>1 Sitting Only</strong></span>
                </li>
                <li className="flex items-center gap-2 text-slate-700">
                  <span className={result.eligibility.hasRequiredCreditCount ? 'text-emerald-600 font-bold' : 'text-red-600 font-bold'}>
                    {result.eligibility.hasRequiredCreditCount ? '✓' : '✗'}
                  </span>
                  <span>Required O&apos;Level Credits (C6 or higher): <strong>All Required Subjects</strong></span>
                </li>
              </ul>
            </div>

            {/* Warnings list */}
            {result.eligibility.warnings.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100" role="alert">
                <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                  Admission Advisory Notices ({result.eligibility.warnings.length})
                </h4>
                <div className="space-y-1.5">
                  {result.eligibility.warnings.map((w, i) => (
                    <div key={i} className="p-2.5 bg-amber-50 border border-amber-200 rounded text-xs text-amber-950 flex items-start gap-2">
                      <span className="text-amber-700 font-bold shrink-0 mt-0.5">•</span>
                      <span>{w}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
