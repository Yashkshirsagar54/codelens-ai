import { describe, it, expect } from 'vitest';
import { analyzeCodeRequestSchema, geminiAnalysisResponseSchema } from '../server/lib/validators';

describe('Zod Validators Suite', () => {
  describe('analyzeCodeRequestSchema', () => {
    it('validates a valid code payload with mode', () => {
      const result = analyzeCodeRequestSchema.safeParse({
        code: 'const x = 1;',
        language: 'typescript',
        mode: 'security',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.code).toBe('const x = 1;');
        expect(result.data.language).toBe('typescript');
        expect(result.data.mode).toBe('security');
      }
    });

    it('defaults to general mode when mode is omitted', () => {
      const result = analyzeCodeRequestSchema.safeParse({
        code: 'const x = 1;',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.mode).toBe('general');
      }
    });

    it('rejects empty code snippets', () => {
      const result = analyzeCodeRequestSchema.safeParse({
        code: '',
      });
      expect(result.success).toBe(false);
    });

    it('rejects code snippets exceeding 20,000 characters', () => {
      const longCode = 'a'.repeat(20001);
      const result = analyzeCodeRequestSchema.safeParse({
        code: longCode,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('geminiAnalysisResponseSchema', () => {
    it('validates a valid Gemini structured JSON response with metrics, refactoredCode, and generatedTests', () => {
      const mockGeminiOutput = {
        overallScore: 85,
        summary: 'Solid code quality with minor optimization potential.',
        issues: [
          {
            severity: 'medium',
            line: 4,
            title: 'Unused variable',
            description: 'Variable temp is declared but never referenced.',
            suggestion: 'Remove variable temp.',
          },
        ],
        strengths: ['Good type definitions', 'Clean modular function structure'],
        refactoredCode: 'const x = 1;\nexport { x };',
        generatedTests: 'describe("unit test", () => { it("works", () => {}); });',
        metrics: {
          cyclomaticComplexity: 2,
          maintainabilityIndex: 88,
          cognitiveLoad: 2,
          linesOfCode: 10,
          commentRatio: 10,
          securityScore: 95,
          performanceScore: 90,
        },
      };

      const result = geminiAnalysisResponseSchema.safeParse(mockGeminiOutput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.overallScore).toBe(85);
        expect(result.data.issues).toHaveLength(1);
        expect(result.data.refactoredCode).toBeDefined();
        expect(result.data.metrics?.maintainabilityIndex).toBe(88);
      }
    });

    it('rejects scores outside 0-100 range', () => {
      const mockInvalidScore = {
        overallScore: 120,
        summary: 'Invalid score test',
        issues: [],
        strengths: [],
      };

      const result = geminiAnalysisResponseSchema.safeParse(mockInvalidScore);
      expect(result.success).toBe(false);
    });
  });
});
