'use client';

import React, { useState, useMemo } from 'react';
import { calculateAggregate } from '../core/calculator';
import { calculateRequiredPutme } from '../core/targetCalculator';
import { AggregateResult, TargetCalculationResult, SubjectGrade } from '../core/types';
import { SessionSelector } from './SessionSelector';
import { VerificationNotice } from './VerificationNotice';
import { TargetModeToggle } from './TargetModeToggle';
import { UtmeInput } from './UtmeInput';
import { PutmeInput } from './PutmeInput';
import { OlevelSelector, GRADE_POINTS_DISPLAY } from './OlevelSelector';
import { DepartmentCombobox } from './DepartmentCombobox';
import { ResultCard } from './ResultCard';
import { ReverseTargetCard } from './ReverseTargetCard';
import { DepartmentComparisonCard } from './DepartmentComparisonCard';
import { ResultUploadModal } from './ocr/ResultUploadModal';
import { OcrReviewPayload, MultiSlotCompletePayload } from '../ocr/types';

const INITIAL_SUBJECTS: SubjectGrade[] = [
  { subjectName: 'English Language', grade: 'A1' },
  { subjectName: 'Mathematics', grade: 'B2' },
  { subjectName: 'Physics', grade: 'B3' },
  { subjectName: 'Chemistry', grade: 'C4' },
  { subjectName: 'Biology', grade: 'C5' },
  { subjectName: 'Further Mathematics', grade: 'A1' } // Available if 6th subject needed (Biomedical Engineering)
];

export const CalculatorContainer: React.FC = () => {
  const [session, setSession] = useState<string>('2025/2026');
  const [allowPreliminary, setAllowPreliminary] = useState<boolean>(false);
  const [isTargetMode, setIsTargetMode] = useState<boolean>(false);

  const [utmeScore, setUtmeScore] = useState<string>('280');
  const [putmeScore, setPutmeScore] = useState<string>('22.5');
  const [targetAggregate, setTargetAggregate] = useState<string>('75.000');

  const [selectedProgramme, setSelectedProgramme] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('');
  const [subjects, setSubjects] = useState<SubjectGrade[]>(INITIAL_SUBJECTS);

  // OCR Upload Modal State
  const [isOcrModalOpen, setIsOcrModalOpen] = useState<boolean>(false);
  const [ocrSuccessMessage, setOcrSuccessMessage] = useState<string | null>(null);

  const handleApplyOcrPayload = (payload: OcrReviewPayload) => {
    let appliedSummary = '';
    if (payload.category === 'UTME' && payload.utmeScore !== undefined) {
      setUtmeScore(String(payload.utmeScore));
      appliedSummary = `Applied scanned JAMB UTME score (${payload.utmeScore}).`;
    } else if (payload.category === 'PUTME' && payload.putmeScore !== undefined) {
      setPutmeScore(String(payload.putmeScore));
      appliedSummary = `Applied scanned Post-UTME score (${payload.putmeScore}).`;
    } else if (payload.category === 'OLEVEL' && payload.olevelSubjects && payload.olevelSubjects.length >= 5) {
      setSubjects((prev) => {
        const next = [...prev];
        payload.olevelSubjects!.forEach((sub, idx) => {
          if (idx < 5) {
            next[idx] = sub;
          }
        });
        return next;
      });
      appliedSummary = `Applied ${payload.olevelSubjects.length} scanned O'Level subjects and grades.`;
    }

    if (appliedSummary) {
      setOcrSuccessMessage(appliedSummary);
      setTimeout(() => setOcrSuccessMessage(null), 7000);
    }
  };

  const handleApplyAllOcr = (payload: MultiSlotCompletePayload) => {
    if (payload.utme.utmeScore !== undefined) {
      setUtmeScore(String(payload.utme.utmeScore));
    }
    if (payload.putme.putmeScore !== undefined) {
      setPutmeScore(String(payload.putme.putmeScore));
    }
    if (payload.olevel.olevelSubjects && payload.olevel.olevelSubjects.length >= 5) {
      setSubjects((prev) => {
        const next = [...prev];
        payload.olevel.olevelSubjects!.forEach((sub, idx) => {
          if (idx < 5) {
            next[idx] = sub;
          }
        });
        return next;
      });
    }

    setOcrSuccessMessage(
      `Successfully applied all 3 verified results: UTME (${payload.utme.utmeScore}), Post-UTME (${payload.putme.putmeScore?.toFixed(3)}), and 5 O'Level subjects.`
    );
    setTimeout(() => setOcrSuccessMessage(null), 8000);
  };

  // Biomedical Engineering selection flag
  const isBiomedicalEngineering = selectedProgramme.trim().toUpperCase() === 'BIOMEDICAL ENGINEERING';

  const handleUpdateSubject = (index: number, updated: SubjectGrade) => {
    setSubjects((prev) => {
      const next = [...prev];
      next[index] = updated;
      return next;
    });
  };

  // Check for duplicate subjects across 5 subjects
  const duplicateSubjectError = useMemo(() => {
    const active = subjects.slice(0, 5);
    const seen = new Set<string>();
    for (const item of active) {
      const name = item.subjectName.trim().toLowerCase();
      if (!name) continue;
      if (seen.has(name)) {
        return `Duplicate subject detected: "${item.subjectName}". Each subject must be distinct.`;
      }
      seen.add(name);
    }
    return undefined;
  }, [subjects]);

  // Compute accumulated O'Level points for live display (5 subjects, max 20.000 pts)
  const pointsAccumulated = useMemo(() => {
    const active = subjects.slice(0, 5);
    const total = active.reduce((acc, curr) => {
      return acc + (GRADE_POINTS_DISPLAY[curr.grade]?.points || 0);
    }, 0);
    return Math.round((total + Number.EPSILON) * 1000) / 1000;
  }, [subjects]);

  // Execute forward calculation
  const forwardCalculation = useMemo(() => {
    if (isTargetMode || duplicateSubjectError) {
      return { result: null as AggregateResult | null, error: duplicateSubjectError };
    }

    const utmeInt = parseInt(utmeScore, 10);
    const putmeFloat = parseFloat(putmeScore);

    if (isNaN(utmeInt)) {
      return { result: null, error: 'Please enter a valid numeric UTME score.' };
    }
    if (isNaN(putmeFloat)) {
      return { result: null, error: 'Please enter a valid Post-UTME score.' };
    }

    const response = calculateAggregate({
      session,
      utmeScore: utmeInt,
      putmeScore: putmeFloat,
      olevelGrades: subjects.slice(0, 5),
      allowPreliminarySession: allowPreliminary
    });

    if (!response.success) {
      return { result: null, error: response.message };
    }

    return { result: response, error: undefined };
  }, [
    isTargetMode,
    duplicateSubjectError,
    session,
    utmeScore,
    putmeScore,
    subjects,
    allowPreliminary
  ]);

  // Execute reverse target calculation
  const reverseCalculation = useMemo(() => {
    if (!isTargetMode || duplicateSubjectError) {
      return { targetResult: null as TargetCalculationResult | null, error: duplicateSubjectError };
    }

    const utmeInt = parseInt(utmeScore, 10);
    const targetFloat = parseFloat(targetAggregate);

    if (isNaN(utmeInt)) {
      return { targetResult: null, error: 'Please enter a valid numeric UTME score.' };
    }
    if (isNaN(targetFloat)) {
      return { targetResult: null, error: 'Please enter a valid target aggregate score.' };
    }

    const response = calculateRequiredPutme({
      session,
      targetAggregate: targetFloat,
      utmeScore: utmeInt,
      olevelGrades: subjects.slice(0, 5),
      allowPreliminarySession: allowPreliminary
    });

    if (!response.success) {
      return { targetResult: null, error: response.message };
    }

    return { targetResult: response, error: undefined };
  }, [
    isTargetMode,
    duplicateSubjectError,
    session,
    targetAggregate,
    utmeScore,
    subjects,
    allowPreliminary
  ]);

  const handleApplyAsTarget = (score: number) => {
    setTargetAggregate(score.toFixed(3));
    setIsTargetMode(true);
  };

  const calculatedAggregateForComparison = forwardCalculation.result
    ? forwardCalculation.result.breakdown.totalAggregate
    : null;

  return (
    <div id="calculator-section" className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form Panel: Inputs & Selectors */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div>
              <h2 className="text-lg font-bold text-[#0F2942]">
                Undergraduate Candidate Credentials
              </h2>
              <p className="text-xs text-slate-500">
                Enter your scores manually or scan your verified result slip
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsOcrModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 transition-colors shadow-2xs cursor-pointer"
                title="Scan or upload a photograph of your result slip"
              >
                <svg className="w-3.5 h-3.5 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Upload Result Slips (OCR)</span>
              </button>
              <TargetModeToggle isTargetMode={isTargetMode} onToggle={setIsTargetMode} />
            </div>
          </div>

          {/* OCR Scanned Success Notice */}
          {ocrSuccessMessage && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-300 p-3 text-xs text-emerald-950 flex items-center justify-between animate-fadeIn">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span><strong>Scan Applied:</strong> {ocrSuccessMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setOcrSuccessMessage(null)}
                className="text-emerald-700 hover:text-emerald-950 font-bold ml-2 text-sm leading-none"
                aria-label="Dismiss message"
              >
                ×
              </button>
            </div>
          )}

          {/* Session Selection */}
          <SessionSelector
            selectedSession={session}
            onSelectSession={(s) => {
              setSession(s);
              if (s !== '2026/2027') setAllowPreliminary(false);
            }}
          />

          {/* Verification Safeguard Notice */}
          <VerificationNotice
            session={session}
            isPreliminary={session === '2026/2027'}
            allowPreliminary={allowPreliminary}
            onTogglePreliminary={setAllowPreliminary}
          />

          {/* UTME Score Input */}
          <UtmeInput
            value={utmeScore}
            onChange={setUtmeScore}
          />

          {/* Post-UTME Input or Target Aggregate Input depending on mode */}
          {!isTargetMode ? (
            <PutmeInput
              value={putmeScore}
              onChange={setPutmeScore}
            />
          ) : (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="target-aggregate-input" className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Target Aggregate Goal
                </label>
                <span className="text-xs text-slate-500 font-medium">Scale: 0 – 100</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  id="target-aggregate-input"
                  min="0"
                  max="100"
                  step="0.001"
                  placeholder="e.g. 82.500"
                  value={targetAggregate}
                  onChange={(e) => setTargetAggregate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 hover:border-slate-400 text-base font-semibold text-slate-900 bg-white transition-all focus-ring"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-xs text-slate-400 font-medium">
                  / 100
                </div>
              </div>
              <p className="text-xs text-slate-500">
                Enter your target departmental cut-off score, or pick a course below to populate automatically.
              </p>
            </div>
          )}

          {/* O'Level Grade Selector */}
          <OlevelSelector
            subjects={subjects}
            onUpdateSubject={handleUpdateSubject}
            isBiomedicalEngineering={isBiomedicalEngineering}
            duplicateError={duplicateSubjectError}
            pointsAccumulated={pointsAccumulated}
          />

          {/* Departmental Cut-Off Lookup & Selection */}
          <div className="pt-4 border-t border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Compare with Target Department
            </h3>
            <DepartmentCombobox
              selectedProgramme={selectedProgramme}
              onSelectProgramme={setSelectedProgramme}
              selectedState={selectedState}
              onSelectState={setSelectedState}
              onApplyAsTarget={handleApplyAsTarget}
            />
          </div>
        </div>

        {/* Right Panel: Results & Benchmark Comparison */}
        <div className="lg:col-span-5 space-y-6">
          {!isTargetMode ? (
            <ResultCard
              result={forwardCalculation.result}
              error={forwardCalculation.error}
            />
          ) : (
            <ReverseTargetCard
              targetResult={reverseCalculation.targetResult}
              error={reverseCalculation.error}
            />
          )}

          {/* Comparative Benchmark Card if Course is Selected */}
          <DepartmentComparisonCard
            userAggregate={calculatedAggregateForComparison}
            selectedProgramme={selectedProgramme}
            selectedState={selectedState}
          />
        </div>
      </div>

      {/* Local Browser-Based Result Slip OCR Modal */}
      <ResultUploadModal
        isOpen={isOcrModalOpen}
        onClose={() => setIsOcrModalOpen(false)}
        onApplyPayload={handleApplyOcrPayload}
        onApplyAll={handleApplyAllOcr}
      />
    </div>
  );
};
