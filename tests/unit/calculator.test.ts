import { describe, it, expect } from 'vitest';
import {
  calculateAggregate,
  calculateUtmePoints,
  calculatePutmePoints,
  calculateOlevelPoints
} from '../../src/core/calculator.js';
import { getSessionConfig } from '../../src/core/rulesEngine.js';
import { AggregateResult, SubjectGrade } from '../../src/core/types.js';

describe('Calculator Core Engine', () => {
  const verifiedSession = '2025/2026';
  const config = getSessionConfig(verifiedSession)!;

  const sample5A1s: SubjectGrade[] = [
    { subjectName: 'English Language', grade: 'A1' },
    { subjectName: 'Mathematics', grade: 'A1' },
    { subjectName: 'Physics', grade: 'A1' },
    { subjectName: 'Chemistry', grade: 'A1' },
    { subjectName: 'Biology', grade: 'A1' }
  ];

  const sample5C6s: SubjectGrade[] = [
    { subjectName: 'English Language', grade: 'C6' },
    { subjectName: 'Mathematics', grade: 'C6' },
    { subjectName: 'Physics', grade: 'C6' },
    { subjectName: 'Chemistry', grade: 'C6' },
    { subjectName: 'Biology', grade: 'C6' }
  ];

  describe('Individual Scoring Components', () => {
    it('calculates UTME points correctly (UTME / 8)', () => {
      expect(calculateUtmePoints(400, config)).toBe(50.000);
      expect(calculateUtmePoints(320, config)).toBe(40.000);
      expect(calculateUtmePoints(200, config)).toBe(25.000);
      expect(calculateUtmePoints(247, config)).toBe(30.875);
      expect(calculateUtmePoints(0, config)).toBe(0.000);
    });

    it('calculates Post-UTME points correctly on 30-point scale', () => {
      expect(calculatePutmePoints(30.0, config)).toBe(30.000);
      expect(calculatePutmePoints(22.5, config)).toBe(22.500);
      expect(calculatePutmePoints(15.0, config)).toBe(15.000);
      expect(calculatePutmePoints(18.25, config)).toBe(18.250);
      expect(calculatePutmePoints(0.0, config)).toBe(0.000);
    });

    it('calculates OLevel points correctly for all A1s (5 * 4.0 = 20.0)', () => {
      const res = calculateOlevelPoints(sample5A1s, config);
      expect(res.points).toBe(20.000);
      expect(res.passingCount).toBe(5);
    });

    it('calculates OLevel points correctly for all C6s (5 * 2.0 = 10.0)', () => {
      const res = calculateOlevelPoints(sample5C6s, config);
      expect(res.points).toBe(10.000);
      expect(res.passingCount).toBe(5);
    });

    it('calculates mixed OLevel grades according to verified mapping', () => {
      // A1 (4.0) + B2 (3.6) + B3 (3.2) + C4 (2.8) + C5 (2.4) = 16.0
      const mixed: SubjectGrade[] = [
        { subjectName: 'English', grade: 'A1' },
        { subjectName: 'Mathematics', grade: 'B2' },
        { subjectName: 'Physics', grade: 'B3' },
        { subjectName: 'Chemistry', grade: 'C4' },
        { subjectName: 'Biology', grade: 'C5' }
      ];
      const res = calculateOlevelPoints(mixed, config);
      expect(res.points).toBe(16.000);
      expect(res.passingCount).toBe(5);
    });

    it('awards 0 points for non-credit grades (D7, E8, F9)', () => {
      const withDeficits: SubjectGrade[] = [
        { subjectName: 'English', grade: 'A1' }, // 4.0
        { subjectName: 'Mathematics', grade: 'B2' }, // 3.6
        { subjectName: 'Physics', grade: 'C4' }, // 2.8
        { subjectName: 'Chemistry', grade: 'D7' }, // 0.0
        { subjectName: 'Biology', grade: 'F9' } // 0.0
      ];
      const res = calculateOlevelPoints(withDeficits, config);
      expect(res.points).toBe(10.400); // 4.0 + 3.6 + 2.8 = 10.4
      expect(res.passingCount).toBe(3);
    });
  });

  describe('Known-Answer Calculation Test Matrix (QA_STRATEGY.md)', () => {
    it('TC-CALC-001: Perfect score (UTME 400, PUTME 30, 5 A1s -> 100.000)', () => {
      const response = calculateAggregate({
        session: verifiedSession,
        utmeScore: 400,
        putmeScore: 30.0,
        olevelGrades: sample5A1s
      });

      expect(response.success).toBe(true);
      const res = response as AggregateResult;
      expect(res.breakdown.utmePoints).toBe(50.000);
      expect(res.breakdown.putmePoints).toBe(30.000);
      expect(res.breakdown.olevelPoints).toBe(20.000);
      expect(res.breakdown.totalAggregate).toBe(100.000);
      expect(res.breakdown.formatted.totalAggregate).toBe('100.000');
      expect(res.eligibility.isEligibleForScreening).toBe(true);
    });

    it('TC-CALC-002: High candidate (UTME 320, PUTME 25.0, A1, B2, B3, C4, C5 -> 81.000)', () => {
      const response = calculateAggregate({
        session: verifiedSession,
        utmeScore: 320,
        putmeScore: 25.0,
        olevelGrades: [
          { subjectName: 'English', grade: 'A1' },
          { subjectName: 'Mathematics', grade: 'B2' },
          { subjectName: 'Physics', grade: 'B3' },
          { subjectName: 'Chemistry', grade: 'C4' },
          { subjectName: 'Biology', grade: 'C5' }
        ]
      });

      expect(response.success).toBe(true);
      const res = response as AggregateResult;
      expect(res.breakdown.utmePoints).toBe(40.000);
      expect(res.breakdown.putmePoints).toBe(25.000);
      expect(res.breakdown.olevelPoints).toBe(16.000);
      expect(res.breakdown.totalAggregate).toBe(81.000);
      expect(res.breakdown.formatted.totalAggregate).toBe('81.000');
    });

    it('TC-CALC-003: Mid candidate (UTME 280, PUTME 22.5, B2, B2, B3, B3, C4 -> 73.900)', () => {
      const response = calculateAggregate({
        session: verifiedSession,
        utmeScore: 280,
        putmeScore: 22.5,
        olevelGrades: [
          { subjectName: 'English', grade: 'B2' },
          { subjectName: 'Mathematics', grade: 'B2' },
          { subjectName: 'Physics', grade: 'B3' },
          { subjectName: 'Chemistry', grade: 'B3' },
          { subjectName: 'Biology', grade: 'C4' }
        ]
      });

      expect(response.success).toBe(true);
      const res = response as AggregateResult;
      expect(res.breakdown.utmePoints).toBe(35.000);
      expect(res.breakdown.putmePoints).toBe(22.500);
      expect(res.breakdown.olevelPoints).toBe(16.400); // 3.6 + 3.6 + 3.2 + 3.2 + 2.8 = 16.4
      expect(res.breakdown.totalAggregate).toBe(73.900);
      expect(res.breakdown.formatted.totalAggregate).toBe('73.900');
    });

    it('TC-CALC-004: Minimum passing boundary (UTME 200, PUTME 15.0, 5 C6s -> 50.000)', () => {
      const response = calculateAggregate({
        session: verifiedSession,
        utmeScore: 200,
        putmeScore: 15.0,
        olevelGrades: sample5C6s
      });

      expect(response.success).toBe(true);
      const res = response as AggregateResult;
      expect(res.breakdown.utmePoints).toBe(25.000);
      expect(res.breakdown.putmePoints).toBe(15.000);
      expect(res.breakdown.olevelPoints).toBe(10.000);
      expect(res.breakdown.totalAggregate).toBe(50.000);
      expect(res.breakdown.formatted.totalAggregate).toBe('50.000');
      expect(res.eligibility.isEligibleForScreening).toBe(true);
    });

    it('TC-CALC-005: 3-decimal precision test (UTME 335, PUTME 27.0, A1, A1, B2, B2, B3 -> 87.275)', () => {
      const response = calculateAggregate({
        session: verifiedSession,
        utmeScore: 335,
        putmeScore: 27.0,
        olevelGrades: [
          { subjectName: 'English', grade: 'A1' }, // 4.0
          { subjectName: 'Mathematics', grade: 'A1' }, // 4.0
          { subjectName: 'Physics', grade: 'B2' }, // 3.6
          { subjectName: 'Chemistry', grade: 'B2' }, // 3.6
          { subjectName: 'Biology', grade: 'B3' } // 3.2 -> total Olevel = 18.4
        ]
      });

      expect(response.success).toBe(true);
      const res = response as AggregateResult;
      expect(res.breakdown.utmePoints).toBe(41.875);
      expect(res.breakdown.putmePoints).toBe(27.000);
      expect(res.breakdown.olevelPoints).toBe(18.400);
      expect(res.breakdown.totalAggregate).toBe(87.275);
      expect(res.breakdown.formatted.totalAggregate).toBe('87.275');
    });

    it('TC-CALC-006: Fractional PUTME (UTME 247, PUTME 18.25, B3, C4, C4, C5, C6 -> 62.325)', () => {
      const response = calculateAggregate({
        session: verifiedSession,
        utmeScore: 247,
        putmeScore: 18.25,
        olevelGrades: [
          { subjectName: 'English', grade: 'B3' }, // 3.2
          { subjectName: 'Mathematics', grade: 'C4' }, // 2.8
          { subjectName: 'Physics', grade: 'C4' }, // 2.8
          { subjectName: 'Chemistry', grade: 'C5' }, // 2.4
          { subjectName: 'Biology', grade: 'C6' } // 2.0 -> total 13.2
        ]
      });

      expect(response.success).toBe(true);
      const res = response as AggregateResult;
      expect(res.breakdown.utmePoints).toBe(30.875);
      expect(res.breakdown.putmePoints).toBe(18.250);
      expect(res.breakdown.olevelPoints).toBe(13.200);
      expect(res.breakdown.totalAggregate).toBe(62.325);
      expect(res.breakdown.formatted.totalAggregate).toBe('62.325');
    });

    it('TC-CALC-007: Fractional points (UTME 311, PUTME 24.3, A1, B2, C4, C5, C6 -> 77.975)', () => {
      const response = calculateAggregate({
        session: verifiedSession,
        utmeScore: 311,
        putmeScore: 24.3,
        olevelGrades: [
          { subjectName: 'English', grade: 'A1' }, // 4.0
          { subjectName: 'Mathematics', grade: 'B2' }, // 3.6
          { subjectName: 'Physics', grade: 'C4' }, // 2.8
          { subjectName: 'Chemistry', grade: 'C5' }, // 2.4
          { subjectName: 'Biology', grade: 'C6' } // 2.0 -> total 14.8
        ]
      });

      expect(response.success).toBe(true);
      const res = response as AggregateResult;
      expect(res.breakdown.utmePoints).toBe(38.875);
      expect(res.breakdown.putmePoints).toBe(24.300);
      expect(res.breakdown.olevelPoints).toBe(14.800);
      expect(res.breakdown.totalAggregate).toBe(77.975);
      expect(res.breakdown.formatted.totalAggregate).toBe('77.975');
    });
  });

  describe('Eligibility Evaluation & Warning Flags', () => {
    it('flags candidate with UTME score below 200 threshold as ineligible for screening', () => {
      const response = calculateAggregate({
        session: verifiedSession,
        utmeScore: 195,
        putmeScore: 20.0,
        olevelGrades: sample5A1s
      });

      expect(response.success).toBe(true);
      const res = response as AggregateResult;
      expect(res.eligibility.meetsUtmeMinimum).toBe(false);
      expect(res.eligibility.isEligibleForScreening).toBe(false);
      expect(res.eligibility.warnings.some(w => w.includes('below UNILAG\'s mandatory minimum'))).toBe(true);
    });

    it('flags candidate with more than 1 sitting as ineligible under single sitting rule', () => {
      const response = calculateAggregate({
        session: verifiedSession,
        utmeScore: 250,
        putmeScore: 20.0,
        olevelGrades: sample5A1s,
        sittings: 2
      });

      expect(response.success).toBe(true);
      const res = response as AggregateResult;
      expect(res.eligibility.meetsSittingsRequirement).toBe(false);
      expect(res.eligibility.isEligibleForScreening).toBe(false);
      expect(res.eligibility.warnings.some(w => w.includes('ONE SITTING ONLY'))).toBe(true);
    });

    it('flags candidate with non-credit Olevel grade (D7/F9) as ineligible', () => {
      const response = calculateAggregate({
        session: verifiedSession,
        utmeScore: 250,
        putmeScore: 20.0,
        olevelGrades: [
          { subjectName: 'English', grade: 'A1' },
          { subjectName: 'Mathematics', grade: 'A1' },
          { subjectName: 'Physics', grade: 'A1' },
          { subjectName: 'Chemistry', grade: 'A1' },
          { subjectName: 'Biology', grade: 'D7' }
        ]
      });

      expect(response.success).toBe(true);
      const res = response as AggregateResult;
      expect(res.eligibility.hasRequiredCreditCount).toBe(false);
      expect(res.eligibility.isEligibleForScreening).toBe(false);
      expect(res.eligibility.warnings.some(w => w.includes('non-credit grades'))).toBe(true);
    });
  });
});
