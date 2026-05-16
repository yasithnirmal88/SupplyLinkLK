import React, { useState } from 'react';
import { View, Text, ScrollView, Image, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StatusBar } from 'expo-status-bar';
import { CheckCircle2, User, Landmark, Package, MapPin } from 'lucide-react-native';

import { useKycStore } from '../../../stores/kycStore';
import { useAuthStore } from '../../../stores/authStore';
import { ProgressBar } from '../../../components/onboarding/ProgressBar';
import { uploadImage } from '../../../services/storage';
import { apiClient } from '../../../services/api';
import { COLORS } from '../../../constants/Colors';

export default function ReviewScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { uid } = useAuthStore();
  
  const { 
    displayName, address, district, profilePhotoUrl,
    nicFrontUrl, nicBackUrl, selfieUrl, selectedCategories,
    isLoading, setLoading, setError 
  } = useKycStore();

  const handleFinalSubmit = async () => {
    if (!uid) return;
    
    setLoading(true);
    try {
      // 1. Upload all media to Firebase Storage
      const [
        pPhoto, nFront, nBack, sPhoto
      ] = await Promise.all([
        profilePhotoUrl ? uploadImage(profilePhotoUrl, `users/${uid}/profile.jpg`) : null,
        nicFrontUrl ? uploadImage(nicFrontUrl, `kyc/${uid}/nic-front.jpg`) : null,
        nicBackUrl ? uploadImage(nicBackUrl, `kyc/${uid}/nic-back.jpg`) : null,
        selfieUrl ? uploadImage(selfieUrl, `kyc/${uid}/selfie.jpg`) : null,
      ]);

      // Upload category selfies
      const categoriesWithUrls = await Promise.all(
        selectedCategories.map(async (cat) => {
          if (cat.selfieUrl) {
            const url = await uploadImage(cat.selfieUrl, `kyc/${uid}/category-${cat.slug}.jpg`);
            return { name: cat.name, selfieUrl: url };
          }
          return { name: cat.name };
        })
      );

      // 2. Submit to Backend
      await apiClient('/kyc/submit', {
        method: 'POST',
        body: {
          uid,
          displayName,
          address,
          district,
          profilePhotoUrl: pPhoto,
          nicFrontUrl: nFront,
          nicBackUrl: nBack,
          selfieUrl: sPhoto,
          categories: categoriesWithUrls,
        },
      });

      // 3. Navigate to Success
      router.push('/onboarding/supplier/submitted');
    } catch (err: any) {
      console.error('Submission failed:', err);
      Alert.alert('Submission Error', err.message || 'Could not submit your KYC application.');
    } finally {
      setLoading(false);
    }
  };

  const Section = ({ title, icon: Icon, children }: any) => (
    <View className="mb-8">
      <View className="flex-row items-center mb-4">
        <Icon size={20} color={COLORS.primaryGreen} />
        <Text className="text-lg font-bold ml-2 text-text-primary uppercase tracking-tight">
          {title}
        </Text>
      </View>
      <View className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm">
        {children}
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="dark" />
      <ProgressBar current={6} total={7} />

      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
        <View className="mb-6">
          <Text className="text-3xl font-bold text-text-primary">
            {t('onboarding.supplier.review.title')}
          </Text>
          <Text className="text-text-muted mt-2">
            {t('onboarding.supplier.review.subtitle')}
          </Text>
        </View>

        {/* Personal Details */}
        <Section title={t('onboarding.supplier.review.personal')} icon={User}>
          <View className="flex-row items-center mb-4">
            {profilePhotoUrl ? (
              <Image source={{ uri: profilePhotoUrl }} className="w-16 h-16 rounded-full mr-4" />
            ) : (
              <View className="w-16 h-16 rounded-full bg-gray-100 mr-4 items-center justify-center">
                <User color="#9CA3AF" />
              </View>
            )}
            <View>
              <Text className="font-bold text-lg text-text-primary">{displayName}</Text>
              <View className="flex-row items-center">
                <MapPin size={12} color={COLORS.textMuted} />
                <Text className="text-text-muted ml-1">{district}</Text>
              </View>
            </View>
          </View>
          <Text className="text-text-muted text-sm">{address}</Text>
        </Section>

        {/* Identity Docs */}
        <Section title={t('onboarding.supplier.review.documents')} icon={Landmark}>
          <View className="flex-row gap-2">
             <View className="flex-1 aspect-[1.6/1] rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                <Image source={{ uri: nicFrontUrl }} className="w-full h-full" />
             </View>
             <View className="flex-1 aspect-[1.6/1] rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                <Image source={{ uri: nicBackUrl }} className="w-full h-full" />
             </View>
          </View>
          <View className="mt-2 flex-row items-center justify-center">
            <CheckCircle2 size={12} color={COLORS.primaryGreen} />
            <Text className="text-primary-green font-bold text-[10px] ml-1 uppercase">Live Selfie Captured</Text>
          </View>Section
        </Section>

        {/* Categories */}
        <Section title={t('onboarding.supplier.review.suppliedItems')} icon={Package}>
          <View className="flex-row flex-wrap gap-2">
            {selectedCategories.map((cat) => (
              <View key={cat.slug} className="px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg flex-row items-center">
                 <Text className="text-sm font-semibold text-text-primary">{cat.name}</Text>
                 <View className="ml-2 w-2 h-2 rounded-full bg-primary-green" />
              </View>
            ))}
          </View>
        </Section>
        
        <View className="h-10" />
      </ScrollView>

      <View className="p-6 bg-background">
        <Pressable
          onPress={handleFinalSubmit}
          disabled={isLoading}
          className={`py-4 rounded-2xl items-center ${isLoading ? 'bg-gray-400' : 'bg-primary-green'}`}
          style={{
            shadowColor: COLORS.primaryGreen,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 4
          }}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">
              {t('onboarding.supplier.review.submit')}
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}
