import { Router, Request, Response } from 'express';
import { Webhook } from 'svix';
import { db } from '../../db';
import { users } from '../../db/schema';
import { eq } from 'drizzle-orm';
import * as Sentry from '@sentry/node';

export const webhookRouter = Router();

interface ClerkEmailAddress {
  id: string;
  email_address: string;
}

interface ClerkUserEventData {
  id: string;
  email_addresses?: ClerkEmailAddress[];
  primary_email_address_id?: string;
}

interface ClerkWebhookEvent {
  data: ClerkUserEventData;
  object: 'event';
  type: 'user.created' | 'user.updated' | 'user.deleted';
}

/**
 * POST /api/webhooks/clerk
 * Idempotent webhook listener for Clerk user account lifecycle events.
 */
webhookRouter.post('/clerk', async (req: Request, res: Response): Promise<void> => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('❌ Missing CLERK_WEBHOOK_SECRET in environment variables');
    res.status(500).json({ error: 'Server webhook configuration error' });
    return;
  }

  const svix_id = req.headers['svix-id'] as string;
  const svix_timestamp = req.headers['svix-timestamp'] as string;
  const svix_signature = req.headers['svix-signature'] as string;

  if (!svix_id || !svix_timestamp || !svix_signature) {
    res.status(400).json({ error: 'Missing required Svix verification headers' });
    return;
  }

  const payload = req.body;
  const bodyString = Buffer.isBuffer(payload) ? payload.toString('utf8') : JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: ClerkWebhookEvent;

  try {
    evt = wh.verify(bodyString, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as ClerkWebhookEvent;
  } catch (err: any) {
    console.error('❌ Webhook verification failed:', err.message);
    Sentry.captureException(err, {
      tags: { component: 'clerk_webhook' },
      extra: { message: 'Svix signature verification failed' },
    });
    res.status(400).json({ error: 'Invalid webhook signature' });
    return;
  }

  const { id: userId } = evt.data;
  const eventType = evt.type;

  console.log(`🔔 Clerk Webhook Verified: "${eventType}" for user "${userId}"`);

  try {
    switch (eventType) {
      case 'user.created':
      case 'user.updated': {
        // 1. Cross-reference primary_email_address_id against email_addresses array
        const emails = evt.data.email_addresses || [];
        const primaryEmailObj = emails.find(
          (e) => e.id === evt.data.primary_email_address_id
        ) || emails[0];

        const email = primaryEmailObj?.email_address || 'unknown@clerk.user';

        // 2. Idempotent Upsert (ON CONFLICT UPDATE email) to handle duplicate deliveries gracefully
        await db
          .insert(users)
          .values({
            id: userId,
            email: email,
            createdAt: new Date(),
          })
          .onConflictDoUpdate({
            target: users.id,
            set: { email: email },
          });

        console.log(`✅ User ${userId} (${email}) upserted cleanly in DB.`);
        break;
      }

      case 'user.deleted': {
        // Cascades delete to analyses and usage_counters
        await db.delete(users).where(eq(users.id, userId));
        console.log(`🗑️ User ${userId} deleted from DB (cascaded).`);
        break;
      }

      default:
        console.log(`ℹ️ Unhandled Clerk event type: ${eventType}`);
        break;
    }

    res.status(200).json({ success: true, message: `Processed ${eventType}` });
  } catch (dbError: any) {
    console.error(`❌ DB error processing webhook ${eventType}:`, dbError);
    Sentry.captureException(dbError, {
      tags: { component: 'clerk_webhook', eventType, userId },
    });
    res.status(500).json({ error: 'Database synchronization failed' });
  }
});
