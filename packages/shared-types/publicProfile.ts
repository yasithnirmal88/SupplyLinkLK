import { SellerStats, TrustBadge } from './trust';

/**
 * Firestore: publicProfiles/{uid}
 * Contains only data that is safe to display publicly.
 * Sensitive information must remain in private user collections.
 */
export interface PublicProfile {
  uid: string;

  displayName: string;
  photoURL?: string;

  role: 'supplier' | 'business';

  district: string;

  bio?: string;
  businessName?: string;
  categories?: string[];
  languages?: string[];

  verified: {
    kyc: boolean;
    business: boolean;
    phone: boolean;
  };

  memberSince: string;

  stats: SellerStats;
  trustBadges?: TrustBadge[];

  future?: {
    ratingEnabled?: boolean;
    trustScoreEnabled?: boolean;
    followersEnabled?: boolean;
  };
}
