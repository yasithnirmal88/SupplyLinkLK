import { Request, Response } from 'express';
import { adminAuth, adminDb, FieldValue } from '../firebase-admin';
import { COLLECTIONS } from '../constants/collections';
import { AuthenticatedRequest } from '../middleware/auth';

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
        notificationPreferences: {
          chat: true,
          marketplace: true,
          kyc: true,
          promotional: true
        },
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

/**
 * PATCH /api/v1/auth/role
 *
 * Self-service role assignment used during onboarding.
 *
 * Only safe self-selected roles are accepted (buyer, supplier, business).
 * The role is stored on the Firestore user doc,which is read by the mobile app
 * for UI purposes. Privilege-bearing claims (role=admin etc.) are minted
 * exclusively by the Admin SDK (KYC approval / admin provisioning), never here,
 * so this endpoint cannot escalate privileges..
 *
 * Existing backend-assigned roles are preserved: once a user has a
 * non-buyer role (supplier/business), they may not switch it away here —
 * that transition is gated by KYC reject/admin action server-side.
 */
export async function updateRole(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { uid } = req;
    if (!uid) {
      res.status(401).json({ error: 'Unauthenticated' });
      return;
    }

    const { role } = req.body;
    const ALLOWED_ROLES = ['buyer', 'supplier', 'business'];
    if (typeof role !== 'string' || !ALLOWED_ROLES.includes(role)) {
      res.status(400).json({ error: 'Invalid role. Allowed: buyer, supplier, business' });
      return;
    }

    const userRef = adminDb.collection(COLLECTIONS.USERS).doc(uid);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      res.status(404).json({ error: 'User profile not found' });
      return;
    }

    const currentRole = userDoc.data()?.role ?? null;
    if (
      currentRole &&
      currentRole !== role &&
      currentRole !== 'buyer'
    ) {
      res.status(409).json({
        error: 'Role is already finalized; contact support to change it',
      });
      return;
    }

    await userRef.update({
      role,
      updatedAt: FieldValue.serverTimestamp(),
    });

    res.status(200).json({ ok: true });
  } catch (error: any) {
    console.error('Role update failed:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
