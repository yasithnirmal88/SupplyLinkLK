import { Router } from 'express';
import authRouter from './auth';
import kycRouter from './kyc';
import adminRouter from './admin';
import supplyAdsRouter from './supplyAds';
import demandPostsRouter from './demandPosts';
import offersRouter from './offers';
import reviewsRouter from './reviews';
import subscriptionRouter from './subscription';

const router = Router();

// ─── Mount Feature Routes ────────────────────────────────────
router.use('/auth', authRouter);
router.use('/kyc', kycRouter);
router.use('/admin', adminRouter);
router.use('/supply-ads', supplyAdsRouter);
router.use('/demand-posts', demandPostsRouter);
router.use('/offers', offersRouter);
router.use('/reviews', reviewsRouter);
router.use('/subscription', subscriptionRouter);

// Future routes:
// router.use('/users', usersRouter);
// router.use('/supply-ads', supplyAdsRouter);
// router.use('/demand-posts', demandPostsRouter);
// router.use('/offers', offersRouter);
// router.use('/admin', adminRouter);

export default router;
