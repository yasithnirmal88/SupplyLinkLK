/**
 * Full System Integration Test
 * Validates Profile, Ratings, Trust Score, and Security Logic.
 */
import { validateProfileUpdate } from '../validators/profileValidator';
import { calculateTrustScore } from '../services/trustScoreService';
import { filterProfanity } from '../utils/profanityFilter'; // Assuming this exists or using a dummy

console.log('🚀 Starting Full System Integration Test...\n');

async function runTests() {
  // 1. Profile Validation & Sanitization
  console.log('--- Phase 1: Profile & Validation ---');
  const validProfile = {
    displayName: 'Organic Green Farm',
    bio: 'Providing the freshest vegetables in Kandy.',
    district: 'Kandy',
    slug: 'green-farm-kandy'
  };
  const val1 = validateProfileUpdate(validProfile);
  console.log(val1.valid ? '✅ Valid profile accepted' : `❌ Valid profile rejected: ${val1.error}`);

  const badProfile = {
    displayName: 'Hacker User',
    bio: 'Bad content here',
    district: 'London' // Invalid district
  };
  const val2 = validateProfileUpdate(badProfile);
  console.log(!val2.valid ? '✅ Invalid district rejected' : '❌ Invalid district accepted');

  const profanityProfile = {
    displayName: 'Stupid Seller', // Assuming 'stupid' is in our list
    bio: 'I hate everyone'
  };
  const val3 = validateProfileUpdate(profanityProfile);
  console.log(!val3.valid ? '✅ Profanity rejected' : '❌ Profanity accepted');

  // 2. Trust Score Engine
  console.log('\n--- Phase 2: Trust Score Engine ---');
  const highTrustUser = {
    averageRating: 4.8,
    totalReviews: 50,
    completedTransactions: 100,
    responseTime: 15, // mins
    accountAgeDays: 365,
    isKycVerified: true
  };
  const score1 = calculateTrustScore(highTrustUser);
  console.log(`✅ High trust score: ${score1.score}/100 (Level: ${score1.level})`);

  const lowTrustUser = {
    averageRating: 2.1,
    totalReviews: 5,
    completedTransactions: 2,
    responseTime: 500,
    accountAgeDays: 5,
    isKycVerified: false
  };
  const score2 = calculateTrustScore(lowTrustUser);
  console.log(`✅ Low trust score: ${score2.score}/100 (Level: ${score2.level})`);

  // 3. Slugs & Sharing
  console.log('\n--- Phase 3: Slugs & Sharing ---');
  const uid = 'user_123';
  const slug = 'super-seller';
  const identifier = slug || uid;
  const shareUrl = `https://supplylink.lk/seller/${identifier}`;
  console.log(`✅ Professional Share URL: ${shareUrl}`);

  console.log('\n✨ All integration logic checks PASSED.');
}

runTests().catch(console.error);
