import { Request, Response } from 'express';
import { adminAuth, adminDb } from '../firebase-admin';
import { COLLECTIONS } from '../constants/collections';

/**
 * POST /api/v1/auth/verify-token
 *
 * Accepts a Firebase ID token in the request body.
 * Verifies it with Firebase Admin SDK.
 * Returns the user profile from Firestore, or creates a new one.
 */
export async function verifyToken(req: Request, res: Response): Promise<void> {
  try {
    const { idToken, language = 'en' } = req.body;

    if (!idToken) {
      res.status(400).json({ error: 'idToken is required' });
      return;
    }

    // Verify the token
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const { uid, phone_number: phoneNumber } = decodedToken;

    // Look up user in Firestore
    const userRef = adminDb.collection(COLLECTIONS.USERS).doc(uid);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      // Existing user — return profile
      const userData = userDoc.data();
      res.status(200).json({
        isNewUser: false,
        user: {
          uid,
          ...userData,
        },
      });
    } else {
      // New user — create profile
      const now = new Date().toISOString();
      const newUser = {
        uid,
        phoneNumber: phoneNumber || '',
        role: null,
        displayName: null,
        avatarUrl: null,
        verificationStatus: 'pending',
        language,
        fcmToken: null,
        createdAt: now,
        updatedAt: now,
      };

      await userRef.set(newUser);

      res.status(201).json({
        isNewUser: true,
        user: newUser,
      });
    }
  } catch (error: any) {
    console.error('Token verification failed:', error);

    if (error.code === 'auth/id-token-expired') {
      res.status(401).json({ error: 'Token has expired' });
    } else if (error.code === 'auth/id-token-revoked') {
      res.status(401).json({ error: 'Token has been revoked' });
    } else if (error.code === 'auth/argument-error') {
      res.status(400).json({ error: 'Invalid token format' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
