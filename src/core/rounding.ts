/**
 * High-precision rounding and numeric formatting utilities.
 * Ensures deterministic 3-decimal precision and protects against
 * IEEE 754 floating-point representation drift.
 */

/**
 * Rounds a floating-point number to the specified number of decimal places
 * using standard round-half-up with Number.EPSILON protection.
 */
export function roundToPrecision(value: number, decimalPlaces = 3): number {
  if (!Number.isFinite(value)) {
    return value;
  }
  const factor = Math.pow(10, decimalPlaces);
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

/**
 * Formats a number to exactly 3 decimal places as a string (e.g. "83.425", "70.000").
 */
export function formatToPrecision(value: number, decimalPlaces = 3): string {
  const rounded = roundToPrecision(value, decimalPlaces);
  return rounded.toFixed(decimalPlaces);
}
