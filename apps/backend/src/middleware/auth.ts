import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../firebase-admin';

export interface AuthenticatedRequest extends Request {
  uid?: string;
  role?: string;
  verified?: boolean;
}

/**
 * Middleware to verify Firebase ID token from Authorization header.
 * Attaches uid and role to the request on success.
 */
export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header' });
    return;
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.uid = decodedToken.uid;
    req.role = (decodedToken.role as string | undefined) || (decodedToken.customClaims?.role as string | undefined);
    req.verified = (decodedToken.customClaims?.verified as boolean | undefined) || undefined;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
