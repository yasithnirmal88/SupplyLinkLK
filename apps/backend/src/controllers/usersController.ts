import { Request, Response } from 'express';
import { adminDb } from '../firebase-admin';
import { COLLECTIONS } from '../constants/collections';
import { AuthenticatedRequest } from '../middleware/auth';
import { validateProfileUpdate } from '../validators/profileValidator';

/**
 * PATCH /api/v1/users/profile
 * 
 * Updates the authenticated user's profile.
 * Only allows safe fields to be edited. Protected fields (role, verification status, KYC data) are ignored.
 * 
 * Enforces strict validation on all editable fields:
 * - displayName: 3-100 chars, no profanity
 * - bio: max 300 chars, no profanity
 * - district: must be valid Sri Lankan district
 * - businessName: 3-150 chars, no profanity
 * - photoUrl: HTTPS only, trusted CDN only, valid image format
 * - categories: max 10 items
 * - languages: max 5 items
 */
export async function updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { uid } = req;
    if (!uid) {
      res.status(401).json({ error: 'Unauthenticated' });
      return;
    }

    // Step 1: Comprehensive validation
    const validationResult = validateProfileUpdate(req.body);
    if (!validationResult.valid) {
      res.status(400).json({
        error: validationResult.error,
        field: validationResult.errorField,
      });
      return;
    }

    const {
      displayName,
      bio,
      district,
      businessName,
      photoURL,
      photoSize,
      photoMimeType,
      categories,
      languages,
      slug,
    } = req.body;

    const updates: Record<string, any> = {};

    // Step 2: Get existing user data for re-verification check
    const userRef = adminDb.collection(COLLECTIONS.USERS).doc(uid);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const existingUser = userSnap.data() || {};

    // Step 3: Build updates object with validated fields
    if (displayName !== undefined) {
      updates.displayName = displayName.trim();
    }

    if (bio !== undefined) {
      updates.bio = bio?.trim() || '';
    }

    if (district !== undefined) {
      updates.district = district.trim();
    }

    if (businessName !== undefined) {
      updates.businessName = businessName?.trim() || '';
    }

    const photoUrl = (req.body.photoUrl || photoURL || '').trim();
    if (photoUrl && typeof photoUrl === 'string') {
      updates.photoUrl = photoUrl;
      updates.avatarUrl = photoUrl;
      updates.profilePhotoUrl = photoUrl;
      
      // Store metadata if provided
      if (photoSize) updates.photoSize = photoSize;
      if (photoMimeType) updates.photoMimeType = photoMimeType;
    }

    if (Array.isArray(categories) && categories.length > 0) {
      updates.categories = categories;
    }

    if (Array.isArray(languages) && languages.length > 0) {
      updates.languages = languages;
    }

    if (slug && slug !== existingUser.slug) {
      // Check for uniqueness
      const slugQuery = await adminDb.collection(COLLECTIONS.USERS)
        .where('slug', '==', slug)
        .limit(1)
        .get();
      
      if (!slugQuery.empty) {
        res.status(400).json({ error: 'This slug is already taken' });
        return;
      }
      updates.slug = slug.toLowerCase();
    }

    // Step 4: Trigger re-verification if critical fields changed
    const shouldTriggerVerification = [
      'businessName',
      'district',
      'photoUrl',
    ].some((key) => updates[key] !== undefined && updates[key] !== existingUser[key]);

    if (shouldTriggerVerification && existingUser.verificationStatus === 'approved') {
      updates.verificationStatus = 'pending';
      updates.verificationReviewRequestedAt = new Date().toISOString();
    }

    updates.updatedAt = new Date().toISOString();

    // Step 5: Persist updates
    await userRef.update(updates);

    res.status(200).json({
      message: 'Profile updated successfully',
      updates,
      verificationTriggered: shouldTriggerVerification && existingUser.verificationStatus === 'approved',
    });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
