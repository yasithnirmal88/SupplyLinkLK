/**
 * Load Test: Ratings Aggregation Performance.
 * Simulates concurrent rating submissions for a single target user.
 */

import { adminDb } from '../firebase-admin';
import { updateSellerMetrics, syncTrustScore } from '../services/ratings/ratingsAggregationService';

async function simulateLoad(targetUid: string, count: number) {
  console.log(`🔥 Starting Load Test for UID: ${targetUid}`);
  console.log(`📊 Simulating ${count} concurrent reviews...`);

  const startTime = Date.now();
  const tasks = [];

  for (let i = 0; i < count; i++) {
    const rating = Math.floor(Math.random() * 5) + 1;
    tasks.push(updateSellerMetrics(targetUid, rating));
  }

  try {
    const results = await Promise.allSettled(tasks);
    const successCount = results.filter(r => r.status === 'fulfilled').length;
    const failureCount = results.filter(r => r.status === 'rejected').length;

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;

    console.log('\n--- Load Test Results ---');
    console.log(`✅ Success: ${successCount}`);
    console.log(`❌ Failures (Concurrency contentions): ${failureCount}`);
    console.log(`⏱️ Total Duration: ${duration.toFixed(2)}s`);
    console.log(`📈 Throughput: ${(successCount / duration).toFixed(2)} updates/sec`);

    // Final sync
    console.log('\n🔄 Performing final trust score sync...');
    const finalScore = await syncTrustScore(targetUid);
    console.log(`🎯 Final Trust Score: ${finalScore}%`);

  } catch (error) {
    console.error('Critical failure in load test:', error);
  }
}

// Usage: npx ts-node src/tests/loadTest.ts [uid] [count]
const uid = process.argv[2] || 'test_user_id';
const count = parseInt(process.argv[3]) || 50;

simulateLoad(uid, count).catch(console.error);
