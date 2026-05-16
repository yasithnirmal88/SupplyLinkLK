/**
 * seedDummyAccounts.js
 *
 * Creates 3 dummy supplier accounts and 3 dummy business accounts
 * directly into Firestore (no Firebase Auth — phone auth can't be seeded via SDK).
 *
 * Collections written:
 *   users/{uid}
 *   suppliers/{uid}          (supplier role only)
 *   businesses/{uid}         (buyer role only)
 *   publicProfiles/{uid}
 *
 * Usage:
 *   1. Place this file at: apps/mobile/scripts/seedDummyAccounts.js
 *   2. Place your Firebase service account JSON at: apps/mobile/scripts/serviceAccount.json
 *   3. Run: node scripts/seedDummyAccounts.js
 *
 * Install deps first (one-time):
 *   npm install firebase-admin --save-dev
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccount.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const now = admin.firestore.FieldValue.serverTimestamp();

// ─── Dummy Suppliers ──────────────────────────────────────────────────────────

const suppliers = [
  {
    uid: 'dummy_supplier_001',
    phoneNumber: '+94771000001',
    displayName: 'Kamal Perera',
    role: 'supplier',
    verificationStatus: 'verified',
    language: 'si',
    district: 'Colombo',
    plan: 'basic',
    // Supplier-specific profile
    businessName: 'Perera Agro Supplies',
    categories: ['vegetables', 'fruits'],
    description: 'Fresh vegetables and fruits supplier from Colombo district. 10+ years of experience.',
    rating: 4.5,
    reviewCount: 12,
    isActive: true,
  },
  {
    uid: 'dummy_supplier_002',
    phoneNumber: '+94771000002',
    displayName: 'Nimal Silva',
    role: 'supplier',
    verificationStatus: 'verified',
    language: 'si',
    district: 'Kandy',
    plan: 'premium',
    businessName: 'Silva Dairy Farm',
    categories: ['dairy', 'eggs'],
    description: 'Premium dairy products and free-range eggs from the hill country.',
    rating: 4.8,
    reviewCount: 27,
    isActive: true,
  },
  {
    uid: 'dummy_supplier_003',
    phoneNumber: '+94771000003',
    displayName: 'Amara Fernando',
    role: 'supplier',
    verificationStatus: 'pending',
    language: 'ta',
    district: 'Jaffna',
    plan: 'basic',
    businessName: 'Fernando Spice Garden',
    categories: ['spices', 'dried goods'],
    description: 'Authentic northern spices and dried goods. Direct from farm to buyer.',
    rating: 4.2,
    reviewCount: 5,
    isActive: true,
  },
];

// ─── Dummy Businesses (Buyers) ────────────────────────────────────────────────

const businesses = [
  {
    uid: 'dummy_buyer_001',
    phoneNumber: '+94772000001',
    displayName: 'Suresh Jayawardena',
    role: 'buyer',
    verificationStatus: 'verified',
    language: 'en',
    district: 'Gampaha',
    plan: 'basic',
    // Business-specific profile
    businessName: 'Fresh Mart Supermarket',
    businessType: 'retail',
    description: 'Mid-sized supermarket chain looking for reliable fresh produce suppliers.',
    rating: 4.3,
    reviewCount: 8,
    isActive: true,
  },
  {
    uid: 'dummy_buyer_002',
    phoneNumber: '+94772000002',
    displayName: 'Priya Wickramasinghe',
    role: 'buyer',
    verificationStatus: 'verified',
    language: 'si',
    district: 'Kalutara',
    plan: 'premium',
    businessName: 'Green Leaf Restaurant',
    businessType: 'restaurant',
    description: 'Farm-to-table restaurant sourcing fresh ingredients weekly.',
    rating: 4.7,
    reviewCount: 19,
    isActive: true,
  },
  {
    uid: 'dummy_buyer_003',
    phoneNumber: '+94772000003',
    displayName: 'Rajan Muthu',
    role: 'buyer',
    verificationStatus: 'pending',
    language: 'ta',
    district: 'Matale',
    plan: 'basic',
    businessName: 'Muthu Wholesale Traders',
    businessType: 'wholesale',
    description: 'Wholesale distributor supplying small retailers across Central Province.',
    rating: 4.0,
    reviewCount: 3,
    isActive: true,
  },
];

// ─── Write Helpers ────────────────────────────────────────────────────────────

async function seedSupplier(s) {
  const batch = db.batch();

  // users/{uid}
  batch.set(db.collection('users').doc(s.uid), {
    uid: s.uid,
    phoneNumber: s.phoneNumber,
    displayName: s.displayName,
    role: s.role,
    verificationStatus: s.verificationStatus,
    language: s.language,
    district: s.district,
    plan: s.plan,
    createdAt: now,
    updatedAt: now,
  });

  // suppliers/{uid}
  batch.set(db.collection('suppliers').doc(s.uid), {
    uid: s.uid,
    displayName: s.displayName,
    phoneNumber: s.phoneNumber,
    businessName: s.businessName,
    categories: s.categories,
    description: s.description,
    district: s.district,
    plan: s.plan,
    rating: s.rating,
    reviewCount: s.reviewCount,
    isActive: s.isActive,
    verificationStatus: s.verificationStatus,
    createdAt: now,
    updatedAt: now,
  });

  // publicProfiles/{uid}
  batch.set(db.collection('publicProfiles').doc(s.uid), {
    uid: s.uid,
    displayName: s.displayName,
    businessName: s.businessName,
    role: s.role,
    district: s.district,
    categories: s.categories,
    rating: s.rating,
    reviewCount: s.reviewCount,
    isActive: s.isActive,
    plan: s.plan,
  });

  await batch.commit();
  console.log(`✅ Supplier seeded: ${s.displayName} (${s.uid})`);
}

async function seedBusiness(b) {
  const batch = db.batch();

  // users/{uid}
  batch.set(db.collection('users').doc(b.uid), {
    uid: b.uid,
    phoneNumber: b.phoneNumber,
    displayName: b.displayName,
    role: b.role,
    verificationStatus: b.verificationStatus,
    language: b.language,
    district: b.district,
    plan: b.plan,
    createdAt: now,
    updatedAt: now,
  });

  // businesses/{uid}
  batch.set(db.collection('businesses').doc(b.uid), {
    uid: b.uid,
    displayName: b.displayName,
    phoneNumber: b.phoneNumber,
    businessName: b.businessName,
    businessType: b.businessType,
    description: b.description,
    district: b.district,
    plan: b.plan,
    rating: b.rating,
    reviewCount: b.reviewCount,
    isActive: b.isActive,
    verificationStatus: b.verificationStatus,
    createdAt: now,
    updatedAt: now,
  });

  // publicProfiles/{uid}
  batch.set(db.collection('publicProfiles').doc(b.uid), {
    uid: b.uid,
    displayName: b.displayName,
    businessName: b.businessName,
    role: b.role,
    district: b.district,
    businessType: b.businessType,
    rating: b.rating,
    reviewCount: b.reviewCount,
    isActive: b.isActive,
    plan: b.plan,
  });

  await batch.commit();
  console.log(`✅ Business seeded: ${b.displayName} (${b.uid})`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🌱 Seeding SupplyLink LK dummy accounts...\n');

  console.log('--- Suppliers ---');
  for (const s of suppliers) await seedSupplier(s);

  console.log('\n--- Businesses ---');
  for (const b of businesses) await seedBusiness(b);

  console.log('\n🎉 Done! 3 suppliers + 3 businesses seeded.\n');
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
