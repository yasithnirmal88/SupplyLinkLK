const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccount.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'supplylinklk-dba66'
  });
}

const db = admin.firestore();
const now = admin.firestore.FieldValue.serverTimestamp();

// ─── Supply Ads (with Images and Prices) ────────────────────────────────────────────────────────
const supplyAds = [
  {
    adId: 'dummy_ad_001',
    supplierId: 'dummy_supplier_001',
    supplierName: 'Kamal Perera',
    businessName: 'Perera Agro Supplies',
    title: 'Fresh Carrots from Nuwara Eliya',
    description: 'Freshly harvested carrots available for wholesale. Top quality, washed and packed.',
    category: 'vegetables',
    quantity: 500,
    unit: 'kg',
    pricePerUnit: 120,
    currency: 'LKR',
    imageUrls: ['https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?q=80&w=800&auto=format&fit=crop'],
    district: 'Nuwara Eliya',
    availableFrom: new Date().toISOString(),
    status: 'active',
    viewCount: 15,
    offerCount: 2,
  },
  {
    adId: 'dummy_ad_002',
    supplierId: 'dummy_supplier_002',
    supplierName: 'Nimal Silva',
    businessName: 'Silva Dairy Farm',
    title: 'Fresh Cow Milk (Bulk)',
    description: '100% pure fresh cow milk, pasteurized and ready for delivery in Kandy area.',
    category: 'dairy',
    quantity: 1000,
    unit: 'litre',
    pricePerUnit: 200,
    currency: 'LKR',
    imageUrls: ['https://images.unsplash.com/photo-1550583724-b2692b85b150?q=80&w=800&auto=format&fit=crop'],
    district: 'Kandy',
    availableFrom: new Date().toISOString(),
    status: 'active',
    viewCount: 42,
    offerCount: 5,
  },
  {
    adId: 'dummy_ad_003',
    supplierId: 'dummy_supplier_003',
    supplierName: 'Amara Fernando',
    businessName: 'Fernando Spice Garden',
    title: 'Premium Ceylon Cinnamon',
    description: 'High-quality export grade Ceylon Cinnamon directly from our plantation.',
    category: 'spices',
    quantity: 50,
    unit: 'kg',
    pricePerUnit: 4500,
    currency: 'LKR',
    imageUrls: ['https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=800&auto=format&fit=crop'],
    district: 'Jaffna',
    availableFrom: new Date().toISOString(),
    status: 'active',
    viewCount: 89,
    offerCount: 12,
  },
  {
    adId: 'dummy_ad_004',
    supplierId: 'dummy_supplier_001',
    supplierName: 'Kamal Perera',
    businessName: 'Perera Agro Supplies',
    title: 'Organic Red Apples',
    description: 'Crisp, sweet, and locally grown organic apples.',
    category: 'fruits',
    quantity: 200,
    unit: 'kg',
    pricePerUnit: 800,
    currency: 'LKR',
    imageUrls: ['https://images.unsplash.com/photo-1560806887-1e4cd0b6faa6?q=80&w=800&auto=format&fit=crop'],
    district: 'Nuwara Eliya',
    availableFrom: new Date().toISOString(),
    status: 'active',
    viewCount: 22,
    offerCount: 0,
  }
];

// ─── Demand Posts ────────────────────────────────────────────────────────────
const demandPosts = [
  {
    postId: 'dummy_demand_001',
    businessId: 'dummy_buyer_001',
    businessName: 'Fresh Mart Supermarket',
    title: 'Looking for Samba Rice (Bulk)',
    description: 'We need high-quality Samba rice for our supermarket chain. Weekly delivery required.',
    category: 'grains',
    quantityNeeded: 2000,
    filledQuantity: 0,
    unit: 'kg',
    priceRangeMin: 180,
    priceRangeMax: 220,
    currency: 'LKR',
    district: 'Gampaha',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    offersCount: 3,
    status: 'open',
  },
  {
    postId: 'dummy_demand_002',
    businessId: 'dummy_buyer_002',
    businessName: 'Green Leaf Restaurant',
    title: 'Organic Tomatoes & Onions',
    description: 'Farm-fresh organic tomatoes and red onions needed for daily restaurant operations.',
    category: 'vegetables',
    quantityNeeded: 50,
    filledQuantity: 0,
    unit: 'kg',
    priceRangeMin: 150,
    priceRangeMax: 300,
    currency: 'LKR',
    district: 'Kalutara',
    deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    offersCount: 1,
    status: 'open',
  },
  {
    postId: 'dummy_demand_003',
    businessId: 'dummy_buyer_003',
    businessName: 'Muthu Wholesale Traders',
    title: 'Bulk Coconuts Needed',
    description: 'Require a steady weekly supply of large coconuts for wholesale distribution.',
    category: 'coconuts',
    quantityNeeded: 5000,
    filledQuantity: 0,
    unit: 'pieces',
    priceRangeMin: 80,
    priceRangeMax: 100,
    currency: 'LKR',
    district: 'Matale',
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    offersCount: 8,
    status: 'open',
  }
];

async function seedAds() {
  console.log('🌱 Seeding SupplyLink LK dummy ads & demands...\n');
  const batch = db.batch();

  for (const ad of supplyAds) {
    const ref = db.collection('supplyAds').doc(ad.adId);
    batch.set(ref, {
      ...ad,
      createdAt: now,
      updatedAt: now,
    });
    console.log(`✅ Supply Ad ready: ${ad.title}`);
  }

  for (const post of demandPosts) {
    const ref = db.collection('demandPosts').doc(post.postId);
    batch.set(ref, {
      ...post,
      createdAt: now,
      updatedAt: now,
    });
    console.log(`✅ Demand Post ready: ${post.title}`);
  }

  await batch.commit();
  console.log('\n🎉 Done! Dummy ads and demands seeded with images and prices.\n');
  process.exit(0);
}

seedAds().catch(err => {
  console.error('❌ Error seeding ads:', err);
  process.exit(1);
});
