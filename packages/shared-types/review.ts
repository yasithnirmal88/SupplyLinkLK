/** Firestore: reportedReviews/{reportId} */
export interface ReportedReview {
  reportId: string;
  ratingId: string;
  reporterId: string;
  reason: 'spam' | 'offensive' | 'fake' | 'other';
  description?: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}
