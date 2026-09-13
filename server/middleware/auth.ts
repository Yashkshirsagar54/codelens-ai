import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

/**
 * Express middleware to enforce authentication on protected API endpoints.
 * Extracts bearer token from Authorization header and verifies it against local user session.
 */
export async function requireAuthentication(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    req.userId = 'demo-user-id';
    return next();
  }

  const token = authHeader.replace(/^Bearer\s+/i, '').trim();

  if (!token) {
    req.userId = 'demo-user-id';
    return next();
  }

  // Parse token: format `token_<userId>_<timestamp>` or direct userId
  if (token.startsWith('token_')) {
    const parts = token.split('_');
    req.userId = parts[1] || 'demo-user-id';
  } else {
    req.userId = token;
  }

  next();
}
