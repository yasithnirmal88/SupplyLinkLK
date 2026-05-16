/**
 * services/auth.ts
 *
 * Uses @react-native-firebase/auth namespace API — auth() — which is correct
 * for ALL versions of @react-native-firebase including v22+ / v24.
 *
 * getAuth() / onAuthStateChanged() as standalone imports is the Firebase Web
 * SDK pattern (firebase/auth) and does NOT apply to @react-native-firebase.
 *
 * Firestore uses the Firebase Web SDK (firebase/firestore) via ./firebase
 * because @react-native-firebase/firestore is not in package.json.
 */
import auth from '@react-native-firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { COLLECTIONS } from '../constants/Collections';
import { apiClient } from './api';
import type { User, Role, Language } from '@supplylink/shared-types';

// ─── OTP / Phone Auth ─────────────────────────────────────────────────────────

/**
 * Sends an OTP to the given phone number.
 * Returns a ConfirmationResult with a .confirm(code) method.
 */
export async function sendOtp(phoneNumber: string) {
  return auth().signInWithPhoneNumber(phoneNumber);
}

/**
 * Confirms OTP using the ConfirmationResult returned by sendOtp().
 * Use this when you store confirmationResult in component state.
 */
export async function confirmOtpWithResult(confirmationResult: any, otpCode: string) {
  const userCredential = await confirmationResult.confirm(otpCode);
  return userCredential.user;
}

/**
 * Confirms OTP using a raw verificationId string.
 * Use this when you rely on verificationId from phone auth callbacks.
 */
export async function confirmOtp(verificationId: string, otpCode: string) {
  const credential = auth.PhoneAuthProvider.credential(verificationId, otpCode);
  const userCredential = await auth().signInWithCredential(credential);
  return userCredential.user;
}

// ─── Backend token verification ───────────────────────────────────────────────

export async function verifyIdTokenWithBackend(
  idToken: string,
  language: Language
): Promise<{ isNewUser: boolean; user: User }> {
  return apiClient<{ isNewUser: boolean; user: User }>('/auth/verify-token', {
    method: 'POST',
    body: { idToken, language },
  });
}

// ─── Firestore profile helpers (Firebase Web SDK) ─────────────────────────────

export async function getUserProfile(uid: string): Promise<User | null> {
  const docRef  = doc(db, COLLECTIONS.USERS, uid);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? (docSnap.data() as User) : null;
}

export async function updateUserRole(uid: string, role: Role): Promise<void> {
  const docRef = doc(db, COLLECTIONS.USERS, uid);
  await setDoc(docRef, { role, updatedAt: serverTimestamp() }, { merge: true });
}

// ─── Auth state ───────────────────────────────────────────────────────────────

export async function signOutUser(): Promise<void> {
  await auth().signOut();
}

export function onAuthChange(callback: (user: any | null) => void): () => void {
  return auth().onAuthStateChanged(callback);
}

// ─── Error key mapper ─────────────────────────────────────────────────────────

export function getAuthErrorKey(errorCode: string): string {
  switch (errorCode) {
    case 'auth/invalid-verification-code': return 'auth.errors.invalidOtp';
    case 'auth/code-expired':              return 'auth.errors.expiredOtp';
    case 'auth/too-many-requests':         return 'auth.errors.tooManyRequests';
    case 'auth/invalid-phone-number':      return 'auth.errors.invalidPhone';
    case 'auth/network-request-failed':    return 'auth.errors.network';
    case 'auth/quota-exceeded':            return 'auth.errors.tooManyRequests';
    default:                               return 'common.error';
  }
}