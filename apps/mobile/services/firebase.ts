/**
 * services/firebase.ts
 * Uses @react-native-firebase for both Auth and Firestore.
 * This ensures the auth token is automatically included in all Firestore requests.
 */
import nativeAuth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';

export const auth = nativeAuth;
export const db = firestore;
export const st = storage;
export default nativeAuth;