import { create } from 'zustand';

export interface CategorySelection {
  slug: string;
  name: string;
  selfieUrl?: string;
}

interface KycState {
  // Step 1: Profile (Shared / Business)
  displayName: string;
  district: string;
  address: string;
  profilePhotoUrl?: string;

  // Business Specific
  businessName?: string;
  businessType?: string;
  contactPerson?: string;
  phoneNumber?: string;

  // Step 2: NIC
  nicFrontUrl?: string;
  nicBackUrl?: string;

  // Step 3: Selfie
  selfieUrl?: string;

  // Step 4: Business Reg (Business Only)
  businessRegUrl?: string;

  // Step 4: Categories (Supplier Only)
  selectedCategories: CategorySelection[];

  // Step 5: (Internal tracking for category-selfie loop)
  currentCategoryIndex: number;

  isLoading: boolean;
  error: string | null;
}

interface KycActions {
  updateProfile: (data: Partial<Pick<KycState, 'displayName' | 'district' | 'address' | 'profilePhotoUrl' | 'businessName' | 'businessType' | 'contactPerson' | 'phoneNumber'>>) => void;
  updateNic: (front: string, back: string) => void;
  updateSelfie: (url: string) => void;
  updateBusinessReg: (url: string) => void;
  setCategories: (categories: CategorySelection[]) => void;
  updateCategorySelfie: (slug: string, url: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  nextCategory: () => boolean; // returns false if no more categories
  reset: () => void;
}

export const useKycStore = create<KycState & KycActions>((set, get) => ({
  displayName: '',
  district: '',
  address: '',
  selectedCategories: [],
  currentCategoryIndex: 0,
  isLoading: false,
  error: null,

  updateProfile: (data) => set((state) => ({ ...state, ...data })),
  updateNic: (nicFrontUrl, nicBackUrl) => set({ nicFrontUrl, nicBackUrl }),
  updateSelfie: (selfieUrl) => set({ selfieUrl }),
  updateBusinessReg: (businessRegUrl) => set({ businessRegUrl }),
  setCategories: (selectedCategories) => set({ selectedCategories, currentCategoryIndex: 0 }),
  
  updateCategorySelfie: (slug, url) => set((state) => ({
    selectedCategories: state.selectedCategories.map(c => 
      c.slug === slug ? { ...c, selfieUrl: url } : c
    )
  })),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  nextCategory: () => {
    const { currentCategoryIndex, selectedCategories } = get();
    if (currentCategoryIndex < selectedCategories.length - 1) {
      set({ currentCategoryIndex: currentCategoryIndex + 1 });
      return true;
    }
    return false;
  },

  reset: () => set({
    displayName: '',
    district: '',
    address: '',
    profilePhotoUrl: undefined,
    businessName: undefined,
    businessType: undefined,
    contactPerson: undefined,
    phoneNumber: undefined,
    nicFrontUrl: undefined,
    nicBackUrl: undefined,
    selfieUrl: undefined,
    businessRegUrl: undefined,
    selectedCategories: [],
    currentCategoryIndex: 0,
    isLoading: false,
    error: null,
  }),
}));
