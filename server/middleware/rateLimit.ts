import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';
import { db } from '../../db';
import { usageCounters } from '../../db/schema';
import { eq, and, sql } from 'drizzle-orm';
import * as Sentry from '@sentry/node';

export const DAILY_FREE_LIMIT = 20;

/**
 * Returns today's date in YYYY-MM-DD format
 */
export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * READ-ONLY: Checks current daily usage count for a given user without mutating state.
 */
export async function getDailyUsageStatus(userId: string): Promise<{
  count: number;
  remaining: number;
  limit: number;
  allowed: boolean;
}> {
  const today = getTodayDateString();

  try {
    const record = await db
      .select({ requestCount: usageCounters.requestCount })
      .from(usageCounters)
      .where(and(eq(usageCounters.userId, userId), eq(usageCounters.date, today)))
      .limit(1);

    const currentCount = record[0]?.requestCount || 0;
    const remaining = Math.max(0, DAILY_FREE_LIMIT - currentCount);
    const allowed = currentCount < DAILY_FREE_LIMIT;

    return {
      count: currentCount,
      remaining,
      limit: DAILY_FREE_LIMIT,
      allowed,
    };
  } catch (err: any) {
    console.warn('⚠️ Usage status DB query fallback:', err.message);
    return {
      count: 1,
      remaining: 19,
      limit: DAILY_FREE_LIMIT,
      allowed: true,
    };
  }
}

/**
 * Atomically increments the daily usage counter for a user ONLY ONCE after a successful analysis.
 */
export async function incrementDailyUsage(userId: string): Promise<number> {
  const today = getTodayDateString();

  try {
    const updatedRecord = await db
      .insert(usageCounters)
      .values({
        userId,
        date: today,
        requestCount: 1,
      })
      .onConflictDoUpdate({
        target: [usageCounters.userId, usageCounters.date],
        set: {
          requestCount: sql`usage_counters.request_count + 1`,
        },
      })
      .returning({ newCount: usageCounters.requestCount });

    return updatedRecord[0]?.newCount || 1;
  } catch (err: any) {
    console.warn('⚠️ Usage increment DB fallback:', err.message);
    return 1;
  }
}

/**
 * READ-ONLY Express middleware to check rate limit prior to Gemini processing.
 */
export async function rateLimitMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const userId = req.userId;

  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const status = await getDailyUsageStatus(userId);

    if (!status.allowed) {
      res.status(429).json({
        error: 'Daily limit reached',
        message: `You have reached the daily limit of ${DAILY_FREE_LIMIT} code analyses. Please try again tomorrow.`,
        limit: DAILY_FREE_LIMIT,
        remaining: 0,
      });
      return;
    }

    next();
  } catch (error: any) {
    console.error('❌ Error checking rate limit in middleware:', error);
    Sentry.captureException(error, {
      tags: { component: 'rate_limiter_middleware', userId },
    });
    next();
  }
}
