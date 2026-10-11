import React from 'react';
import { OlevelGrade, SubjectGrade } from '../core/types';

interface OlevelSelectorProps {
  subjects: SubjectGrade[];
  onUpdateSubject: (index: number, updated: SubjectGrade) => void;
  requiredCount?: number;
  isBiomedicalEngineering?: boolean;
  duplicateError?: string;
  pointsAccumulated: number;
}

export const COMMON_SUBJECTS = [
  'English Language',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Further Mathematics',
  'Economics',
  'Literature-in-English',
  'Government',
  'Geography',
  'Financial Accounting',
  'Civic Education',
  'Commerce',
  'Agricultural Science',
  'History',
  'Christian Religious Studies',
  'Islamic Religious Studies',
  'Computer Studies / Data Processing',
  'Technical Drawing',
  'Visual Arts'
];

export const GRADE_POINTS_DISPLAY: Record<OlevelGrade, { points: number; label: string }> = {
  A1: { points: 4.0, label: 'A1 (4.0 pts)' },
  B2: { points: 3.6, label: 'B2 (3.6 pts)' },
  B3: { points: 3.2, label: 'B3 (3.2 pts)' },
  C4: { points: 2.8, label: 'C4 (2.8 pts)' },
  C5: { points: 2.4, label: 'C5 (2.4 pts)' },
  C6: { points: 2.0, label: 'C6 (2.0 pts)' },
  D7: { points: 0.0, label: 'D7 (0 pts - Fail)' },
  E8: { points: 0.0, label: 'E8 (0 pts - Fail)' },
  F9: { points: 0.0, label: 'F9 (0 pts - Fail)' }
};

export const OlevelSelector: React.FC<OlevelSelectorProps> = ({
  subjects,
  onUpdateSubject,
  requiredCount,
  isBiomedicalEngineering = false,
  duplicateError,
  pointsAccumulated
}) => {
  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-1 border-b border-slate-200">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
            Senior Secondary O&apos;Level Results (WAEC / NECO / GCE)
          </label>
          <span className="text-xs text-slate-500">
            Strict Requirement: <strong>ONE SITTING ONLY</strong>. Two sittings are rejected.
          </span>
        </div>
        <div className="text-right">
          <span className="inline-flex items-center px-2.5 py-1 rounded bg-[#0F2942]/10 text-[#0F2942] font-bold text-xs">
            O&apos;Level Points: {pointsAccumulated.toFixed(3)} / 20.000
          </span>
        </div>
      </div>

      {isBiomedicalEngineering && (
        <div className="bg-blue-50 border border-blue-200 rounded p-2.5 text-xs text-blue-900" role="status">
          <strong>Biomedical Engineering Prerequisite Notice:</strong> While the UNILAG admissions handbook mandates <strong>six (6) credit passes</strong> (English, Mathematics, Further Mathematics, Biology, Physics, Chemistry) for departmental eligibility, UNILAG&apos;s composite aggregate scoring officially evaluates the candidate&apos;s <strong>five (5) relevant subjects</strong> (max 20.000 points). UNILAG does not publish a 6-subject scoring or scaling formula.
        </div>
      )}

      {duplicateError && (
        <p className="text-xs font-semibold text-red-600 bg-red-50 p-2 rounded border border-red-200" role="alert">
          {duplicateError}
        </p>
      )}

      <div className="space-y-2">
        {subjects.slice(0, 5).map((item, idx) => (
          <div key={idx} className="grid grid-cols-12 gap-2 items-center">
            <div className="col-span-1 text-center font-bold text-xs text-slate-400">
              #{idx + 1}
            </div>

            <div className="col-span-7 sm:col-span-7">
              <label htmlFor={`subject-name-${idx}`} className="sr-only">
                Subject {idx + 1} Name
              </label>
              <input
                type="text"
                id={`subject-name-${idx}`}
                list="common-subjects-list"
                value={item.subjectName}
                onChange={(e) => onUpdateSubject(idx, { ...item, subjectName: e.target.value })}
                placeholder={`e.g. ${COMMON_SUBJECTS[idx] || 'Subject'}`}
                className="w-full px-3 py-2 text-sm font-medium rounded-md border border-slate-300 bg-white text-slate-900 focus-ring hover:border-slate-400"
              />
            </div>

            <div className="col-span-4 sm:col-span-4">
              <label htmlFor={`subject-grade-${idx}`} className="sr-only">
                Subject {idx + 1} Grade
              </label>
              <select
                id={`subject-grade-${idx}`}
                value={item.grade}
                onChange={(e) => onUpdateSubject(idx, { ...item, grade: e.target.value as OlevelGrade })}
                className="w-full px-2.5 py-2 text-sm font-semibold rounded-md border border-slate-300 bg-white text-slate-900 focus-ring hover:border-slate-400"
              >
                {(Object.keys(GRADE_POINTS_DISPLAY) as OlevelGrade[]).map((g) => (
                  <option key={g} value={g}>
                    {GRADE_POINTS_DISPLAY[g].label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>

      <datalist id="common-subjects-list">
        {COMMON_SUBJECTS.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>

      <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex flex-wrap gap-x-3 gap-y-1">
        <span>A1: 4.0 pts</span>
        <span>B2: 3.6 pts</span>
        <span>B3: 3.2 pts</span>
        <span>C4: 2.8 pts</span>
        <span>C5: 2.4 pts</span>
        <span>C6: 2.0 pts</span>
        <span className="text-red-500">D7/E8/F9: 0 pts</span>
      </div>
    </div>
  );
};
