/**
 * Firestore collection path constants for the backend.
 * Mirrors the mobile constants for consistency.
 */
export const COLLECTIONS = {
  USERS: 'users',
  SUPPLIERS: 'suppliers',
  BUSINESSES: 'businesses',
  SUPPLY_ADS: 'supplyAds',
  DEMAND_POSTS: 'demandPosts',
  OFFERS: 'offers',
  CHATS: 'chats',
  MESSAGES: 'messages',
  REPORTS: 'reports',
  RATINGS: 'ratings',
  REPORTED_REVIEWS: 'reportedReviews',
  NOTIFICATIONS: 'notifications',
  NOTIFICATION_ITEMS: 'items',
  PUBLIC_PROFILES: 'publicProfiles',
  ADMIN_QUEUE: 'adminQueue',
  // Future Collections (Step 19.1)
  FOLLOWERS: 'followers',
  FAVORITES: 'favorites',
  TRUST_SCORES: 'trustScores',
  SUBSCRIPTIONS: 'subscriptions',
} as const;
