'use client';

import React, { useState } from 'react';
import {
  ExtractedResultData,
  ExtractedUtmeData,
  ExtractedOlevelData,
  ExtractedPutmeData,
  OcrReviewPayload
} from '../../ocr/types';
import { SubjectGrade, OlevelGrade } from '../../core/types';
import { GRADE_POINTS_DISPLAY } from '../OlevelSelector';

interface OcrReviewFormProps {
  data: ExtractedResultData;
  imageUrl?: string;
  onConfirm: (payload: OcrReviewPayload) => void;
  onCancel: () => void;
  onRescan: () => void;
}

const VALID_GRADES: OlevelGrade[] = ['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9'];

export const OcrReviewForm: React.FC<OcrReviewFormProps> = ({
  data,
  imageUrl,
  onConfirm,
  onCancel,
  onRescan
}) => {
  const [showImagePreview, setShowImagePreview] = useState<boolean>(true);
  const [formError, setFormError] = useState<string | null>(null);

  // UTME State
  const [utmeScore, setUtmeScore] = useState<string>(
    data.category === 'UTME' && data.totalScore !== undefined ? String(data.totalScore) : ''
  );

  // Post-UTME State
  const [putmeScore, setPutmeScore] = useState<string>(
    data.category === 'PUTME' && data.score !== undefined ? String(data.score) : ''
  );

  // O'Level State
  const [olevelSubjects, setOlevelSubjects] = useState<SubjectGrade[]>(() => {
    if (data.category === 'OLEVEL' && data.subjects.length > 0) {
      return data.subjects.map((s) => ({
        subjectName: s.subjectName,
        grade: s.grade
      }));
    }
    return [
      { subjectName: 'English Language', grade: 'A1' },
      { subjectName: 'Mathematics', grade: 'B2' },
      { subjectName: 'Physics', grade: 'B3' },
      { subjectName: 'Chemistry', grade: 'C4' },
      { subjectName: 'Biology', grade: 'C5' }
    ];
  });

  const handleUpdateOlevel = (index: number, field: 'subjectName' | 'grade', value: string) => {
    setOlevelSubjects((prev) => {
      const next = [...prev];
      if (field === 'grade') {
        next[index] = { ...next[index], grade: value as OlevelGrade };
      } else {
        next[index] = { ...next[index], subjectName: value };
      }
      return next;
    });
  };

  const handleAddOlevelSubject = () => {
    if (olevelSubjects.length >= 9) return;
    setOlevelSubjects((prev) => [...prev, { subjectName: 'Civic Education', grade: 'B3' }]);
  };

  const handleRemoveOlevelSubject = (index: number) => {
    if (olevelSubjects.length <= 5) {
      setFormError('UNILAG aggregate scoring requires at least 5 subjects.');
      return;
    }
    setFormError(null);
    setOlevelSubjects((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (data.category === 'UTME') {
      const parsed = parseInt(utmeScore.trim(), 10);
      if (isNaN(parsed) || parsed < 0 || parsed > 400) {
        setFormError('Please enter a valid UTME score between 0 and 400.');
        return;
      }
      onConfirm({
        category: 'UTME',
        utmeScore: parsed,
        examYear: data.examYear
      });
    } else if (data.category === 'PUTME') {
      const parsed = parseFloat(putmeScore.trim());
      if (isNaN(parsed) || parsed < 0 || parsed > 30.0) {
        setFormError('Please enter a valid UNILAG Post-UTME score between 0.000 and 30.000.');
        return;
      }
      onConfirm({
        category: 'PUTME',
        putmeScore: Math.round(parsed * 1000) / 1000,
        examYear: data.examYear
      });
    } else if (data.category === 'OLEVEL') {
      if (olevelSubjects.length < 5) {
        setFormError('At least 5 subjects are required for aggregate calculation.');
        return;
      }
      // Check duplicate subjects among the first 5
      const active = olevelSubjects.slice(0, 5);
      const seen = new Set<string>();
      for (const item of active) {
        const lower = item.subjectName.trim().toLowerCase();
        if (seen.has(lower)) {
          setFormError(`Duplicate subject detected: "${item.subjectName}". Each of the 5 subjects must be distinct.`);
          return;
        }
        seen.add(lower);
      }
      onConfirm({
        category: 'OLEVEL',
        olevelSubjects: olevelSubjects.slice(0, 5),
        examBody: data.examBody,
        examYear: data.examYear
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Guidance */}
      <div className="border-b border-slate-200 pb-3">
        <h3 className="text-lg font-bold text-[#0F2942]">
          Review & Confirm Scanned Credentials
        </h3>
        <p className="text-xs text-slate-600 mt-1">
          Optical character recognition may occasionally misread characters. Compare the extracted values with your document and edit any corrections below.
        </p>
      </div>

      {/* Uncertainty Warnings if detected */}
      {data.uncertainties.length > 0 && (
        <div className="rounded-lg bg-amber-50 border border-amber-300 p-3.5 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
            <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>Items Requiring Verification</span>
          </div>
          <ul className="text-xs text-amber-800 list-disc list-inside space-y-1 pl-1">
            {data.uncertainties.map((u, i) => (
              <li key={i}>{u}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Form Error Banner */}
      {formError && (
        <div className="rounded-md bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800 font-medium">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Category Specific Form Fields */}
        {data.category === 'UTME' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Total UTME Score (0 – 400)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="400"
                    value={utmeScore}
                    onChange={(e) => setUtmeScore(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-lg font-bold text-slate-900 focus-ring"
                    placeholder="e.g. 290"
                  />
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-slate-400 font-semibold pointer-events-none">
                    / 400
                  </span>
                </div>
              </div>

              {data.examYear && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Detected Examination Year
                  </label>
                  <input
                    type="text"
                    value={data.examYear}
                    readOnly
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700"
                  />
                </div>
              )}
            </div>

            {/* Individual detected subjects display */}
            {data.subjects.length > 0 && (
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Detected Subject Breakdown
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {data.subjects.map((sub, idx) => (
                    <div key={idx} className="bg-white p-2 rounded border border-slate-200">
                      <div className="text-slate-500 truncate font-medium">{sub.name}</div>
                      <div className="text-sm font-bold text-[#0F2942]">{sub.score}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {data.category === 'PUTME' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Post-UTME Screening Score (0.000 – 30.000)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="30"
                    step="0.001"
                    value={putmeScore}
                    onChange={(e) => setPutmeScore(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-lg font-bold text-slate-900 focus-ring"
                    placeholder="e.g. 24.500"
                  />
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs text-slate-400 font-semibold pointer-events-none">
                    / 30.000
                  </span>
                </div>
              </div>

              {data.examYear && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Detected Session Year
                  </label>
                  <input
                    type="text"
                    value={data.examYear}
                    readOnly
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {data.category === 'OLEVEL' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                O'Level Subjects & Grades ({olevelSubjects.length} found)
              </span>
              <span className="text-xs text-slate-500">
                First 5 subjects count toward aggregate
              </span>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {olevelSubjects.map((sub, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-2 p-2 rounded-lg border ${
                    idx < 5 ? 'bg-white border-slate-200' : 'bg-slate-50 border-dashed border-slate-300'
                  }`}
                >
                  <span className="text-xs font-bold text-slate-400 w-5 text-center">
                    {idx + 1}.
                  </span>
                  <input
                    type="text"
                    value={sub.subjectName}
                    onChange={(e) => handleUpdateOlevel(idx, 'subjectName', e.target.value)}
                    placeholder="Subject Name"
                    className="flex-1 px-2.5 py-1.5 text-xs font-medium border border-slate-300 rounded focus-ring"
                  />
                  <select
                    value={sub.grade}
                    onChange={(e) => handleUpdateOlevel(idx, 'grade', e.target.value)}
                    className="w-20 px-2 py-1.5 text-xs font-bold border border-slate-300 rounded focus-ring bg-white"
                  >
                    {VALID_GRADES.map((g) => (
                      <option key={g} value={g}>
                        {g} ({GRADE_POINTS_DISPLAY[g]?.points ?? 0} pts)
                      </option>
                    ))}
                  </select>
                  {olevelSubjects.length > 5 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOlevelSubject(idx)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                      title="Remove subject"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>

            {olevelSubjects.length < 9 && (
              <button
                type="button"
                onClick={handleAddOlevelSubject}
                className="text-xs font-semibold text-[#0F2942] hover:underline flex items-center gap-1 pt-1"
              >
                + Add another subject
              </button>
            )}
          </div>
        )}

        {/* Image Preview Toggle & Thumbnail */}
        {imageUrl && (
          <div className="pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setShowImagePreview((prev) => !prev)}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 mb-2"
            >
              <svg className={`w-3.5 h-3.5 transform transition-transform ${showImagePreview ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              {showImagePreview ? 'Hide scanned image thumbnail' : 'Show scanned image thumbnail'}
            </button>
            {showImagePreview && (
              <div className="max-h-48 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 flex items-center justify-center p-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt="Scanned result preview"
                  className="max-h-44 object-contain rounded"
                />
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onRescan}
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Scan Different Image
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-[#0F2942] hover:bg-[#163859] text-white text-xs font-bold shadow-sm transition-colors"
          >
            Confirm & Apply to Calculator
          </button>
        </div>
      </form>
    </div>
  );
};
