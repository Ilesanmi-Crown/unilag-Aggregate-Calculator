import { describe, it, expect } from 'vitest';
import { validateCandidateInputs, validateTargetInputs } from '../../src/core/validator.js';
import { CalculationError } from '../../src/core/types.js';

describe('Validator & Boundary Guards', () => {
  const validGrades = [
    { subjectName: 'English', grade: 'A1' },
    { subjectName: 'Mathematics', grade: 'B2' },
    { subjectName: 'Physics', grade: 'B3' },
    { subjectName: 'Chemistry', grade: 'C4' },
    { subjectName: 'Biology', grade: 'C5' }
  ];

  describe('Session Validation', () => {
    it('rejects missing or empty session', () => {
      const res = validateCandidateInputs({
        session: '',
        utmeScore: 250,
        putmeScore: 20,
        olevelGrades: validGrades
      }) as CalculationError;

      expect(res.success).toBe(false);
      expect(res.code).toBe('INVALID_INPUT');
    });

    it('rejects completely unsupported academic session', () => {
      const res = validateCandidateInputs({
        session: '1999/2000',
        utmeScore: 250,
        putmeScore: 20,
        olevelGrades: validGrades
      }) as CalculationError;

      expect(res.success).toBe(false);
      expect(res.code).toBe('UNSUPPORTED_SESSION');
    });

    it('rejects unverified 2026/2027 session by default without explicit simulation flag', () => {
      const res = validateCandidateInputs({
        session: '2026/2027',
        utmeScore: 250,
        putmeScore: 20,
        olevelGrades: validGrades
      }) as CalculationError;

      expect(res.success).toBe(false);
      expect(res.code).toBe('UNVERIFIED_SESSION');
      expect(res.message).toContain('not officially verified');
    });

    it('allows 2026/2027 preliminary session when allowPreliminarySession is true', () => {
      const res = validateCandidateInputs({
        session: '2026/2027',
        utmeScore: 250,
        putmeScore: 20,
        olevelGrades: validGrades,
        allowPreliminarySession: true
      });

      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.warnings.some(w => w.includes('Preliminary Session'))).toBe(true);
      }
    });
  });

  describe('UTME Input Validation', () => {
    it('rejects negative UTME score', () => {
      const res = validateCandidateInputs({
        session: '2025/2026',
        utmeScore: -1,
        putmeScore: 20,
        olevelGrades: validGrades
      }) as CalculationError;

      expect(res.success).toBe(false);
      expect(res.code).toBe('INVALID_UTME_SCORE');
    });

    it('rejects UTME score above 400', () => {
      const res = validateCandidateInputs({
        session: '2025/2026',
        utmeScore: 401,
        putmeScore: 20,
        olevelGrades: validGrades
      }) as CalculationError;

      expect(res.success).toBe(false);
      expect(res.code).toBe('INVALID_UTME_SCORE');
    });

    it('rejects non-integer UTME score (JAMB scores are integers)', () => {
      const res = validateCandidateInputs({
        session: '2025/2026',
        utmeScore: 275.5,
        putmeScore: 20,
        olevelGrades: validGrades
      }) as CalculationError;

      expect(res.success).toBe(false);
      expect(res.code).toBe('INVALID_UTME_SCORE');
      expect(res.message).toContain('integer');
    });

    it('rejects non-numeric UTME score', () => {
      const res = validateCandidateInputs({
        session: '2025/2026',
        utmeScore: NaN,
        putmeScore: 20,
        olevelGrades: validGrades
      }) as CalculationError;

      expect(res.success).toBe(false);
      expect(res.code).toBe('INVALID_UTME_SCORE');
    });
  });

  describe('Post-UTME Input Validation', () => {
    it('rejects negative Post-UTME score', () => {
      const res = validateCandidateInputs({
        session: '2025/2026',
        utmeScore: 250,
        putmeScore: -0.5,
        olevelGrades: validGrades
      }) as CalculationError;

      expect(res.success).toBe(false);
      expect(res.code).toBe('INVALID_PUTME_SCORE');
    });

    it('rejects Post-UTME score exceeding 30.0', () => {
      const res = validateCandidateInputs({
        session: '2025/2026',
        utmeScore: 250,
        putmeScore: 30.1,
        olevelGrades: validGrades
      }) as CalculationError;

      expect(res.success).toBe(false);
      expect(res.code).toBe('INVALID_PUTME_SCORE');
    });

    it('rejects non-numeric Post-UTME score', () => {
      const res = validateCandidateInputs({
        session: '2025/2026',
        utmeScore: 250,
        putmeScore: 'twenty' as unknown as number,
        olevelGrades: validGrades
      }) as CalculationError;

      expect(res.success).toBe(false);
      expect(res.code).toBe('INVALID_PUTME_SCORE');
    });
  });

  describe('OLevel Grades Validation', () => {
    it('rejects when fewer than 5 subjects are provided', () => {
      const res = validateCandidateInputs({
        session: '2025/2026',
        utmeScore: 250,
        putmeScore: 20,
        olevelGrades: validGrades.slice(0, 4)
      }) as CalculationError;

      expect(res.success).toBe(false);
      expect(res.code).toBe('INVALID_OLEVEL_GRADES');
      expect(res.message).toContain('Exactly 5 relevant O\'Level subjects');
    });

    it('rejects when more than 5 subjects are provided', () => {
      const res = validateCandidateInputs({
        session: '2025/2026',
        utmeScore: 250,
        putmeScore: 20,
        olevelGrades: [...validGrades, { subjectName: 'Geography', grade: 'B2' }]
      }) as CalculationError;

      expect(res.success).toBe(false);
      expect(res.code).toBe('INVALID_OLEVEL_GRADES');
    });

    it('rejects duplicate subject names', () => {
      const res = validateCandidateInputs({
        session: '2025/2026',
        utmeScore: 250,
        putmeScore: 20,
        olevelGrades: [
          { subjectName: 'Mathematics', grade: 'A1' },
          { subjectName: 'mathematics', grade: 'B2' }, // duplicate case-insensitive
          { subjectName: 'English', grade: 'A1' },
          { subjectName: 'Physics', grade: 'A1' },
          { subjectName: 'Chemistry', grade: 'A1' }
        ]
      }) as CalculationError;

      expect(res.success).toBe(false);
      expect(res.code).toBe('INVALID_OLEVEL_GRADES');
      expect(res.message).toContain('Duplicate subject');
    });

    it('rejects invalid grade letter codes', () => {
      const res = validateCandidateInputs({
        session: '2025/2026',
        utmeScore: 250,
        putmeScore: 20,
        olevelGrades: [
          { subjectName: 'English', grade: 'Z9' as unknown as 'A1' },
          ...validGrades.slice(1)
        ]
      }) as CalculationError;

      expect(res.success).toBe(false);
      expect(res.code).toBe('INVALID_OLEVEL_GRADES');
      expect(res.message).toContain('Invalid grade "Z9"');
    });
  });

  describe('Target Inputs Validation', () => {
    it('rejects target aggregate above 100.0', () => {
      const res = validateTargetInputs({
        session: '2025/2026',
        targetAggregate: 101.0,
        utmeScore: 250,
        olevelGrades: validGrades
      }) as CalculationError;

      expect(res.success).toBe(false);
      expect(res.code).toBe('INVALID_TARGET_AGGREGATE');
    });

    it('rejects target aggregate below 0.0', () => {
      const res = validateTargetInputs({
        session: '2025/2026',
        targetAggregate: -5.0,
        utmeScore: 250,
        olevelGrades: validGrades
      }) as CalculationError;

      expect(res.success).toBe(false);
      expect(res.code).toBe('INVALID_TARGET_AGGREGATE');
    });
  });
});
