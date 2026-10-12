import React from 'react';

export const OcrPrivacyNotice: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 px-2.5 py-1.5 rounded-md border border-emerald-200">
        <svg className="w-4 h-4 shrink-0 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <span>
          <strong>100% In-Browser Privacy:</strong> Your result image never leaves your device. No cloud storage, no server tracking.
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-3.5 text-xs text-emerald-900 space-y-1">
      <div className="flex items-center gap-2 font-semibold text-emerald-950">
        <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <span>Strict Client-Side Privacy Guarantee</span>
      </div>
      <p className="text-emerald-800 leading-relaxed">
        Optical character recognition runs entirely inside your browser using Web Workers and WebAssembly. Your photos, scores, and names are <strong>never uploaded to any server, database, or external service</strong>.
      </p>
    </div>
  );
};
