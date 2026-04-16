import { Response } from 'express';
import crypto from 'crypto';
import { adminDb } from '../firebase-admin';
import { COLLECTIONS } from '../constants/collections';
import { AuthenticatedRequest } from '../middleware/auth';

const MERCHANT_ID = process.env.PAYHERE_MERCHANT_ID || '';
const MERCHANT_SECRET = process.env.PAYHERE_SECRET || '';

/**
 * POST /api/v1/subscription/initiate
 * 
 * Generates the PayHere hash for a specific plan.
 */
export async function initiateSubscription(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { uid } = req;
    const { planId, billingCycle } = req.body; // billingCycle: 'monthly' | 'annual'

    if (!uid) {
       res.status(401).json({ error: 'Unauthenticated' });
       return;
    }

    const orderId = `SUB_${uid}_${Date.now()}`;
    const amount = planId === 'supplier_pro' 
       ? (billingCycle === 'monthly' ? 499 : 4499)
       : (billingCycle === 'monthly' ? 999 : 8999);
    
    // Hash = strtoupper(md5(merchant_id + order_id + amount + currency + strtoupper(md5(merchant_secret))))
    const secretHash = crypto.createHash('md5').update(MERCHANT_SECRET).digest('hex').toUpperCase();
    const mainHash = crypto.createHash('md5').update(MERCHANT_ID + orderId + amount.toFixed(2) + 'LKR' + secretHash).digest('hex').toUpperCase();

    res.status(200).json({
       merchantId: MERCHANT_ID,
       orderId,
       amount,
       currency: 'LKR',
       hash: mainHash,
       items: `${planId} - ${billingCycle}`,
       subscriptionParams: {
          period: billingCycle === 'monthly' ? '1 Month' : '1 Year',
          recurrence: '0', // 0 = Infinite
          duration: 'Forever',
       }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * POST /api/v1/subscription/webhook
 * 
 * PayHere notification callback.
 */
export async function payhereWebhook(req: Request, res: Response): Promise<void> {
  try {
    const { 
      merchant_id, 
      order_id, 
      payhere_amount, 
      payhere_currency, 
      status_code, 
      md5sig,
      custom_1: uid // We'll pass uid in custom_1
    } = req.body;

    // Verify Signature
    const secretHash = crypto.createHash('md5').update(MERCHANT_SECRET).digest('hex').toUpperCase();
    const expectedHash = crypto.createHash('md5').update(merchant_id + order_id + payhere_amount + payhere_currency + status_code + secretHash).digest('hex').toUpperCase();

    if (md5sig !== expectedHash) {
       console.error('[PayHere] Invalid signature');
       res.status(400).send('Invalid signature');
       return;
    }

    if (status_code === '2') { // 2 = Success
      const planInfo = order_id.split('_'); // Mocking plan detection from orderId logic if needed
      // For this prototype, we'll assume the client sent the right plan and we handle it here.
      
      const expiry = new Date();
      expiry.setMonth(expiry.getMonth() + 1); // Mock 1 month for now

      await adminDb.collection(COLLECTIONS.USERS).doc(uid).update({
         plan: 'pro', // simplified for demo
         planExpiresAt: expiry.toISOString(),
         updatedAt: new Date().toISOString()
      });

      console.log(`[Subscription] Plan activated for user ${uid}`);
    }

    res.status(200).send('OK');
  } catch (err) {
    res.status(500).send('Error');
  }
}
