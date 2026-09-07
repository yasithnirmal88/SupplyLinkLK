import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';
import { adminAuth, adminDb } from '../firebase-admin';
import { COLLECTIONS } from '../constants/collections';

/**
 * Middleware that verifies the caller is an admin via Firebase custom claims.
 * Custom claims are only minted by the Admin SDK (admins approvals / server-side flows),
 * so they cannot be forged by users writing their own Firestore documents.
 *
 * Self-healing: legacy admins seeded directly in Firestore (users/{uid}.role = "admin")
 * are minted a custom claim on first use so existing admins are not locked out.
 * The doc write itself is now blocked for clients by firestore.rules, so this
 * fallback cannot be abused to self-promote.
 *
 * Must be used AFTER authMiddleware.
 */
export async function adminMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.uid) {
    res.status(401).json({ error: 'Unauthenticated' });
    return;
  }

  if (req.role === 'admin') {
    next();
    return;
  }

  // Legacy fallback: Firestore-seeded admin (no claim yet;). Try to mint now.
  try {
    const userDoc = await adminDb.collection(COLLECTIONS.USERS).doc(req.uid).get();
    if (userDoc.exists && userDoc.data()?.role === 'admin') {
      req.role = 'admin';
      await adminAuth.setCustomUserClaims(req.uid, { role: 'admin' }).catch((err) => {
        console.error('Failed to mint admin claim for legacy admin:', err);
      });
      next();
      return;
    }
  } catch (error) {
    console.error('Admin fallback lookup failed:', error);
  }

  res.status(403).json({ error: 'Forbidden: Admin access required' });
}

