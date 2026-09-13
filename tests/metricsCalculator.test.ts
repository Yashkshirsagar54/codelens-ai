import { describe, it, expect } from 'vitest';
import { calculateClientMetrics, getComplexityRating, getMaintainabilityRating } from '../src/lib/metricsCalculator';

describe('Metrics Calculator Suite', () => {
  it('computes metrics accurately for simple linear code', () => {
    const simpleCode = `function add(a: number, b: number): number {
  return a + b;
}`;
    const metrics = calculateClientMetrics(simpleCode);
    expect(metrics.cyclomaticComplexity).toBe(1);
    expect(metrics.maintainabilityIndex).toBeGreaterThanOrEqual(80);
    expect(metrics.linesOfCode).toBe(3);
  });

  it('computes higher cyclomatic complexity for branched and looped code', () => {
    const branchedCode = `function processData(items: number[]) {
  if (items.length > 0) {
    for (let i = 0; i < items.length; i++) {
      if (items[i] > 10 && items[i] < 50) {
        console.log(items[i]);
      } else if (items[i] === 0) {
        return 0;
      }
    }
  }
  return -1;
}`;
    const metrics = calculateClientMetrics(branchedCode);
    expect(metrics.cyclomaticComplexity).toBeGreaterThanOrEqual(4);
    const rating = getComplexityRating(metrics.cyclomaticComplexity);
    expect(['Simple', 'Moderate', 'High']).toContain(rating.label);
  });

  it('rates maintainability correctly across thresholds', () => {
    expect(getMaintainabilityRating(90).label).toBe('Excellent');
    expect(getMaintainabilityRating(70).label).toBe('Good');
    expect(getMaintainabilityRating(55).label).toBe('Moderate');
    expect(getMaintainabilityRating(30).label).toBe('Poor');
  });
});
