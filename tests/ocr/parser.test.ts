import { describe, it, expect } from 'vitest';
import {
  parseUtmeText,
  parseOlevelText,
  parsePutmeText,
  parseOcrResult
} from '../../src/ocr/parser';

describe('OCR Parser - JAMB UTME Slips', () => {
  it('correctly extracts total score, subjects, name, and ignores reg numbers and timestamps', () => {
    const rawSlip = `
      JOINT ADMISSIONS AND MATRICULATION BOARD
      2025 UTME RESULTS NOTIFICATION
      REGISTRATION NUMBER: 202519283748JA
      EXAMINATION NUMBER: 4010203045
      DATE OF EXAM: 14/05/2025 09:30:15 AM
      PHONE: 08034567890
      CANDIDATE NAME: ADEBAYO OLUWASEUN SAMUEL
      
      SUBJECTS TAKEN:
      Use of English: 72
      Mathematics: 85
      Physics: 78
      Chemistry: 75

      AGGREGATE SCORE: 310
    `;

    const result = parseUtmeText(rawSlip);
    expect(result.category).toBe('UTME');
    expect(result.totalScore).toBe(310);
    expect(result.examYear).toBe('2025');
    expect(result.candidateName).toBe('ADEBAYO OLUWASEUN SAMUEL');
    expect(result.subjects).toHaveLength(4);
    expect(result.subjects.find((s) => s.name === 'Mathematics')?.score).toBe(85);
    expect(result.subjects.find((s) => s.name === 'Physics')?.score).toBe(78);
    expect(result.confidence).toBe('high');
    expect(result.uncertainties).toHaveLength(0);
  });

  it('infers total score from sum of 4 subjects when total label is missing', () => {
    const rawSlip = `
      JAMB 2025 NOTIFICATION
      CANDIDATE NAME: OKONKWO CHIDI
      Use of English: 65
      Mathematics: 70
      Physics: 60
      Chemistry: 65
    `;

    const result = parseUtmeText(rawSlip);
    expect(result.totalScore).toBe(260);
    expect(result.uncertainties.some((u) => u.includes('inferred from the sum'))).toBe(true);
  });

  it('flags warning when total score does not match sum of subject scores', () => {
    const rawSlip = `
      JAMB 2025 RESULT
      Use of English: 60
      Mathematics: 60
      Physics: 60
      Chemistry: 60
      TOTAL SCORE: 300
    `;

    const result = parseUtmeText(rawSlip);
    expect(result.totalScore).toBe(300);
    expect(result.uncertainties.some((u) => u.includes('Discrepancy'))).toBe(true);
  });

  it('flags category mismatch when OLevel result is parsed with UTME parser', () => {
    const rawSlip = `
      WEST AFRICAN EXAMINATIONS COUNCIL
      WASSCE 2024
      ENGLISH LANGUAGE: A1
      MATHEMATICS: B2
      PHYSICS: B3
      CHEMISTRY: C4
      BIOLOGY: C5
    `;

    const result = parseUtmeText(rawSlip);
    expect(result.uncertainties.some((u) => u.includes("appears to be an O'Level result"))).toBe(true);
  });
});

describe('OCR Parser - O\'Level Slips (WAEC / NECO / NABTEB / GCE)', () => {
  it('extracts subjects, normalizes names and letter grades, and detects exam body and year', () => {
    const rawSlip = `
      WEST AFRICAN SENIOR SCHOOL CERTIFICATE EXAMINATION (WASSCE)
      MAY/JUNE 2024
      CANDIDATE NAME: IBRAHIM FATIMA ZAHRA
      EXAMINATION NUMBER: 4020102034
      CENTRE NUMBER: 4020102
      DATE OF BIRTH: 12/08/2007

      SUBJECT RESULTS:
      ENGLISH LANGUAGE - A1
      GENERAL MATHEMATICS - B2
      PHYSICS - B3
      CHEMISTRY - C4
      BIOLOGY - C5
      FURTHER MATHS - A1
      ECONOMICS - B2
    `;

    const result = parseOlevelText(rawSlip);
    expect(result.category).toBe('OLEVEL');
    expect(result.examBody).toBe('WAEC');
    expect(result.examYear).toBe('2024');
    expect(result.candidateName).toBe('IBRAHIM FATIMA ZAHRA');
    expect(result.subjects.length).toBeGreaterThanOrEqual(5);

    const eng = result.subjects.find((s) => s.subjectName === 'English Language');
    expect(eng?.grade).toBe('A1');

    const math = result.subjects.find((s) => s.subjectName === 'Mathematics');
    expect(math?.grade).toBe('B2');

    const fmath = result.subjects.find((s) => s.subjectName === 'Further Mathematics');
    expect(fmath?.grade).toBe('A1');
  });

  it('handles OCR character glitches such as "Al" for A1 and "O6" for C6', () => {
    const rawSlip = `
      NATIONAL EXAMINATIONS COUNCIL (NECO)
      JUNE/JULY 2023
      ENGLISH LANGUAGE Al
      MATHEMATICS B2
      PHYSICS B3
      CHEMISTRY C4
      BIOLOGY O6
    `;

    const result = parseOlevelText(rawSlip);
    expect(result.examBody).toBe('NECO');
    expect(result.subjects.find((s) => s.subjectName === 'English Language')?.grade).toBe('A1');
    expect(result.subjects.find((s) => s.subjectName === 'Biology')?.grade).toBe('C6');
  });

  it('flags warning when fewer than 5 subjects are detected', () => {
    const rawSlip = `
      WAEC GCE 2023
      ENGLISH LANGUAGE A1
      MATHEMATICS B2
    `;

    const result = parseOlevelText(rawSlip);
    expect(result.subjects).toHaveLength(2);
    expect(result.uncertainties.some((u) => u.includes('requires 5 relevant subjects'))).toBe(true);
    expect(result.confidence).toBe('low');
  });
});

describe('OCR Parser - UNILAG Post-UTME Slips', () => {
  it('correctly extracts Post-UTME score out of 30 and does NOT mistake UTME score for Post-UTME', () => {
    const rawSlip = `
      UNIVERSITY OF LAGOS, AKOKA
      2025/2026 POST-UTME SCREENING EXERCISE
      CANDIDATE NAME: EZE CHUKWUEMEKA
      JAMB REG NUMBER: 202511223344JA
      UTME SCORE: 290
      
      POST-UTME SCORE: 24.50 / 30
      FACULTY: ENGINEERING
      PROGRAMME: ELECTRICAL & ELECTRONICS ENGINEERING
    `;

    const result = parsePutmeText(rawSlip);
    expect(result.category).toBe('PUTME');
    expect(result.score).toBe(24.5);
    expect(result.maxScore).toBe(30.0);
    expect(result.examYear).toBe('2025');
    expect(result.candidateName).toBe('EZE CHUKWUEMEKA');
    expect(result.confidence).toBe('high');
  });

  it('extracts decimal Post-UTME score with 3-decimal precision', () => {
    const rawSlip = `
      UNILAG POST-UTME SCREENING 2025
      TOTAL SCORE: 21.667 / 30
    `;

    const result = parsePutmeText(rawSlip);
    expect(result.score).toBe(21.667);
  });

  it('flags error when score is not detectable or out of boundary', () => {
    const rawSlip = `
      UNILAG ADMISSIONS
      POST-UTME SCORE: 45.00
    `;

    const result = parsePutmeText(rawSlip);
    // 45 is > 30, so it shouldn't match as valid Post-UTME score
    expect(result.score).toBeUndefined();
    expect(result.uncertainties.some((u) => u.includes('Could not detect Post-UTME score'))).toBe(true);
  });
});

describe('Universal Dispatcher parseOcrResult', () => {
  it('routes correctly by category', () => {
    const utme = parseOcrResult('UTME SCORE: 280', 'UTME');
    expect(utme.category).toBe('UTME');

    const olevel = parseOcrResult('ENGLISH LANGUAGE A1\nMATHEMATICS B2', 'OLEVEL');
    expect(olevel.category).toBe('OLEVEL');

    const putme = parseOcrResult('POST-UTME: 22.5 / 30', 'PUTME');
    expect(putme.category).toBe('PUTME');
  });
});
