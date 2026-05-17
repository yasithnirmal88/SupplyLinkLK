import { Request, Response } from 'express';
import { adminDb } from '../firebase-admin';
import { COLLECTIONS } from '../constants/collections';
import { AuthenticatedRequest } from '../middleware/auth';
import { notifyMatchesForSupplyAd } from '../services/matchingService';

/**
 * POST /api/v1/supply-ads
 *
 * Creates a new supply ad for an approved supplier.
 */
export async function createSupplyAd(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { uid } = req;
    
    if (!uid) {
      res.status(401).json({ error: 'Unauthenticated' });
      return;
    }

    const {
      category,
      itemName,
      quantity,
      unit,
      pricePerUnit,
      description,
      photoUrls,
      district,
      availableFrom,
      availableUntil
    } = req.body;

    // 1. Verify user is Approved Supplier
    const userDoc = await adminDb.collection(COLLECTIONS.USERS).doc(uid).get();
    if (!userDoc.exists) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const userData = userDoc.data()!;
    if (userData.role !== 'supplier') {
      res.status(403).json({ error: 'Forbidden: Only suppliers can create supply ads' });
      return;
    }

    if (userData.verificationStatus !== 'approved' && userData.verificationStatus !== true) {
      res.status(403).json({ error: 'Forbidden: Supplier must be verified to post ads' });
      return;
    }

    // Optionally get supplier profile for rating/reviews
    const supplierDoc = await adminDb.collection('adminQueue').where('uid', '==', uid).where('type', '==', 'supplier_kyc').limit(1).get();
    // Usually there is a dedicated suppliers collection for rating, but we can mock it here if not established
    const supplierRating = 0;

    const now = new Date().toISOString();

    const adData = {
      supplierId: uid,
      supplierName: userData.displayName,
      supplierRating: supplierRating,
      supplierVerified: true,
      category,
      title: itemName,
      description: description || '',
      imageUrls: photoUrls || [],
      quantity,
      unit,
      pricePerUnit,
      currency: 'LKR',
      district,
      availableFrom,
      availableUntil: availableUntil || null,
      status: 'active',
      createdAt: now,
      updatedAt: now,
      viewCount: 0,
      offerCount: 0
    };

    // 2. Create Document
    const adRef = adminDb.collection(COLLECTIONS.SUPPLY_ADS).doc();
    await adRef.set({
      adId: adRef.id,
      ...adData
    });

    // 3. Trigger Matches (Async)
    notifyMatchesForSupplyAd(adRef.id, category, district, itemName);

    console.log(`[Notification] Supply Ad created. Notifying matches for ${itemName} in ${district}.`);

    res.status(201).json({ message: 'Supply Ad created successfully', adId: adRef.id });
  } catch (error: any) {
    console.error('Error creating supply ad:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
