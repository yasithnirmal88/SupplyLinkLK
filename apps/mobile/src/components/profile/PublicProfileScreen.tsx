import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {
  FlatList,
  View,
  Text,
  ActivityIndicator,
  Image,
  Pressable,
  Alert,
  Modal,
  TextInput,
  Share,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Linking from 'expo-linking';
import {
  addDoc,
  collection,
} from 'firebase/firestore';
import {
  MapPin,
  Calendar,
  MessageCircle,
  Bookmark,
  Flag,
  Sparkles,
  Users,
} from 'lucide-react-native';

import { usePublicProfile } from '../../hooks/usePublicProfile';
import { useSellerListings } from '../../hooks/useSellerListings';
import VerificationBadge from './VerificationBadge';
import { COLORS } from '../../../constants/Colors';
import { COLLECTIONS } from '../../../constants/Collections';
import { auth, db } from '../../../services/firebase';
import { apiClient } from '../../../services/api';
import { useAuthStore } from '../../stores/authStore';
import { SupplyCard } from '../../components/marketplace/SupplyCard';
import { DemandCard } from '../../components/marketplace/DemandCard';
import { useReviews } from '../../hooks/useReviews';
import { StarRating } from '../../components/reviews/StarRating';
import { TrustBadge } from '../../components/reviews/TrustBadge';
import { ReviewsList } from '../../components/reviews/ReviewsList';
import { ReviewSubmissionModal } from '../../components/reviews/ReviewSubmissionModal';
import { Star } from 'lucide-react-native';
import { trackEvent } from '../../../services/analytics';

type RouteParams = {
  id?: string;
};

type ListingTab = 'supply' | 'demand';

function SkeletonBlock({ width = '100%', height = 16, style = {} }: { width?: string | number; height?: number; style?: object }) {
  return (
    <View className="rounded-2xl bg-slate-200/70" style={[{ width, height }, style]} />
  );
}

const ListingTabButton = memo(({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) => {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-1 rounded-full px-4 py-3 ${active ? 'bg-slate-900' : 'bg-slate-100'}`}
    >
      <Text className={`text-center text-sm font-black ${active ? 'text-white' : 'text-slate-600'}`}>{label}</Text>
    </Pressable>
  );
});

export default function PublicProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<RouteParams>();
  const currentUserId = useAuthStore((state) => state.uid);
  const { profile, loading, error } = usePublicProfile(id as string | undefined);
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<ListingTab>('supply');
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);

  const supplyListings = useSellerListings(profile?.uid, 'supply');
  const demandListings = useSellerListings(profile?.uid, 'demand');
  const { reviews, metrics, loading: reviewsLoading, loadMore: loadMoreReviews, loadingMore: isFetchingMore, submitReview } = useReviews(profile?.uid);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  useEffect(() => {
    if (profile) {
      trackEvent('profile_viewed', { targetUserId: profile.uid, role: profile.role });
    }
  }, [profile]);

  const listings = activeTab === 'supply' ? supplyListings : demandListings;
  const activeListingLabel = activeTab === 'supply' ? 'Supply Listings' : 'Demand Posts';

  const memberSinceLabel = useMemo(() => {
    if (!profile?.memberSince) return '...';
    const date = new Date(profile.memberSince).toLocaleDateString('en-GB', { year: 'numeric', month: 'short' });
    return t('profile.memberSince', { date });
  }, [profile?.memberSince, t]);

  const shareUrl = useMemo(() => {
    if (!profile) return 'https://supplylink.lk';
    const basePath = profile.role === 'business' ? 'business' : 'seller';
    const identifier = profile.slug || profile.uid;
    return `https://supplylink.lk/${basePath}/${identifier}`;
  }, [profile]);

  const appShareUrl = useMemo(() => {
    if (!profile) return '';
    const basePath = profile.role === 'business' ? 'business' : 'seller';
    const identifier = profile.slug || profile.uid;
    return Linking.createURL(`/${basePath}/${identifier}`);
  }, [profile]);

  const handleShareProfile = useCallback(async () => {
    if (!profile) return;

    const message = `Check out ${profile.displayName} on SupplyLink:\n${shareUrl}\n\nOpen in app: ${appShareUrl}`;

    try {
      await Share.share({ message });
      trackEvent('share_clicked', { targetUserId: profile.uid });
    } catch (shareError) {
      Alert.alert('Unable to share', 'Please copy the link manually.');
    }
  }, [profile, shareUrl, appShareUrl]);

  const handleStartChat = useCallback(async () => {
    if (!profile || !currentUserId) return;
    if (currentUserId === profile.uid) {
      Alert.alert('Cannot message yourself', 'You are viewing your own profile.');
      return;
    }

    try {
      const currentUser = auth.currentUser;
      const token = currentUser ? await currentUser.getIdToken() : undefined;
      const response = await apiClient<{ chatId: string }>('/chats/create', {
        method: 'POST',
        token,
        body: {
          targetUserId: profile.uid,
          targetDisplayName: profile.displayName,
        },
      });

      router.push(`/chat/${response.chatId}`);
      trackEvent('message_clicked', { targetUserId: profile.uid });
    } catch (creationError) {
      console.error('Chat creation failed:', creationError);
      Alert.alert('Unable to open chat', 'Please try again later.');
    }
  }, [currentUserId, profile, router]);

  const handleSubmitReport = useCallback(async () => {
    if (!profile || !currentUserId) return;
    if (!reportReason.trim()) {
      Alert.alert('Add a reason', 'Please tell us why you are reporting this user.');
      return;
    }

    setReportSubmitting(true);

    try {
      await addDoc(collection(db, COLLECTIONS.REPORTS), {
        reporterId: currentUserId,
        targetUserId: profile.uid,
        reason: reportReason.trim(),
        createdAt: new Date().toISOString(),
      });

      setReportReason('');
      setReportModalOpen(false);
      Alert.alert('Report submitted', 'Thank you. Our team will review this report shortly.');
    } catch (submitError) {
      console.error('Report submission failed:', submitError);
      Alert.alert('Unable to submit report', 'Please try again later.');
    } finally {
      setReportSubmitting(false);
    }
  }, [currentUserId, profile, reportReason]);

  const renderListingItem = ({ item }: { item: any }) => {
    const handleListingPress = () => {
      trackEvent('listing_opened', { 
        listingId: item.adId || item.postId, 
        targetUserId: profile?.uid 
      });
      Alert.alert('Listing details coming soon');
    };

    if (activeTab === 'supply') {
      return <SupplyCard ad={item} onPress={handleListingPress} />;
    }

    return <DemandCard post={item} onPress={handleListingPress} />;
  };

  if (loading) {
    return (
      <View className="flex-1 bg-slate-50 items-center justify-center" style={{ paddingTop: insets.top }}>
        <ActivityIndicator size="large" color={COLORS.primaryGreen} />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-slate-50 items-center justify-center px-6" style={{ paddingTop: insets.top }}>
        <Text className="text-slate-900 text-xl font-black mb-3">Unable to load profile</Text>
        <Text className="text-slate-500 text-center">Please check your connection and try again.</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View className="flex-1 bg-slate-50 items-center justify-center px-6" style={{ paddingTop: insets.top }}>
        <Text className="text-slate-900 text-xl font-black mb-3">Profile not found</Text>
        <Text className="text-slate-500 text-center">This public seller/business profile may not exist yet.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      <FlatList
        data={listings.items}
        keyExtractor={(item) => item.adId ?? item.postId ?? String(Math.random())}
        renderItem={renderListingItem}
        onEndReached={() => listings.hasMore && listings.loadMore()}
        onEndReachedThreshold={0.4}
        initialNumToRender={5}
        windowSize={11}
        ListHeaderComponent={() => (
          <View>
            <View className="px-6 mb-6">
              <LinearGradient
                colors={['#ECFDF5', '#E0F2FE']}
                className="rounded-[2.5rem] p-6 shadow-xl shadow-slate-300/20"
                style={{ borderWidth: 1, borderColor: '#E2E8F0' }}
              >
                <View className="flex-row gap-4 items-center mb-6">
                  <View className="w-24 h-24 rounded-[2.5rem] bg-slate-100 overflow-hidden items-center justify-center shadow-lg shadow-slate-400/10">
                    {loading ? (
                      <SkeletonBlock width="100%" height="100%" />
                    ) : profile.photoURL ? (
                      <Image
                        source={{ uri: profile.photoURL }}
                        className="w-full h-full"
                        style={{ resizeMode: 'cover' }}
                      />
                    ) : (
                      <Users size={40} color="#94A3B8" />
                    )}
                  </View>
                  <View className="flex-1">
                    {loading ? (
                      <>
                        <SkeletonBlock width={150} height={24} style={{ marginBottom: 8 }} />
                        <SkeletonBlock width={80} height={12} />
                      </>
                    ) : (
                      <>
                        <Text className="text-3xl font-black text-slate-950 uppercase tracking-tight">{profile.displayName}</Text>
                        <Text className="text-slate-500 uppercase text-[10px] tracking-[0.35em] mt-2">{profile.role}</Text>
                      </>
                    )}
                    <View className="mt-4 space-y-2">
                      <View className="flex-row items-center gap-2">
                        <MapPin size={14} color="#334155" />
                        <Text className="text-slate-700 text-sm font-bold">{profile.district || 'District unavailable'}</Text>
                      </View>
                      <View className="flex-row items-center gap-2">
                        <Calendar size={14} color="#334155" />
                        <Text className="text-slate-700 text-sm font-bold">{memberSinceLabel}</Text>
                      </View>
                    </View>
                  </View>
                </View>

                <View className="flex-row flex-wrap gap-3">
                  <VerificationBadge label="KYC" enabled={profile.verified.kyc} />
                  <VerificationBadge label="Business" enabled={profile.verified.business} />
                  <VerificationBadge label="Phone" enabled={profile.verified.phone} />
                </View>

                {metrics && (
                  <View className="mt-6 pt-6 border-t border-slate-200 flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <Star size={20} color="#F4A261" fill="#F4A261" />
                      <Text className="text-2xl font-black text-slate-950 ml-2">{metrics.averageRating}</Text>
                      <Text className="text-slate-400 text-sm ml-2 font-bold">({metrics.totalReviews} {t('profile.ratings')})</Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Trust Score</Text>
                      <View className="bg-slate-900 rounded-full px-3 py-1">
                        <Text className="text-white font-black text-sm">{metrics.trustScore}%</Text>
                      </View>
                    </View>
                  </View>
                )}
              </LinearGradient>
            </View>

            {metrics?.badges && metrics.badges.length > 0 && (
              <View className="px-6 mb-6">
                <View className="flex-row flex-wrap">
                  {metrics.badges.map((badge: string) => (
                    <TrustBadge key={badge} badge={badge} />
                  ))}
                </View>
              </View>
            )}

            <View className="px-6 mb-6">
              <View className="rounded-[2rem] bg-white p-6 shadow-sm border border-slate-100">
                <Text className="text-xs font-black uppercase tracking-[0.35em] text-slate-400 mb-4">About</Text>
                <Text className="text-slate-700 text-base leading-7 mb-4">{profile.bio || 'No public bio has been added yet.'}</Text>

                <View className="flex-row flex-wrap gap-3 mb-4">
                  {(profile.categories?.length ?? 0) > 0 ? (
                    profile.categories.map((category) => (
                      <View key={category} className="rounded-full bg-slate-100 px-4 py-2">
                        <Text className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-700">{category}</Text>
                      </View>
                    ))
                  ) : (
                    <Text className="text-slate-400 text-sm">No categories available.</Text>
                  )}
                </View>

                <View className="flex-row flex-wrap gap-3">
                  {(profile.languages?.length ?? 0) > 0 ? (
                    profile.languages.map((language) => (
                      <View key={language} className="rounded-full bg-slate-100 px-4 py-2">
                        <Text className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-700">{language}</Text>
                      </View>
                    ))
                  ) : (
                    <Text className="text-slate-400 text-sm">Languages not specified.</Text>
                  )}
                </View>
              </View>
            </View>

            <View className="px-6 mb-6">
              <View className="rounded-[2rem] bg-white p-6 shadow-sm border border-slate-100">
                <Text className="text-xs font-black uppercase tracking-[0.35em] text-slate-400 mb-5">Quick Actions</Text>
                <Pressable
                  onPress={handleStartChat}
                  className="mb-3 rounded-[1.75rem] bg-primary-green px-5 py-4 flex-row items-center justify-between"
                >
                  <View className="flex-row items-center gap-3">
                    <MessageCircle size={18} color="white" />
                    <Text className="text-white font-black uppercase tracking-[0.2em]">Message seller</Text>
                  </View>
                </Pressable>
                <Pressable
                  onPress={() => setReviewModalOpen(true)}
                  className="mb-3 rounded-[1.75rem] bg-orange-50 px-5 py-4 flex-row items-center justify-between"
                >
                  <View className="flex-row items-center gap-3">
                    <Star size={18} color="#F4A261" />
                    <Text className="text-orange-600 font-black uppercase tracking-[0.2em]">Rate this user</Text>
                  </View>
                </Pressable>
                <Pressable
                  onPress={handleShareProfile}
                  className="mb-3 rounded-[1.75rem] bg-slate-100 px-5 py-4 flex-row items-center justify-between"
                >
                  <View className="flex-row items-center gap-3">
                    <Bookmark size={18} color={COLORS.primaryGreen} />
                    <Text className="text-slate-900 font-black uppercase tracking-[0.2em]">Share profile</Text>
                  </View>
                </Pressable>
                <Pressable
                  onPress={() => setReportModalOpen(true)}
                  className="rounded-[1.75rem] bg-rose-50 px-5 py-4 flex-row items-center justify-between"
                >
                  <View className="flex-row items-center gap-3">
                    <Flag size={18} color="#DC2626" />
                    <Text className="text-rose-600 font-black uppercase tracking-[0.2em]">Report user</Text>
                  </View>
                </Pressable>
              </View>
            </View>

            <View className="px-6 mb-6">
              <View className="rounded-[2rem] bg-white p-6 shadow-sm border border-slate-100">
                <Text className="text-xs font-black uppercase tracking-[0.35em] text-slate-400 mb-5">Reviews</Text>
                <ReviewsList 
                  reviews={reviews} 
                  isLoading={reviewsLoading} 
                  isFetchingMore={isFetchingMore}
                  onEndReached={loadMoreReviews}
                />
              </View>
            </View>

            <View className="px-6 mb-6">
              <View className="rounded-[2rem] bg-white p-6 shadow-sm border border-slate-100">
                <Text className="text-xs font-black uppercase tracking-[0.35em] text-slate-400 mb-5">{t('profile.listings')}</Text>
                <View className="flex-row rounded-full bg-slate-100 p-1 gap-1">
                  <ListingTabButton
                    active={activeTab === 'supply'}
                    label="Supply Listings"
                    onPress={() => setActiveTab('supply')}
                  />
                  <ListingTabButton
                    active={activeTab === 'demand'}
                    label="Demand Posts"
                    onPress={() => setActiveTab('demand')}
                  />
                </View>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={() => (
          <View className="px-6 py-12 items-center justify-center">
            {listings.loading ? (
              <View className="w-full gap-4">
                 <SkeletonBlock height={180} />
                 <SkeletonBlock height={180} />
              </View>
            ) : (
              <View className="items-center">
                <Sparkles size={40} color="#CBD5E1" />
                <Text className="text-slate-500 text-center text-sm mt-4 font-bold uppercase tracking-widest">
                  {t('profile.noListings')}
                </Text>
              </View>
            )}
          </View>
        )}
        ListFooterComponent={() => (
          <View className="px-6 py-4">
            {listings.loadingMore && <ActivityIndicator color={COLORS.primaryGreen} />}
          </View>
        )}
        contentContainerStyle={{ paddingTop: insets.top + 24, paddingBottom: 90 }}
      />

      <Modal
        visible={reportModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setReportModalOpen(false)}
      >
        <View className="flex-1 bg-black/40 items-center justify-end">
          <View className="w-full rounded-t-[2rem] bg-white p-6">
            <Text className="text-lg font-black text-slate-950 mb-3">Report user</Text>
            <Text className="text-slate-500 text-sm mb-4">Tell us why you are reporting this profile.</Text>
            <TextInput
              value={reportReason}
              onChangeText={setReportReason}
              placeholder="Reason for reporting"
              multiline
              numberOfLines={4}
              className="min-h-[120px] rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900"
            />
            <View className="flex-row justify-between gap-3 mt-5">
              <Pressable
                onPress={() => setReportModalOpen(false)}
                className="flex-1 rounded-3xl border border-slate-200 px-4 py-3 items-center"
              >
                <Text className="text-slate-600 uppercase font-bold">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleSubmitReport}
                disabled={reportSubmitting}
                className="flex-1 rounded-3xl bg-primary-green px-4 py-3 items-center"
              >
                <Text className="text-white uppercase font-bold">Submit</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <ReviewSubmissionModal
        isVisible={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        targetName={profile.displayName}
        onSubmit={async (rating, text) => {
          // Note: In a real app, we'd need to find a valid transaction ID.
          // For now, we'll assume the backend handles validation or provides one.
          // This is a placeholder for the integration logic.
          Alert.alert('Integration Note', 'Rating submission requires a valid completed transaction ID.');
          setReviewModalOpen(false);
        }}
      />
    </View>
  );
}
