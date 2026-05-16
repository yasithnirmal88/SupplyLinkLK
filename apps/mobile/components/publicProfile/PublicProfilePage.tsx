import React from 'react';
import { View, Text, ScrollView, ActivityIndicator, Image, Pressable, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MessageCircle, Bookmark, Flag, MapPin, CheckCircle2, Star, Globe2, Calendar, User } from 'lucide-react-native';

import { usePublicProfile } from '../../src/hooks/usePublicProfile';
import { COLORS } from '../../constants/Colors';

type RouteParams = {
  id?: string;
};

export default function PublicProfilePage() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<RouteParams>();
  const { profile, loading, error } = usePublicProfile(id as string | undefined);
  const notFound = !loading && !profile && !error;

  const handleAction = (action: string) => {
    Alert.alert(action, `This feature will be available soon.`);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50" style={{ paddingTop: insets.top }}>
        <ActivityIndicator size="large" color={COLORS.primaryGreen} />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-8" style={{ paddingTop: insets.top }}>
        <Text className="text-slate-900 text-xl font-black mb-3">Failed to load profile</Text>
        <Text className="text-slate-500 text-center">Please try again later.</Text>
      </View>
    );
  }

  if (notFound || !profile) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 px-8" style={{ paddingTop: insets.top }}>
        <Text className="text-slate-900 text-xl font-black mb-3">Profile Not Found</Text>
        <Text className="text-slate-500 text-center">We couldn't find this public profile. It may not exist yet.</Text>
      </View>
    );
  }

  const memberSinceLabel = profile.memberSince
    ? new Date(profile.memberSince).toLocaleDateString('en-GB', { year: 'numeric', month: 'short' })
    : 'Unknown';

  const trustBadges = [
    { label: 'KYC', enabled: profile.verified.kyc },
    { label: 'Business', enabled: profile.verified.business },
    { label: 'Phone', enabled: profile.verified.phone },
  ];

  return (
    <ScrollView
      className="flex-1 bg-slate-50"
      contentContainerStyle={{ paddingTop: insets.top + 24, paddingBottom: 60 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="px-6 mb-6">
        <View className="bg-white rounded-[2.5rem] px-6 py-8 shadow-sm border border-slate-100">
          <View className="flex-row items-center gap-4 mb-6">
            <View className="w-20 h-20 rounded-[2.5rem] bg-slate-100 overflow-hidden items-center justify-center">
              {profile.photoURL ? (
                <Image
                  source={{ uri: profile.photoURL }}
                  className="w-full h-full"
                  style={{ resizeMode: 'cover' }}
                />
              ) : (
                <User size={42} color="#9CA3AF" />
              )}
            </View>
            <View className="flex-1">
              <Text className="text-2xl font-black text-slate-900 uppercase tracking-tight">{profile.displayName}</Text>
              <View className="flex-row items-center gap-2 mt-2 flex-wrap">
                <View className="bg-slate-100 px-3 py-1 rounded-full">
                  <Text className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">{profile.role}</Text>
                </View>
                {profile.verified.kyc && (
                  <View className="bg-emerald-50 px-3 py-1 rounded-full flex-row items-center gap-1">
                    <CheckCircle2 size={12} color={COLORS.success} />
                    <Text className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">Verified</Text>
                  </View>
                )}
              </View>
              <Text className="text-slate-500 text-xs font-bold mt-3 flex-row items-center gap-1">
                <MapPin size={12} color="#94A3B8" /> {profile.district || 'District unavailable'}
              </Text>
              <Text className="text-slate-500 text-xs font-bold mt-1 flex-row items-center gap-1">
                <Calendar size={12} color="#94A3B8" /> Member since {memberSinceLabel}
              </Text>
            </View>
          </View>

          {profile.bio ? (
            <View className="mb-5">
              <Text className="text-slate-500 text-sm leading-6">{profile.bio}</Text>
            </View>
          ) : null}

          <View className="flex-row flex-wrap gap-3">
            {profile.categories?.map((category) => (
              <View key={category} className="bg-slate-100 px-3 py-2 rounded-3xl">
                <Text className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">{category}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View className="px-6 mb-6">
        <Text className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Marketplace Reputation</Text>
        <View className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
          <View className="flex-row justify-between mb-4">
            <View>
              <Text className="text-[10px] uppercase tracking-[0.3em] text-slate-400">Active listings</Text>
              <Text className="text-2xl font-black text-slate-900">{profile.stats.activeListings}</Text>
            </View>
            <View>
              <Text className="text-[10px] uppercase tracking-[0.3em] text-slate-400">Transactions</Text>
              <Text className="text-2xl font-black text-slate-900">{profile.stats.completedTransactions}</Text>
            </View>
          </View>

          <View className="flex-row justify-between gap-4">
            <View className="flex-1 bg-slate-50 rounded-[1.5rem] p-4">
              <Text className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Response rate</Text>
              <Text className="text-xl font-black text-slate-900 mt-2">{profile.stats.responseRate}%</Text>
            </View>
            <View className="flex-1 bg-slate-50 rounded-[1.5rem] p-4">
              <Text className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Avg reply</Text>
              <Text className="text-xl font-black text-slate-900 mt-2">{profile.stats.averageResponseTime}m</Text>
            </View>
          </View>
        </View>
      </View>

      <View className="px-6 mb-6">
        <Text className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Trust & Verification</Text>
        <View className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
          {trustBadges.map((badge) => (
            <View key={badge.label} className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center gap-2">
                <CheckCircle2 size={16} color={badge.enabled ? COLORS.success : '#CBD5E1'} />
                <Text className="text-sm font-bold text-slate-700">{badge.label} verified</Text>
              </View>
              <Text className={`text-xs font-black uppercase ${badge.enabled ? 'text-emerald-700' : 'text-slate-400'}`}>
                {badge.enabled ? 'Yes' : 'Pending'}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View className="px-6 mb-6">
        <Text className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Contact & Engagement</Text>
        <View className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
          <Pressable
            onPress={() => handleAction(`Message ${profile.role}`)}
            className="flex-row items-center justify-between bg-primary-green px-5 py-4 rounded-3xl mb-3"
          >
            <View className="flex-row items-center gap-3">
              <MessageCircle size={18} color="white" />
              <Text className="text-white font-black uppercase tracking-widest">Message {profile.role}</Text>
            </View>
          </Pressable>
          <Pressable
            onPress={() => handleAction('Save Profile')}
            className="flex-row items-center justify-between bg-slate-100 px-5 py-4 rounded-3xl mb-3"
          >
            <View className="flex-row items-center gap-3">
              <Bookmark size={18} color={COLORS.primaryGreen} />
              <Text className="text-slate-900 font-black uppercase tracking-widest">Save Profile</Text>
            </View>
          </Pressable>
          <Pressable
            onPress={() => handleAction('Report User')}
            className="flex-row items-center justify-between bg-rose-50 px-5 py-4 rounded-3xl"
          >
            <View className="flex-row items-center gap-3">
              <Flag size={18} color="#DC2626" />
              <Text className="text-rose-600 font-black uppercase tracking-widest">Report User</Text>
            </View>
          </Pressable>
        </View>
      </View>

      <View className="px-6">
        <Text className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Profile Details</Text>
        <View className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
          <View className="flex-row items-center gap-3 mb-4">
            <Globe2 size={18} color="#64748B" />
            <Text className="text-sm font-bold text-slate-700">Languages</Text>
          </View>
          <Text className="text-slate-500 text-sm mb-4">{profile.languages?.join(', ') || 'Not specified'}</Text>

          {profile.businessName ? (
            <View className="flex-row items-center gap-3 mb-4">
              <User size={18} color="#64748B" />
              <Text className="text-sm font-bold text-slate-700">Business</Text>
            </View>
          ) : null}
          {profile.businessName ? (
            <Text className="text-slate-500 text-sm">{profile.businessName}</Text>
          ) : null}
        </View>
      </View>
    </ScrollView>
  );
}
