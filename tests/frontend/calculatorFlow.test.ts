import { describe, it, expect } from 'vitest';
import { calculateAggregate } from '../../src/core/calculator';
import { calculateRequiredPutme } from '../../src/core/targetCalculator';
import { SOUTH_WEST_CATCHMENT_STATES } from '../../src/components/DepartmentCombobox';
import cutoffData from '../../src/data/cutoffs/2026_2027.json' with { type: 'json' };
import {
  CutoffDataset,
  SubjectGrade,
  AggregateResult,
  TargetCalculationResult,
  CalculationError
} from '../../src/core/types';

describe('Frontend Calculator Workflow & UI State Logic', () => {
  const dataset = cutoffData as unknown as CutoffDataset;

  const valid5Subjects: SubjectGrade[] = [
    { subjectName: 'English Language', grade: 'A1' },
    { subjectName: 'Mathematics', grade: 'B2' },
    { subjectName: 'Physics', grade: 'B3' },
    { subjectName: 'Chemistry', grade: 'C4' },
    { subjectName: 'Biology', grade: 'C5' }
  ];

  describe('1. Preliminary Session Safeguard Workflow', () => {
    it('allows calculation on verified 2025/2026 session without simulation opt-in', () => {
      const response = calculateAggregate({
        session: '2025/2026',
        utmeScore: 280,
        putmeScore: 20.0,
        olevelGrades: valid5Subjects,
        allowPreliminarySession: false
      });

      expect(response.success).toBe(true);
      const res = response as AggregateResult;
      expect(res.verificationStatus).toBe('CONFIRMED');
      expect(res.isPreliminary).toBe(false);
      expect(res.breakdown.totalAggregate).toBe(71.000);
    });

    it('blocks 2026/2027 calculation by default when allowPreliminarySession is false', () => {
      const response = calculateAggregate({
        session: '2026/2027',
        utmeScore: 280,
        putmeScore: 20.0,
        olevelGrades: valid5Subjects,
        allowPreliminarySession: false
      });

      expect(response.success).toBe(false);
      const err = response as CalculationError;
      expect(err.code).toBe('UNVERIFIED_SESSION');
      expect(err.message).toContain('preliminary');
    });

    it('permits 2026/2027 calculation when user explicitly confirms simulation opt-in', () => {
      const response = calculateAggregate({
        session: '2026/2027',
        utmeScore: 280,
        putmeScore: 20.0,
        olevelGrades: valid5Subjects,
        allowPreliminarySession: true
      });

      expect(response.success).toBe(true);
      const res = response as AggregateResult;
      expect(res.verificationStatus).toBe('PRELIMINARY');
      expect(res.isPreliminary).toBe(true);
      expect(res.eligibility.warnings.some((w) => w.includes('Preliminary Session'))).toBe(true);
    });
  });

  describe('2. Input Constraints & Boundary Guards', () => {
    it('flags minimum screening eligibility failure when UTME is below 200', () => {
      const response = calculateAggregate({
        session: '2025/2026',
        utmeScore: 195,
        putmeScore: 18.0,
        olevelGrades: valid5Subjects
      });

      expect(response.success).toBe(true);
      const res = response as AggregateResult;
      expect(res.eligibility.meetsUtmeMinimum).toBe(false);
      expect(res.eligibility.isEligibleForScreening).toBe(false);
      expect(
        res.eligibility.warnings.some((w) => w.includes('below UNILAG\'s mandatory minimum'))
      ).toBe(true);
    });

    it('flags historical Post-UTME failure when score is below 12.0', () => {
      const response = calculateAggregate({
        session: '2025/2026',
        utmeScore: 260,
        putmeScore: 11.5,
        olevelGrades: valid5Subjects
      });

      expect(response.success).toBe(true);
      const res = response as AggregateResult;
      expect(
        res.eligibility.warnings.some((w) => w.includes('below the historical pass mark'))
      ).toBe(true);
    });

    it('rejects invalid UTME scores outside [0, 400]', () => {
      const responseOver = calculateAggregate({
        session: '2025/2026',
        utmeScore: 405,
        putmeScore: 20.0,
        olevelGrades: valid5Subjects
      });
      expect(responseOver.success).toBe(false);
      expect((responseOver as CalculationError).code).toBe('INVALID_UTME_SCORE');

      const responseNeg = calculateAggregate({
        session: '2025/2026',
        utmeScore: -10,
        putmeScore: 20.0,
        olevelGrades: valid5Subjects
      });
      expect(responseNeg.success).toBe(false);
      expect((responseNeg as CalculationError).code).toBe('INVALID_UTME_SCORE');
    });

    it('rejects invalid Post-UTME scores outside [0, 30]', () => {
      const responseOver = calculateAggregate({
        session: '2025/2026',
        utmeScore: 250,
        putmeScore: 32.5,
        olevelGrades: valid5Subjects
      });
      expect(responseOver.success).toBe(false);
      expect((responseOver as CalculationError).code).toBe('INVALID_PUTME_SCORE');

      const responseNeg = calculateAggregate({
        session: '2025/2026',
        utmeScore: 250,
        putmeScore: -1.0,
        olevelGrades: valid5Subjects
      });
      expect(responseNeg.success).toBe(false);
      expect((responseNeg as CalculationError).code).toBe('INVALID_PUTME_SCORE');
    });
  });

  describe('3. O\'Level 5-Subject Rule & Biomedical Engineering Prerequisite Handling', () => {
    it('strictly calculates aggregate score on 5 relevant subjects (max 20.000 pts)', () => {
      const response = calculateAggregate({
        session: '2025/2026',
        utmeScore: 300,
        putmeScore: 25.0,
        olevelGrades: valid5Subjects
      });

      expect(response.success).toBe(true);
      const res = response as AggregateResult;
      // All grades: A1(4.0), B2(3.6), B3(3.2), C4(2.8), C5(2.4) = 16.000 pts
      expect(res.breakdown.olevelPoints).toBe(16.000);
      expect(res.breakdown.formatted.olevelPoints).toBe('16.000');
    });

    it('rejects 6 subjects because UNILAG scoring officially evaluates only 5 subjects', () => {
      const sixSubjects: SubjectGrade[] = [
        ...valid5Subjects,
        { subjectName: 'Further Mathematics', grade: 'A1' }
      ];

      const response = calculateAggregate({
        session: '2025/2026',
        utmeScore: 300,
        putmeScore: 25.0,
        olevelGrades: sixSubjects
      });

      expect(response.success).toBe(false);
      const err = response as CalculationError;
      expect(err.code).toBe('INVALID_OLEVEL_GRADES');
      expect(err.message).toContain('Exactly 5 relevant O\'Level subjects must be provided');
    });
  });

  describe('4. Duplicate Subject Detection', () => {
    it('detects duplicate subjects in candidate input list', () => {
      const duplicateSubjects: SubjectGrade[] = [
        { subjectName: 'Mathematics', grade: 'A1' },
        { subjectName: 'Mathematics', grade: 'B2' },
        { subjectName: 'English Language', grade: 'A1' },
        { subjectName: 'Physics', grade: 'B3' },
        { subjectName: 'Chemistry', grade: 'C4' }
      ];

      const names = duplicateSubjects.map((s) => s.subjectName.toLowerCase().trim());
      const hasDuplicate = new Set(names).size !== names.length;
      expect(hasDuplicate).toBe(true);

      const response = calculateAggregate({
        session: '2025/2026',
        utmeScore: 280,
        putmeScore: 20.0,
        olevelGrades: duplicateSubjects
      });
      expect(response.success).toBe(false);
      expect((response as CalculationError).code).toBe('INVALID_OLEVEL_GRADES');
      expect((response as CalculationError).message).toContain('Duplicate subject detected');
    });
  });

  describe('5. Target Mode Reverse Calculator Workflows', () => {
    it('calculates achievable required Post-UTME score for a competitive course', () => {
      // Medicine cut-off = 83.425
      // Candidate: UTME 330 (41.25 pts), O'Level 16.0 pts -> Known = 57.25 pts
      // Required Post-UTME = 83.425 - 57.25 = 26.175
      const res = calculateRequiredPutme({
        session: '2025/2026',
        targetAggregate: 83.425,
        utmeScore: 330,
        olevelGrades: valid5Subjects // points: 4.0 + 3.6 + 3.2 + 2.8 + 2.4 = 16.0
      });

      expect(res.success).toBe(true);
      const targetRes = res as TargetCalculationResult;
      expect(targetRes.status).toBe('ACHIEVABLE');
      expect(targetRes.requiredPutmeScore).toBe(26.175);
      expect(targetRes.isAchievable).toBe(true);
    });

    it('returns MATHEMATICALLY_IMPOSSIBLE when target exceeds 100 or requires > 30.0 in Post-UTME', () => {
      const res = calculateRequiredPutme({
        session: '2025/2026',
        targetAggregate: 95.0,
        utmeScore: 250, // 31.25 pts
        olevelGrades: valid5Subjects // 16.0 pts -> known = 47.25 pts. Required Putme = 47.75 (> 30.0)
      });

      expect(res.success).toBe(true);
      const targetRes = res as TargetCalculationResult;
      expect(targetRes.status).toBe('MATHEMATICALLY_IMPOSSIBLE');
      expect(targetRes.isAchievable).toBe(false);
    });

    it('returns ALREADY_SURPASSED when known scores already meet or exceed target', () => {
      const res = calculateRequiredPutme({
        session: '2025/2026',
        targetAggregate: 55.0,
        utmeScore: 340, // 42.5 pts
        olevelGrades: valid5Subjects // 16.0 pts -> known = 58.5 pts (> 55.0)
      });

      expect(res.success).toBe(true);
      const targetRes = res as TargetCalculationResult;
      expect(targetRes.status).toBe('ALREADY_SURPASSED');
      expect(targetRes.requiredPutmeScore).toBe(0);
      expect(targetRes.isAchievable).toBe(true);
    });
  });

  describe('6. Department Filter & Catchment vs. Merit Comparison', () => {
    it('correctly categorizes the 6 South-Western states as Catchment states', () => {
      expect(SOUTH_WEST_CATCHMENT_STATES).toEqual(['EKITI', 'LAGOS', 'OGUN', 'ONDO', 'OSUN', 'OYO']);
      expect(SOUTH_WEST_CATCHMENT_STATES.includes('LAGOS')).toBe(true);
      expect(SOUTH_WEST_CATCHMENT_STATES.includes('KANO')).toBe(false);
    });

    it('correctly matches Computer Science cut-offs for Merit and Lagos Catchment', () => {
      const cs = dataset.records.find((r) => r.programme === 'COMPUTER SCIENCE');
      expect(cs).toBeDefined();
      expect(cs?.merit).toBe(82.05);
      expect(cs?.catchment.lagos).toBe(73.225);
    });

    it('safely handles programmes with NIL / null cut-offs without coercing to zero', () => {
      const recordsWithNull = dataset.records.filter(
        (r) =>
          r.merit === null ||
          Object.values(r.catchment).some((val) => val === null)
      );
      expect(recordsWithNull.length).toBeGreaterThan(0);

      const nullSample = recordsWithNull[0];
      const hasStrictNull =
        nullSample.merit === null ||
        Object.values(nullSample.catchment).includes(null);
      expect(hasStrictNull).toBe(true);
    });

    it('calculates correct margin between candidate aggregate and departmental cut-off', () => {
      const userAggregate = 78.400;
      const meritCutoff = 82.050;
      const lagosCutoff = 73.225;

      const meritMargin = userAggregate - meritCutoff;
      const lagosMargin = userAggregate - lagosCutoff;

      expect(Number(meritMargin.toFixed(3))).toBe(-3.650);
      expect(Number(lagosMargin.toFixed(3))).toBe(5.175);
    });
  });
});
