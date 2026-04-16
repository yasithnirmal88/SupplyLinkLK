import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';
import { adminDb } from '../firebase-admin';
import { COLLECTIONS } from '../constants/collections';

/**
 * Middleware to verify if the user has an 'admin' role in Firestore.
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

  try {
    const userDoc = await adminDb.collection(COLLECTIONS.USERS).doc(req.uid).get();
    
    if (!userDoc.exists) {
      res.status(403).json({ error: 'User not found' });
      return;
    }

    const userData = userDoc.data();
    if (userData?.role !== 'admin') {
      res.status(403).json({ error: 'Forbidden: Admin access required' });
      return;
    }

    next();
  } catch (error) {
    console.error('Error verifying admin status:', error);
    res.status(500).json({ error: 'Internal server error while verifying authorization' });
  }
}
