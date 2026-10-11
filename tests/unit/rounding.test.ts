import { describe, it, expect } from 'vitest';
import { roundToPrecision, formatToPrecision } from '../../src/core/rounding.js';

describe('Rounding & Decimal Precision', () => {
  it('protects against IEEE 754 floating-point drift', () => {
    const rawSum = 0.1 + 0.2; // 0.30000000000000004 in standard JS
    expect(roundToPrecision(rawSum, 3)).toBe(0.3);
    expect(formatToPrecision(rawSum, 3)).toBe('0.300');
  });

  it('formats whole numbers to exact 3-decimal string', () => {
    expect(formatToPrecision(50, 3)).toBe('50.000');
    expect(formatToPrecision(100, 3)).toBe('100.000');
    expect(formatToPrecision(0, 3)).toBe('0.000');
  });

  it('formats fractional values accurately to 3 decimals without drift', () => {
    expect(formatToPrecision(83.425, 3)).toBe('83.425');
    expect(formatToPrecision(62.325, 3)).toBe('62.325');
    expect(formatToPrecision(77.975, 3)).toBe('77.975');
    expect(formatToPrecision(41.875, 3)).toBe('41.875');
  });

  it('handles standard round-half-up boundaries', () => {
    expect(roundToPrecision(1.0005, 3)).toBe(1.001);
    expect(roundToPrecision(1.0004, 3)).toBe(1.000);
  });
});
