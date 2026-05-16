/** 
 * Seller performance and reliability statistics 
 */
export interface SellerStats {
  averageRating: number;
  totalReviews: number;
  completedTransactions: number;
  responseRate: number; // e.g., 95 for 95%
  // response time in hours
  responseTimeHours: number;
  // average response time in minutes (optional)
  averageResponseTime?: number;
  trustScore: number; // e.g., out of 100
  repeatCustomers: number;
  activeListings: number;
}

/** 
 * Represents a trust badge earned by a user 
 */
export interface TrustBadge {
  badgeId: string;
  name: string; // e.g., 'Top Rated', 'Fast Responder'
  description: string;
  iconUrl: string;
  earnedAt: string;
}
