import { Request, Response } from 'express';
import { adminDb } from '../firebase-admin';
import { COLLECTIONS } from '../constants/collections';

/**
 * GET /api/v1/admin/analytics/summary
 * 
 * Provides high-level metrics for the admin dashboard.
 */
export async function getAnalyticsSummary(req: Request, res: Response): Promise<void> {
  try {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

    // 1. Notification Metrics
    const logsSnap = await adminDb.collection('notification_logs')
      .where('timestamp', '>=', last24h)
      .get();
    
    let totalSent = logsSnap.size;
    let pushSuccesses = 0;
    let smsSuccesses = 0;
    
    logsSnap.forEach(doc => {
      const data = doc.data();
      if (data.pushSuccess) pushSuccesses++;
      if (data.smsSuccess) smsSuccesses++;
    });

    // 2. Marketplace Metrics
    const adsSnap = await adminDb.collection(COLLECTIONS.SUPPLY_ADS).get();
    const demandsSnap = await adminDb.collection(COLLECTIONS.DEMAND_POSTS).get();
    
    const categoryCounts: Record<string, number> = {};
    adsSnap.forEach(doc => {
      const cat = doc.data().category;
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    // 3. User Activity
    const activeUsersSnap = await adminDb.collection(COLLECTIONS.USERS)
      .where('lastNotificationAt', '>=', last24h)
      .get();

    // 4. Platform Totals
    const totalUsersSnap = await adminDb.collection(COLLECTIONS.USERS).count().get();
    const totalAdsSnap = await adminDb.collection(COLLECTIONS.SUPPLY_ADS).count().get();

    res.status(200).json({
      notifications: {
        total24h: totalSent,
        pushSuccessRate: totalSent > 0 ? (pushSuccesses / totalSent) * 100 : 100,
        smsSuccessRate: totalSent > 0 ? (smsSuccesses / totalSent) * 100 : 100,
      },
      marketplace: {
        totalAds: totalAdsSnap.data().count,
        totalDemands: demandsSnap.size,
        topCategories: Object.entries(categoryCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([name, count]) => ({ name, count })),
      },
      users: {
        totalRegistered: totalUsersSnap.data().count,
        active24h: activeUsersSnap.size,
      },
      timestamp: now.toISOString()
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
