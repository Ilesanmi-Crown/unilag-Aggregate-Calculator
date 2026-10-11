/**
 * UNILAG Scoring Rules Engine & Session Registry
 *
 * Loads, validates, and provides access to admission session configurations.
 * Guarantees that unverified or unsupported sessions cannot be treated as confirmed.
 */

import { SessionRuleConfig, PassingOlevelGrade } from './types';
import rules2025_2026 from '../data/rules/2025_2026.json' with { type: 'json' };
import rules2026_2027 from '../data/rules/2026_2027.json' with { type: 'json' };

const PASSING_GRADES: readonly PassingOlevelGrade[] = ['A1', 'B2', 'B3', 'C4', 'C5', 'C6'];

/**
 * Validates at runtime that a given session configuration object
 * conforms strictly to the SessionRuleConfig schema.
 */
export function validateSessionConfig(config: unknown): config is SessionRuleConfig {
  if (!config || typeof config !== 'object') {
    throw new Error('Session config must be a non-null object.');
  }

  const c = config as Record<string, unknown>;

  if (typeof c.session !== 'string' || !c.session.trim()) {
    throw new Error('Session config missing valid "session" identifier.');
  }

  const validStatuses = ['CONFIRMED', 'HISTORICAL_ONLY', 'UNVERIFIED', 'PRELIMINARY'];
  if (!validStatuses.includes(c.verificationStatus as string)) {
    throw new Error(`Invalid verificationStatus: "${c.verificationStatus}".`);
  }

  if (typeof c.isCalculationSupported !== 'boolean') {
    throw new Error('Session config must specify boolean "isCalculationSupported".');
  }

  // Validate weights
  if (!c.weights || typeof c.weights !== 'object') {
    throw new Error('Session config missing "weights" block.');
  }
  const w = c.weights as Record<string, unknown>;
  if (
    typeof w.utmeMaxScore !== 'number' ||
    typeof w.utmeWeight !== 'number' ||
    typeof w.putmeMaxScore !== 'number' ||
    typeof w.putmeWeight !== 'number' ||
    typeof w.olevelMaxScore !== 'number' ||
    typeof w.olevelWeight !== 'number'
  ) {
    throw new Error('Invalid numeric values in "weights" block.');
  }

  // Ensure weights sum to 100
  const totalWeight = w.utmeWeight + w.putmeWeight + w.olevelWeight;
  if (totalWeight !== 100) {
    throw new Error(`Weights must sum to 100 points, got: ${totalWeight}`);
  }

  // Validate eligibility
  if (!c.eligibility || typeof c.eligibility !== 'object') {
    throw new Error('Session config missing "eligibility" block.');
  }
  const e = c.eligibility as Record<string, unknown>;
  if (
    typeof e.minimumUtmeScore !== 'number' ||
    typeof e.maximumSittings !== 'number' ||
    typeof e.requiredSubjectCount !== 'number' ||
    typeof e.minimumAge !== 'number'
  ) {
    throw new Error('Invalid numeric values in "eligibility" block.');
  }

  // Validate olevelGrading
  if (!c.olevelGrading || typeof c.olevelGrading !== 'object') {
    throw new Error('Session config missing "olevelGrading" block.');
  }
  const og = c.olevelGrading as Record<string, unknown>;
  if (!og.gradePoints || typeof og.gradePoints !== 'object') {
    throw new Error('Missing "gradePoints" mapping in "olevelGrading".');
  }
  const gp = og.gradePoints as Record<string, unknown>;
  for (const grade of PASSING_GRADES) {
    if (typeof gp[grade] !== 'number') {
      throw new Error(`Missing numeric point mapping for grade: ${grade}`);
    }
  }

  return true;
}

// In-memory validated session registry
const SESSION_REGISTRY: ReadonlyMap<string, SessionRuleConfig> = (() => {
  const map = new Map<string, SessionRuleConfig>();

  const rawConfigs = [rules2025_2026, rules2026_2027];
  for (const raw of rawConfigs) {
    if (validateSessionConfig(raw)) {
      map.set(raw.session, raw as unknown as SessionRuleConfig);
    }
  }

  return map;
})();

/**
 * Retrieves the session configuration for the given session identifier.
 * Returns null if the session is not registered.
 */
export function getSessionConfig(session: string): SessionRuleConfig | null {
  return SESSION_REGISTRY.get(session.trim()) ?? null;
}

/**
 * Returns all registered academic sessions.
 */
export function getRegisteredSessions(): string[] {
  return Array.from(SESSION_REGISTRY.keys());
}

/**
 * Returns all sessions where calculation is verified and supported out of the box.
 */
export function getSupportedCalculationSessions(): string[] {
  return Array.from(SESSION_REGISTRY.values())
    .filter(c => c.isCalculationSupported)
    .map(c => c.session);
}
