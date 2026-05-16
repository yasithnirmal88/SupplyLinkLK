import { getAuth, PhoneAuthProvider } from '@react-native-firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { COLLECTIONS } from '../constants/Collections';
import { apiClient } from './api';
import type { User, Role, Language } from '@supplylink/shared-types';

// --- Phone Auth ---

export async function sendOtp(phoneNumber: string) {
  return getAuth().signInWithPhoneNumber(phoneNumber);
}

export async function confirmOtpWithResult(
  confirmationResult: any,
  otpCode: string
) {
  const userCredential = await confirmationResult.confirm(otpCode);
  return userCredential.user;
}

export async function confirmOtp(
  verificationId: string,
  otpCode: string
) {
  const credential = PhoneAuthProvider.credential(verificationId, otpCode);
  const userCredential = await getAuth().signInWithCredential(credential);
  return userCredential.user;
}

export async function verifyIdTokenWithBackend(
  idToken: string,
  language: Language
): Promise<{ isNewUser: boolean; user: User }> {
  return apiClient<{ isNewUser: boolean; user: User }>('/auth/verify-token', {
    method: 'POST',
    body: { idToken, language },
  });
}

export async function getUserProfile(uid: string): Promise<User | null> {
  const docRef = doc(db, COLLECTIONS.USERS, uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data() as User;
  }
  return null;
}

export async function updateUserRole(uid: string, role: Role): Promise<void> {
  const docRef = doc(db, COLLECTIONS.USERS, uid);
  await setDoc(docRef, { role, updatedAt: serverTimestamp() }, { merge: true });
}

export async function signOutUser(): Promise<void> {
  await getAuth().signOut();
}

export function onAuthChange(
  callback: (user: any | null) => void
): () => void {
  return getAuth().onAuthStateChanged(callback);
}

export function getAuthErrorKey(errorCode: string): string {
  switch (errorCode) {
    case 'auth/invalid-verification-code':
      return 'auth.errors.invalidOtp';
    case 'auth/code-expired':
      return 'auth.errors.expiredOtp';
    case 'auth/too-many-requests':
      return 'auth.errors.tooManyRequests';
    case 'auth/invalid-phone-number':
      return 'auth.errors.invalidPhone';
    case 'auth/network-request-failed':
      return 'auth.errors.network';
    case 'auth/quota-exceeded':
      return 'auth.errors.tooManyRequests';
    default:
      return 'common.error';
  }
}