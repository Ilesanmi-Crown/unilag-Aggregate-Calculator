import React from 'react';

export const AdmissionDisclaimer: React.FC = () => {
  return (
    <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 sm:p-5 text-xs text-slate-600 space-y-2 leading-relaxed">
      <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
        <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Institutional Disclaimers & Accuracy Notice
      </div>
      <p>
        The <strong>UNILAG Aggregate Calculator</strong> is an independent academic resource designed to assist prospective Nigerian university candidates. It is <strong>not an official portal of the University of Lagos (UNILAG)</strong> and does not represent university management.
      </p>
      <p>
        Calculated aggregate scores are estimates derived from published University of Lagos modalities (JAMB 50%, Post-UTME 30%, O&apos;Level 20%). Achieving or exceeding a published departmental cut-off mark does <strong>not guarantee admission</strong> into any degree programme. Final admissions are determined exclusively by the UNILAG Central Admissions Committee and the Joint Admissions and Matriculation Board (JAMB CAPS).
      </p>
    </div>
  );
};
