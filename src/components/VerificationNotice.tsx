import React from 'react';

interface VerificationNoticeProps {
  session: string;
  isPreliminary: boolean;
  allowPreliminary: boolean;
  onTogglePreliminary: (allow: boolean) => void;
}

export const VerificationNotice: React.FC<VerificationNoticeProps> = ({
  session,
  isPreliminary,
  allowPreliminary,
  onTogglePreliminary
}) => {
  if (!isPreliminary) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs sm:text-sm text-emerald-900 flex items-start gap-2.5">
        <svg className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <strong className="font-semibold text-emerald-950">Verified Official Modalities:</strong> The scoring formula and O&apos;Level grade mapping for the <strong>{session}</strong> academic session are verified from official University of Lagos Admissions notices.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 text-xs sm:text-sm text-amber-950 space-y-3" role="alert">
      <div className="flex items-start gap-2.5">
        <svg className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div>
          <strong className="font-semibold text-amber-950 block mb-1">
            Preliminary / Unverified Session Notice ({session}):
          </strong>
          <p className="text-amber-900 leading-relaxed">
            The University of Lagos has officially released 2026/2027 screening cut-offs, but has <strong>not yet published an independent 2026/2027 scoring circular</strong> with standalone grade-point values. By default, calculations for {session} are paused to prevent presenting unverified formulas as official policy.
          </p>
        </div>
      </div>

      <div className="pt-2 border-t border-amber-200 flex items-start gap-3">
        <input
          type="checkbox"
          id="opt-in-preliminary"
          checked={allowPreliminary}
          onChange={(e) => onTogglePreliminary(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-amber-400 text-[#0F2942] focus:ring-[#0F2942]"
        />
        <label htmlFor="opt-in-preliminary" className="text-xs font-medium text-amber-950 cursor-pointer select-none">
          I understand that this is an <strong>estimated simulation</strong> using inherited 2025/2026 scoring rules, not an officially gazetted 2026/2027 scoring decree.
        </label>
      </div>
    </div>
  );
};
