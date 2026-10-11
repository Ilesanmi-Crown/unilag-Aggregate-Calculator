/**
 * Comprehensive input validators and boundary guards.
 */

import {
  CandidateInputs,
  CalculationError,
  SessionRuleConfig,
  OlevelGrade,
  PassingOlevelGrade,
  TargetCalculationInputs
} from './types';
import { getSessionConfig } from './rulesEngine';

export const VALID_OLEVEL_GRADES: readonly OlevelGrade[] = [
  'A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9'
];

export const PASSING_OLEVEL_GRADES: readonly PassingOlevelGrade[] = [
  'A1', 'B2', 'B3', 'C4', 'C5', 'C6'
];

export function isPassingGrade(grade: OlevelGrade): grade is PassingOlevelGrade {
  return (PASSING_OLEVEL_GRADES as readonly string[]).includes(grade);
}

export interface ValidationSuccess<T> {
  success: true;
  config: SessionRuleConfig;
  sanitized: T;
  warnings: string[];
}

export type ValidationOutcome<T> = ValidationSuccess<T> | CalculationError;

/**
 * Validates candidate inputs for forward aggregate calculation.
 */
export function validateCandidateInputs(
  inputs: unknown
): ValidationOutcome<CandidateInputs> {
  if (!inputs || typeof inputs !== 'object') {
    return {
      success: false,
      code: 'INVALID_INPUT',
      message: 'Candidate inputs must be a non-null object.'
    };
  }

  const raw = inputs as Record<string, unknown>;
  const warnings: string[] = [];

  // 1. Session Validation
  if (typeof raw.session !== 'string' || !raw.session.trim()) {
    return {
      success: false,
      code: 'INVALID_INPUT',
      message: 'Academic session identifier is required (e.g. "2025/2026").'
    };
  }

  const session = raw.session.trim();
  const config = getSessionConfig(session);

  if (!config) {
    return {
      success: false,
      code: 'UNSUPPORTED_SESSION',
      message: `Academic session "${session}" is not supported. Supported sessions: 2025/2026, 2026/2027.`
    };
  }

  const allowPreliminary = Boolean(raw.allowPreliminarySession);

  if (!config.isCalculationSupported && !allowPreliminary) {
    return {
      success: false,
      code: 'UNVERIFIED_SESSION',
      message: `Calculation formula for session "${session}" is not officially verified by UNILAG. Official modalities have not been released. To simulate using preliminary/inherited rules, pass "allowPreliminarySession: true".`
    };
  }

  if (config.verificationStatus === 'PRELIMINARY') {
    warnings.push(
      `Preliminary Session: The scoring modalities for ${session} are inherited from historical rules and have not been officially published as standalone circulars by UNILAG.`
    );
  }

  // 2. UTME Score Validation
  if (typeof raw.utmeScore !== 'number' || !Number.isFinite(raw.utmeScore)) {
    return {
      success: false,
      code: 'INVALID_UTME_SCORE',
      message: 'UTME score must be a valid number.'
    };
  }

  const utmeScore = raw.utmeScore;
  if (!Number.isInteger(utmeScore)) {
    return {
      success: false,
      code: 'INVALID_UTME_SCORE',
      message: 'UTME score must be an integer (JAMB raw scores do not contain decimals).'
    };
  }

  if (utmeScore < 0 || utmeScore > config.weights.utmeMaxScore) {
    return {
      success: false,
      code: 'INVALID_UTME_SCORE',
      message: `UTME score must be between 0 and ${config.weights.utmeMaxScore}. Received: ${utmeScore}.`
    };
  }

  if (utmeScore < config.eligibility.minimumUtmeScore) {
    warnings.push(
      `Minimum UTME Score Alert: Your UTME score (${utmeScore}) is below UNILAG's mandatory minimum eligibility threshold (${config.eligibility.minimumUtmeScore}). You are ineligible for Post-UTME screening.`
    );
  }

  // 3. Post-UTME Score Validation
  if (typeof raw.putmeScore !== 'number' || !Number.isFinite(raw.putmeScore)) {
    return {
      success: false,
      code: 'INVALID_PUTME_SCORE',
      message: 'Post-UTME score must be a valid number.'
    };
  }

  const putmeScore = raw.putmeScore;
  if (putmeScore < 0 || putmeScore > config.weights.putmeMaxScore) {
    return {
      success: false,
      code: 'INVALID_PUTME_SCORE',
      message: `Post-UTME score must be between 0 and ${config.weights.putmeMaxScore}. Received: ${putmeScore}.`
    };
  }

  if (
    config.eligibility.historicalPutmePassMark !== undefined &&
    putmeScore < config.eligibility.historicalPutmePassMark
  ) {
    warnings.push(
      `Post-UTME Pass Mark Warning: Your Post-UTME score (${putmeScore}) is below the historical pass mark of ${config.eligibility.historicalPutmePassMark}/30 (40%). Candidates scoring below this threshold have historically been ineligible for departmental cut-off consideration.`
    );
  }

  // 4. O'Level Grades Validation
  if (!Array.isArray(raw.olevelGrades)) {
    return {
      success: false,
      code: 'INVALID_OLEVEL_GRADES',
      message: 'O\'Level grades must be provided as an array of subjects and grades.'
    };
  }

  const requiredCount = config.eligibility.requiredSubjectCount;
  if (raw.olevelGrades.length !== requiredCount) {
    return {
      success: false,
      code: 'INVALID_OLEVEL_GRADES',
      message: `Exactly ${requiredCount} relevant O'Level subjects must be provided. Received: ${raw.olevelGrades.length}.`
    };
  }

  const seenSubjects = new Set<string>();
  const sanitizedGrades: CandidateInputs['olevelGrades'] = [];
  let nonCreditCount = 0;

  for (let i = 0; i < raw.olevelGrades.length; i++) {
    const item = raw.olevelGrades[i];
    if (!item || typeof item !== 'object') {
      return {
        success: false,
        code: 'INVALID_OLEVEL_GRADES',
        message: `Invalid subject item at index ${i}. Expected object with subjectName and grade.`
      };
    }

    const { subjectName, grade } = item as Record<string, unknown>;
    if (typeof subjectName !== 'string' || !subjectName.trim()) {
      return {
        success: false,
        code: 'INVALID_OLEVEL_GRADES',
        message: `Subject name at index ${i} must be a non-empty string.`
      };
    }

    const normalizedSubj = subjectName.trim().toLowerCase();
    if (seenSubjects.has(normalizedSubj)) {
      return {
        success: false,
        code: 'INVALID_OLEVEL_GRADES',
        message: `Duplicate subject detected: "${subjectName}". Each of the ${requiredCount} subjects must be distinct.`
      };
    }
    seenSubjects.add(normalizedSubj);

    if (typeof grade !== 'string' || !VALID_OLEVEL_GRADES.includes(grade.trim().toUpperCase() as OlevelGrade)) {
      return {
        success: false,
        code: 'INVALID_OLEVEL_GRADES',
        message: `Invalid grade "${grade}" for subject "${subjectName}". Valid grades: ${VALID_OLEVEL_GRADES.join(', ')}.`
      };
    }

    const normalizedGrade = grade.trim().toUpperCase() as OlevelGrade;
    sanitizedGrades.push({
      subjectName: subjectName.trim(),
      grade: normalizedGrade
    });

    if (!isPassingGrade(normalizedGrade)) {
      nonCreditCount++;
    }
  }

  if (nonCreditCount > 0) {
    warnings.push(
      `O'Level Credit Requirement: ${nonCreditCount} subject(s) have non-credit grades (D7/E8/F9). UNILAG strictly requires at least credit passes (C6 or higher) in all ${requiredCount} subjects. Non-credit subjects award 0 points.`
    );
  }

  // 5. Sittings Validation
  let sittings = 1;
  if (raw.sittings !== undefined) {
    if (typeof raw.sittings !== 'number' || !Number.isInteger(raw.sittings) || raw.sittings < 1) {
      return {
        success: false,
        code: 'INVALID_SITTINGS',
        message: 'Sittings count must be a positive integer.'
      };
    }
    sittings = raw.sittings;
    if (sittings > config.eligibility.maximumSittings) {
      warnings.push(
        `Sitting Rule Ineligibility: You entered ${sittings} sittings. UNILAG strictly enforces that all required O'Level credits must be obtained in ONE SITTING ONLY. Combined results are rejected.`
      );
    }
  }

  return {
    success: true,
    config,
    warnings,
    sanitized: {
      session,
      utmeScore,
      putmeScore,
      olevelGrades: sanitizedGrades,
      sittings,
      allowPreliminarySession: allowPreliminary
    }
  };
}

/**
 * Validates inputs for reverse target calculation.
 */
export function validateTargetInputs(
  inputs: unknown
): ValidationOutcome<TargetCalculationInputs> {
  if (!inputs || typeof inputs !== 'object') {
    return {
      success: false,
      code: 'INVALID_INPUT',
      message: 'Target inputs must be a non-null object.'
    };
  }

  const raw = inputs as Record<string, unknown>;

  // 1. Validate Target Aggregate
  if (typeof raw.targetAggregate !== 'number' || !Number.isFinite(raw.targetAggregate)) {
    return {
      success: false,
      code: 'INVALID_TARGET_AGGREGATE',
      message: 'Target aggregate must be a valid number.'
    };
  }

  const target = raw.targetAggregate;
  if (target < 0 || target > 100) {
    return {
      success: false,
      code: 'INVALID_TARGET_AGGREGATE',
      message: `Target aggregate must be between 0.000 and 100.000. Received: ${target}.`
    };
  }

  // 2. Validate Session
  if (typeof raw.session !== 'string' || !raw.session.trim()) {
    return {
      success: false,
      code: 'INVALID_INPUT',
      message: 'Academic session identifier is required (e.g. "2025/2026").'
    };
  }

  const session = raw.session.trim();
  const config = getSessionConfig(session);

  if (!config) {
    return {
      success: false,
      code: 'UNSUPPORTED_SESSION',
      message: `Academic session "${session}" is not supported. Supported sessions: 2025/2026, 2026/2027.`
    };
  }

  const allowPreliminary = Boolean(raw.allowPreliminarySession);

  if (!config.isCalculationSupported && !allowPreliminary) {
    return {
      success: false,
      code: 'UNVERIFIED_SESSION',
      message: `Calculation formula for session "${session}" is not officially verified by UNILAG. Official modalities have not been released. To simulate using preliminary/inherited rules, pass "allowPreliminarySession: true".`
    };
  }

  const warnings: string[] = [];
  if (config.verificationStatus === 'PRELIMINARY') {
    warnings.push(
      `Preliminary Session: The scoring modalities for ${session} are inherited from historical rules and have not been officially published as standalone circulars by UNILAG.`
    );
  }

  // 3. UTME Score Validation
  if (typeof raw.utmeScore !== 'number' || !Number.isFinite(raw.utmeScore)) {
    return {
      success: false,
      code: 'INVALID_UTME_SCORE',
      message: 'UTME score must be a valid number.'
    };
  }

  const utmeScore = raw.utmeScore;
  if (!Number.isInteger(utmeScore)) {
    return {
      success: false,
      code: 'INVALID_UTME_SCORE',
      message: 'UTME score must be an integer (JAMB raw scores do not contain decimals).'
    };
  }

  if (utmeScore < 0 || utmeScore > config.weights.utmeMaxScore) {
    return {
      success: false,
      code: 'INVALID_UTME_SCORE',
      message: `UTME score must be between 0 and ${config.weights.utmeMaxScore}. Received: ${utmeScore}.`
    };
  }

  // 4. O'Level Grades Validation
  if (!Array.isArray(raw.olevelGrades)) {
    return {
      success: false,
      code: 'INVALID_OLEVEL_GRADES',
      message: 'O\'Level grades must be provided as an array of subjects and grades.'
    };
  }

  const requiredCount = config.eligibility.requiredSubjectCount;
  if (raw.olevelGrades.length !== requiredCount) {
    return {
      success: false,
      code: 'INVALID_OLEVEL_GRADES',
      message: `Exactly ${requiredCount} relevant O'Level subjects must be provided. Received: ${raw.olevelGrades.length}.`
    };
  }

  const seenSubjects = new Set<string>();
  const sanitizedGrades: TargetCalculationInputs['olevelGrades'] = [];

  for (let i = 0; i < raw.olevelGrades.length; i++) {
    const item = raw.olevelGrades[i];
    if (!item || typeof item !== 'object') {
      return {
        success: false,
        code: 'INVALID_OLEVEL_GRADES',
        message: `Invalid subject item at index ${i}. Expected object with subjectName and grade.`
      };
    }

    const { subjectName, grade } = item as Record<string, unknown>;
    if (typeof subjectName !== 'string' || !subjectName.trim()) {
      return {
        success: false,
        code: 'INVALID_OLEVEL_GRADES',
        message: `Subject name at index ${i} must be a non-empty string.`
      };
    }

    const normalizedSubj = subjectName.trim().toLowerCase();
    if (seenSubjects.has(normalizedSubj)) {
      return {
        success: false,
        code: 'INVALID_OLEVEL_GRADES',
        message: `Duplicate subject detected: "${subjectName}". Each of the ${requiredCount} subjects must be distinct.`
      };
    }
    seenSubjects.add(normalizedSubj);

    if (typeof grade !== 'string' || !VALID_OLEVEL_GRADES.includes(grade.trim().toUpperCase() as OlevelGrade)) {
      return {
        success: false,
        code: 'INVALID_OLEVEL_GRADES',
        message: `Invalid grade "${grade}" for subject "${subjectName}". Valid grades: ${VALID_OLEVEL_GRADES.join(', ')}.`
      };
    }

    sanitizedGrades.push({
      subjectName: subjectName.trim(),
      grade: grade.trim().toUpperCase() as OlevelGrade
    });
  }

  return {
    success: true,
    config,
    warnings,
    sanitized: {
      session,
      targetAggregate: target,
      utmeScore,
      olevelGrades: sanitizedGrades,
      allowPreliminarySession: allowPreliminary
    }
  };
}
