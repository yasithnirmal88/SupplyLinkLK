/**
 * seedAds.js
 *
 * Creates 3 Supply Ads and 3 Demand Posts in Firestore.
 * Linked to the dummy accounts created previously.
 *
 * Usage:
 *   node scripts/seedAds.js
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccount.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'supplylinklk-dba66.firebasestorage.app'
});

const db = admin.firestore();
const now = admin.firestore.FieldValue.serverTimestamp();

// ─── Supply Ads (Suppliers Selling) ──────────────────────────────────────────

const supplyAds = [
  {
    id: 'supply_ad_001',
    supplierId: 'dummy_supplier_001',
    title: 'Fresh King Coconuts (Thambili)',
    category: 'fruits',
    description: 'Fresh king coconuts (thambili) available — 300 units ready for immediate pickup. Grown organically in Colombo district. Ideal for juice bars, hotels, and retailers. Price negotiable for bulk orders. Contact for delivery options.',
    price: 150,
    unit: 'piece',
    quantity: 300,
    district: 'Colombo',
    imageUrl: 'https://images.unsplash.com/photo-1589135398302-388cd65e1d3b?q=80&w=1000&auto=format&fit=crop', // Placeholder for kingcoconut.png
    status: 'active',
  },
  {
    id: 'supply_ad_002',
    supplierId: 'dummy_supplier_002',
    title: 'Premium Fresh Coconuts',
    category: 'vegetables',
    description: 'Premium fresh coconuts — 120 units available this week. Hill country grown, mature and heavy. Perfect for coconut milk, oil pressing, or direct retail. Pickup from Kandy or can arrange transport. Serious buyers only.',
    price: 110,
    unit: 'piece',
    quantity: 120,
    district: 'Kandy',
    imageUrl: 'https://images.unsplash.com/photo-1596434458315-08e1ec25251a?q=80&w=1000&auto=format&fit=crop', // Placeholder for coconuts.webp
    status: 'active',
  },
  {
    id: 'supply_ad_003',
    supplierId: 'dummy_supplier_003',
    title: 'Dried Coconut Shells',
    category: 'raw materials',
    description: 'Dried coconut shells — 10,000 units in stock. Ideal for charcoal production, craft workshops, and biomass fuel. Bulk pricing available. Located in Jaffna, can negotiate freight for large orders.',
    price: 5,
    unit: 'piece',
    quantity: 10000,
    district: 'Jaffna',
    imageUrl: 'https://images.unsplash.com/photo-1596434458315-08e1ec25251a?q=80&w=1000&auto=format&fit=crop', // Placeholder for coconut charcoal.webp
    status: 'active',
  },
];

// ─── Demand Posts (Businesses Buying) ─────────────────────────────────────────

const demandPosts = [
  {
    id: 'demand_post_001',
    buyerId: 'dummy_buyer_001',
    title: 'Seeking Recurring King Coconut Supply',
    category: 'fruits',
    description: 'Looking to source 300 king coconuts (thambili) weekly on a recurring basis. Must be fresh, orange, and market-ready. Prefer suppliers within Gampaha or Colombo district. Long-term contract possible for reliable suppliers.',
    targetPrice: 130,
    unit: 'piece',
    quantityNeeded: 300,
    frequency: 'weekly',
    district: 'Gampaha',
    imageUrl: 'https://images.unsplash.com/photo-1589135398302-388cd65e1d3b?q=80&w=1000&auto=format&fit=crop', // Placeholder
    status: 'open',
  },
  {
    id: 'demand_post_002',
    buyerId: 'dummy_buyer_002',
    title: 'Fresh Moringa Leaves & Drumsticks Needed',
    category: 'vegetables',
    description: 'Urgently need 50kg of fresh moringa leaves and drumstick pods. Weekly supply preferred. Must be pesticide-free. Located in Kalutara — nearby suppliers prioritized. Premium price offered for consistent quality.',
    targetPrice: 450,
    unit: 'kg',
    quantityNeeded: 50,
    frequency: 'weekly',
    district: 'Kalutara',
    imageUrl: 'https://images.unsplash.com/photo-1590005354167-6da97870c747?q=80&w=1000&auto=format&fit=crop', // Placeholder for moringa.webp
    status: 'open',
  },
  {
    id: 'demand_post_003',
    buyerId: 'dummy_buyer_003',
    title: 'Fresh Banana Bunches (Recurring)',
    category: 'fruits',
    description: 'Seeking 10 kan (bunches) of fresh bananas weekly for redistribution to local retailers across Matale district. Any variety considered — Kolikuttu preferred. Ongoing contract available for dependable suppliers.',
    targetPrice: 2500,
    unit: 'bunch',
    quantityNeeded: 10,
    frequency: 'weekly',
    district: 'Matale',
    imageUrl: 'https://images.unsplash.com/photo-1571771894821-ad99026a0947?q=80&w=1000&auto=format&fit=crop', // Placeholder for banana.jpg
    status: 'open',
  },
];

async function seedSupplyAds() {
  const batch = db.batch();
  for (const ad of supplyAds) {
    const docRef = db.collection('supplyAds').doc(ad.id);
    batch.set(docRef, {
      ...ad,
      createdAt: now,
      updatedAt: now,
    });
  }
  await batch.commit();
  console.log('✅ Supply Ads seeded');
}

async function seedDemandPosts() {
  const batch = db.batch();
  for (const post of demandPosts) {
    const docRef = db.collection('demandPosts').doc(post.id);
    batch.set(docRef, {
      ...post,
      createdAt: now,
      updatedAt: now,
    });
  }
  await batch.commit();
  console.log('✅ Demand Posts seeded');
}

async function main() {
  console.log('\n📦 Seeding SupplyLink LK Ads & Demands...\n');
  await seedSupplyAds();
  await seedDemandPosts();
  console.log('\n🎉 Done!\n');
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
