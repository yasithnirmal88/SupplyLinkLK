import * as admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';

if (!admin.apps.length) {
  let credential;
  
  const specificKeyPath = path.resolve(__dirname, '../supplylinklk-dba66-firebase-adminsdk-fbsvc-489d9003b7.json');
  const genericKeyPath = path.resolve(__dirname, '../serviceAccountKey.json');
  
  if (fs.existsSync(genericKeyPath)) {
    console.log('[Firebase Admin] Initializing with serviceAccountKey.json.');
    credential = admin.credential.cert(require(genericKeyPath));
  } else if (fs.existsSync(specificKeyPath)) {
    console.log('[Firebase Admin] Initializing with local service account JSON.');
    credential = admin.credential.cert(require(specificKeyPath));
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      credential = admin.credential.cert(serviceAccount);
    } catch (e) {
      console.warn("Could not parse FIREBASE_SERVICE_ACCOUNT_KEY as JSON. Using default application credentials.");
      credential = admin.credential.applicationDefault();
    }
  } else {
    credential = admin.credential.applicationDefault();
  }

  admin.initializeApp({
    credential,
    projectId: 'supplylinklk-dba66',
  });
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
export const adminStorage = admin.storage();
export const adminMessaging = admin.messaging();
