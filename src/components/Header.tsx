import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      {/* Accessibility Skip Link */}
      <a
        href="#calculator-section"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#0F2942] focus:text-white focus:rounded focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0F2942]"
      >
        Skip to Aggregate Calculator
      </a>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <a href="/" className="flex items-center space-x-3 focus-ring rounded">
          <div className="w-9 h-9 rounded bg-[#0F2942] text-white flex items-center justify-center font-bold text-lg tracking-wider" aria-hidden="true">
            UL
          </div>
          <div>
            <span className="font-bold text-slate-900 text-lg tracking-tight block leading-tight">
              UNILAG <span className="text-[#0F2942]">Aggregate Calculator</span>
            </span>
            <span className="text-xs text-slate-500 font-medium block">
              Undergraduate Admissions Estimator
            </span>
          </div>
        </a>

        <nav aria-label="Main Navigation" className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-600">
          <a href="/#calculator-section" className="hover:text-[#0F2942] transition-colors focus-ring rounded px-1">
            Calculator
          </a>
          <a href="/#cutoffs-section" className="hover:text-[#0F2942] transition-colors focus-ring rounded px-1">
            Department Cut-Offs
          </a>
          <a href="/how-to-calculate-unilag-aggregate" className="hover:text-[#0F2942] transition-colors focus-ring rounded px-1">
            Scoring Guide
          </a>
          <a href="/departmental-cut-off-marks-guide" className="hover:text-[#0F2942] transition-colors focus-ring rounded px-1">
            Cut-Offs Guide
          </a>
          <a href="/#faq-section" className="hover:text-[#0F2942] transition-colors focus-ring rounded px-1">
            FAQ
          </a>
        </nav>
      </div>
    </header>
  );
};
