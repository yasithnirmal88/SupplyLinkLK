/** Firestore: ratings/{ratingId} */
export interface Rating {
  ratingId: string;
  reviewerId: string;
  revieweeId: string;
  transactionId: string; // The related chat or offer ID
  rating: number; // 1–5
  reviewText?: string;
  wouldRecommend: boolean;
  isVerifiedPurchase: boolean;
  createdAt: string;
}
