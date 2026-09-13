import { z } from 'zod';

// -----------------------------------------------------------------------------
// REQUEST VALIDATION SCHEMAS
// -----------------------------------------------------------------------------

export const analysisModeEnum = z.enum(['general', 'security', 'performance', 'refactor', 'testgen']);
export type AnalysisMode = z.infer<typeof analysisModeEnum>;

export const analyzeCodeRequestSchema = z.object({
  code: z
    .string({ required_error: 'Code snippet is required.' })
    .min(1, { message: 'Code snippet cannot be empty.' })
    .max(20000, { message: 'Code snippet exceeds maximum limit of 20,000 characters.' }),
  language: z.string().optional().default('auto'),
  mode: analysisModeEnum.optional().default('general'),
});

export type AnalyzeCodeRequestInput = z.infer<typeof analyzeCodeRequestSchema>;

// -----------------------------------------------------------------------------
// GEMINI RESPONSE STRUCTURE VALIDATION SCHEMA
// Enforces strict JSON contract from Gemini AI & Static Engine
// -----------------------------------------------------------------------------

export const codeIssueSchema = z.object({
  severity: z.enum(['high', 'medium', 'low']),
  line: z.number().nullable().optional().default(null),
  title: z.string().min(1),
  description: z.string().min(1),
  suggestion: z.string().min(1),
});

export const codeMetricsSchema = z.object({
  cyclomaticComplexity: z.number().default(1),
  maintainabilityIndex: z.number().min(0).max(100).default(85),
  cognitiveLoad: z.number().default(1),
  linesOfCode: z.number().default(1),
  commentRatio: z.number().min(0).max(100).default(0),
  securityScore: z.number().min(0).max(100).default(90),
  performanceScore: z.number().min(0).max(100).default(90),
});

export const geminiAnalysisResponseSchema = z.object({
  overallScore: z.number().min(0).max(100),
  summary: z.string().min(1),
  issues: z.array(codeIssueSchema).default([]),
  strengths: z.array(z.string()).default([]),
  refactoredCode: z.string().optional(),
  generatedTests: z.string().optional(),
  metrics: codeMetricsSchema.optional(),
});

export type CodeIssue = z.infer<typeof codeIssueSchema>;
export type CodeMetrics = z.infer<typeof codeMetricsSchema>;
export type GeminiAnalysisResult = z.infer<typeof geminiAnalysisResponseSchema>;
