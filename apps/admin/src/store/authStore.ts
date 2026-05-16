import { create } from 'zustand';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  initialize: () => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  initialize: () => {
    onAuthStateChanged(auth, (user) => {
      set({ user, isAuthenticated: !!user, isLoading: false });
    });
  },

  logout: async () => {
    await signOut(auth);
    set({ user: null, isAuthenticated: false });
  },
}));
