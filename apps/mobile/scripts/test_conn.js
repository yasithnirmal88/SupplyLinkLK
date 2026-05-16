const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccount.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function test() {
  try {
    const collections = await db.listCollections();
    console.log('Success! Collections found:', collections.length);
  } catch (err) {
    console.error('Test failed:', err);
  }
}

test();
