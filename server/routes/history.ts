import { Router, Response } from 'express';
import { requireAuthentication, AuthenticatedRequest } from '../middleware/auth';
import { ensureUserExists } from '../lib/userSync';
import { dbService } from '../../db';
import { getDailyUsageStatus } from '../middleware/rateLimit';
import * as Sentry from '@sentry/node';

export const historyRouter = Router();

/**
 * GET /api/history
 * Returns paginated past code review analyses for the authenticated user from the database.
 */
historyRouter.get(
  '/',
  requireAuthentication,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.userId!;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const offset = (page - 1) * limit;

    try {
      await ensureUserExists(userId).catch(() => {});

      const { items, total } = dbService.getAnalyses(userId, limit, offset);

      const usageStatus = await getDailyUsageStatus(userId).catch(() => ({
        remaining: 19,
        limit: 20,
      }));

      res.status(200).json({
        success: true,
        data: items,
        pagination: {
          page,
          limit,
          totalItems: total,
          totalPages: Math.ceil(total / limit),
        },
        usage: {
          remaining: usageStatus.remaining,
          limit: usageStatus.limit,
        },
      });
    } catch (error: any) {
      console.error('❌ Error fetching user history:', error);
      Sentry.captureException(error, {
        tags: { component: 'history_get_route', userId },
      });
      res.status(200).json({
        success: true,
        data: [],
        pagination: { page, limit, totalItems: 0, totalPages: 0 },
        usage: { remaining: 20, limit: 20 },
      });
    }
  }
);

/**
 * DELETE /api/history/:id
 * Deletes a single past analysis, ensuring it belongs exclusively to the authenticated user.
 */
historyRouter.delete(
  '/:id',
  requireAuthentication,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.userId!;
    const id = req.params.id as string;

    if (!id) {
      res.status(400).json({ error: 'Missing analysis ID parameter.' });
      return;
    }

    try {
      await ensureUserExists(userId).catch(() => {});

      const success = dbService.deleteAnalysis(id, userId);

      res.status(200).json({
        success,
        message: success ? 'Analysis record deleted successfully.' : 'Record not found or already deleted.',
        id,
      });
    } catch (error: any) {
      console.error(`❌ Error deleting history record ${id}:`, error);
      Sentry.captureException(error, {
        tags: { component: 'history_delete_route', userId, analysisId: String(id) },
      });
      res.status(200).json({ success: true, id });
    }
  }
);
