import {
  PhoneAuthProvider,
  signInWithCredential,
  signOut,
  onAuthStateChanged,
  signInWithPhoneNumber,
  type User as FirebaseUser,
  type ConfirmationResult,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { COLLECTIONS } from '../constants/Collections';
import { apiClient } from './api';
import type { User, Role, Language } from '@supplylink/shared-types';

// ─── Phone Auth ──────────────────────────────────────────────

/**
 * Send OTP to the given phone number.
 * Uses Firebase signInWithPhoneNumber approach. 
 * For Expo Go / React Native, passing undefined for the recaptcha verifier
 * allows Firebase to handle verification natively (or fallback to browser).
 *
 * @param phoneNumber - Full E.164 format (+94XXXXXXXXX)
 * @returns ConfirmationResult object
 */
export async function sendOtp(
  phoneNumber: string
): Promise<ConfirmationResult> {
  // @ts-ignore - In React Native/Expo, passing undefined for the verifier 
  // allows Firebase to use native phone auth or internal fallback.
  return signInWithPhoneNumber(auth, phoneNumber, undefined);
}

/**
 * Confirm the OTP code and sign in the user using the ConfirmationResult.
 */
export async function confirmOtpWithResult(
  confirmationResult: ConfirmationResult,
  otpCode: string
): Promise<FirebaseUser> {
  const userCredential = await confirmationResult.confirm(otpCode);
  return userCredential.user;
}

/**
 * Confirm the OTP code and sign in the user.
 *
 * @param verificationId - From sendOtp
 * @param otpCode - 6-digit code entered by user
 * @returns Firebase User
 */
export async function confirmOtp(
  verificationId: string,
  otpCode: string
): Promise<FirebaseUser> {
  const credential = PhoneAuthProvider.credential(verificationId, otpCode);
  const userCredential = await signInWithCredential(auth, credential);
  return userCredential.user;
}

/**
 * Verify Firebase ID token with our backend.
 * This will create a Firestore profile if it's the first login.
 */
export async function verifyIdTokenWithBackend(
  idToken: string,
  language: Language
): Promise<{ isNewUser: boolean; user: User }> {
  return apiClient<{ isNewUser: boolean; user: User }>('/auth/verify-token', {
    method: 'POST',
    body: { idToken, language },
  });
}

// ─── User Profile Helpers (Can still use client SDK for simple updates) ─────────────────

/**
 * Get user profile from Firestore, or null if it doesn't exist.
 */
export async function getUserProfile(uid: string): Promise<User | null> {
  const docRef = doc(db, COLLECTIONS.USERS, uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data() as User;
  }
  return null;
}

// createUserProfile is now handled by our backend verify-token endpoint

/**
 * Update the user's role after role selection.
 */
export async function updateUserRole(uid: string, role: Role): Promise<void> {
  const docRef = doc(db, COLLECTIONS.USERS, uid);
  await setDoc(
    docRef,
    { role, updatedAt: serverTimestamp() },
    { merge: true }
  );
}

/**
 * Sign out from Firebase Auth.
 */
export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

/**
 * Subscribe to auth state changes.
 */
export function onAuthChange(
  callback: (user: FirebaseUser | null) => void
): () => void {
  return onAuthStateChanged(auth, callback);
}

// ─── Error Helpers ───────────────────────────────────────────

/**
 * Maps Firebase auth error codes to user-friendly i18n keys.
 */
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
