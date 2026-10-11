import { describe, it, expect } from 'vitest';
import {
  getSessionConfig,
  getRegisteredSessions,
  getSupportedCalculationSessions,
  validateSessionConfig
} from '../../src/core/rulesEngine.js';

describe('Rules Engine & Session Registry', () => {
  it('loads 2025/2026 confirmed historical session with calculation supported', () => {
    const config = getSessionConfig('2025/2026');
    expect(config).not.toBeNull();
    expect(config?.session).toBe('2025/2026');
    expect(config?.verificationStatus).toBe('CONFIRMED');
    expect(config?.isCalculationSupported).toBe(true);
    expect(config?.weights.utmeWeight).toBe(50);
    expect(config?.weights.putmeWeight).toBe(30);
    expect(config?.weights.olevelWeight).toBe(20);
    expect(config?.eligibility.minimumUtmeScore).toBe(200);
    expect(config?.eligibility.maximumSittings).toBe(1);
  });

  it('loads 2026/2027 session with PRELIMINARY status and calculation unsupported by default', () => {
    const config = getSessionConfig('2026/2027');
    expect(config).not.toBeNull();
    expect(config?.session).toBe('2026/2027');
    expect(config?.verificationStatus).toBe('PRELIMINARY');
    expect(config?.isCalculationSupported).toBe(false);
  });

  it('returns null for unregistered session', () => {
    expect(getSessionConfig('2020/2021')).toBeNull();
    expect(getSessionConfig('nonexistent')).toBeNull();
  });

  it('lists registered sessions correctly', () => {
    const sessions = getRegisteredSessions();
    expect(sessions).toContain('2025/2026');
    expect(sessions).toContain('2026/2027');
  });

  it('lists only supported calculation sessions', () => {
    const supported = getSupportedCalculationSessions();
    expect(supported).toContain('2025/2026');
    expect(supported).not.toContain('2026/2027');
  });

  describe('Runtime Schema Validation (validateSessionConfig)', () => {
    it('throws when config is not an object', () => {
      expect(() => validateSessionConfig(null)).toThrow('Session config must be a non-null object');
      expect(() => validateSessionConfig('invalid')).toThrow('Session config must be a non-null object');
    });

    it('throws when weights do not sum to 100', () => {
      const invalidWeights = {
        session: '2099/3000',
        verificationStatus: 'CONFIRMED',
        isCalculationSupported: true,
        weights: {
          utmeMaxScore: 400,
          utmeWeight: 60, // 60 + 30 + 20 = 110 != 100
          putmeMaxScore: 30,
          putmeWeight: 30,
          olevelMaxScore: 20,
          olevelWeight: 20
        },
        eligibility: {
          minimumUtmeScore: 200,
          maximumSittings: 1,
          requiredSubjectCount: 5,
          minimumAge: 16
        },
        olevelGrading: {
          gradePoints: { A1: 4, B2: 3.6, B3: 3.2, C4: 2.8, C5: 2.4, C6: 2 },
          failingGradePoints: 0,
          minimumQualifyingGrade: 'C6'
        },
        roundingPolicy: { decimalPlaces: 3, strategy: 'ROUND_HALF_UP' },
        source: { url: 'https://test', title: 'Test' }
      };

      expect(() => validateSessionConfig(invalidWeights)).toThrow('Weights must sum to 100 points');
    });

    it('throws when missing grade points in olevelGrading', () => {
      const missingGrade = {
        session: '2099/3000',
        verificationStatus: 'CONFIRMED',
        isCalculationSupported: true,
        weights: {
          utmeMaxScore: 400,
          utmeWeight: 50,
          putmeMaxScore: 30,
          putmeWeight: 30,
          olevelMaxScore: 20,
          olevelWeight: 20
        },
        eligibility: {
          minimumUtmeScore: 200,
          maximumSittings: 1,
          requiredSubjectCount: 5,
          minimumAge: 16
        },
        olevelGrading: {
          gradePoints: { A1: 4, B2: 3.6, B3: 3.2, C4: 2.8, C5: 2.4 /* C6 missing */ },
          failingGradePoints: 0,
          minimumQualifyingGrade: 'C6'
        },
        roundingPolicy: { decimalPlaces: 3, strategy: 'ROUND_HALF_UP' },
        source: { url: 'https://test', title: 'Test' }
      };

      expect(() => validateSessionConfig(missingGrade)).toThrow('Missing numeric point mapping for grade: C6');
    });
  });
});
