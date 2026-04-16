/**
 * Firestore collection path constants.
 * Use these everywhere instead of hardcoding strings.
 */
export const COLLECTIONS = {
  USERS: 'users',
  SUPPLIERS: 'suppliers',
  BUSINESSES: 'businesses',
  SUPPLY_ADS: 'supplyAds',
  DEMAND_POSTS: 'demandPosts',
  OFFERS: 'offers',
  CHATS: 'chats',
  MESSAGES: 'messages', // subcollection: chats/{chatId}/messages/{msgId}
  REVIEWS: 'reviews',
  NOTIFICATIONS: 'notifications', // subcollection: notifications/{uid}/items/{notifId}
  NOTIFICATION_ITEMS: 'items',
  ADMIN_QUEUE: 'adminQueue',
} as const;
