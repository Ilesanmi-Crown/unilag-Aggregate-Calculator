import {
  ResultCategory,
  ExtractedResultData,
  ExtractedUtmeData,
  ExtractedUtmeSubject,
  ExtractedOlevelData,
  ExtractedOlevelSubject,
  ExtractedPutmeData,
  ConfidenceLevel
} from './types';
import { OlevelGrade } from '../core/types';

// Canonical O'Level subject catalog for normalization
export const OLEVEL_SUBJECT_CATALOG: Record<string, string> = {
  'ENGLISH LANGUAGE': 'English Language',
  'ENGLISH': 'English Language',
  'ENG LANG': 'English Language',
  'ENG': 'English Language',
  'MATHEMATICS': 'Mathematics',
  'GENERAL MATHEMATICS': 'Mathematics',
  'GEN MATH': 'Mathematics',
  'MATH': 'Mathematics',
  'MATHS': 'Mathematics',
  'PHYSICS': 'Physics',
  'PHYS': 'Physics',
  'CHEMISTRY': 'Chemistry',
  'CHEM': 'Chemistry',
  'BIOLOGY': 'Biology',
  'BIO': 'Biology',
  'FURTHER MATHEMATICS': 'Further Mathematics',
  'FURTHER MATHS': 'Further Mathematics',
  'FURTHER MATH': 'Further Mathematics',
  'F/MATHS': 'Further Mathematics',
  'F/MATH': 'Further Mathematics',
  'ADDITIONAL MATHEMATICS': 'Further Mathematics',
  'AGRICULTURAL SCIENCE': 'Agricultural Science',
  'AGRIC SCIENCE': 'Agricultural Science',
  'AGRIC': 'Agricultural Science',
  'ECONOMICS': 'Economics',
  'ECON': 'Economics',
  'GOVERNMENT': 'Government',
  'GOVT': 'Government',
  'LITERATURE IN ENGLISH': 'Literature in English',
  'LIT IN ENG': 'Literature in English',
  'LITERATURE': 'Literature in English',
  'CHRISTIAN RELIGIOUS STUDIES': 'CRS',
  'CHRISTIAN RELIGIOUS KNOWLEDGE': 'CRS',
  'CRS': 'CRS',
  'CRK': 'CRS',
  'ISLAMIC RELIGIOUS STUDIES': 'IRS',
  'ISLAMIC RELIGIOUS KNOWLEDGE': 'IRS',
  'IRS': 'IRS',
  'IRK': 'IRS',
  'CIVIC EDUCATION': 'Civic Education',
  'CIVIC EDU': 'Civic Education',
  'CIVIC': 'Civic Education',
  'COMMERCE': 'Commerce',
  'FINANCIAL ACCOUNTING': 'Financial Accounting',
  'FIN ACCOUNTING': 'Financial Accounting',
  'BOOK KEEPING': 'Financial Accounting',
  'ACCOUNTING': 'Financial Accounting',
  'ACCOUNTS': 'Financial Accounting',
  'GEOGRAPHY': 'Geography',
  'GEO': 'Geography',
  'TECHNICAL DRAWING': 'Technical Drawing',
  'TECH DRAWING': 'Technical Drawing',
  'COMPUTER STUDIES': 'Computer Studies',
  'DATA PROCESSING': 'Data Processing',
  'FRENCH': 'French',
  'YORUBA': 'Yoruba',
  'IGBO': 'Igbo',
  'HAUSA': 'Hausa',
  'FOOD AND NUTRITION': 'Food and Nutrition',
  'FOOD & NUTRITION': 'Food and Nutrition',
  'HISTORY': 'History',
  'MUSIC': 'Music',
  'VISUAL ART': 'Visual Art'
};

const VALID_OLEVEL_GRADES = new Set(['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9']);

/**
 * Normalizes common OCR misreadings of grades:
 * 'Al' -> 'A1', 'BI' -> 'B1', 'C-4' -> 'C4', etc.
 */
function normalizeGrade(raw: string): OlevelGrade | null {
  const clean = raw.trim().toUpperCase().replace(/[-_\s.]/g, '');
  if (clean === 'AL' || clean === 'AI' || clean === 'A|') return 'A1';
  if (clean === 'BL' || clean === 'BI') return 'B2'; // frequent misread of B2 or B3
  if (clean === 'O6' || clean === '06') return 'C6';
  if (clean === 'O4' || clean === '04') return 'C4';
  if (clean === 'O5' || clean === '05') return 'C5';
  if (VALID_OLEVEL_GRADES.has(clean)) return clean as OlevelGrade;
  return null;
}

/**
 * Filter out noise from a line of text:
 * phone numbers, dates, timestamps, 10-digit registration numbers.
 */
function cleanLineNoise(line: string): string {
  return line
    // Strip timestamps e.g. 14:32:05
    .replace(/\b\d{1,2}:\d{2}(?::\d{2})?\b/g, ' ')
    // Strip dates e.g. 14/05/2025 or 2025-06-12
    .replace(/\b\d{1,4}[/-]\d{1,2}[/-]\d{2,4}\b/g, ' ')
    // Strip phone numbers e.g. 08012345678, +234...
    .replace(/\b(?:\+?234|0)[789][01]\d{8}\b/g, ' ')
    // Strip 10-character alphanumeric reg numbers e.g. 2025123456JA
    .replace(/\b\d{8,10}[A-Z]{1,3}\b/gi, ' ')
    .trim();
}

/**
 * Parse JAMB UTME Result Slip text
 */
export function parseUtmeText(rawText: string): ExtractedUtmeData {
  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const uncertainties: string[] = [];
  let candidateName: string | undefined;
  let examYear: string | undefined;
  let totalScore: number | undefined;
  const subjects: ExtractedUtmeSubject[] = [];

  // Check for category mismatch: If text has many O'Level grades (e.g. WAEC, A1, B2, C4)
  const olevelGradeCount = (rawText.match(/\b(?:A1|B2|B3|C4|C5|C6|D7|E8|F9)\b/gi) || []).length;
  if (olevelGradeCount >= 4 && !/JAMB|UTME/i.test(rawText)) {
    uncertainties.push('Notice: Document appears to be an O\'Level result rather than a JAMB UTME slip.');
  }

  // 1. Detect Exam Year (2020-2029)
  const yearMatch = rawText.match(/\b(202[0-9])\b/);
  if (yearMatch) {
    examYear = yearMatch[1];
  }

  // 2. Candidate Name extraction heuristics
  const nameLine = lines.find((l) => /^(?:CANDIDATE\s*NAME|NAME|SURNAME)[:\s]/i.test(l));
  if (nameLine) {
    const extracted = nameLine.replace(/^(?:CANDIDATE\s*NAME|NAME|SURNAME)[:\s]+/i, '').trim();
    if (extracted.length >= 4 && !/\d{4}/.test(extracted)) {
      candidateName = extracted;
    }
  }

  // 3. Subject names and subject scores
  const utmeSubjectNames = [
    'Use of English', 'English Language', 'Mathematics', 'Physics', 'Chemistry',
    'Biology', 'Economics', 'Government', 'Literature in English', 'CRS', 'IRS',
    'Commerce', 'Accounting', 'Geography', 'Agricultural Science'
  ];

  for (const line of lines) {
    const cleaned = cleanLineNoise(line);
    for (const subName of utmeSubjectNames) {
      const escaped = subName.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
      const pattern = new RegExp(`${escaped}[^\\d]*?(\\d{1,3})\\b`, 'i');
      const match = cleaned.match(pattern);
      if (match) {
        const score = parseInt(match[1], 10);
        if (score >= 0 && score <= 100 && !subjects.some((s) => s.name.toLowerCase() === subName.toLowerCase())) {
          subjects.push({
            name: subName === 'English Language' ? 'Use of English' : subName,
            score,
            confidence: 'high'
          });
        }
      }
    }
  }

  // 4. Extract Total UTME Score
  // Pattern A: explicit Total / Aggregate label
  const totalRegexes = [
    /(?:AGGREGATE|TOTAL\s*SCORE|TOTAL|UTME\s*SCORE|OVERALL\s*SCORE)[:\s=]+(\d{2,3})\b/i,
    /(?:TOTAL|AGGREGATE)[^\d\n\r]{1,15}(\d{2,3})\b/i
  ];

  for (const regex of totalRegexes) {
    const match = rawText.match(regex);
    if (match) {
      const candidateVal = parseInt(match[1], 10);
      if (candidateVal >= 40 && candidateVal <= 400) {
        totalScore = candidateVal;
        break;
      }
    }
  }

  // Pattern B: If total wasn't labeled explicitly, but 4 subjects were found, sum them
  if (totalScore === undefined && subjects.length === 4) {
    const sum = subjects.reduce((acc, curr) => acc + curr.score, 0);
    if (sum >= 40 && sum <= 400) {
      totalScore = sum;
      uncertainties.push('Total score inferred from the sum of the 4 recognized UTME subjects.');
    }
  }

  // Pattern C: If total found doesn't match sum of subjects
  if (totalScore !== undefined && subjects.length === 4) {
    const sum = subjects.reduce((acc, curr) => acc + curr.score, 0);
    if (Math.abs(sum - totalScore) > 2) {
      uncertainties.push(`Discrepancy: Extracted total (${totalScore}) does not equal sum of subjects (${sum}). Please verify.`);
    }
  }

  // Boundary check
  if (totalScore === undefined) {
    uncertainties.push('Could not confidently detect total UTME score. Please verify or enter manually.');
  } else if (totalScore < 0 || totalScore > 400) {
    uncertainties.push(`Detected score (${totalScore}) is outside the valid UTME range (0-400).`);
    totalScore = undefined;
  }

  let confidence: ConfidenceLevel = 'high';
  if (!totalScore || uncertainties.length > 1) {
    confidence = 'low';
  } else if (uncertainties.length === 1 || subjects.length < 4) {
    confidence = 'medium';
  }

  return {
    category: 'UTME',
    totalScore,
    subjects,
    candidateName,
    examYear,
    confidence,
    uncertainties,
    rawText
  };
}

/**
 * Parse O'Level Result Slip (WAEC / NECO / NABTEB / GCE)
 */
export function parseOlevelText(rawText: string): ExtractedOlevelData {
  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const uncertainties: string[] = [];
  const subjects: ExtractedOlevelSubject[] = [];
  let candidateName: string | undefined;
  let examYear: string | undefined;
  let examBody: ExtractedOlevelData['examBody'] = 'OTHER';

  // 1. Detect Exam Body
  if (/WASSCE|WAEC|WEST\s*AFRICAN\s*EXAMINATIONS\s*COUNCIL/i.test(rawText)) {
    examBody = 'WAEC';
  } else if (/NECO|NATIONAL\s*EXAMINATIONS\s*COUNCIL/i.test(rawText)) {
    examBody = 'NECO';
  } else if (/NABTEB/i.test(rawText)) {
    examBody = 'NABTEB';
  } else if (/GCE/i.test(rawText)) {
    examBody = 'GCE';
  }

  // Category mismatch check
  if (/JAMB|JOINT\s*ADMISSIONS|POST[-\s]*UTME/i.test(rawText) && !/WAEC|NECO|WASSCE/i.test(rawText)) {
    uncertainties.push('Notice: Document appears to be a JAMB or Post-UTME result rather than an O\'Level slip.');
  }

  // 2. Detect Exam Year (2010-2029)
  const yearMatch = rawText.match(/\b(20[12][0-9])\b/);
  if (yearMatch) {
    examYear = yearMatch[1];
  }

  // 3. Candidate Name
  const nameLine = lines.find((l) => /^(?:CANDIDATE\s*NAME|NAME|STUDENT\s*NAME)[:\s]/i.test(l));
  if (nameLine) {
    const extracted = nameLine.replace(/^(?:CANDIDATE\s*NAME|NAME|STUDENT\s*NAME)[:\s]+/i, '').trim();
    if (extracted.length >= 4 && !/\d{4}/.test(extracted)) {
      candidateName = extracted;
    }
  }

  // 4. Subject and Grade Extraction
  // Look across catalog
  const catalogKeys = Object.keys(OLEVEL_SUBJECT_CATALOG).sort((a, b) => b.length - a.length);

  for (const line of lines) {
    const cleaned = cleanLineNoise(line);
    const upperLine = cleaned.toUpperCase();

    for (const key of catalogKeys) {
      if (upperLine.includes(key)) {
        const canonicalName = OLEVEL_SUBJECT_CATALOG[key];

        // If subject already detected, skip
        if (subjects.some((s) => s.subjectName.toLowerCase() === canonicalName.toLowerCase())) {
          continue;
        }

        // Search for grade in text appearing after the subject name
        const subIndex = upperLine.indexOf(key);
        const textAfterSubject = upperLine.slice(subIndex + key.length);
        const gradePattern = /\b([A-Za-z0-9]{1,2})\b/g;
        let gradeFound: OlevelGrade | null = null;
        let match: RegExpExecArray | null;

        while ((match = gradePattern.exec(textAfterSubject)) !== null) {
          const norm = normalizeGrade(match[1]);
          if (norm) {
            gradeFound = norm;
            break;
          }
        }

        if (gradeFound) {
          subjects.push({
            subjectName: canonicalName,
            grade: gradeFound,
            confidence: 'high'
          });
          break; // move to next line
        }
      }
    }
  }

  // 5. Check if at least 5 subjects detected
  if (subjects.length < 5) {
    uncertainties.push(
      `Detected ${subjects.length} O'Level subject(s). UNILAG aggregate scoring requires 5 relevant subjects. Please add or verify missing subjects.`
    );
  }

  let confidence: ConfidenceLevel = 'high';
  if (subjects.length < 3) {
    confidence = 'low';
  } else if (subjects.length < 5 || uncertainties.length > 0) {
    confidence = 'medium';
  }

  return {
    category: 'OLEVEL',
    subjects,
    examBody,
    examYear,
    sitting: 1,
    candidateName,
    confidence,
    uncertainties,
    rawText
  };
}

/**
 * Parse UNILAG Post-UTME Result Slip text
 */
export function parsePutmeText(rawText: string): ExtractedPutmeData {
  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const uncertainties: string[] = [];
  let candidateName: string | undefined;
  let examYear: string | undefined;
  let score: number | undefined;

  // Category mismatch check
  if (/WAEC|WASSCE|NECO/i.test(rawText) && !/POST[-\s]*UTME|PUTME|LAGOS/i.test(rawText)) {
    uncertainties.push('Notice: Document appears to be an O\'Level result rather than a Post-UTME slip.');
  }

  // 1. Detect Exam Year (2020-2029)
  const yearMatch = rawText.match(/\b(202[0-9])\b/);
  if (yearMatch) {
    examYear = yearMatch[1];
  }

  // 2. Candidate Name
  const nameLine = lines.find((l) => /^(?:CANDIDATE\s*NAME|NAME|SURNAME)[:\s]/i.test(l));
  if (nameLine) {
    const extracted = nameLine.replace(/^(?:CANDIDATE\s*NAME|NAME|SURNAME)[:\s]+/i, '').trim();
    if (extracted.length >= 4 && !/\d{4}/.test(extracted)) {
      candidateName = extracted;
    }
  }

  // 3. Post-UTME Score extraction
  // Must be between 0.000 and 30.000.
  // We must not confuse with UTME score (which is often > 100 on UNILAG slips).
  const putmeScorePatterns = [
    // Pattern: "POST-UTME SCORE: 24.50" or "P-UTME: 24.5 / 30"
    /(?:POST[-\s]*UTME|P-UTME|SCREENING\s*SCORE)[^\d\n\r]*?(\d{1,3}(?:\.\d{1,3})?)\s*(?:\/\s*30)?\b/i,
    // Pattern: "SCORE: 22.50 / 30" or "AGGREGATE: 22.50 / 30"
    /(?:SCORE|AGGREGATE)[:\s]+(\d{1,3}(?:\.\d{1,3})?)\s*(?:\/|\s*OUT\s*OF\s*)30\b/i,
    // Pattern: "24.50 / 30"
    /\b(\d{1,3}(?:\.\d{1,3})?)\s*\/\s*30(?:\.0)?\b/i
  ];

  let foundExplicitCandidate = false;
  for (const regex of putmeScorePatterns) {
    const match = rawText.match(regex);
    if (match) {
      foundExplicitCandidate = true;
      const val = parseFloat(match[1]);
      if (!isNaN(val)) {
        if (val > 30.0) {
          uncertainties.push(`Detected score (${val}) is above the maximum UNILAG Post-UTME score of 30.000.`);
        } else if (val >= 0) {
          score = Math.round(val * 1000) / 1000;
        }
        break;
      }
    }
  }

  // Fallback: If no explicit label matched and no explicit out-of-bounds candidate was found
  if (score === undefined && !foundExplicitCandidate) {
    for (const line of lines) {
      const cleaned = cleanLineNoise(line);
      if (/POST|PUTME|SCREENING/i.test(cleaned)) {
        const numMatch = cleaned.match(/\b([0-2]?\d(?:\.\d{1,3})?|30(?:\.0{1,3})?)\b/);
        if (numMatch) {
          const val = parseFloat(numMatch[1]);
          if (!isNaN(val) && val >= 0 && val <= 30.0) {
            score = Math.round(val * 1000) / 1000;
            uncertainties.push('Post-UTME score inferred from line containing screening keywords.');
            break;
          }
        }
      }
    }
  }

  if (score === undefined) {
    uncertainties.push('Could not detect Post-UTME score (scale: 0.0 - 30.0). Please enter manually.');
  }

  let confidence: ConfidenceLevel = 'high';
  if (score === undefined) {
    confidence = 'low';
  } else if (uncertainties.length > 0) {
    confidence = 'medium';
  }

  return {
    category: 'PUTME',
    score,
    maxScore: 30.0,
    candidateName,
    examYear,
    confidence,
    uncertainties,
    rawText
  };
}

/**
 * Universal parser dispatcher based on requested category
 */
export function parseOcrResult(rawText: string, expectedCategory: ResultCategory): ExtractedResultData {
  switch (expectedCategory) {
    case 'UTME':
      return parseUtmeText(rawText);
    case 'OLEVEL':
      return parseOlevelText(rawText);
    case 'PUTME':
      return parsePutmeText(rawText);
    default:
      throw new Error(`Unsupported category: ${expectedCategory}`);
  }
}
