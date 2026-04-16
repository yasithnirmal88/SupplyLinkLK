import { Request, Response } from 'express';
import { adminAuth, adminDb } from '../firebase-admin';
import { COLLECTIONS } from '../constants/collections';

/**
 * POST /api/v1/kyc/submit
 *
 * Handles supplier KYC submission.
 * Validates data, updates user profile, and creates an admin queue entry.
 */
export async function submitKyc(req: Request, res: Response): Promise<void> {
  try {
    const { 
      uid, 
      displayName, 
      address, 
      district, 
      profilePhotoUrl,
      nicFrontUrl, 
      nicBackUrl, 
      selfieUrl, 
      categories 
    } = req.body;

    if (!uid || !displayName || !nicFrontUrl || !nicBackUrl || !selfieUrl) {
      res.status(400).json({ error: 'Missing required KYC fields' });
      return;
    }

    const now = new Date();
    const batch = adminDb.batch();

    // 1. Update user profile
    const userRef = adminDb.collection(COLLECTIONS.USERS).doc(uid);
    batch.update(userRef, {
      displayName,
      verificationStatus: 'pending',
      updatedAt: now.toISOString(),
    });

    // 2. Add to admin queue for manual review
    const queueRef = adminDb.collection('adminQueue').doc();
    batch.set(queueRef, {
      uid,
      type: 'supplier_kyc',
      displayName,
      address,
      district,
      profilePhotoUrl,
      nicFrontUrl,
      nicBackUrl,
      selfieUrl,
      categories, // Array of { name, selfieUrl }
      status: 'pending',
      submittedAt: now.toISOString(),
    });

    await batch.commit();

    // 3. TODO: Send FCM Notification to Admins
    // 4. TODO: Trigger Notify.lk SMS to user (requires API key)

    res.status(200).json({ message: 'KYC submitted successfully', queueId: queueRef.id });
  } catch (error: any) {
    console.error('KYC submission failed:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * POST /api/v1/kyc/submit-business
 *
 * Handles business KYC submission.
 */
export async function submitBusinessKyc(req: Request, res: Response): Promise<void> {
  try {
    const { 
      uid, 
      businessName,
      contactPerson,
      businessType,
      address, 
      district, 
      profilePhotoUrl,
      nicFrontUrl, 
      nicBackUrl, 
      selfieUrl, 
      businessRegUrl 
    } = req.body;

    if (!uid || !businessName || !contactPerson) {
      res.status(400).json({ error: 'Missing required Business KYC fields' });
      return;
    }

    const now = new Date();
    const batch = adminDb.batch();

    // 1. Update user profile
    const userRef = adminDb.collection(COLLECTIONS.USERS).doc(uid);
    batch.update(userRef, {
      displayName: businessName,
      verificationStatus: 'pending',
      updatedAt: now.toISOString(),
    });

    // 2. Add to admin queue
    const queueRef = adminDb.collection('adminQueue').doc();
    batch.set(queueRef, {
      uid,
      type: 'business_kyc',
      businessName,
      contactPerson,
      businessType,
      address,
      district,
      profilePhotoUrl,
      nicFrontUrl,
      nicBackUrl,
      selfieUrl,
      businessRegUrl,
      status: 'pending',
      submittedAt: now.toISOString(),
    });

    await batch.commit();

    res.status(200).json({ message: 'Business KYC submitted successfully', queueId: queueRef.id });
  } catch (error: any) {
    console.error('Business KYC submission failed:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
