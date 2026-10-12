'use client';

import React, { useState } from 'react';
import { MultiSlotCompletePayload, OcrReviewPayload } from '../../ocr/types';
import { GRADE_POINTS_DISPLAY } from '../OlevelSelector';

interface FinalReviewScreenProps {
  data: MultiSlotCompletePayload;
  onApplyAll: (payload: MultiSlotCompletePayload) => void;
  onEditCategory: (category: 'UTME' | 'PUTME' | 'OLEVEL') => void;
  onBack: () => void;
}

export const FinalReviewScreen: React.FC<FinalReviewScreenProps> = ({
  data,
  onApplyAll,
  onEditCategory,
  onBack
}) => {
  // Local editable values for rapid inline adjustments before final apply
  const [utmeScore, setUtmeScore] = useState<number>(data.utme.utmeScore ?? 0);
  const [putmeScore, setPutmeScore] = useState<number>(data.putme.putmeScore ?? 0);
  const [olevelSubjects, setOlevelSubjects] = useState(data.olevel.olevelSubjects ?? []);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // UTME Points (50% scale)
  const utmePoints = Math.round(utmeScore * 0.125 * 1000) / 1000;

  // Post-UTME Points (30% scale)
  const putmePoints = Math.round(putmeScore * 1000) / 1000;

  // O'Level Points (20% scale, max 20)
  const olevelPoints = Math.round(
    olevelSubjects.slice(0, 5).reduce((acc, curr) => {
      return acc + (GRADE_POINTS_DISPLAY[curr.grade]?.points || 0);
    }, 0) * 1000
  ) / 1000;

  const estimatedAggregate = (utmePoints + putmePoints + olevelPoints).toFixed(3);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (isNaN(utmeScore) || utmeScore < 0 || utmeScore > 400) {
      setErrorMsg('UTME score must be between 0 and 400.');
      return;
    }

    if (isNaN(putmeScore) || putmeScore < 0 || putmeScore > 30) {
      setErrorMsg('Post-UTME score must be between 0.000 and 30.000.');
      return;
    }

    if (olevelSubjects.length < 5) {
      setErrorMsg('O\'Level result must contain at least 5 subjects.');
      return;
    }

    const updatedPayload: MultiSlotCompletePayload = {
      utme: {
        ...data.utme,
        utmeScore
      },
      putme: {
        ...data.putme,
        putmeScore
      },
      olevel: {
        ...data.olevel,
        olevelSubjects
      }
    };

    onApplyAll(updatedPayload);
  };

  return (
    <div className="space-y-6">
      {/* Title & Guidance */}
      <div className="pb-3 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#0F2942]">
              Final Review: All 3 Results Confirmed
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Review and verify your credentials before applying them to the UNILAG aggregate calculator.
            </p>
          </div>
          <div className="hidden sm:block text-right">
            <span className="text-xs text-slate-400 font-medium">Estimated Aggregate</span>
            <div className="text-lg font-bold text-[#0F2942]">{estimatedAggregate} / 100</div>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Section 1: JAMB UTME Result */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center">
                1
              </span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                JAMB UTME Result (50% Weight)
              </h4>
            </div>
            <button
              type="button"
              onClick={() => onEditCategory('UTME')}
              className="text-xs font-semibold text-[#0F2942] hover:underline"
            >
              Edit in Scanner
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Total UTME Score
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="400"
                  value={utmeScore}
                  onChange={(e) => setUtmeScore(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-1.5 text-sm font-bold border border-slate-300 rounded focus-ring"
                />
                <span className="absolute right-2.5 top-1.5 text-xs text-slate-400 font-medium">
                  / 400
                </span>
              </div>
            </div>

            <div>
              <span className="block text-[11px] font-semibold text-slate-600 mb-1">
                Converted Points (50%)
              </span>
              <div className="px-3 py-1.5 text-sm font-bold text-[#0F2942] bg-slate-50 border border-slate-200 rounded">
                {utmePoints.toFixed(3)} pts
              </div>
            </div>

            <div>
              <span className="block text-[11px] font-semibold text-slate-600 mb-1">
                Exam Details
              </span>
              <div className="px-3 py-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded truncate">
                {data.utme.examYear ? `Year: ${data.utme.examYear}` : 'Verified Slip'}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: UNILAG Post-UTME Result */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center">
                2
              </span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                UNILAG Post-UTME Result (30% Weight)
              </h4>
            </div>
            <button
              type="button"
              onClick={() => onEditCategory('PUTME')}
              className="text-xs font-semibold text-[#0F2942] hover:underline"
            >
              Edit in Scanner
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Screening Score
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="30"
                  step="0.001"
                  value={putmeScore}
                  onChange={(e) => setPutmeScore(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 text-sm font-bold border border-slate-300 rounded focus-ring"
                />
                <span className="absolute right-2.5 top-1.5 text-xs text-slate-400 font-medium">
                  / 30
                </span>
              </div>
            </div>

            <div>
              <span className="block text-[11px] font-semibold text-slate-600 mb-1">
                Converted Points (30%)
              </span>
              <div className="px-3 py-1.5 text-sm font-bold text-[#0F2942] bg-slate-50 border border-slate-200 rounded">
                {putmePoints.toFixed(3)} pts
              </div>
            </div>

            <div>
              <span className="block text-[11px] font-semibold text-slate-600 mb-1">
                Exam Details
              </span>
              <div className="px-3 py-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded truncate">
                {data.putme.examYear ? `Session: ${data.putme.examYear}` : 'Verified Slip'}
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: WAEC / O'Level Result */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center">
                3
              </span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                WAEC / O'Level Result (20% Weight • Top 5 Subjects)
              </h4>
            </div>
            <button
              type="button"
              onClick={() => onEditCategory('OLEVEL')}
              className="text-xs font-semibold text-[#0F2942] hover:underline"
            >
              Edit in Scanner
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {olevelSubjects.slice(0, 5).map((sub, idx) => (
              <div
                key={idx}
                className="p-2 rounded bg-slate-50 border border-slate-200 text-center space-y-0.5"
              >
                <div className="text-[11px] font-medium text-slate-600 truncate" title={sub.subjectName}>
                  {sub.subjectName}
                </div>
                <div className="text-sm font-bold text-[#0F2942]">
                  {sub.grade}
                </div>
                <div className="text-[10px] text-slate-400 font-medium">
                  {GRADE_POINTS_DISPLAY[sub.grade]?.points ?? 0} pts
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
            <span>
              Cumulative O'Level Points: <strong className="text-[#0F2942]">{olevelPoints.toFixed(3)}</strong> / 20.000 pts
            </span>
            <span>
              {data.olevel.examBody || 'WAEC'} {data.olevel.examYear || ''}
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onBack}
            className="w-full sm:w-auto px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
          >
            ← Return to Upload Slots
          </button>

          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-[#0F2942] hover:bg-[#163859] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            Apply All Confirmed Scores to Calculator →
          </button>
        </div>
      </form>
    </div>
  );
};
