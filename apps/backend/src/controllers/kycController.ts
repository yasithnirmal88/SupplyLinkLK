import { Request, Response } from 'express';
import { adminDb } from '../firebase-admin';
import { COLLECTIONS } from '../constants/collections';
import { sendNotification } from '../services/notificationService';
import { AuthenticatedRequest } from '../middleware/auth';

const isSecureUrl = (v: unknown): boolean => typeof v === 'string' && /^https:\/\//.test(v);

/**
 * POST /api/v1/kyc/submit
 *
 * Handles supplier KYC submission. The authenticated user's identity (req.uid)
 * is the ONLY authority for whom the submission belongs to — the body uid is never
 * trusted for the target user.
 */
export async function submitKyc(req: AuthenticatedRequest, res: Response): Promise<void> {
  const uid = req.uid;
  if (!uid) {
    res.status(401).json({ error: 'Unauthenticated' });
    return;
  }

  try {
    const { displayName, address, district, profilePhotoUrl, nicFrontUrl, nicBackUrl, selfieUrl, categories } = req.body || {};

    const errors: string[] = [];
    if (typeof displayName !== 'string' || displayName.trim().length < 2 || displayName.trim().length > 100) errors.push('displayName must be 2-100 characters');
    if (!isSecureUrl(nicFrontUrl)) errors.push('nicFrontUrl must be a secure https URL');
    if (!isSecureUrl(nicBackUrl)) errors.push('nicBackUrl must be a secure https URL');
    if (!isSecureUrl(selfieUrl)) errors.push('selfieUrl must be a secure https URL');
    if (profilePhotoUrl !== undefined && !isSecureUrl(profilePhotoUrl)) errors.push('profilePhotoUrl must be a secure https URL');
    if (address !== undefined && typeof address !== 'string') errors.push('address must be a string');
    if (district !== undefined && typeof district !== 'string') errors.push('district must be a string');
    if (categories !== undefined && (!Array.isArray(categories) || categories.length > 10 || categories.some(c => !c || typeof c.name !== 'string'))) errors.push('categories must be an array of up to 10 items with a name');

    if (errors.length > 0) {
      res.status(400).json({ error: errors[0] });
      return;
    }

    const now = new Date();
    const batch = adminDb.batch();

    const userRef = adminDb.collection(COLLECTIONS.USERS).doc(uid);
    batch.update(userRef, {
      displayName: displayName.trim(),
      address: address || '',
      district: district || '',
      verificationStatus: 'pending',
      updatedAt: now.toISOString(),
    });

    const queueRef = adminDb.collection('adminQueue').doc();
    batch.set(queueRef, {
      uid,
      type: 'supplier_kyc',
      displayName: displayName.trim(),
      address: address || '',
      district: district || '',
      profilePhotoUrl: profilePhotoUrl || null,
      nicFrontUrl,
      nicBackUrl,
      selfieUrl,
      categories: categories || [],
      status: 'pending',
      submittedAt: now.toISOString(),
    });

    await batch.commit();

    await sendNotification(uid, {
      title: 'KYC Submitted 📄',
      body: 'Your verification documents have been received and are under review. This typically takes 24 hours.',
      type: 'kyc_status',
      relatedId: queueRef.id,
    });

    res.status(200).json({ message: 'KYC submitted successfully', queueId: queueRef.id });
  } catch (error: any) {
    console.error('KYC submission failed:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * POST /api/v1/kyc/submit-business
 *
 * Handles business KYC submission. Same ownership rule as supplier flow。
 */
export async function submitBusinessKyc(req: AuthenticatedRequest, res: Response): Promise<void> {
  const uid = req.uid;
  if (!uid) {
    res.status(401).json({ error: 'Unauthenticated' });
    return;
  }

  try {
    const { businessName, contactPerson, businessType, address, district, profilePhotoUrl, nicFrontUrl, nicBackUrl, selfieUrl, businessRegUrl } = req.body || {};

    const errors: string[] = [];
    if (typeof businessName !== 'string' || businessName.trim().length < 2 || businessName.trim().length > 150) errors.push('businessName must be 2-150 characters');
    if (typeof contactPerson !== 'string' || contactPerson.trim().length < 2) errors.push('contactPerson must be at least 2 characters');

    if (!isSecureUrl(nicFrontUrl)) errors.push('nicFrontUrl must be a secure https URL');
    if (!isSecureUrl(nicBackUrl)) errors.push('nicBackUrl must be a secure https URL');
    if (!isSecureUrl(selfieUrl)) errors.push('selfieUrl must be a secure https URL');
    if (profilePhotoUrl !== undefined && !isSecureUrl(profilePhotoUrl)) errors.push('profilePhotoUrl must be a secure https URL');
    if (businessRegUrl !== undefined && !isSecureUrl(businessRegUrl)) errors.push('businessRegUrl must be a secure https URL');
    if (businessType !== undefined && typeof businessType !== 'string') errors.push('businessType must be a string');
    if (address !== undefined && typeof address !== 'string') errors.push('address must be a string');
    if (district !== undefined && typeof district !== 'string') errors.push('district must be a string');

    if (errors.length > 0) {
      res.status(400).json({ error: errors[0] });
      return;
    }

    const now = new Date();
    const batch = adminDb.batch();

    const userRef = adminDb.collection(COLLECTIONS.USERS).doc(uid);
    batch.update(userRef, {
      displayName: businessName.trim(),
      businessName: businessName.trim(),
      contactPerson,
      businessType: businessType || '',
      address: address || '',
      district: district || '',
      verificationStatus: 'pending',
      updatedAt: now.toISOString(),
    });

    const queueRef = adminDb.collection('adminQueue').doc();
    batch.set(queueRef, {
      uid,
      type: 'business_kyc',
      businessName: businessName.trim(),
      contactPerson,
      businessType: businessType || '',
      address: address || '',
      district: district || '',
      profilePhotoUrl: profilePhotoUrl || null,
      nicFrontUrl,
      nicBackUrl,
      selfieUrl,
      businessRegUrl: businessRegUrl || null,
      status: 'pending',
      submittedAt: now.toISOString(),
    });

    await batch.commit();

    await sendNotification(uid, {
      title: 'Business KYC Submitted 📄',
      body: 'Your business documents have been received and are under review.',
      type: 'kyc_status',
      relatedId: queueRef.id,
    });

    res.status(200).json({ message: 'Business KYC submitted successfully', queueId: queueRef.id });
  } catch (error: any) {
    console.error('Business KYC submission failed:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
