/**
 * services/auth.ts
 *
 * Uses @react-native-firebase/auth and @react-native-firebase/firestore.
 * This ensures the auth token is automatically synchronized with native requests.
 */
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { COLLECTIONS } from '../constants/Collections';
import { apiClient } from './api';
import type { User, Role, Language } from '@supplylink/shared-types';

// ─── OTP / Phone Auth ─────────────────────────────────────────────────────────

export async function sendOtp(phoneNumber: string) {
  return auth().signInWithPhoneNumber(phoneNumber);
}

export async function confirmOtpWithResult(confirmationResult: any, otpCode: string) {
  const userCredential = await confirmationResult.confirm(otpCode);
  return userCredential.user;
}

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

// ─── Firestore profile helpers (Native SDK) ─────────────────────────────

export async function getUserProfile(uid: string): Promise<User | null> {
  const docSnap = await firestore().collection(COLLECTIONS.USERS).doc(uid).get();
  return docSnap.exists ? (docSnap.data() as User) : null;
}

export async function updateUserRole(uid: string, role: Role): Promise<void> {
  await firestore().collection(COLLECTIONS.USERS).doc(uid).set({ 
    role, 
    updatedAt: firestore.FieldValue.serverTimestamp() 
  }, { merge: true });
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