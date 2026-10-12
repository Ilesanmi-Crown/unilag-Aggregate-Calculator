import { describe, it, expect } from 'vitest';
import { parseUtmeText, parseOlevelText, parsePutmeText } from '../../src/ocr/parser';
import { calculateAggregate } from '../../src/core/calculator';
import { SubjectGrade } from '../../src/core/types';

describe('OCR to Calculator Engine Integration Flow', () => {
  it('translates scanned UTME text into calculator input and executes aggregate calculation correctly', () => {
    const rawUtmeSlip = `
      JOINT ADMISSIONS AND MATRICULATION BOARD
      2025 UTME RESULTS
      CANDIDATE: OLUWATOBI ADISA
      Use of English: 70
      Mathematics: 80
      Physics: 75
      Chemistry: 75
      TOTAL SCORE: 300
    `;

    // 1. OCR Parser layer
    const extracted = parseUtmeText(rawUtmeSlip);
    expect(extracted.totalScore).toBe(300);

    // 2. Calculator input mapping
    const utmeScore = extracted.totalScore!;
    const putmeScore = 24.0;
    const defaultOlevel: SubjectGrade[] = [
      { subjectName: 'English Language', grade: 'A1' },
      { subjectName: 'Mathematics', grade: 'B2' },
      { subjectName: 'Physics', grade: 'B3' },
      { subjectName: 'Chemistry', grade: 'C4' },
      { subjectName: 'Biology', grade: 'C5' }
    ];

    // 3. Scoring Engine Execution
    const response = calculateAggregate({
      session: '2025/2026',
      utmeScore,
      putmeScore,
      olevelGrades: defaultOlevel
    });

    expect(response.success).toBe(true);
    if (response.success) {
      // 300 * 0.125 = 37.5
      expect(response.breakdown.utmePoints).toBe(37.5);
      // O'Level: 4.0 + 3.6 + 3.2 + 2.8 + 2.4 = 16.0
      expect(response.breakdown.olevelPoints).toBe(16.0);
      expect(response.breakdown.putmePoints).toBe(24.0);
      // Total: 37.5 + 16.0 + 24.0 = 77.500
      expect(response.breakdown.totalAggregate).toBe(77.5);
      expect(response.breakdown.formatted.totalAggregate).toBe('77.500');
    }
  });

  it('translates scanned O\'Level text into calculator subject grades and evaluates exact points', () => {
    const rawWaecSlip = `
      WEST AFRICAN EXAMINATIONS COUNCIL
      WASSCE MAY/JUNE 2024
      ENGLISH LANGUAGE A1
      MATHEMATICS A1
      PHYSICS A1
      CHEMISTRY A1
      BIOLOGY A1
      FURTHER MATHEMATICS B2
    `;

    const extracted = parseOlevelText(rawWaecSlip);
    expect(extracted.subjects.length).toBeGreaterThanOrEqual(5);

    // Map top 5 subjects
    const candidateSubjects: SubjectGrade[] = extracted.subjects.slice(0, 5).map((s) => ({
      subjectName: s.subjectName,
      grade: s.grade as any
    }));

    const response = calculateAggregate({
      session: '2025/2026',
      utmeScore: 280,
      putmeScore: 25.0,
      olevelGrades: candidateSubjects
    });

    expect(response.success).toBe(true);
    if (response.success) {
      // All 5 A1s = 5 * 4.0 = 20.000 max points
      expect(response.breakdown.olevelPoints).toBe(20.0);
      // UTME: 280 * 0.125 = 35.0
      expect(response.breakdown.utmePoints).toBe(35.0);
      // Putme: 25.0
      expect(response.breakdown.putmePoints).toBe(25.0);
      // Total: 35.0 + 20.0 + 25.0 = 80.000
      expect(response.breakdown.totalAggregate).toBe(80.0);
    }
  });

  it('translates scanned UNILAG Post-UTME text into calculator and produces combined total', () => {
    const rawPutmeSlip = `
      UNIVERSITY OF LAGOS
      2025/2026 POST-UTME SCREENING RESULT
      CANDIDATE: BELLO AHMED
      UTME SCORE: 288
      POST-UTME SCORE: 25.50 / 30
    `;

    const extracted = parsePutmeText(rawPutmeSlip);
    expect(extracted.score).toBe(25.5);

    const defaultOlevel: SubjectGrade[] = [
      { subjectName: 'English Language', grade: 'B2' },
      { subjectName: 'Mathematics', grade: 'B2' },
      { subjectName: 'Physics', grade: 'B2' },
      { subjectName: 'Chemistry', grade: 'B2' },
      { subjectName: 'Biology', grade: 'B2' }
    ];

    const response = calculateAggregate({
      session: '2025/2026',
      utmeScore: 288,
      putmeScore: extracted.score!,
      olevelGrades: defaultOlevel
    });

    expect(response.success).toBe(true);
    if (response.success) {
      // UTME: 288 * 0.125 = 36.0
      expect(response.breakdown.utmePoints).toBe(36.0);
      // O'Level: 5 * 3.6 = 18.0
      expect(response.breakdown.olevelPoints).toBe(18.0);
      // Putme: 25.5
      expect(response.breakdown.putmePoints).toBe(25.5);
      // Total: 36.0 + 18.0 + 25.5 = 79.500
      expect(response.breakdown.totalAggregate).toBe(79.5);
    }
  });

  it('preserves all scoring safeguards when low or invalid scanned scores are provided', () => {
    const lowUtmeSlip = `
      JAMB 2025 RESULT
      TOTAL SCORE: 180
    `;

    const extracted = parseUtmeText(lowUtmeSlip);
    expect(extracted.totalScore).toBe(180);

    const defaultOlevel: SubjectGrade[] = [
      { subjectName: 'English Language', grade: 'A1' },
      { subjectName: 'Mathematics', grade: 'A1' },
      { subjectName: 'Physics', grade: 'A1' },
      { subjectName: 'Chemistry', grade: 'A1' },
      { subjectName: 'Biology', grade: 'A1' }
    ];

    const response = calculateAggregate({
      session: '2025/2026',
      utmeScore: extracted.totalScore!,
      putmeScore: 20.0,
      olevelGrades: defaultOlevel
    });

    // Score is computed, but an eligibility warning is flagged because UTME < 200
    expect(response.success).toBe(true);
    if (response.success) {
      expect(response.eligibility.warnings.some((w) => w.includes('200'))).toBe(true);
    }
  });
});
