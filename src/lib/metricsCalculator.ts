/**
 * metricsCalculator.ts — Client & server utilities to evaluate code quality, maintainability, and complexity.
 */

import { CodeMetrics } from './apiClient';

export interface ComplexityRating {
  label: 'Simple' | 'Moderate' | 'High' | 'Complex' | 'Critical';
  color: string;
  bg: string;
  borderColor: string;
  description: string;
}

export function getComplexityRating(complexity: number): ComplexityRating {
  if (complexity <= 5) {
    return {
      label: 'Simple',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      description: 'Low risk, clean linear execution path with minimal branching.',
    };
  }
  if (complexity <= 10) {
    return {
      label: 'Moderate',
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      description: 'Well-structured with standard control flow branches.',
    };
  }
  if (complexity <= 20) {
    return {
      label: 'High',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
      description: 'Moderate risk. Consider refactoring into smaller helper functions.',
    };
  }
  return {
    label: 'Critical',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    description: 'High cognitive complexity. Prone to regressions and hard to test.',
  };
}

export function getMaintainabilityRating(index: number): { label: string; color: string } {
  if (index >= 80) return { label: 'Excellent', color: 'text-emerald-400' };
  if (index >= 65) return { label: 'Good', color: 'text-blue-400' };
  if (index >= 50) return { label: 'Moderate', color: 'text-amber-400' };
  return { label: 'Poor', color: 'text-red-400' };
}

/**
 * Computes estimated client-side metrics instantly from code before or during analysis.
 */
export function calculateClientMetrics(code: string): CodeMetrics {
  const lines = code.split('\n');
  let commentLines = 0;
  let branchCount = 1;

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
      commentLines++;
    }
    if (/\b(if|else if|for|while|case|catch)\b/.test(trimmed) || /&&|\|\||\?/.test(trimmed)) {
      branchCount++;
    }
  });

  const linesOfCode = Math.max(1, lines.length);
  const commentRatio = Math.round((commentLines / linesOfCode) * 100);
  const cyclomaticComplexity = Math.max(1, branchCount);
  const cognitiveLoad = Math.max(1, Math.round(branchCount * 1.1));
  const maintainabilityIndex = Math.max(20, Math.min(100, Math.round(100 - cyclomaticComplexity * 3.5)));

  return {
    cyclomaticComplexity,
    maintainabilityIndex,
    cognitiveLoad,
    linesOfCode,
    commentRatio,
    securityScore: 92,
    performanceScore: 90,
  };
}
