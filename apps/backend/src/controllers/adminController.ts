import { Request, Response } from 'express';
import { adminDb } from '../firebase-admin';
import { COLLECTIONS } from '../constants/collections';

export async function getQueue(req: Request, res: Response): Promise<void> {
  try {
    const queueSnapshot = await adminDb.collection('adminQueue')
      .where('status', '==', 'pending')
      // Ordered by oldest first to handle 24h SLA. Note: Need an index for this.
      .orderBy('submittedAt', 'asc')
      .get();

    const queue = queueSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const rejectedSnapshot = await adminDb.collection('adminQueue')
      .where('status', '==', 'rejected')
      .orderBy('reviewedAt', 'desc')
      .limit(50)
      .get();
      
    const rejected = rejectedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.status(200).json({ pending: queue, rejected });
  } catch (error: any) {
    console.error('Error fetching admin queue:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function approveKyc(req: Request, res: Response): Promise<void> {
  try {
    const { queueId } = req.params;

    const queueRef = adminDb.collection('adminQueue').doc(queueId);
    const doc = await queueRef.get();

    if (!doc.exists) {
      res.status(404).json({ error: 'Queue item not found' });
      return;
    }

    const { uid } = doc.data()!;
    const now = new Date().toISOString();
    const batch = adminDb.batch();

    // 1. Update queue status
    batch.update(queueRef, {
      status: 'approved',
      reviewedAt: now,
    });

    // 2. Update user status
    const userRef = adminDb.collection(COLLECTIONS.USERS).doc(uid);
    batch.update(userRef, {
      verificationStatus: 'approved',
      updatedAt: now,
    });

    await batch.commit();

    // 3. TODO: Send FCM + SMS
    console.log(`[Notification] KYC Approved for ${uid}`);

    res.status(200).json({ message: 'KYC approved successfully' });
  } catch (error: any) {
    console.error('Error approving KYC:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function rejectKyc(req: Request, res: Response): Promise<void> {
  try {
    const { queueId } = req.params;
    const { reason, internalNotes } = req.body;

    if (!reason) {
      res.status(400).json({ error: 'Rejection reason is required' });
      return;
    }

    const queueRef = adminDb.collection('adminQueue').doc(queueId);
    const doc = await queueRef.get();

    if (!doc.exists) {
      res.status(404).json({ error: 'Queue item not found' });
      return;
    }

    const { uid } = doc.data()!;
    const now = new Date().toISOString();
    const batch = adminDb.batch();

    // 1. Update queue status
    batch.update(queueRef, {
      status: 'rejected',
      rejectionReason: reason,
      internalNotes: internalNotes || null,
      reviewedAt: now,
    });

    // 2. Update user status
    const userRef = adminDb.collection(COLLECTIONS.USERS).doc(uid);
    batch.update(userRef, {
      verificationStatus: 'rejected',
      updatedAt: now,
    });

    await batch.commit();

    // 3. TODO: Send FCM + SMS
    console.log(`[Notification] KYC Rejected for ${uid} with reason: ${reason}`);

    res.status(200).json({ message: 'KYC rejected successfully' });
  } catch (error: any) {
    console.error('Error rejecting KYC:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getStats(req: Request, res: Response): Promise<void> {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const startOfTodayIso = startOfToday.toISOString();

    const db = adminDb;
    
    // Total Users
    const usersSnapshot = await db.collection(COLLECTIONS.USERS).count().get();
    const totalUsers = usersSnapshot.data().count;

    // Total Suppliers
    const suppliersSnapshot = await db.collection(COLLECTIONS.USERS).where('role', '==', 'supplier').count().get();
    const totalSuppliers = suppliersSnapshot.data().count;

    // Total Businesses
    const businessesSnapshot = await db.collection(COLLECTIONS.USERS).where('role', '==', 'business').count().get();
    const totalBusinesses = businessesSnapshot.data().count;

    // Pending Queue
    const pendingSnapshot = await db.collection('adminQueue').where('status', '==', 'pending').count().get();
    const pendingQueueCount = pendingSnapshot.data().count;

    // Approved Today
    // Requires composite index if we had a large dataset, but simple query is fine
    // However, count() with multiple fields might be tricky. Let's just fetch for today or use aggregation
    const approvedTodaySnapshot = await db.collection('adminQueue')
      .where('status', '==', 'approved')
      .where('reviewedAt', '>=', startOfTodayIso)
      .count()
      .get();
    const approvedToday = approvedTodaySnapshot.data().count;

    // Rejected Today
    const rejectedTodaySnapshot = await db.collection('adminQueue')
      .where('status', '==', 'rejected')
      .where('reviewedAt', '>=', startOfTodayIso)
      .count()
      .get();
    const rejectedToday = rejectedTodaySnapshot.data().count;

    res.status(200).json({
      totalUsers,
      totalSuppliers,
      totalBusinesses,
      pendingQueueCount,
      approvedToday,
      rejectedToday
    });

  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
