import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Role, VerificationState, Language } from '@supplylink/shared-types';

// ─── State Interface ─────────────────────────────────────────
interface AuthState {
  // Firebase Auth
  uid: string | null;
  phoneNumber: string | null;
  role: Role | null;
  verificationStatus: VerificationState | null;
  displayName: string | null;

  // Phone Auth flow
  verificationId: string | null;
  confirmationResult: any | null;

  // App State
  isLoading: boolean;
  isAuthenticated: boolean;
  isNewUser: boolean;
  language: Language;

  // Error
  authError: string | null;
}

// ─── Actions Interface ───────────────────────────────────────
interface AuthActions {
  // Auth flow
  setVerificationId: (id: string) => void;
  setConfirmationResult: (result: any) => void;
  setUser: (user: {
    uid: string;
    phoneNumber: string;
    role: Role | null;
    verificationStatus: VerificationState | null;
    displayName?: string | null;
  }) => void;
  setRole: (role: Role) => void;
  setNewUser: (isNew: boolean) => void;
  setAuthError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;

  // Language
  setLanguage: (lang: Language) => void;
  loadLanguage: () => Promise<void>;
}

const LANGUAGE_KEY = '@supplylink_language';

export const useAuthStore = create<AuthState & AuthActions>((set, get) => ({
  // ─── Initial State ───────────────────────────────────────────
  uid: null,
  phoneNumber: null,
  role: null,
  verificationStatus: null,
  displayName: null,
  verificationId: null,
  confirmationResult: null,
  isLoading: true,
  isAuthenticated: false,
  isNewUser: false,
  language: 'en',
  authError: null,

  // ─── Actions ─────────────────────────────────────────────────
  setVerificationId: (verificationId) =>
    set({ verificationId, authError: null }),

  setConfirmationResult: (confirmationResult) =>
    set({ confirmationResult, authError: null }),

  setUser: (user) =>
    set({
      uid: user.uid,
      phoneNumber: user.phoneNumber,
      role: user.role,
      verificationStatus: user.verificationStatus,
      displayName: user.displayName ?? null,
      isAuthenticated: true,
      isLoading: false,
      authError: null,
    }),

  setRole: (role) => set({ role }),

  setNewUser: (isNewUser) => set({ isNewUser }),

  setAuthError: (authError) => set({ authError, isLoading: false }),

  setLoading: (isLoading) => set({ isLoading }),

  logout: () =>
    set({
      uid: null,
      phoneNumber: null,
      role: null,
      verificationStatus: null,
      displayName: null,
      verificationId: null,
      confirmationResult: null,
      isAuthenticated: false,
      isLoading: false,
      isNewUser: false,
      authError: null,
    }),

  // ─── Language ────────────────────────────────────────────────
  setLanguage: async (language) => {
    set({ language });
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, language);
    } catch (e) {
      console.warn('Failed to persist language preference:', e);
    }
  },

  loadLanguage: async () => {
    try {
      const stored = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (stored && ['en', 'si', 'ta'].includes(stored)) {
        set({ language: stored as Language });
      }
    } catch (e) {
      console.warn('Failed to load language preference:', e);
    }
  },
}));
