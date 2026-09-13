import { describe, it, expect, vi } from 'vitest';
import { geminiAnalysisResponseSchema } from '../server/lib/validators';

// Mock Gemini AI call
vi.mock('../server/lib/gemini', () => ({
  analyzeCodeWithGemini: vi.fn().mockResolvedValue({
    overallScore: 88,
    summary: 'Mocked Gemini AI review response.',
    issues: [],
    strengths: ['Clean code structure'],
  }),
}));

describe('/api/analyze-code Route Mock Integration', () => {
  it('processes valid payload and returns structured analysis result', async () => {
    const { analyzeCodeWithGemini } = await import('../server/lib/gemini');
    const result = await analyzeCodeWithGemini('const x = 10;', 'typescript');

    expect(result.overallScore).toBe(88);
    expect(result.summary).toContain('Mocked Gemini');
    expect(result.strengths).toContain('Clean code structure');

    const schemaValidation = geminiAnalysisResponseSchema.safeParse(result);
    expect(schemaValidation.success).toBe(true);
  });
});
