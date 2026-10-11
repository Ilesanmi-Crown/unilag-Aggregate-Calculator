/**
 * UNILAG Aggregate Calculator — Pure Domain Calculation Engine
 *
 * Implements composite aggregate scoring according to verified University of Lagos modalities.
 * Zero DOM or network dependencies. Full internal precision with deterministic presentation rounding.
 */

import {
  AggregateCalculationResponse,
  AggregateResult,
  CandidateInputs,
  SessionRuleConfig
} from './types';
import { validateCandidateInputs, isPassingGrade } from './validator';
import { roundToPrecision, formatToPrecision } from './rounding';

/**
 * Calculates O'Level component score given 5 subjects and session config.
 */
export function calculateOlevelPoints(
  grades: CandidateInputs['olevelGrades'],
  config: SessionRuleConfig
): { points: number; passingCount: number } {
  let total = 0;
  let passingCount = 0;

  for (const item of grades) {
    if (isPassingGrade(item.grade)) {
      total += config.olevelGrading.gradePoints[item.grade];
      passingCount++;
    } else {
      total += config.olevelGrading.failingGradePoints;
    }
  }

  return {
    points: roundToPrecision(total, config.roundingPolicy.decimalPlaces),
    passingCount
  };
}

/**
 * Calculates UTME component score (Score / 8).
 */
export function calculateUtmePoints(
  utmeScore: number,
  config: SessionRuleConfig
): number {
  const points = (utmeScore / config.weights.utmeMaxScore) * config.weights.utmeWeight;
  return roundToPrecision(points, config.roundingPolicy.decimalPlaces);
}

/**
 * Calculates Post-UTME component score (raw score on 30-point scale).
 */
export function calculatePutmePoints(
  putmeScore: number,
  config: SessionRuleConfig
): number {
  const points = (putmeScore / config.weights.putmeMaxScore) * config.weights.putmeWeight;
  return roundToPrecision(points, config.roundingPolicy.decimalPlaces);
}

/**
 * Main pure entrypoint: Calculates the full composite aggregate score
 * and evaluates candidate admission eligibility warnings.
 */
export function calculateAggregate(inputs: unknown): AggregateCalculationResponse {
  const validation = validateCandidateInputs(inputs);

  if (!validation.success) {
    return validation;
  }

  const { config, sanitized, warnings } = validation;

  // 1. Calculate components
  const utmePoints = calculateUtmePoints(sanitized.utmeScore, config);
  const putmePoints = calculatePutmePoints(sanitized.putmeScore, config);
  const { points: olevelPoints, passingCount } = calculateOlevelPoints(
    sanitized.olevelGrades,
    config
  );

  // 2. Compute composite aggregate
  const rawTotal = utmePoints + putmePoints + olevelPoints;
  const totalAggregate = roundToPrecision(rawTotal, config.roundingPolicy.decimalPlaces);

  // 3. Evaluate eligibility
  const targetSubjectCount = config.eligibility.requiredSubjectCount;
  const meetsUtmeMinimum = sanitized.utmeScore >= config.eligibility.minimumUtmeScore;
  const meetsSittingsRequirement = (sanitized.sittings ?? 1) <= config.eligibility.maximumSittings;
  const hasRequiredCreditCount = passingCount >= targetSubjectCount;
  const isEligibleForScreening = meetsUtmeMinimum && meetsSittingsRequirement && hasRequiredCreditCount;

  const result: AggregateResult = {
    success: true,
    session: config.session,
    verificationStatus: config.verificationStatus,
    isPreliminary: config.verificationStatus === 'PRELIMINARY',
    breakdown: {
      utmePoints,
      putmePoints,
      olevelPoints,
      totalAggregate,
      formatted: {
        utmePoints: formatToPrecision(utmePoints, config.roundingPolicy.decimalPlaces),
        putmePoints: formatToPrecision(putmePoints, config.roundingPolicy.decimalPlaces),
        olevelPoints: formatToPrecision(olevelPoints, config.roundingPolicy.decimalPlaces),
        totalAggregate: formatToPrecision(totalAggregate, config.roundingPolicy.decimalPlaces)
      }
    },
    eligibility: {
      isEligibleForScreening,
      meetsUtmeMinimum,
      meetsSittingsRequirement,
      hasRequiredCreditCount,
      warnings
    }
  };

  return result;
}
