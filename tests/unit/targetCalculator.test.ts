import { describe, it, expect } from 'vitest';
import { calculateRequiredPutme } from '../../src/core/targetCalculator.js';
import { TargetCalculationResult, SubjectGrade } from '../../src/core/types.js';

describe('Reverse Target Calculator', () => {
  const verifiedSession = '2025/2026';

  const perfect5A1s: SubjectGrade[] = [
    { subjectName: 'English', grade: 'A1' }, // 4.0
    { subjectName: 'Mathematics', grade: 'A1' }, // 4.0
    { subjectName: 'Physics', grade: 'A1' }, // 4.0
    { subjectName: 'Chemistry', grade: 'A1' }, // 4.0
    { subjectName: 'Biology', grade: 'A1' } // 4.0 -> Total Olevel = 20.0
  ];

  const min5C6s: SubjectGrade[] = [
    { subjectName: 'English', grade: 'C6' }, // 2.0
    { subjectName: 'Mathematics', grade: 'C6' }, // 2.0
    { subjectName: 'Physics', grade: 'C6' }, // 2.0
    { subjectName: 'Chemistry', grade: 'C6' }, // 2.0
    { subjectName: 'Biology', grade: 'C6' } // 2.0 -> Total Olevel = 10.0
  ];

  describe('Achievable Target Cases', () => {
    it('TC-TGT-01: Medicine merit cut-off target (83.425) with UTME 320 and 5 A1s', () => {
      // UTME 320 -> 40.0 pts; OLevel -> 20.0 pts; Current = 60.0 pts
      // Required PUTME = 83.425 - 60.0 = 23.425
      const response = calculateRequiredPutme({
        session: verifiedSession,
        targetAggregate: 83.425,
        utmeScore: 320,
        olevelGrades: perfect5A1s
      });

      expect(response.success).toBe(true);
      const res = response as TargetCalculationResult;
      expect(res.status).toBe('ACHIEVABLE');
      expect(res.isAchievable).toBe(true);
      expect(res.currentPointsFromUtmeAndOlevel).toBe(60.000);
      expect(res.requiredPutmeScore).toBe(23.425);
      expect(res.requiredPutmeScoreFormatted).toBe('23.425');
    });

    it('calculates exact boundary target requiring maximum 30.000 in PUTME', () => {
      // Target 100.0, UTME 400 (50.0 pts), 5 A1s (20.0 pts) -> Required = 30.000
      const response = calculateRequiredPutme({
        session: verifiedSession,
        targetAggregate: 100.0,
        utmeScore: 400,
        olevelGrades: perfect5A1s
      });

      expect(response.success).toBe(true);
      const res = response as TargetCalculationResult;
      expect(res.status).toBe('ACHIEVABLE');
      expect(res.isAchievable).toBe(true);
      expect(res.requiredPutmeScore).toBe(30.000);
      expect(res.requiredPutmeScoreFormatted).toBe('30.000');
    });

    it('attaches warning when required PUTME is below the historical 12/30 pass mark', () => {
      // Target 65.0, UTME 320 (40.0 pts), 5 A1s (20.0 pts) -> Current = 60.0 pts
      // Required = 65.0 - 60.0 = 5.000 (< 12.0)
      const response = calculateRequiredPutme({
        session: verifiedSession,
        targetAggregate: 65.0,
        utmeScore: 320,
        olevelGrades: perfect5A1s
      });

      expect(response.success).toBe(true);
      const res = response as TargetCalculationResult;
      expect(res.status).toBe('ACHIEVABLE');
      expect(res.requiredPutmeScore).toBe(5.000);
      expect(res.warning).toBeDefined();
      expect(res.warning).toContain('Historical Pass Mark Notice');
      expect(res.warning).toContain('12/30');
    });
  });

  describe('Impossible Target Cases', () => {
    it('TC-TGT-03: Flags impossible target when required score exceeds 30.0', () => {
      // UTME 200 (25.0 pts), 5 C6s (10.0 pts) -> Current = 35.0 pts
      // Target 75.0 -> Max achievable is 35.0 + 30.0 = 65.0 < 75.0
      // Required = 40.0 > 30.0
      const response = calculateRequiredPutme({
        session: verifiedSession,
        targetAggregate: 75.0,
        utmeScore: 200,
        olevelGrades: min5C6s
      });

      expect(response.success).toBe(true);
      const res = response as TargetCalculationResult;
      expect(res.status).toBe('MATHEMATICALLY_IMPOSSIBLE');
      expect(res.isAchievable).toBe(false);
      expect(res.message).toContain('mathematically unattainable');
      expect(res.message).toContain('highest possible aggregate is 65.000');
    });
  });

  describe('Already Surpassed Target Cases', () => {
    it('TC-TGT-04: Recognizes when candidate already exceeds target before Post-UTME', () => {
      // Target 55.0, UTME 320 (40.0 pts), 5 A1s (20.0 pts) -> Current = 60.0 pts > 55.0
      const response = calculateRequiredPutme({
        session: verifiedSession,
        targetAggregate: 55.0,
        utmeScore: 320,
        olevelGrades: perfect5A1s
      });

      expect(response.success).toBe(true);
      const res = response as TargetCalculationResult;
      expect(res.status).toBe('ALREADY_SURPASSED');
      expect(res.isAchievable).toBe(true);
      expect(res.requiredPutmeScore).toBe(0.000);
      expect(res.message).toContain('already meet or exceed');
    });
  });

  describe('Session Rule Re-use', () => {
    it('uses the same session configuration and rejects unverified sessions by default', () => {
      const response = calculateRequiredPutme({
        session: '2026/2027',
        targetAggregate: 80.0,
        utmeScore: 300,
        olevelGrades: perfect5A1s
      });

      expect(response.success).toBe(false);
      if (!response.success) {
        expect(response.code).toBe('UNVERIFIED_SESSION');
      }
    });

    it('supports preliminary reverse target calculation when allowPreliminarySession is true', () => {
      const response = calculateRequiredPutme({
        session: '2026/2027',
        targetAggregate: 80.0,
        utmeScore: 300,
        olevelGrades: perfect5A1s,
        allowPreliminarySession: true
      });

      expect(response.success).toBe(true);
      const res = response as TargetCalculationResult;
      expect(res.isPreliminary).toBe(true);
    });
  });
});
