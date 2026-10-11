import { describe, it, expect } from 'vitest';
import { calculateAggregate } from '../../src/core/calculator.js';
import { calculateRequiredPutme } from '../../src/core/targetCalculator.js';
import cutoffData from '../../src/data/cutoffs/2026_2027.json' with { type: 'json' };
import { AggregateResult, CutoffDataset, TargetCalculationResult } from '../../src/core/types.js';

describe('End-to-End Admission Workflow Integration', () => {
  const verifiedSession = '2025/2026';
  const cutoffs = cutoffData as unknown as CutoffDataset;

  const candidateOlevels = [
    { subjectName: 'English Language', grade: 'A1' as const }, // 4.0
    { subjectName: 'Mathematics', grade: 'A1' as const }, // 4.0
    { subjectName: 'Physics', grade: 'B2' as const }, // 3.6
    { subjectName: 'Chemistry', grade: 'B2' as const }, // 3.6
    { subjectName: 'Biology', grade: 'B3' as const } // 3.2 -> Olevel = 18.4
  ];

  it('calculates aggregate and compares with Computer Science cutoffs (Catchment Concession)', () => {
    // UTME 320 -> 40.0 pts. PUTME 20.0 -> 20.0 pts. Olevel 18.4 pts.
    // Total aggregate = 78.400
    const calc = calculateAggregate({
      session: verifiedSession,
      utmeScore: 320,
      putmeScore: 20.0,
      olevelGrades: candidateOlevels
    });

    expect(calc.success).toBe(true);
    const result = calc as AggregateResult;
    expect(result.breakdown.totalAggregate).toBe(78.400);

    // Look up Computer Science in official 2026/2027 cut-offs
    const cs = cutoffs.records.find(r => r.programme === 'COMPUTER SCIENCE')!;
    expect(cs.merit).toBe(82.05); // Merit cut-off
    expect(cs.catchment.lagos).toBe(73.225); // Lagos Catchment cut-off

    // Candidate does not meet National Merit (78.400 < 82.05)
    expect(result.breakdown.totalAggregate < cs.merit!).toBe(true);

    // Candidate from Lagos State qualifies under Catchment quota (78.400 >= 73.225)
    expect(result.breakdown.totalAggregate >= cs.catchment.lagos!).toBe(true);
  });

  it('demonstrates Target Calculator workflow for a prospective Medicine candidate', () => {
    // Medicine 2026/2027 Merit Cut-Off = 83.425
    const med = cutoffs.records.find(r => r.programme === 'MEDICINE & SURGERY')!;
    expect(med.merit).toBe(83.425);

    // Candidate scored 330 in UTME (41.25 pts), has 18.4 O'Level points -> Current known = 59.65 pts
    // Required in PUTME = 83.425 - 59.65 = 23.775
    const target = calculateRequiredPutme({
      session: verifiedSession,
      targetAggregate: med.merit,
      utmeScore: 330,
      olevelGrades: candidateOlevels
    });

    expect(target.success).toBe(true);
    const targetResult = target as TargetCalculationResult;
    expect(targetResult.isAchievable).toBe(true);
    expect(targetResult.status).toBe('ACHIEVABLE');
    expect(targetResult.requiredPutmeScore).toBe(23.775);
    expect(targetResult.requiredPutmeScoreFormatted).toBe('23.775');

    // Confirm that if this candidate scores 23.775 in PUTME, their aggregate matches target
    const forwardCheck = calculateAggregate({
      session: verifiedSession,
      utmeScore: 330,
      putmeScore: 23.775,
      olevelGrades: candidateOlevels
    }) as AggregateResult;

    expect(forwardCheck.breakdown.totalAggregate).toBe(83.425);
  });
});
