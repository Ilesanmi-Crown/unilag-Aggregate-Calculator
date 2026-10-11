import React from 'react';

export const CompactHero: React.FC = () => {
  return (
    <section className="bg-slate-100/70 border-b border-slate-200 py-6 sm:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-200/80 text-slate-800 text-xs font-semibold mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500" aria-hidden="true"></span>
            Official 50:30:20 Formula Implementation
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0F2942] tracking-tight leading-tight">
            Calculate Your UNILAG Admission Aggregate
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-700 leading-relaxed">
            Accurately compute your undergraduate admission score across <strong>UTME (50%)</strong>, <strong>Post-UTME (30%)</strong>, and <strong>O&apos;Level (20%)</strong>. Compare your results with officially published departmental cut-off marks.
          </p>
        </div>
      </div>
    </section>
  );
};
