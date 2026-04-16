// ─── Core Enums ──────────────────────────────────────────────
export type Role = 'supplier' | 'business' | 'admin';
export type VerificationState = 'pending' | 'approved' | 'rejected';
export type Language = 'en' | 'si' | 'ta';

// ─── Users ───────────────────────────────────────────────────
/** Firestore: users/{uid} */
export interface User {
  uid: string;
  phoneNumber: string;
  role: Role;
  displayName?: string;
  avatarUrl?: string;
  verificationStatus: VerificationState;
  language: Language;
  fcmToken?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Suppliers ───────────────────────────────────────────────
/** Firestore: suppliers/{uid} */
export interface SupplierProfile {
  uid: string;
  supplyCategories: string[];
  district: string;
  selfieWithItemUrls: string[];
  nicFrontUrl: string;
  nicBackUrl: string;
  bio?: string;
  rating: number;
  totalReviews: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Businesses ──────────────────────────────────────────────
/** Firestore: businesses/{uid} */
export interface BusinessProfile {
  uid: string;
  businessName: string;
  businessType: 'importer' | 'distributor' | 'restaurant' | 'hotel' | 'other';
  registrationNumber: string;
  nicFrontUrl: string;
  nicBackUrl: string;
  certificationUrl?: string;
  district: string;
  address: string;
  rating: number;
  totalReviews: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Supply Ads ──────────────────────────────────────────────
/** Firestore: supplyAds/{adId} */
export interface SupplyAd {
  adId: string;
  supplierId: string;
  supplierName: string;
  title: string;
  description: string;
  category: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  currency: 'LKR';
  imageUrls: string[];
  district: string;
  availableFrom: string;
  availableUntil?: string;
  status: 'active' | 'sold' | 'expired' | 'removed';
  createdAt: string;
  updatedAt: string;
}

// ─── Demand Posts ────────────────────────────────────────────
/** Firestore: demandPosts/{postId} */
export interface DemandPost {
  postId: string;
  businessId: string;
  businessName: string;
  title: string;
  description: string;
  category: string;
  quantityNeeded: number;
  unit: string;
  priceRangeMin?: number;
  priceRangeMax?: number;
  currency: 'LKR';
  district: string;
  deadline: string;
  offersCount: number;
  status: 'open' | 'fulfilled' | 'closed' | 'expired';
  createdAt: string;
  updatedAt: string;
}

// ─── Offers ──────────────────────────────────────────────────
/** Firestore: offers/{offerId} */
export interface Offer {
  offerId: string;
  demandPostId: string;
  supplierId: string;
  supplierName: string;
  businessId: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  currency: 'LKR';
  message?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  createdAt: string;
  updatedAt: string;
}

// ─── Chats ───────────────────────────────────────────────────
/** Firestore: chats/{chatId} */
export interface Chat {
  chatId: string;
  participants: [string, string];
  participantNames: Record<string, string>;
  relatedOfferId?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  createdAt: string;
}

/** Firestore: messages/{chatId}/messages/{msgId} */
export interface Message {
  msgId: string;
  chatId: string;
  senderId: string;
  text: string;
  imageUrl?: string;
  readBy: string[];
  createdAt: string;
}

// ─── Reviews ─────────────────────────────────────────────────
/** Firestore: reviews/{reviewId} */
export interface Review {
  reviewId: string;
  reviewerId: string;
  revieweeId: string;
  offerId: string;
  rating: number; // 1–5
  comment?: string;
  createdAt: string;
}

// ─── Notifications ───────────────────────────────────────────
/** Firestore: notifications/{uid}/items/{notifId} */
export interface Notification {
  notifId: string;
  type: 'offer_received' | 'offer_accepted' | 'offer_rejected' | 'chat_message' | 'kyc_approved' | 'kyc_rejected' | 'new_demand' | 'system';
  title: string;
  body: string;
  data?: Record<string, string>;
  read: boolean;
  createdAt: string;
}

// ─── Admin Queue ─────────────────────────────────────────────
/** Firestore: adminQueue/{queueId} */
export interface AdminQueueItem {
  queueId: string;
  userId: string;
  role: Role;
  documentUrls: string[];
  selfieUrl?: string;
  status: VerificationState;
  reviewedBy?: string;
  reviewNote?: string;
  submittedAt: string;
  reviewedAt?: string;
}
