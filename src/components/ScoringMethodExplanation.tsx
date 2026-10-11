import React from 'react';

export const ScoringMethodExplanation: React.FC = () => {
  return (
    <section id="scoring-rules-section" aria-labelledby="scoring-rules-title" className="space-y-6">
      <div className="border-b border-slate-200 pb-3">
        <h2 id="scoring-rules-title" className="text-xl sm:text-2xl font-extrabold text-[#0F2942] tracking-tight">
          Understanding the UNILAG Aggregate Scoring System
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          How the University of Lagos evaluates UTME candidates on a 100-point composite merit scale.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Component 1: UTME */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2">
          <div className="w-8 h-8 rounded-full bg-[#0F2942]/10 text-[#0F2942] font-bold text-sm flex items-center justify-center">
            50%
          </div>
          <h3 className="font-bold text-slate-900 text-base">JAMB / UTME Score</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Your UTME raw score (out of 400) is scaled down to 50 points by dividing by 8:
          </p>
          <div className="bg-slate-50 p-2.5 rounded font-mono text-xs font-semibold text-[#0F2942] text-center border border-slate-100">
            UTME Points = UTME Score ÷ 8
          </div>
          <p className="text-[11px] text-slate-500">
            * Minimum eligibility threshold: <strong>200 points</strong> in UTME.
          </p>
        </div>

        {/* Component 2: Post-UTME */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2">
          <div className="w-8 h-8 rounded-full bg-[#0F2942]/10 text-[#0F2942] font-bold text-sm flex items-center justify-center">
            30%
          </div>
          <h3 className="font-bold text-slate-900 text-base">Post-UTME Screening</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            The university administers an online Computer-Based Aptitude Test graded out of 30 marks:
          </p>
          <div className="bg-slate-50 p-2.5 rounded font-mono text-xs font-semibold text-[#0F2942] text-center border border-slate-100">
            PUTME Points = Test Raw Score
          </div>
          <p className="text-[11px] text-slate-500">
            * Historical pass mark: <strong>12.0 / 30 (40%)</strong> minimum.
          </p>
        </div>

        {/* Component 3: O'Level */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-2">
          <div className="w-8 h-8 rounded-full bg-[#0F2942]/10 text-[#0F2942] font-bold text-sm flex items-center justify-center">
            20%
          </div>
          <h3 className="font-bold text-slate-900 text-base">O&apos;Level Results (SSCE)</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Points derived from your 5 required subjects obtained at <strong>ONE SITTING ONLY</strong>:
          </p>
          <div className="bg-slate-50 p-2.5 rounded font-mono text-xs font-semibold text-[#0F2942] text-center border border-slate-100">
            O&apos;Level Points = Sum of 5 Grades
          </div>
          <p className="text-[11px] text-slate-500">
            * Biomedical Engineering requires 6 subjects.
          </p>
        </div>
      </div>

      {/* Grade Conversion Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
        <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">
          Official O&apos;Level Grade-to-Point Conversion Scale
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <th className="p-2.5">O&apos;Level Grade</th>
                <th className="p-2.5">Raw Point Scale (out of 10)</th>
                <th className="p-2.5">Aggregate Point Scale (out of 4.0)</th>
                <th className="p-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="p-2.5 font-bold text-emerald-700">A1 (Excellent)</td>
                <td className="p-2.5">10 points</td>
                <td className="p-2.5 font-bold">4.0 points</td>
                <td className="p-2.5 text-emerald-600">Credit Pass</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold text-emerald-700">B2 (Very Good)</td>
                <td className="p-2.5">9 points</td>
                <td className="p-2.5 font-bold">3.6 points</td>
                <td className="p-2.5 text-emerald-600">Credit Pass</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold text-emerald-700">B3 (Good)</td>
                <td className="p-2.5">8 points</td>
                <td className="p-2.5 font-bold">3.2 points</td>
                <td className="p-2.5 text-emerald-600">Credit Pass</td>
              </tr>
              <tr>
                <td className="p-2.5 font-semibold text-slate-800">C4 (Credit)</td>
                <td className="p-2.5">7 points</td>
                <td className="p-2.5 font-bold">2.8 points</td>
                <td className="p-2.5 text-emerald-600">Credit Pass</td>
              </tr>
              <tr>
                <td className="p-2.5 font-semibold text-slate-800">C5 (Credit)</td>
                <td className="p-2.5">6 points</td>
                <td className="p-2.5 font-bold">2.4 points</td>
                <td className="p-2.5 text-emerald-600">Credit Pass</td>
              </tr>
              <tr>
                <td className="p-2.5 font-semibold text-slate-800">C6 (Credit)</td>
                <td className="p-2.5">5 points</td>
                <td className="p-2.5 font-bold">2.0 points</td>
                <td className="p-2.5 text-emerald-600">Minimum Qualifying Credit</td>
              </tr>
              <tr className="bg-red-50/40">
                <td className="p-2.5 text-red-600">D7 / E8 / F9 (Fail)</td>
                <td className="p-2.5">0 points</td>
                <td className="p-2.5 font-bold text-red-600">0.0 points</td>
                <td className="p-2.5 text-red-600">Disqualifying / Non-Credit</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
