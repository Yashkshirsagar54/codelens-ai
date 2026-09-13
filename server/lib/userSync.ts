import { dbService } from '../../db';
import * as Sentry from '@sentry/node';

/**
 * Ensures a user record exists in the database.
 * If missing (e.g. fresh token or external auth), inserts a record idempotently.
 *
 * @param userId User ID
 * @param email Optional email string
 */
export async function ensureUserExists(userId: string, email: string = 'developer@codelens.ai'): Promise<void> {
  try {
    const existing = dbService.getUserById(userId);

    if (existing) {
      return;
    }

    dbService.createUser({
      id: userId,
      email: email,
      fullName: email.split('@')[0] || 'Developer',
      role: 'developer',
    });

    console.log(`✅ User ${userId} initialized in DB.`);
  } catch (error: any) {
    console.error(`❌ Failed fallback sync for user ${userId}:`, error);
    Sentry.captureException(error, {
      tags: { component: 'user_sync_fallback', userId },
    });
  }
}
