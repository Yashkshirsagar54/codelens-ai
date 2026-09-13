import { describe, it, expect } from 'vitest';
import { exportToMarkdown, ExportableAnalysis } from '../src/lib/exportUtils';

describe('Export Utilities Unit Tests', () => {
  it('formats analysis into markdown structure', () => {
    const sampleAnalysis: ExportableAnalysis = {
      id: 'test-uuid-123',
      language: 'typescript',
      overallScore: 92,
      summary: 'Production grade code with robust error handling.',
      issues: [
        {
          severity: 'low',
          line: 12,
          title: 'Missing return type explicit annotation',
          description: 'Explicit function return types improve IDE autocomplete.',
          suggestion: 'Add : string to function signature',
        },
      ],
      strengths: ['Strict TypeScript checks', 'No unsafe type assertions'],
      code: 'function hello(): string { return "world"; }',
      createdAt: new Date('2026-08-02'),
    };

    expect(sampleAnalysis.overallScore).toBe(92);
    expect(sampleAnalysis.issues).toHaveLength(1);
  });
});
