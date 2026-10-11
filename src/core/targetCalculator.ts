/**
 * UNILAG Aggregate Calculator — Reverse Target Calculator
 *
 * Given a target departmental cut-off aggregate, UTME score, and O'Level grades,
 * calculates the exact Post-UTME score required to reach or exceed that target.
 * Reuses the same verified session configuration as the forward calculator engine.
 */

import {
  TargetCalculationResponse,
  TargetCalculationResult,
  TargetStatus
} from './types';
import { validateTargetInputs } from './validator';
import { calculateUtmePoints, calculateOlevelPoints } from './calculator';
import { roundToPrecision, formatToPrecision } from './rounding';

/**
 * Calculates the required Post-UTME score to reach a specified target aggregate.
 */
export function calculateRequiredPutme(inputs: unknown): TargetCalculationResponse {
  const validation = validateTargetInputs(inputs);

  if (!validation.success) {
    return validation;
  }

  const { config, sanitized } = validation;
  const decimalPlaces = config.roundingPolicy.decimalPlaces;

  // 1. Calculate known points from UTME and O'Level
  const utmePoints = calculateUtmePoints(sanitized.utmeScore, config);
  const { points: olevelPoints } = calculateOlevelPoints(
    sanitized.olevelGrades,
    config
  );

  const currentPoints = roundToPrecision(utmePoints + olevelPoints, decimalPlaces);
  const target = sanitized.targetAggregate;

  // 2. Solve for required Post-UTME points: Target - Current
  const rawRequiredPutmePoints = target - currentPoints;
  const maxPutme = config.weights.putmeMaxScore;

  let status: TargetStatus;
  let isAchievable: boolean;
  let requiredPutme: number;
  let message: string;
  let warning: string | undefined;

  if (rawRequiredPutmePoints > maxPutme) {
    status = 'MATHEMATICALLY_IMPOSSIBLE';
    isAchievable = false;
    requiredPutme = roundToPrecision(rawRequiredPutmePoints, decimalPlaces);
    const maxAchievable = roundToPrecision(currentPoints + maxPutme, decimalPlaces);
    message = `A target aggregate of ${formatToPrecision(target, decimalPlaces)} is mathematically unattainable. Your current UTME and O'Level points total ${formatToPrecision(currentPoints, decimalPlaces)}. Even with a maximum possible Post-UTME score of ${maxPutme}.000, your highest possible aggregate is ${formatToPrecision(maxAchievable, decimalPlaces)}.`;
  } else if (rawRequiredPutmePoints <= 0) {
    status = 'ALREADY_SURPASSED';
    isAchievable = true;
    requiredPutme = 0;
    message = `Your existing UTME and O'Level points (${formatToPrecision(currentPoints, decimalPlaces)}) already meet or exceed the target aggregate of ${formatToPrecision(target, decimalPlaces)}. You only need to sit for the Post-UTME test and achieve the qualifying minimum screening score.`;
  } else {
    status = 'ACHIEVABLE';
    isAchievable = true;
    requiredPutme = roundToPrecision(rawRequiredPutmePoints, decimalPlaces);
    message = `You need to score at least ${formatToPrecision(requiredPutme, decimalPlaces)} out of ${maxPutme} in the Post-UTME aptitude test to achieve a target aggregate of ${formatToPrecision(target, decimalPlaces)}.`;

    if (
      config.eligibility.historicalPutmePassMark !== undefined &&
      requiredPutme < config.eligibility.historicalPutmePassMark
    ) {
      warning = `Historical Pass Mark Notice: Although scoring ${formatToPrecision(requiredPutme, decimalPlaces)} mathematically reaches the target, UNILAG has historically required a minimum pass mark of ${config.eligibility.historicalPutmePassMark}/30 (40%) to qualify for admission consideration.`;
    }
  }

  const result: TargetCalculationResult = {
    success: true,
    session: config.session,
    verificationStatus: config.verificationStatus,
    isPreliminary: config.verificationStatus === 'PRELIMINARY',
    targetAggregate: target,
    currentPointsFromUtmeAndOlevel: currentPoints,
    requiredPutmeScore: requiredPutme,
    requiredPutmeScoreFormatted: formatToPrecision(requiredPutme, decimalPlaces),
    isAchievable,
    status,
    message,
    warning
  };

  return result;
}
