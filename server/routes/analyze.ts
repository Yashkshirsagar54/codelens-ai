import { Router, Response } from 'express';
import { requireAuthentication, AuthenticatedRequest } from '../middleware/auth';
import { rateLimitMiddleware, incrementDailyUsage, getDailyUsageStatus } from '../middleware/rateLimit';
import { analyzeCodeRequestSchema } from '../lib/validators';
import { analyzeCodeWithGemini } from '../lib/gemini';
import { ensureUserExists } from '../lib/userSync';
import { dbService } from '../../db';
import crypto from 'crypto';
import * as Sentry from '@sentry/node';

export const analyzeRouter = Router();

/**
 * POST /api/analyze-code
 * Analyzes code using Gemini AI / Static Engine, validates request & response,
 * enforces rate limits, and safely persists the result permanently in DB.
 */
analyzeRouter.post(
  '/',
  requireAuthentication,
  rateLimitMiddleware,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.userId!;

    try {
      // 1. Ensure user row exists in DB
      await ensureUserExists(userId).catch((err) =>
        console.warn('⚠️ Non-fatal user sync warning:', err.message)
      );

      // 2. Validate payload schema with Zod
      const parseResult = analyzeCodeRequestSchema.safeParse(req.body);

      if (!parseResult.success) {
        const errorMessages = parseResult.error.errors.map((e) => e.message).join(', ');
        res.status(400).json({
          error: 'Bad Request',
          message: errorMessages || 'Invalid request payload.',
        });
        return;
      }

      const { code, language, mode } = parseResult.data;

      // 3. Call AI / Static Analysis Engine
      const analysisResult = await analyzeCodeWithGemini(code, language, mode);

      const recordId = crypto.randomUUID();
      const recordDate = new Date().toISOString();

      const finalRecord = {
        id: recordId,
        userId: userId,
        code: code,
        language: language || 'auto',
        mode: mode || 'general',
        overallScore: analysisResult.overallScore,
        summary: analysisResult.summary,
        issues: analysisResult.issues,
        strengths: analysisResult.strengths,
        refactoredCode: analysisResult.refactoredCode,
        generatedTests: analysisResult.generatedTests,
        metrics: analysisResult.metrics,
        createdAt: recordDate,
      };

      // 4. Save permanently in DB
      try {
        dbService.saveAnalysis(finalRecord);
        console.log(`💾 Analysis saved in DB for user [${userId}] (ID: ${recordId}, Score: ${analysisResult.overallScore}/100)`);
      } catch (dbErr: any) {
        console.warn('⚠️ DB save analysis note:', dbErr.message);
      }

      // 5. Rate limit counter update
      await incrementDailyUsage(userId).catch(() => {});
      const usageStatus = await getDailyUsageStatus(userId).catch(() => ({
        remaining: 19,
        limit: 20,
      }));

      // 6. Return complete analysis payload to frontend
      res.status(200).json({
        success: true,
        analysis: finalRecord,
        usage: {
          remaining: usageStatus.remaining,
          limit: usageStatus.limit,
        },
      });
    } catch (error: any) {
      console.error('❌ Error during code analysis route execution:', error);
      Sentry.captureException(error, {
        tags: { component: 'analyze_route', userId },
      });

      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message || 'An unexpected error occurred during code analysis.',
      });
    }
  }
);
