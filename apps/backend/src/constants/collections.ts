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
  REVIEWS: 'reviews',
  NOTIFICATIONS: 'notifications',
  NOTIFICATION_ITEMS: 'items',
  ADMIN_QUEUE: 'adminQueue',
} as const;
